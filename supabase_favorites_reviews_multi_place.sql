-- ─────────────────────────────────────────────────────────────
-- favorites / reviews: 도서관·공유공간 찜·리뷰 지원
-- ─────────────────────────────────────────────────────────────
-- 배경:
--   favorites.store_id / reviews.store_id 는 stores(카페) 테이블만
--   가리키는 NOT NULL FK 라서, 도서관(libraries)·공유공간(shared_spaces)은
--   찜/리뷰 저장이 원천적으로 불가능했음 (INSERT 시 23503 FK violation,
--   운영 DB에 실제 UUID로 재현 테스트하여 확인).
--
--   stores 테이블로 통합하는 방안은 검토 후 기각함 — stores는
--   category/seat_status/outlet_status/vibe_tags/base_price 등
--   카페 전용 NOT NULL 컬럼이 많아 도서관·공유공간과 스키마가 맞지 않고,
--   카페는 카카오 API에서 "지연 upsert"되는 반면 도서관·공유공간은
--   엑셀 큐레이션으로 이미 UUID PK를 갖고 미리 채워지는 등 데이터
--   생성 방식 자체가 달라 억지로 합치면 더 많은 컬럼이 nullable이 되어야 함.
--
--   대신 favorites/reviews 에 library_id/shared_space_id nullable FK를
--   추가하고, "셋 중 정확히 하나만 값이 있어야 한다"는 CHECK 제약으로
--   무결성을 강제함 (libraries/shared_spaces 테이블 자체는 변경 없음).
--
-- 영향:
--   - 기존 카페 찜/리뷰 데이터: store_id 만 채워져 있으므로 CHECK 통과, 무변화
--   - Postgres UNIQUE 제약은 NULL 을 서로 다른 값으로 취급하므로
--     unique(user_id, library_id) 는 partial index 없이도
--     "library_id가 NULL인 행끼리는 유니크 검사 제외" 가 자연히 성립함
--   - RLS 정책(supabase_auth_rls.sql / supabase_rls.sql)은 store_id를
--     참조하지 않고 user_id 기준으로만 검사하므로 별도 수정 불필요
--
-- 적용 방법: Supabase Dashboard → SQL Editor → 아래 전체 복사 후 Run
-- ─────────────────────────────────────────────────────────────

-- ── favorites ──────────────────────────────────────────────
alter table favorites
  alter column store_id drop not null;

alter table favorites
  add column if not exists library_id uuid references libraries(id) on delete cascade,
  add column if not exists shared_space_id uuid references shared_spaces(id) on delete cascade;

alter table favorites
  add constraint favorites_place_kind_check check (
    (store_id is not null)::int
    + (library_id is not null)::int
    + (shared_space_id is not null)::int = 1
  );

alter table favorites
  add constraint favorites_user_library_unique unique (user_id, library_id);

alter table favorites
  add constraint favorites_user_shared_space_unique unique (user_id, shared_space_id);

-- ── reviews ────────────────────────────────────────────────
alter table reviews
  alter column store_id drop not null;

alter table reviews
  add column if not exists library_id uuid references libraries(id) on delete cascade,
  add column if not exists shared_space_id uuid references shared_spaces(id) on delete cascade;

alter table reviews
  add constraint reviews_place_kind_check check (
    (store_id is not null)::int
    + (library_id is not null)::int
    + (shared_space_id is not null)::int = 1
  );

-- ─────────────────────────────────────────────────────────────
-- 검증 (SQL Editor에서 적용 직후 실행해보면 좋음)
-- ─────────────────────────────────────────────────────────────
-- 1) 기존 카페 찜/리뷰가 그대로 조회되는지 확인
--    SELECT count(*) FROM favorites WHERE store_id IS NOT NULL;
--    SELECT count(*) FROM reviews WHERE store_id IS NOT NULL;
--
-- 2) 셋 다 NULL / 둘 이상 채운 INSERT는 이제 CHECK violation(23514)이 나야 정상
--    INSERT INTO favorites (user_id, sort_order) VALUES ('...uuid...', 0);
--
-- 3) library_id만 채운 정상 INSERT가 성공하는지 확인
--    INSERT INTO favorites (user_id, library_id, sort_order) VALUES ('...uuid...', '...library uuid...', 0);
-- ─────────────────────────────────────────────────────────────
