-- ─────────────────────────────────────────────────────────────
-- 네이버플레이스 자동 채움 — is_admin() RPC 노출
-- ─────────────────────────────────────────────────────────────
-- api/naver-place.ts (Vercel Edge Function)가 어드민 검증을 위해
-- PostgREST의 /rest/v1/rpc/is_admin 엔드포인트를 직접 호출함.
-- is_admin()은 supabase_rls.sql에서 이미 생성되어 있고 보통 기본적으로
-- authenticated 롤에 실행 권한이 있지만, 혹시 없을 경우를 대비해 명시적으로 부여.
--
-- 적용 방법: Supabase Dashboard → SQL Editor 에서 실행
-- ─────────────────────────────────────────────────────────────

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
