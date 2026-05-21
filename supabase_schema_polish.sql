-- ─────────────────────────────────────────────────────────────
-- 스키마 보강 마이그레이션 (출시 전 품질 강화)
-- ─────────────────────────────────────────────────────────────
-- 적용 항목:
--   1) guidebook_items.store_id 타입 text → uuid 정정 + FK 재정의
--   2) guidebooks.updated_at + guidebook_items.created_at 컬럼 추가
--   3) 자주 조회되는 컬럼 인덱스 일괄 추가 (성능)
--   4) reviews_likes (user_id, review_id) UNIQUE 제약 (중복 좋아요 방지)
--   5) reports.status CHECK 제약 + 기본값 'pending'
--   6) stores.closed_at 폐업/임시휴업 추적 컬럼
--   7) guidebooks 에도 updated_at 자동 갱신 트리거
--
-- 적용 방법:
--   Supabase Dashboard → SQL Editor → 전체 복사 → Run
--   ⚠️ 1번은 데이터 정합성 영향 가능 — 실행 전 검증 단계 포함됨
-- ─────────────────────────────────────────────────────────────


-- ═════════════════════════════════════════════════════════════
-- 1. guidebook_items.store_id 타입 정정 (text → uuid)
-- ═════════════════════════════════════════════════════════════
-- 사전 검증: 현재 값이 모두 유효한 uuid 형태인지 확인
DO $$
DECLARE
  invalid_count integer;
BEGIN
  SELECT COUNT(*) INTO invalid_count
  FROM guidebook_items
  WHERE store_id IS NOT NULL
    AND store_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

  IF invalid_count > 0 THEN
    RAISE EXCEPTION 'guidebook_items.store_id 에 uuid 형식 아닌 값 % 건 존재 — 마이그레이션 중단', invalid_count;
  END IF;
END $$;

-- 기존 FK 제약 (있다면) 제거
ALTER TABLE guidebook_items DROP CONSTRAINT IF EXISTS guidebook_items_store_id_fkey;

-- 컬럼 타입 변경
ALTER TABLE guidebook_items
  ALTER COLUMN store_id TYPE uuid USING store_id::uuid;

-- FK 재정의 (uuid → uuid, CASCADE로 매장 삭제 시 가이드북 아이템도 정리)
ALTER TABLE guidebook_items
  ADD CONSTRAINT guidebook_items_store_id_fkey
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE;


-- ═════════════════════════════════════════════════════════════
-- 2. 시간 컬럼 누락 보완
-- ═════════════════════════════════════════════════════════════
ALTER TABLE guidebooks
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE guidebook_items
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();


-- ═════════════════════════════════════════════════════════════
-- 3. 인덱스 일괄 추가 (자주 조회되는 FK 컬럼들)
-- ═════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS favorites_user_id_idx
  ON favorites (user_id);

CREATE INDEX IF NOT EXISTS collections_user_id_idx
  ON collections (user_id);

CREATE INDEX IF NOT EXISTS collection_stores_collection_id_idx
  ON collection_stores (collection_id);

CREATE INDEX IF NOT EXISTS collection_stores_store_id_idx
  ON collection_stores (store_id);

CREATE INDEX IF NOT EXISTS reviews_store_id_idx
  ON reviews (store_id);

CREATE INDEX IF NOT EXISTS reviews_user_id_idx
  ON reviews (user_id);

CREATE INDEX IF NOT EXISTS reviews_likes_review_id_idx
  ON reviews_likes (review_id);

CREATE INDEX IF NOT EXISTS reports_user_id_idx
  ON reports (user_id);

CREATE INDEX IF NOT EXISTS guidebook_items_guidebook_id_idx
  ON guidebook_items (guidebook_id);

CREATE INDEX IF NOT EXISTS guidebook_items_store_id_idx
  ON guidebook_items (store_id);

-- 매장 검색용
CREATE INDEX IF NOT EXISTS stores_category_idx
  ON stores (category);


-- ═════════════════════════════════════════════════════════════
-- 4. reviews_likes — 같은 사용자가 같은 리뷰 중복 좋아요 방지
-- ═════════════════════════════════════════════════════════════
-- 기존 중복 데이터 제거 (가장 오래된 것만 남김)
DELETE FROM reviews_likes a
USING reviews_likes b
WHERE a.id > b.id
  AND a.user_id = b.user_id
  AND a.review_id = b.review_id;

-- UNIQUE 제약 추가 (이미 있으면 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'reviews_likes'::regclass
      AND conname = 'reviews_likes_user_review_unique'
  ) THEN
    ALTER TABLE reviews_likes
      ADD CONSTRAINT reviews_likes_user_review_unique
      UNIQUE (user_id, review_id);
  END IF;
END $$;


-- ═════════════════════════════════════════════════════════════
-- 5. reports.status 값 통제 + 기본값
-- ═════════════════════════════════════════════════════════════
-- 기존에 정의된 값 외 데이터 정리 (혹시 모를 케이스 대비)
UPDATE reports SET status = 'pending'
WHERE status IS NULL OR status NOT IN ('pending', 'reviewing', 'resolved', 'rejected');

-- 기본값 지정
ALTER TABLE reports ALTER COLUMN status SET DEFAULT 'pending';

-- CHECK 제약 추가 (이미 있으면 무시)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'reports'::regclass
      AND conname = 'reports_status_check'
  ) THEN
    ALTER TABLE reports
      ADD CONSTRAINT reports_status_check
      CHECK (status IN ('pending', 'reviewing', 'resolved', 'rejected'));
  END IF;
END $$;


-- ═════════════════════════════════════════════════════════════
-- 6. stores 폐업/임시휴업 추적
-- ═════════════════════════════════════════════════════════════
-- NULL = 영업 중, NOT NULL = 폐업/휴업 시작 시점
ALTER TABLE stores
  ADD COLUMN IF NOT EXISTS closed_at timestamptz NULL;

-- 영업 중 매장만 빠르게 조회하기 위한 부분 인덱스
CREATE INDEX IF NOT EXISTS stores_active_idx
  ON stores (id)
  WHERE closed_at IS NULL;


-- ═════════════════════════════════════════════════════════════
-- 7. guidebooks updated_at 자동 갱신 트리거
-- ═════════════════════════════════════════════════════════════
-- (다른 테이블은 supabase_updated_at_triggers.sql 에서 처리됨)
DROP TRIGGER IF EXISTS guidebooks_set_updated_at ON guidebooks;
CREATE TRIGGER guidebooks_set_updated_at
  BEFORE UPDATE ON guidebooks
  FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();


-- ═════════════════════════════════════════════════════════════
-- 8. 검증 쿼리 (선택)
-- ═════════════════════════════════════════════════════════════

-- (1) 변경된 컬럼 타입 확인
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND ((table_name = 'guidebook_items' AND column_name IN ('store_id', 'created_at'))
--    OR (table_name = 'guidebooks' AND column_name = 'updated_at')
--    OR (table_name = 'stores' AND column_name = 'closed_at'))
-- ORDER BY table_name, column_name;

-- (2) 인덱스 목록
-- SELECT tablename, indexname FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;

-- (3) reports 상태값 분포
-- SELECT status, COUNT(*) FROM reports GROUP BY status;

-- (4) 제약조건 목록
-- SELECT conrelid::regclass AS table_name, conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid IN (
--   'reviews_likes'::regclass, 'reports'::regclass, 'guidebook_items'::regclass
-- )
-- ORDER BY conrelid, conname;
