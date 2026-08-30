-- ─────────────────────────────────────────────────────────────
-- cafe-images 저장공간 안전장치
-- ─────────────────────────────────────────────────────────────
-- Free 플랜 Storage 한도(1GB)에 근접하면:
--   1) 어드민 UI가 업로드 전에 get_cafe_images_storage_status()로 상태를 확인해
--      경고 배너를 띄우고 업로드를 막음 (UX)
--   2) storage.objects BEFORE INSERT 트리거가 DB 레벨에서 실제 업로드를 거부함
--      (브라우저 코드를 우회해도 막히는 최종 방어선)
--
-- 임계값: 1GB(1,073,741,824 bytes) - 1MB(1,048,576 bytes) 여유를 두고 차단
-- 실제 한도가 바뀌면 CAP_BYTES 상수만 수정하면 됨
--
-- 적용 방법: Supabase Dashboard → SQL Editor 에서 실행
-- ─────────────────────────────────────────────────────────────

-- ═════════════════════════════════════════════════════════════
-- 1) 어드민 UI용 상태 조회 RPC
-- ═════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.get_cafe_images_storage_status()
RETURNS TABLE (used_bytes bigint, cap_bytes bigint, remaining_bytes bigint, blocked boolean)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_used   bigint;
  v_cap    constant bigint := 1073741824; -- 1 GiB
  v_margin constant bigint := 1048576;    -- 1 MiB
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'admin only';
  END IF;

  SELECT COALESCE(SUM((metadata->>'size')::bigint), 0)
    INTO v_used
    FROM storage.objects
    WHERE bucket_id = 'cafe-images';

  RETURN QUERY SELECT v_used, v_cap, (v_cap - v_used), (v_used >= (v_cap - v_margin));
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_cafe_images_storage_status() TO authenticated;

-- ═════════════════════════════════════════════════════════════
-- 2) DB 레벨 하드 스톱 — storage.objects BEFORE INSERT 트리거
-- ═════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.enforce_cafe_images_storage_cap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_bytes bigint;
  new_bytes      bigint;
  cap_bytes      constant bigint := 1073741824; -- 1 GiB
  margin_bytes   constant bigint := 1048576;    -- 1 MiB
BEGIN
  IF NEW.bucket_id <> 'cafe-images' THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(SUM((metadata->>'size')::bigint), 0)
    INTO existing_bytes
    FROM storage.objects
    WHERE bucket_id = 'cafe-images';

  new_bytes := COALESCE((NEW.metadata->>'size')::bigint, 0);

  IF existing_bytes + new_bytes > (cap_bytes - margin_bytes) THEN
    RAISE EXCEPTION
      'cafe-images storage cap reached (% / % bytes used) — upload blocked to avoid exceeding the free storage limit',
      existing_bytes, cap_bytes
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_cafe_images_storage_cap ON storage.objects;
CREATE TRIGGER enforce_cafe_images_storage_cap
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_cafe_images_storage_cap();
