-- ================================================
-- 카공지도 Supabase 테이블 생성 SQL
-- Supabase Dashboard > SQL Editor 에서 실행하세요
-- ================================================

-- ================================================
-- STEP 1. 기존 테이블 전체 삭제
-- ================================================
drop table if exists reviews_likes cascade;
drop table if exists reviews cascade;
drop table if exists collection_stores cascade;
drop table if exists collections cascade;
drop table if exists favorites cascade;
drop table if exists stores cascade;
drop table if exists users cascade;

-- ================================================
-- STEP 2. 테이블 생성 (FK 의존성 순서대로)
-- ================================================

-- 1. 유저 (users)
create table if not exists users (
  id            uuid default gen_random_uuid() primary key,
  toss_user_id  text not null unique,            -- 토스 OAuth 고유 ID
  nickname      text,                            -- 사용자 설정 닉네임
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- 2. 매장 (stores)
create table if not exists stores (
  id             uuid default gen_random_uuid() primary key,
  api_place_id   text not null unique,           -- 카카오맵 API 매장 ID
  name           text not null,                  -- 매장 이름
  category       text not null,                  -- 카테고리
  address_road   text not null,                  -- 도로명 주소
  latitude       numeric not null,               -- 위도
  longitude      numeric not null,               -- 경도
  phone_number   text,                           -- 전화번호
  thumbnail_url  text not null,                  -- 대표 이미지 URL
  photo_urls     text[],                         -- 매장 사진 목록
  business_hours jsonb,                          -- 영업시간 정보
  website_url    text,                           -- 웹사이트/인스타그램
  seat_status    text not null,                  -- 좌석 상태
  outlet_status  text not null,                  -- 콘센트 상태
  noise_status   text not null,                  -- 소음 상태
  vibe_tags      text[] not null default '{}',   -- 분위기 태그
  base_price     integer not null,               -- 기본 가격대
  amenities      text[] not null default '{}',   -- 편의시설 목록
  badges         text[] not null default '{}',   -- 뱃지 (24시간, 콘센트많음 등)
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null
);

-- 3. 즐겨찾기 (favorites)
create table if not exists favorites (
  id           uuid default gen_random_uuid() primary key,
  user_id      uuid not null references users(id) on delete cascade,
  store_id     uuid not null references stores(id) on delete cascade,
  sort_order   int4 default 0,
  created_at   timestamptz default now() not null,
  updated_at   timestamptz default now() not null,
  unique (user_id, store_id)
);

-- 4. 컬렉션 (collections)
create table if not exists collections (
  id         uuid default gen_random_uuid() primary key,
  user_id    uuid not null references users(id) on delete cascade,
  name       text not null,
  sort_order int4 default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 5. 컬렉션 ↔ 매장 관계 (collection_stores)
create table if not exists collection_stores (
  id            uuid default gen_random_uuid() primary key,
  collection_id uuid not null references collections(id) on delete cascade,
  store_id      uuid not null references stores(id) on delete cascade,
  memo          text,
  sort_order    int4 default 0,
  created_at    timestamptz default now() not null,
  unique (collection_id, store_id)
);

-- 6. 리뷰 (reviews)
create table if not exists reviews (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid not null references users(id) on delete cascade,
  store_id      uuid not null references stores(id) on delete cascade,
  content       text not null,
  outlet_status text not null,
  seat_status   text not null,
  noise_status  text not null,
  photo_urls    text[],
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- 7. 리뷰 좋아요 (reviews_likes)
create table if not exists reviews_likes (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid not null references users(id) on delete cascade,
  review_id   uuid not null references reviews(id) on delete cascade,
  created_at  timestamptz default now() not null,
  unique (user_id, review_id)
);

-- ================================================
-- RLS (Row Level Security) — 개발 중에는 비활성
-- 배포 전에 활성화 권장
-- ================================================
-- alter table users enable row level security;
-- alter table stores enable row level security;
-- alter table favorites enable row level security;
-- alter table collections enable row level security;
-- alter table collection_stores enable row level security;
-- alter table reviews enable row level security;
-- alter table reviews_likes enable row level security;
