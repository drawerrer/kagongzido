-- ================================================
-- libraries / shared_spaces 테이블 생성 SQL
-- Supabase Dashboard > SQL Editor 에서 실행하세요
-- ================================================

-- ── 도서관 (libraries) ──────────────────────────────────────────
create table if not exists libraries (
  id             uuid default gen_random_uuid() primary key,
  name           text not null unique,           -- 장소 이름 (upsert 기준 키)
  address_road   text not null default '',        -- 도로명 주소 (카카오 자동)
  latitude       numeric,                         -- 위도 (카카오 자동)
  longitude      numeric,                         -- 경도 (카카오 자동)
  phone_number   text,                            -- 전화번호 (카카오 자동)
  thumbnail_url  text,                            -- 대표 이미지
  photo_urls     text[],                          -- 사진 목록
  business_hours text,                            -- 이용시간
  ent_price      text,                            -- 입장료
  ent_condition  text,                            -- 입장 조건
  lt_seat_status text,                            -- 노트북 좌석 여부
  noise_status   text,                            -- 소음 수준
  facilities     text[],                          -- 시설 (층수 등)
  amenities      text[],                          -- 편의시설
  badges         text[],                          -- 뱃지
  website_url    text,                            -- 웹사이트
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null
);

-- ── 공유공간 (shared_spaces) ────────────────────────────────────
create table if not exists shared_spaces (
  id             uuid default gen_random_uuid() primary key,
  name           text not null unique,           -- 장소 이름 (upsert 기준 키)
  address_road   text not null default '',        -- 도로명 주소 (카카오 자동)
  latitude       numeric,                         -- 위도 (카카오 자동)
  longitude      numeric,                         -- 경도 (카카오 자동)
  phone_number   text,                            -- 전화번호 (카카오 자동)
  thumbnail_url  text,                            -- 대표 이미지
  photo_urls     text[],                          -- 사진 목록
  business_hours text,                            -- 이용시간
  ent_price      text,                            -- 입장료
  ent_condition  text,                            -- 입장 조건
  lt_seat_status text,                            -- 노트북 좌석 여부
  noise_status   text,                            -- 소음 수준
  facilities     text[],                          -- 시설 (층수 등)
  amenities      text[],                          -- 편의시설
  badges         text[],                          -- 뱃지
  website_url    text,                            -- 웹사이트
  created_at     timestamptz default now() not null,
  updated_at     timestamptz default now() not null
);

-- ── 테이블이 이미 존재할 경우 누락 컬럼 추가 ──────────────────────
-- (이미 만들어져 있다면 아래 ALTER 구문만 실행하세요)
alter table if exists libraries add column if not exists noise_status   text;
alter table if exists libraries add column if not exists facilities     text[];
alter table if exists libraries add column if not exists badges         text[];
alter table if exists libraries add column if not exists ent_price      text;
alter table if exists libraries add column if not exists ent_condition  text;
alter table if exists libraries add column if not exists lt_seat_status text;
alter table if exists libraries add column if not exists website_url    text;

alter table if exists shared_spaces add column if not exists noise_status   text;
alter table if exists shared_spaces add column if not exists facilities     text[];
alter table if exists shared_spaces add column if not exists badges         text[];
alter table if exists shared_spaces add column if not exists ent_price      text;
alter table if exists shared_spaces add column if not exists ent_condition  text;
alter table if exists shared_spaces add column if not exists lt_seat_status text;
alter table if exists shared_spaces add column if not exists website_url    text;
