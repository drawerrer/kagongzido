-- ─────────────────────────────────────────────────────────────
-- reports / guidebooks 의 created_at NOT NULL 일관성 정정
-- ─────────────────────────────────────────────────────────────
-- 배경: 다른 테이블의 created_at 은 NOT NULL DEFAULT now() 인데
--       reports / guidebooks 만 nullable 이었음 → 일관성 보강
--
-- 적용 방법:
--   Supabase Dashboard → SQL Editor → 전체 복사 → Run
-- ─────────────────────────────────────────────────────────────

-- 사전 검증 (NULL 값 있으면 안 됨)
DO $$
DECLARE
  null_reports integer;
  null_guidebooks integer;
BEGIN
  SELECT COUNT(*) INTO null_reports FROM reports WHERE created_at IS NULL;
  SELECT COUNT(*) INTO null_guidebooks FROM guidebooks WHERE created_at IS NULL;

  IF null_reports > 0 OR null_guidebooks > 0 THEN
    RAISE EXCEPTION 'created_at NULL 값 존재 — reports: % / guidebooks: %', null_reports, null_guidebooks;
  END IF;
END $$;

-- NOT NULL + DEFAULT 적용
ALTER TABLE reports
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE guidebooks
  ALTER COLUMN created_at SET NOT NULL,
  ALTER COLUMN created_at SET DEFAULT now();

-- 검증
SELECT table_name, column_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'created_at'
  AND table_name IN ('reports', 'guidebooks');
-- → is_nullable 둘 다 NO 여야 함
