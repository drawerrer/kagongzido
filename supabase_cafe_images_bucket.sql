-- ─────────────────────────────────────────────────────────────
-- Supabase Storage — cafe-images 버킷 정책 (어드민 직접 업로드용)
-- ─────────────────────────────────────────────────────────────
-- 사전 조건: cafe-images 버킷은 이미 존재함 (upload-images.mjs 등에서 사용 중,
--   Public: ✅). 지금까지는 SUPABASE_SERVICE_KEY(RLS 우회)로만 썼기 때문에
--   storage.objects에 대한 RLS 정책이 없었음 — 어드민 세션(anon key)이
--   직접 업로드할 수 있도록 is_admin() 기반 정책을 추가함.
--
-- 적용 방법: Supabase Dashboard → SQL Editor 에서 실행
-- 전제: is_admin() 함수는 supabase_rls.sql에서 이미 생성됨
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "cafe-images: admin insert" ON storage.objects;
CREATE POLICY "cafe-images: admin insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'cafe-images' AND is_admin());

DROP POLICY IF EXISTS "cafe-images: admin update" ON storage.objects;
CREATE POLICY "cafe-images: admin update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'cafe-images' AND is_admin())
  WITH CHECK (bucket_id = 'cafe-images' AND is_admin());

DROP POLICY IF EXISTS "cafe-images: admin delete" ON storage.objects;
CREATE POLICY "cafe-images: admin delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'cafe-images' AND is_admin());

DROP POLICY IF EXISTS "cafe-images: anyone read" ON storage.objects;
CREATE POLICY "cafe-images: anyone read"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'cafe-images');
