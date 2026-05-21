-- ─────────────────────────────────────────────────────────────
-- 주기적 데이터 정리 작업 (pg_cron 사용)
-- ─────────────────────────────────────────────────────────────
-- 사전 조건:
--   Supabase Dashboard → Database → Extensions → pg_cron Enable
--
-- 적용 방법:
--   Supabase Dashboard → SQL Editor → 전체 복사 → Run
-- ─────────────────────────────────────────────────────────────


-- ═════════════════════════════════════════════════════════════
-- 작업 1) 닉네임 미설정 7일 이상 사용자 정리
-- ═════════════════════════════════════════════════════════════
-- 매주 일요일 새벽 3시 (KST) = 토요일 18시 (UTC) 실행

-- 기존 동일 작업 있으면 제거 (재실행 안전)
SELECT cron.unschedule('cleanup_anonymous_users')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup_anonymous_users');

-- 새 작업 등록
SELECT cron.schedule(
  'cleanup_anonymous_users',
  '0 18 * * 6',  -- 매주 토요일 18:00 UTC = 일요일 03:00 KST
  $$
    DELETE FROM users
    WHERE nickname IS NULL
      AND created_at < NOW() - INTERVAL '7 days';
  $$
);


-- ═════════════════════════════════════════════════════════════
-- (선택) 작업 2) 익명 auth 세션 정리
-- ═════════════════════════════════════════════════════════════
-- users 행이 삭제되어 고아가 된 auth.users(is_anonymous=true) 정리
-- 매주 일요일 새벽 3시 30분 실행

-- SELECT cron.unschedule('cleanup_orphan_anon_auth')
-- WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'cleanup_orphan_anon_auth');

-- SELECT cron.schedule(
--   'cleanup_orphan_anon_auth',
--   '30 18 * * 6',
--   $$
--     DELETE FROM auth.users
--     WHERE is_anonymous = true
--       AND id NOT IN (SELECT auth_user_id FROM public.users WHERE auth_user_id IS NOT NULL)
--       AND created_at < NOW() - INTERVAL '30 days';
--   $$
-- );


-- ═════════════════════════════════════════════════════════════
-- 등록된 cron 작업 확인
-- ═════════════════════════════════════════════════════════════
-- SELECT jobid, jobname, schedule, command, active
-- FROM cron.job
-- ORDER BY jobname;

-- ═════════════════════════════════════════════════════════════
-- 최근 실행 이력 확인 (디버깅용)
-- ═════════════════════════════════════════════════════════════
-- SELECT jobid, runid, status, return_message, start_time, end_time
-- FROM cron.job_run_details
-- ORDER BY start_time DESC
-- LIMIT 10;


-- ═════════════════════════════════════════════════════════════
-- 작업 중단/제거가 필요할 때
-- ═════════════════════════════════════════════════════════════
-- SELECT cron.unschedule('cleanup_anonymous_users');
