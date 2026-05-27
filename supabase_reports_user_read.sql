-- ─────────────────────────────────────────────────────────────
-- reports SELECT 정책 보강 — 본인 제보 조회 허용
-- ─────────────────────────────────────────────────────────────
-- 이전: 어드민만 SELECT (사용자는 본인 제보도 못 읽어서 마이페이지 카운트 0)
-- 변경: 본인 user_id 매칭 + 어드민 둘 다 SELECT 허용
--
-- 적용 방법:
--   Supabase Dashboard → SQL Editor → 전체 복사 후 Run
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "reports: admins can read" ON reports;
DROP POLICY IF EXISTS "reports: own or admin read" ON reports;

CREATE POLICY "reports: own or admin read"
  ON reports FOR SELECT
  USING (
    is_admin()
    OR user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid())
  );

-- 검증
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'reports';
