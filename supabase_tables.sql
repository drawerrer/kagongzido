-- ================================================
-- 카공지도 Supabase 테이블 생성 SQL
-- Supabase Dashboard > SQL Editor 에서 실행하세요
-- ================================================

-- 1. 찜한 매장
create table if not exists favorites (
  id           uuid default gen_random_uuid() primary key,
  user_id      text not null,
  store_id     text not null,
  name         text not null,
  address      text not null,
  rating       numeric,
  review_count int,
  badge        text,
  photos       text[],
  sort_order   int default 0,
  created_at   timestamptz default now(),
  unique (user_id, store_id)
);

-- 2. 컬렉션
create table if not exists collections (
  id         text primary key,
  user_id    text not null,
  name       text not null,
  memo       text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- 3. 컬렉션 ↔ 매장 관계
create table if not exists collection_stores (
  id            uuid default gen_random_uuid() primary key,
  collection_id text references collections(id) on delete cascade,
  store_id      text not null,
  memo          text,
  sort_order    int default 0,
  unique (collection_id, store_id)
);

-- ================================================
-- RLS (Row Level Security) — 개발 중에는 비활성
-- 배포 전에 활성화 권장
-- ================================================
-- alter table favorites enable row level security;
-- alter table collections enable row level security;
-- alter table collection_stores enable row level security;
