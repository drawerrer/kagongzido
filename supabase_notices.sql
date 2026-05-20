-- ─────────────────────────────────────────────────────────────
-- 공지사항(notices) 테이블 생성 + RLS
-- ─────────────────────────────────────────────────────────────
-- 적용 방법:
--   Supabase Dashboard → SQL Editor → 전체 복사 후 Run
-- ─────────────────────────────────────────────────────────────

-- ═════════════════════════════════════════════════════════════
-- 1. 테이블 생성
-- ═════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notices (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text NOT NULL,
  content      text NOT NULL,
  is_published boolean NOT NULL DEFAULT true,
  published_at timestamptz DEFAULT now() NOT NULL,
  created_at   timestamptz DEFAULT now() NOT NULL,
  updated_at   timestamptz DEFAULT now() NOT NULL
);

-- 발행 공지 정렬 인덱스
CREATE INDEX IF NOT EXISTS notices_published_at_idx
  ON notices (is_published, published_at DESC);


-- ═════════════════════════════════════════════════════════════
-- 2. RLS 정책 — 발행분만 모두 조회 / 어드민만 수정
-- ═════════════════════════════════════════════════════════════
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notices: anyone can read published" ON notices;
CREATE POLICY "notices: anyone can read published"
  ON notices FOR SELECT
  USING (is_published = true OR is_admin());

DROP POLICY IF EXISTS "notices: admins can insert" ON notices;
CREATE POLICY "notices: admins can insert"
  ON notices FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "notices: admins can update" ON notices;
CREATE POLICY "notices: admins can update"
  ON notices FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "notices: admins can delete" ON notices;
CREATE POLICY "notices: admins can delete"
  ON notices FOR DELETE
  USING (is_admin());


-- ═════════════════════════════════════════════════════════════
-- 3. updated_at 자동 갱신 트리거 (선택)
-- ═════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION trg_notices_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notices_set_updated_at ON notices;
CREATE TRIGGER notices_set_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW EXECUTE FUNCTION trg_notices_set_updated_at();


-- ═════════════════════════════════════════════════════════════
-- 4. (선택) 기존 하드코딩 공지 시드
-- ═════════════════════════════════════════════════════════════
-- INSERT INTO notices (title, content, published_at) VALUES
--   ('카공지도 정식 출시 안내',
--    E'안녕하세요, 카공지도 팀입니다.\n드디어 카공지도가 정식 출시되었어요! 앞으로도 더 좋은 서비스로 찾아오겠습니다. 많은 관심과 사랑 부탁드려요.',
--    '2026-04-28'),
--   ('리뷰 기능 업데이트 안내',
--    '카페에 방문하고 느낀 점을 리뷰로 남길 수 있게 되었어요. 콘센트 여부, 좌석 상태, 소음 수준을 직접 평가해보세요.',
--    '2026-04-10'),
--   ('모음집 기능 업데이트 안내',
--    '마음에 드는 카페를 모음집으로 묶어 관리할 수 있어요. 테마별로 카페를 분류해보세요.',
--    '2026-03-20'),
--   ('카공지도 베타 서비스 오픈 안내',
--    '카공지도 베타 서비스가 시작되었습니다. 서울 주요 지역의 카공 카페 정보를 먼저 만나보세요. 피드백은 언제든지 환영합니다.',
--    '2026-03-01');


-- ═════════════════════════════════════════════════════════════
-- 확인
-- ═════════════════════════════════════════════════════════════
-- SELECT * FROM notices ORDER BY published_at DESC;
