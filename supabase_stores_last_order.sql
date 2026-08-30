-- ================================================
-- stores.last_order 컬럼 추가 (카페 라스트오더 시간)
-- Supabase Dashboard > SQL Editor 에서 실행하세요
--
-- 어드민 "장소 등록" 탭에서 카페의 이용시간과 별도로
-- 라스트오더 시간을 입력할 수 있게 하기 위해 추가.
-- 이 SQL을 실행하기 전까지는 라스트오더 입력값이 저장되지 않아요
-- (어드민 저장 로직은 이 컬럼이 없으면 last_order를 payload에서 빼고 저장함).
-- ================================================

alter table if exists stores add column if not exists last_order jsonb;

comment on column stores.last_order is
  '요일별 라스트오더 시각 — {"월":"21:30","화":"21:30",...} 형태의 jsonb 객체. 값이 없는 요일은 키 자체가 생략됨.';
