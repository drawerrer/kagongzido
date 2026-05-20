-- ─────────────────────────────────────────────────────────────
-- Supabase Anonymous Auth + RLS 마이그레이션 (옵션 A)
-- ─────────────────────────────────────────────────────────────
-- 목표:
--   ▸ users 테이블에 auth.users(id) 와 매핑되는 컬럼 추가
--   ▸ favorites / collections / collection_stores / reviews_likes / users
--     테이블에 RLS 활성화 + auth.uid() 기반 정책 적용
--
-- 적용 전 필수 작업 (Supabase Dashboard):
--   1) Authentication → Providers → Anonymous Sign-Ins 활성화 (ON)
--   2) Authentication → Settings → Enable email confirmations OFF (선택)
--
-- 적용 방법:
--   Supabase Dashboard → SQL Editor → 전체 복사 후 Run
-- ─────────────────────────────────────────────────────────────


-- ═════════════════════════════════════════════════════════════
-- 1. users 테이블에 auth_user_id 컬럼 추가
-- ═════════════════════════════════════════════════════════════

-- 컬럼 추가 (이미 있으면 무시)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 유니크 제약 (한 auth 계정 ↔ 한 users 행)
DROP INDEX IF EXISTS users_auth_user_id_unique;
CREATE UNIQUE INDEX users_auth_user_id_unique
  ON users (auth_user_id)
  WHERE auth_user_id IS NOT NULL;

-- auth.uid() 로 빠르게 조회하기 위한 인덱스
CREATE INDEX IF NOT EXISTS users_auth_user_id_idx ON users (auth_user_id);


-- ═════════════════════════════════════════════════════════════
-- 2. users 테이블 RLS
-- ═════════════════════════════════════════════════════════════
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users: read own row" ON users;
CREATE POLICY "users: read own row"
  ON users FOR SELECT
  USING (auth_user_id = auth.uid() OR is_admin());

-- 본인 row 가 없을 때 INSERT 허용 (앱 첫 진입 시 토스 해시 ↔ auth.uid 매핑)
DROP POLICY IF EXISTS "users: insert own row" ON users;
CREATE POLICY "users: insert own row"
  ON users FOR INSERT
  WITH CHECK (auth_user_id = auth.uid());

-- 본인 row UPDATE (nickname / auth_user_id 재매핑 등)
DROP POLICY IF EXISTS "users: update own row" ON users;
CREATE POLICY "users: update own row"
  ON users FOR UPDATE
  USING (auth_user_id = auth.uid() OR is_admin())
  WITH CHECK (auth_user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "users: delete own row" ON users;
CREATE POLICY "users: delete own row"
  ON users FOR DELETE
  USING (auth_user_id = auth.uid() OR is_admin());


-- ═════════════════════════════════════════════════════════════
-- 3. favorites RLS
-- ═════════════════════════════════════════════════════════════
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "favorites: own data" ON favorites;
CREATE POLICY "favorites: own data"
  ON favorites FOR ALL
  USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));


-- ═════════════════════════════════════════════════════════════
-- 4. collections RLS
-- ═════════════════════════════════════════════════════════════
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "collections: own data" ON collections;
CREATE POLICY "collections: own data"
  ON collections FOR ALL
  USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));


-- ═════════════════════════════════════════════════════════════
-- 5. collection_stores RLS — collections 소유자 검증
-- ═════════════════════════════════════════════════════════════
ALTER TABLE collection_stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "collection_stores: own data" ON collection_stores;
CREATE POLICY "collection_stores: own data"
  ON collection_stores FOR ALL
  USING (
    collection_id IN (
      SELECT c.id FROM collections c
      JOIN users u ON u.id = c.user_id
      WHERE u.auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    collection_id IN (
      SELECT c.id FROM collections c
      JOIN users u ON u.id = c.user_id
      WHERE u.auth_user_id = auth.uid()
    )
  );


-- ═════════════════════════════════════════════════════════════
-- 6. reviews_likes RLS
-- ═════════════════════════════════════════════════════════════
ALTER TABLE reviews_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews_likes: anyone read" ON reviews_likes;
CREATE POLICY "reviews_likes: anyone read"
  ON reviews_likes FOR SELECT
  USING (true);  -- 집계용 COUNT 는 모두 조회 가능

DROP POLICY IF EXISTS "reviews_likes: own writes" ON reviews_likes;
CREATE POLICY "reviews_likes: own writes"
  ON reviews_likes FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "reviews_likes: own delete" ON reviews_likes;
CREATE POLICY "reviews_likes: own delete"
  ON reviews_likes FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));


-- ═════════════════════════════════════════════════════════════
-- 7. reviews — 본인 작성 리뷰만 수정/삭제 가능하도록 정책 보완
-- ═════════════════════════════════════════════════════════════
-- 기존 정책: SELECT 누구나 / INSERT 누구나 / 어드민만 수정·삭제
-- 변경: 본인이 작성한 리뷰는 본인도 수정·삭제 가능

DROP POLICY IF EXISTS "reviews: anyone can insert" ON reviews;
CREATE POLICY "reviews: anyone can insert"
  ON reviews FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

DROP POLICY IF EXISTS "reviews: own or admin update" ON reviews;
CREATE POLICY "reviews: own or admin update"
  ON reviews FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR is_admin())
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS "reviews: admins can update" ON reviews;
DROP POLICY IF EXISTS "reviews: own or admin delete" ON reviews;
CREATE POLICY "reviews: own or admin delete"
  ON reviews FOR DELETE
  USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()) OR is_admin());

DROP POLICY IF EXISTS "reviews: admins can delete" ON reviews;


-- ═════════════════════════════════════════════════════════════
-- 8. reports — 본인 제보 INSERT 시 user_id 일치 검증 (선택)
-- ═════════════════════════════════════════════════════════════
-- 기존: 누구나 INSERT (user_id 검증 안 함)
-- 변경: user_id 가 NULL 이거나 본인 user_id 일 때만 INSERT 허용

DROP POLICY IF EXISTS "reports: anyone can insert" ON reports;
CREATE POLICY "reports: anyone can insert"
  ON reports FOR INSERT
  WITH CHECK (
    user_id IS NULL
    OR user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );


-- ═════════════════════════════════════════════════════════════
-- 9. 검증 쿼리
-- ═════════════════════════════════════════════════════════════
-- 모든 테이블 RLS 활성화 여부 확인
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
--   AND tablename IN ('users', 'favorites', 'collections', 'collection_stores',
--                     'reviews', 'reviews_likes', 'reports', 'stores',
--                     'guidebooks', 'guidebook_items', 'notices');
-- → 모두 rowsecurity = true 여야 함

-- 정책 목록 확인
-- SELECT tablename, policyname, cmd FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;


-- ═════════════════════════════════════════════════════════════
-- ⚠️ 적용 후 주의사항
-- ═════════════════════════════════════════════════════════════
-- ▸ 기존 users 데이터의 auth_user_id 는 NULL → 첫 로그인 시 앱이 자동 매핑
-- ▸ 그 전까지는 해당 사용자의 favorites/collections/reviews_likes 접근 불가
-- ▸ 깔끔히 시작하려면 supabase_reset_users.sql 한 번 더 실행 권장
