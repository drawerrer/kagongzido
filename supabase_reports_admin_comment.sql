-- ─────────────────────────────────────────────────────────────
-- reports.admin_comment 컬럼 추가 (어드민 메모용)
-- ─────────────────────────────────────────────────────────────
-- 용도: 어드민이 제보를 검토하면서 남기는 내부 메모
--       (예: "방문 확인 완료", "사용자에게 확인 요청 필요" 등)
--
-- 적용 방법:
--   Supabase Dashboard → SQL Editor → 전체 복사 후 Run
-- ─────────────────────────────────────────────────────────────

ALTER TABLE reports
  ADD COLUMN IF NOT EXISTS admin_comment text NULL;

-- 검증
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'reports'
  AND column_name = 'admin_comment';
-- → 1줄 결과 (text / YES) 가 나와야 정상
