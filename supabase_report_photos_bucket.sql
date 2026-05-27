-- ─────────────────────────────────────────────────────────────
-- Supabase Storage — report-photos 버킷 정책
-- ─────────────────────────────────────────────────────────────
-- 사전 조건:
--   Supabase Dashboard → Storage → New bucket
--   - Name:          report-photos
--   - Public bucket: ✅ (사용자가 자기 사진 볼 수 있어야 함)
--   - File size:     5MB
--   - MIME types:    image/jpeg, image/png (선택)
--
-- 위 버킷 생성 후 아래 SQL 을 Dashboard → SQL Editor 에서 실행.
-- ─────────────────────────────────────────────────────────────

-- 1) INSERT — 누구나 업로드 (제보 시)
DROP POLICY IF EXISTS "report-photos: anyone insert" ON storage.objects;
CREATE POLICY "report-photos: anyone insert"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id = 'report-photos');

-- 2) SELECT — 누구나 읽기 (퍼블릭 URL 접근)
DROP POLICY IF EXISTS "report-photos: anyone read" ON storage.objects;
CREATE POLICY "report-photos: anyone read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'report-photos');

-- 3) DELETE — 어드민만 삭제
DROP POLICY IF EXISTS "report-photos: admin delete" ON storage.objects;
CREATE POLICY "report-photos: admin delete"
  ON storage.objects FOR DELETE TO public
  USING (bucket_id = 'report-photos' AND is_admin());

-- ═════════════════════════════════════════════════════════════
-- review-photos 버킷도 같은 패턴으로 (리뷰 사진용)
-- 사전: Dashboard 에서 review-photos 버킷도 동일 옵션으로 생성
-- ═════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "review-photos: anyone insert" ON storage.objects;
CREATE POLICY "review-photos: anyone insert"
  ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id = 'review-photos');

DROP POLICY IF EXISTS "review-photos: anyone read" ON storage.objects;
CREATE POLICY "review-photos: anyone read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'review-photos');

DROP POLICY IF EXISTS "review-photos: admin delete" ON storage.objects;
CREATE POLICY "review-photos: admin delete"
  ON storage.objects FOR DELETE TO public
  USING (bucket_id = 'review-photos' AND is_admin());

-- 검증
SELECT policyname, cmd
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND (policyname LIKE 'report-photos%' OR policyname LIKE 'review-photos%');
