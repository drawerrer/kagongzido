-- ─────────────────────────────────────────────────────────────
-- naver_url 컬럼 추가 — 어드민 "네이버플레이스 자동 채움"에 붙여넣은 링크를
-- 그대로 저장해서, 앱의 "길 안내" 버튼이 검색 쿼리 대신 이 링크를 바로 열게 함
-- ─────────────────────────────────────────────────────────────
-- 적용 방법: Supabase Dashboard → SQL Editor 에서 실행
-- ─────────────────────────────────────────────────────────────

alter table if exists stores        add column if not exists naver_url text;
alter table if exists libraries     add column if not exists naver_url text;
alter table if exists shared_spaces add column if not exists naver_url text;
