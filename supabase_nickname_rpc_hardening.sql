-- ─────────────────────────────────────────────────────────────
-- update_user_nickname RPC 보안 강화: 소유권(auth.uid()) 검증 추가
-- ─────────────────────────────────────────────────────────────
-- 배경:
--   update_user_nickname()은 SECURITY DEFINER 로 만들어져 RLS를 우회함
--   (콜드 런치마다 auth.uid()가 새로 발급되는 문제를 피하기 위해 도입).
--   그런데 "호출자가 실제로 이 유저 row의 주인인가"를 검증하는 로직이
--   없어서, anon key만 있으면 세션 유무와 무관하게 아무 p_user_id의
--   닉네임이나 바꿀 수 있는 상태였음 (실제 curl 테스트로 확인됨).
--
-- 수정 내용:
--   auth.uid() 가 대상 row의 auth_user_id 와 일치할 때만 UPDATE 허용.
--   이는 supabase_auth_rls.sql 에 이미 정의돼 있는
--   "users: update own row" RLS 정책(auth_user_id = auth.uid())과
--   동일한 조건을 SECURITY DEFINER 함수 내부에 명시적으로 재현한 것.
--
-- 영향:
--   - 정상적인 own-nickname 변경: 그대로 동작 (auth.uid()가 본인 row와 일치)
--   - 세션 없이/타인 user_id로 호출: 예외 발생 → db.ts의
--     updateUserNickname()이 이미 error를 잡아 false 반환하도록
--     되어 있으므로 클라이언트 코드 변경 없이 안전하게 적용 가능
--
-- 적용 방법: Supabase Dashboard → SQL Editor → 아래 전체 복사 후 Run
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_user_nickname(
  p_user_id uuid,
  p_nickname text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_user_id uuid;
BEGIN
  SELECT auth_user_id INTO v_auth_user_id
  FROM public.users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'user % not found', p_user_id USING ERRCODE = 'P0002';
  END IF;

  IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM v_auth_user_id THEN
    RAISE EXCEPTION 'not authorized to update nickname for user %', p_user_id
      USING ERRCODE = '42501';
  END IF;

  UPDATE public.users
  SET nickname = p_nickname,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$;

-- ─────────────────────────────────────────────────────────────
-- 검증 (SQL Editor에서 적용 직후 실행해보면 좋음)
-- ─────────────────────────────────────────────────────────────
-- 1) 세션 없이 호출 → 이제 42501 에러가 나야 정상 (이전엔 조용히 204 성공했음)
--    SELECT public.update_user_nickname('아무 uuid'::uuid, '해킹시도');
--
-- 2) 실제 클라이언트(anon key + 본인 세션)에서 본인 닉네임 변경 → 정상 동작해야 함
--    (앱에서 마이페이지 → 닉네임 변경으로 직접 테스트)
-- ─────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────
-- upsert_user_by_toss_id RPC 보안 강화: p_auth_user_id 검증 추가
-- ─────────────────────────────────────────────────────────────
-- 실제 운영 중인 원본 정의(Supabase SQL Editor에서 확인)를 그대로 두고,
-- 맨 앞에 "p_auth_user_id는 호출자 본인의 auth.uid()와 반드시 같아야 한다"는
-- 검증 한 줄만 추가함. 로직/반환 타입은 원본과 100% 동일.
--
-- 배경:
--   원본은 p_auth_user_id 를 검증 없이 그대로 믿고, 기존 toss_user_id row가
--   있으면 그 row의 auth_user_id 를 전달받은 값으로 덮어씀.
--   즉 anon key만 있으면 세션 없이도, 혹은 "내 세션 + 남의 toss_user_id"
--   조합으로 남의 row의 auth_user_id를 자기 걸로 바꿔치기할 수 있었음.
--
-- 이번 수정으로 막히는 것:
--   - 세션(auth.uid()) 없이 호출하는 경우 → 이제 거부됨
--   - p_auth_user_id 자리에 "내 세션이 아닌 다른 uuid"를 넣는 경우 → 거부됨
--
-- 이번 수정으로도 못 막는 것 (구조적 한계, 참고만 하세요):
--   - 앱인토스 공식 문서에 따르면 getAnonymousKey()의 hash는
--     "토스 서버 API 호출용 키가 아니며, 서버 측에서 검증할 방법이 없음"
--     (https://developers-apps-in-toss.toss.im/bedrock/reference/framework/비게인/getAnonymousKey.md)
--   - 따라서 누군가 "진짜 남의 toss_user_id 문자열"을 이미 알고 있고,
--     자기 자신의 정상 세션으로 그 값을 넘기면 (auth.uid() = p_auth_user_id는
--     자기 걸로 통과됨) 여전히 그 row를 자기 것으로 재매핑할 수 있음.
--   - 다만 toss_user_id는 앱 UI/URL/analytics 어디에도 노출되지 않는
--     불투명한 값이라, 실제로 이 문자열이 외부에 유출될 경로는 제한적임.
--   - 완전히 막으려면 Toss 쪽에서 hash를 서버 검증하는 공식 API가 필요한데
--     현재 SDK 문서상 제공되지 않음.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.upsert_user_by_toss_id(p_toss_user_id text, p_auth_user_id uuid)
 RETURNS TABLE(id uuid, nickname text, is_new boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_id uuid;
  v_nickname text;
BEGIN
  -- 보안: p_auth_user_id는 반드시 호출자 본인의 auth.uid()와 일치해야 함
  IF auth.uid() IS NULL OR auth.uid() IS DISTINCT FROM p_auth_user_id THEN
    RAISE EXCEPTION 'p_auth_user_id must match the caller''s session'
      USING ERRCODE = '42501';
  END IF;

  -- 1) toss_user_id 로 기존 row 조회
  SELECT u.id, u.nickname INTO v_id, v_nickname
  FROM users u
  WHERE u.toss_user_id = p_toss_user_id
  LIMIT 1;

  IF FOUND THEN
    -- 2) 기존 row 있으면 auth_user_id 최신화 (콜드 런치마다 새 auth.uid 반영)
    UPDATE users
       SET auth_user_id = p_auth_user_id
     WHERE users.id = v_id
       AND (auth_user_id IS DISTINCT FROM p_auth_user_id);

    RETURN QUERY SELECT v_id, v_nickname, false;
  ELSE
    -- 3) 신규 INSERT
    INSERT INTO users (toss_user_id, auth_user_id)
    VALUES (p_toss_user_id, p_auth_user_id)
    RETURNING users.id, users.nickname INTO v_id, v_nickname;

    RETURN QUERY SELECT v_id, v_nickname, true;
  END IF;
END;
$function$;

-- ─────────────────────────────────────────────────────────────
-- 검증
-- ─────────────────────────────────────────────────────────────
-- 세션 없이 호출 → 42501 에러가 나야 정상
--   SELECT * FROM public.upsert_user_by_toss_id('test', gen_random_uuid());
--
-- 실제 앱에서 로그인/재실행 시나리오가 여전히 정상 동작하는지 확인
--   (콜드 런치 → 기존 유저 매칭 → 닉네임 정상 표시)
-- ─────────────────────────────────────────────────────────────
