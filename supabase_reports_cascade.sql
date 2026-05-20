-- ─────────────────────────────────────────────────────────────
-- reports.user_id FK → ON DELETE CASCADE 로 변경
-- ─────────────────────────────────────────────────────────────
-- 효과: users 행 삭제 시 해당 사용자의 reports 도 자동 삭제됨
-- (회원 탈퇴, 사용자 초기화 시 reports 수동 정리 불필요)
--
-- 적용 방법:
--   Supabase Dashboard → SQL Editor → 전체 복사 후 Run
-- ─────────────────────────────────────────────────────────────

-- 기존 FK 제거 (제약 이름이 다를 수 있어 IF EXISTS 사용)
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_user_id_fkey;

-- CASCADE 옵션으로 재생성
ALTER TABLE reports ADD CONSTRAINT reports_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- ═════════════════════════════════════════════════════════════
-- 확인 쿼리 (선택)
-- ═════════════════════════════════════════════════════════════
-- SELECT
--   conname AS constraint_name,
--   confdeltype AS on_delete  -- 'c' = CASCADE, 'a' = NO ACTION
-- FROM pg_constraint
-- WHERE conrelid = 'reports'::regclass AND contype = 'f';
-- → on_delete 가 'c' 로 표시되면 정상
