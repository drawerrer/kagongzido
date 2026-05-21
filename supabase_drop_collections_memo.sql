-- ─────────────────────────────────────────────────────────────
-- collections.memo 컬럼 제거
-- ─────────────────────────────────────────────────────────────
-- 이유: 매장별 메모는 collection_stores.memo 에 저장됨
--       collections.memo (컬렉션 자체 메모) 는 UI에서 사용 안 함 (죽은 컬럼)
-- ─────────────────────────────────────────────────────────────

-- 1단계: 현재 데이터 확인 (혹시 들어있는 값 있는지)
SELECT id, name, memo FROM collections WHERE memo IS NOT NULL;
-- ↑ 결과가 비어있어야 안전. 데이터 있으면 백업 후 진행 권장.


-- 2단계: 컬럼 제거
ALTER TABLE collections DROP COLUMN IF EXISTS memo;


-- 3단계: 검증
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'collections'
ORDER BY ordinal_position;
-- → memo 가 없어야 정상
