-- ─────────────────────────────────────────────────────────────
-- getAnonymousKey 도입 마이그레이션: 기존 사용자 데이터 초기화
-- ─────────────────────────────────────────────────────────────
-- 이전: toss_user_id = 'local_xxxx' (브라우저 localStorage 랜덤 UUID)
-- 이후: toss_user_id = 토스 공식 익명 해시
--
-- ⚠️ 주의: 이 스크립트는 모든 사용자 데이터(즐겨찾기/모음집/리뷰 포함)를 삭제합니다.
--         테스트 단계에서만 사용하세요.
--
-- 적용 방법:
--   1. Supabase Dashboard → SQL Editor
--   2. 아래 내용 복사 → Run
-- ─────────────────────────────────────────────────────────────

-- ── 옵션 A: 전체 사용자 데이터 삭제 (권장 — 클린 시작) ──────
-- reports.user_id FK는 ON DELETE CASCADE가 없어 먼저 비워야 함
-- 나머지 favorites/collections/collection_stores/reviews/reviews_likes는
-- users 삭제 시 CASCADE로 자동 삭제됨
DELETE FROM reports;
DELETE FROM users;

-- 확인 쿼리
SELECT 'users' AS table_name, COUNT(*) AS row_count FROM users
UNION ALL SELECT 'reports', COUNT(*) FROM reports
UNION ALL SELECT 'favorites', COUNT(*) FROM favorites
UNION ALL SELECT 'collections', COUNT(*) FROM collections
UNION ALL SELECT 'collection_stores', COUNT(*) FROM collection_stores
UNION ALL SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL SELECT 'reviews_likes', COUNT(*) FROM reviews_likes;
-- 모두 0이어야 함

-- ─────────────────────────────────────────────────────────────
-- 옵션 B (선택): local_xxxx 사용자만 삭제 (이미 일부 HASH 사용자가 있을 때)
-- ─────────────────────────────────────────────────────────────
-- DELETE FROM reports WHERE user_id IN (SELECT id FROM users WHERE toss_user_id LIKE 'local_%');
-- DELETE FROM users WHERE toss_user_id LIKE 'local_%';

-- ─────────────────────────────────────────────────────────────
-- (선택) 향후 reports도 CASCADE로 변경하려면:
-- ALTER TABLE reports DROP CONSTRAINT reports_user_id_fkey;
-- ALTER TABLE reports ADD CONSTRAINT reports_user_id_fkey
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────
-- 참고: stores/guidebooks/guidebook_items 등 운영 데이터는 영향 없음
-- ─────────────────────────────────────────────────────────────
