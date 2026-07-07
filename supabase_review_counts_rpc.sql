-- ─────────────────────────────────────────────────────────────
-- get_review_counts RPC: 장소별(카페/도서관/공유공간) 리뷰 개수 집계
-- ─────────────────────────────────────────────────────────────
-- 배경:
--   홈 지도 목록, 모음집("저장한 매장"), 최근 본/커스텀 모음집 상세
--   화면의 카드들이 실제 리뷰 개수 대신 reviewCount: 0 을 하드코딩해서
--   보여주고 있었음 — 카페/도서관/공유공간 공통 문제.
--   (유일하게 DetailPage.tsx만 카페 상세 진입 시 fetchReviews() 결과의
--    .length 로 실시간 계산해서 정확한 값을 보여주고 있었음)
--
--   리스트 화면에서는 카드마다 개별 COUNT 쿼리를 날리기엔 비효율적이라
--   전체 장소의 리뷰 개수를 한 번에 집계해서 내려주는 RPC를 추가함.
--
-- 전제 조건:
--   이 파일은 supabase_favorites_reviews_multi_place.sql 이 먼저 적용되어
--   reviews 테이블에 library_id/shared_space_id 컬럼이 존재해야 동작함.
--   (해당 컬럼이 없는 상태에서 이 함수를 생성하면 CREATE FUNCTION 자체가
--    컬럼 참조 오류로 실패함) → 반드시 두 파일을 순서대로 적용할 것.
--
-- 반환 형태:
--   place_id (text) — 카페는 stores.api_place_id, 도서관/공유공간은 UUID 문자열.
--   두 ID 공간은 형식이 달라 충돌 가능성이 없으므로 단일 문자열 키로 병합해도 안전함.
--   review_count (bigint) — 해당 장소의 리뷰 개수
--
-- 클라이언트 사용: src/services/db.ts 의 fetchReviewCounts() 에서
--   supabase.rpc('get_review_counts') 로 호출, Record<place_id, count> 로 변환.
--
-- 적용 방법: Supabase Dashboard → SQL Editor → 아래 전체 복사 후 Run
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_review_counts()
RETURNS TABLE (place_id text, review_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.api_place_id AS place_id, count(*) AS review_count
  FROM reviews r
  JOIN stores s ON s.id = r.store_id
  WHERE r.store_id IS NOT NULL
  GROUP BY s.api_place_id

  UNION ALL

  SELECT r.library_id::text, count(*)
  FROM reviews r
  WHERE r.library_id IS NOT NULL
  GROUP BY r.library_id

  UNION ALL

  SELECT r.shared_space_id::text, count(*)
  FROM reviews r
  WHERE r.shared_space_id IS NOT NULL
  GROUP BY r.shared_space_id
$$;

-- SECURITY DEFINER 함수는 기본적으로 실행 권한이 없으므로 명시적으로 부여
-- (reviews/stores 를 직접 SELECT 하는 게 아니라 집계 결과만 반환하므로 RLS 우회 리스크 없음)
GRANT EXECUTE ON FUNCTION public.get_review_counts() TO anon, authenticated;

-- ── 검증 쿼리 ──
-- select * from get_review_counts() order by review_count desc limit 20;
