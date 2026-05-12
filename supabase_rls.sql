-- ─────────────────────────────────────────────────────────────
-- 카공지도 RLS (Row Level Security) 정책
-- ─────────────────────────────────────────────────────────────
-- 적용 방법:
--   1. Supabase Dashboard → SQL Editor 진입
--   2. 이 파일 내용을 복사해서 실행 (Run)
--   3. 정책 적용 확인: Authentication → Policies
--
-- 정책 요약:
--   ▸ 공개 테이블 (stores, guidebooks, guidebook_items, reviews)
--     - SELECT: 누구나 가능 (앱 사용자)
--     - INSERT/UPDATE/DELETE: 어드민 이메일만
--   ▸ 사용자 개인 테이블 (favorites, collections, reports)
--     - 본인 데이터만 SELECT/INSERT/UPDATE/DELETE
--
-- 어드민 이메일:
--   dsgj0024@gmail.com
--   juliesba1015@gmail.com
-- ─────────────────────────────────────────────────────────────

-- ═════════════════════════════════════════════════════════════
-- 1. 어드민 이메일 판별 함수
-- ═════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.email() IN (
    'dsgj0024@gmail.com',
    'juliesba1015@gmail.com'
  );
$$;


-- ═════════════════════════════════════════════════════════════
-- 2. stores 테이블 — 모두 조회 / 어드민만 수정
-- ═════════════════════════════════════════════════════════════
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stores: anyone can read" ON stores;
CREATE POLICY "stores: anyone can read"
  ON stores FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "stores: admins can insert" ON stores;
CREATE POLICY "stores: admins can insert"
  ON stores FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "stores: admins can update" ON stores;
CREATE POLICY "stores: admins can update"
  ON stores FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "stores: admins can delete" ON stores;
CREATE POLICY "stores: admins can delete"
  ON stores FOR DELETE
  USING (is_admin());


-- ═════════════════════════════════════════════════════════════
-- 3. guidebooks 테이블 — 게시된 것만 조회 / 어드민만 수정
-- ═════════════════════════════════════════════════════════════
ALTER TABLE guidebooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guidebooks: anyone can read published" ON guidebooks;
CREATE POLICY "guidebooks: anyone can read published"
  ON guidebooks FOR SELECT
  USING (is_published = true OR is_admin());

DROP POLICY IF EXISTS "guidebooks: admins can insert" ON guidebooks;
CREATE POLICY "guidebooks: admins can insert"
  ON guidebooks FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "guidebooks: admins can update" ON guidebooks;
CREATE POLICY "guidebooks: admins can update"
  ON guidebooks FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "guidebooks: admins can delete" ON guidebooks;
CREATE POLICY "guidebooks: admins can delete"
  ON guidebooks FOR DELETE
  USING (is_admin());


-- ═════════════════════════════════════════════════════════════
-- 4. guidebook_items 테이블 — 모두 조회 / 어드민만 수정
-- ═════════════════════════════════════════════════════════════
ALTER TABLE guidebook_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guidebook_items: anyone can read" ON guidebook_items;
CREATE POLICY "guidebook_items: anyone can read"
  ON guidebook_items FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "guidebook_items: admins can insert" ON guidebook_items;
CREATE POLICY "guidebook_items: admins can insert"
  ON guidebook_items FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "guidebook_items: admins can update" ON guidebook_items;
CREATE POLICY "guidebook_items: admins can update"
  ON guidebook_items FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "guidebook_items: admins can delete" ON guidebook_items;
CREATE POLICY "guidebook_items: admins can delete"
  ON guidebook_items FOR DELETE
  USING (is_admin());


-- ═════════════════════════════════════════════════════════════
-- 5. reviews 테이블 — 모두 조회 / 본인 작성 + 어드민 수정
-- ═════════════════════════════════════════════════════════════
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews: anyone can read" ON reviews;
CREATE POLICY "reviews: anyone can read"
  ON reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "reviews: anyone can insert" ON reviews;
CREATE POLICY "reviews: anyone can insert"
  ON reviews FOR INSERT
  WITH CHECK (true);  -- 일반 사용자도 리뷰 작성 가능 (user_id는 클라이언트가 전달)

DROP POLICY IF EXISTS "reviews: admins can update" ON reviews;
CREATE POLICY "reviews: admins can update"
  ON reviews FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "reviews: admins can delete" ON reviews;
CREATE POLICY "reviews: admins can delete"
  ON reviews FOR DELETE
  USING (is_admin());


-- ═════════════════════════════════════════════════════════════
-- 6. reports (사용자 제보) — 누구나 INSERT / 어드민만 조회·수정
-- ═════════════════════════════════════════════════════════════
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reports: anyone can insert" ON reports;
CREATE POLICY "reports: anyone can insert"
  ON reports FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "reports: admins can read" ON reports;
CREATE POLICY "reports: admins can read"
  ON reports FOR SELECT
  USING (is_admin());

DROP POLICY IF EXISTS "reports: admins can update" ON reports;
CREATE POLICY "reports: admins can update"
  ON reports FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "reports: admins can delete" ON reports;
CREATE POLICY "reports: admins can delete"
  ON reports FOR DELETE
  USING (is_admin());


-- ═════════════════════════════════════════════════════════════
-- 7. favorites / collections (사용자 개인 데이터)
-- 현재 user_id는 클라이언트 dev-user-001 고정이라 인증 미적용 상태
-- 사용자 로그인 도입 시 아래 주석 해제 후 적용
-- ═════════════════════════════════════════════════════════════
-- ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "favorites: own data"
--   ON favorites FOR ALL
--   USING (user_id = auth.uid()::text)
--   WITH CHECK (user_id = auth.uid()::text);

-- ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "collections: own data"
--   ON collections FOR ALL
--   USING (user_id = auth.uid()::text)
--   WITH CHECK (user_id = auth.uid()::text);


-- ═════════════════════════════════════════════════════════════
-- 적용 후 확인 쿼리 (선택)
-- ═════════════════════════════════════════════════════════════
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public' AND tablename IN (
--   'stores', 'guidebooks', 'guidebook_items', 'reviews', 'reports'
-- );
