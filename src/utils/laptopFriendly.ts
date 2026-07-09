// ── "노트북 펴기 좋은 카페" 우선순위 산정 ──────────────────────────
// 콘센트(outlet_status) × 좌석 규모(seat_status) 조합별 순위표.
// 기획에서 전달받은 순위표(1~9순위)를 그대로 하드코딩한다 — 두 축을 단순
// 사전식으로 정렬하면 나오지 않는 순서(예: '넉넉+소형'(5) 보다 '적당+중형'(4)
// 이 더 선호됨)이기 때문에 조합별 상수 테이블로 관리한다.
//
//   순위 | 콘센트 | 좌석
//   1    | 넉넉   | 대형
//   2    | 넉넉   | 중형
//   3    | 적당   | 대형
//   4    | 적당   | 중형
//   5    | 넉넉   | 소형
//   6    | 적당   | 소형
//   7    | 부족   | 대형
//   8    | 부족   | 중형
//   9    | 부족   | 소형
const RANK_TABLE: Record<string, number> = {
  '넉넉_대형': 1,
  '넉넉_중형': 2,
  '적당_대형': 3,
  '적당_중형': 4,
  '넉넉_소형': 5,
  '적당_소형': 6,
  '부족_대형': 7,
  '부족_중형': 8,
  '부족_소형': 9,
};

/**
 * 콘센트/좌석 상태값으로 "노트북 펴기 좋은" 순위(1~9, 낮을수록 좋음)를 반환.
 * 값이 없거나 알 수 없는 조합이면 null (추천 대상에서 제외).
 */
export function laptopFriendlyRank(
  outletStatus?: string | null,
  seatStatus?: string | null,
): number | null {
  if (!outletStatus || !seatStatus) return null;
  return RANK_TABLE[`${outletStatus}_${seatStatus}`] ?? null;
}

export interface RankableCafe {
  outletStatus?: string;
  seatStatus?: string;
  distance: number;
}

/**
 * 순위 기준 만족 카페 중 (거리 → 순위) 순으로 정렬해 상위 N개를 뽑는다.
 * "내 주변 노트북 펴기 좋은 카페"라는 타이틀에 맞춰 거리(가까운 순)를 1순위로,
 * 거리가 같을 때만 콘센트/좌석 순위표를 타이브레이커로 사용한다.
 * 기준을 만족하지 않는 카페(콘센트/좌석 정보 미확인)는 후보에서 제외된다.
 */
export function pickTopLaptopFriendlyCafes<T extends RankableCafe>(cafes: T[], count = 3): T[] {
  return cafes
    .map(cafe => ({ cafe, rank: laptopFriendlyRank(cafe.outletStatus, cafe.seatStatus) }))
    .filter((x): x is { cafe: T; rank: number } => x.rank !== null)
    .sort((a, b) => (a.cafe.distance - b.cafe.distance) || (a.rank - b.rank))
    .slice(0, count)
    .map(x => x.cafe);
}
