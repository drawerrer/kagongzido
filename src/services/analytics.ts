import { Analytics } from '@apps-in-toss/web-framework';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

type EventParams = Record<string, string | number | boolean>;

function ga(eventName: string, params?: EventParams) {
  try { window.gtag?.('event', eventName, params); } catch { /* 토스 앱 외 환경에서 무시 */ }
}

function ait(params: { log_name: string } & EventParams) {
  try { Analytics.click(params as Parameters<typeof Analytics.click>[0]); } catch { /* 토스 앱 외 환경에서 무시 */ }
}

function aitScreen(params: { log_name: string } & EventParams) {
  try { Analytics.screen(params as Parameters<typeof Analytics.screen>[0]); } catch { /* 토스 앱 외 환경에서 무시 */ }
}

// ── 화면 진입(page_view) ──────────────────────────────────────
export function trackPageView(screenName: string) {
  const params = { log_name: 'screen_view', screen_name: screenName };
  aitScreen(params);
  ga('screen_view', params);
}

// ── 필터 ──────────────────────────────────────────────────────
export function trackFilterOpen() {
  ait({ log_name: 'filter_open' });
  ga('filter_open');
}

export function trackFilterApply(
  filters: { moods: string[]; amenities: string[]; priceMax: number; openNow: boolean },
  resultCount: number,
) {
  const params = {
    log_name: 'filter_apply',
    mood_count: filters.moods.length,
    option_count: filters.amenities.length,
    price_max: filters.priceMax,
    result_count: resultCount,
  };
  ait(params);
  ga('filter_apply', params);
}

export function trackFilterReset() {
  ait({ log_name: 'filter_reset' });
  ga('filter_reset');
}

export function trackChipTap(chipName: string, activated: boolean) {
  const params = { log_name: 'chip_tap', chip_name: chipName, activated };
  ait(params);
  ga('chip_tap', params);
}

// ── 카페 발견 ─────────────────────────────────────────────────
export function trackCafeDetailView(cafeId: string, source: 'map_marker' | 'list' | 'search' | 'nearby_sheet') {
  const params = { log_name: 'cafe_detail_view', cafe_id: cafeId, source };
  ait(params);
  ga('cafe_detail_view', params);
}

export function trackMapOpen(cafeId: string, cafeName: string) {
  const params = { log_name: 'map_open', cafe_id: cafeId, cafe_name: cafeName };
  ait(params);
  ga('map_open', params);
}

export function trackSearchUse(query: string, resultCount?: number) {
  const params: EventParams = { log_name: 'search_use', query };
  if (resultCount !== undefined) params.result_count = resultCount;
  ait(params as { log_name: string } & EventParams);
  ga('search_use', params);
}

export function trackShareCafe(cafeId: string, method: string) {
  const params = { log_name: 'share_cafe', cafe_id: cafeId, method };
  ait(params);
  ga('share_cafe', params);
}

export function trackViewModeChange(mode: 'map' | 'list') {
  const params = { log_name: 'view_mode_change', mode };
  ait(params);
  ga('view_mode_change', params);
}

// ── 방문 확인 ─────────────────────────────────────────────────
export function trackReviewWriteComplete(cafeId: string, hasPhoto: boolean) {
  const params = { log_name: 'review_write_complete', cafe_id: cafeId, has_photo: hasPhoto };
  ait(params);
  ga('review_write_complete', params);
}

export function trackCafeFavoriteAdd(cafeId: string) {
  const params = { log_name: 'cafe_favorite_add', cafe_id: cafeId };
  ait(params);
  ga('cafe_favorite_add', params);
}

// ── UTM 유입 추적 ─────────────────────────────────────────────
export function trackUtmEntry(params: {
  utm_source: string;
  utm_medium?: string;
  utm_campaign?: string;
}) {
  const eventParams = {
    log_name: 'utm_entry',
    utm_source: params.utm_source,
    utm_medium: params.utm_medium ?? '(none)',
    utm_campaign: params.utm_campaign ?? '(none)',
  };
  ait(eventParams);
  ga('utm_entry', eventParams);
}

// ── 지금 내 주변 노트북 펴기 좋은 카페 3곳 ──────────────────────
export function trackNearbyLaptopSheetShow(cafeCount: number) {
  const params = { log_name: 'nearby_laptop_sheet_show', cafe_count: cafeCount };
  ait(params);
  ga('nearby_laptop_sheet_show', params);
}

export function trackNearbyLaptopSheetConfirm() {
  ait({ log_name: 'nearby_laptop_sheet_confirm' });
  ga('nearby_laptop_sheet_confirm');
}

export function trackPhoneCopy(cafeId: string) {
  const params = { log_name: 'phone_copy', cafe_id: cafeId };
  ait(params);
  ga('phone_copy', params);
}

// ── 모음집 ────────────────────────────────────────────────────
export function trackCollectionCreate() {
  ait({ log_name: 'collection_create' });
  ga('collection_create');
}

export function trackCollectionAddCafe(cafeId: string) {
  const params = { log_name: 'collection_add_cafe', cafe_id: cafeId };
  ait(params);
  ga('collection_add_cafe', params);
}

// ── 지도 이동 ──────────────────────────────────────────────────
export function trackMapMove(lat: number, lng: number, zoomLevel: number) {
  const params = { log_name: 'map_move', lat, lng, zoom_level: zoomLevel };
  ait(params);
  ga('map_move', params);
}

// ── 카페 취향 월드컵 ──────────────────────────────────────────
/** [마이] 탭의 '카페 취향 월드컵' CTA를 눌러 진입했을 때 */
export function trackTasteWorldcupMyPageClick() {
  ait({ log_name: 'taste_worldcup_mypage_click' });
  ga('taste_worldcup_mypage_click');
}

/** 온보딩 화면에서 '시작하기'를 눌러 실제로 게임을 시작했을 때 */
export function trackTasteWorldcupStart() {
  ait({ log_name: 'taste_worldcup_start' });
  ga('taste_worldcup_start');
}

/** 16강을 모두 마치고 결과 페이지에 도달했을 때(winner 확정 시점) */
export function trackTasteWorldcupResultView(winnerId: string) {
  const params = { log_name: 'taste_worldcup_result_view', winner_id: winnerId };
  ait(params);
  ga('taste_worldcup_result_view', params);
}

/** 게임을 시작했지만 결과 페이지에 도달하기 전에 이탈(뒤로가기/스와이프/탭 전환 등)했을 때 */
export function trackTasteWorldcupAbandon(step: number) {
  const params = { log_name: 'taste_worldcup_abandon', step };
  ait(params);
  ga('taste_worldcup_abandon', params);
}

// ── 카페 제보하기 — 진입 경로별 클릭/완료 ─────────────────────
/** [홈] 탭 지도 화면의 '카페 제보하기' 플로팅 버튼을 눌렀을 때 */
export function trackReportHomeFloatingClick() {
  ait({ log_name: 'report_home_floating_click' });
  ga('report_home_floating_click');
}

/** 홈 플로팅 버튼을 통해 진입한 제보를 실제로 제출 완료했을 때 */
export function trackReportHomeFloatingSubmit() {
  ait({ log_name: 'report_home_floating_submit' });
  ga('report_home_floating_submit');
}

/** [마이] 탭의 '카페 제보하기' CTA 버튼을 눌렀을 때 */
export function trackReportMyPageClick() {
  ait({ log_name: 'report_mypage_click' });
  ga('report_mypage_click');
}

/** 마이페이지에서 진입한 제보를 실제로 제출 완료했을 때 */
export function trackReportMyPageSubmit() {
  ait({ log_name: 'report_mypage_submit' });
  ga('report_mypage_submit');
}

/** [검색] 페이지 배너를 눌렀을 때 */
export function trackReportSearchBannerClick() {
  ait({ log_name: 'report_search_banner_click' });
  ga('report_search_banner_click');
}

/** 검색 배너를 통해 진입한 제보를 실제로 제출 완료했을 때 */
export function trackReportSearchBannerSubmit() {
  ait({ log_name: 'report_search_banner_submit' });
  ga('report_search_banner_submit');
}

// ── 상세페이지 체류시간 (취향 매칭 라벨 유무 비교) ──────────────
/**
 * 상세페이지를 벗어날 때(뒤로가기/닫기/언마운트) 체류시간을 기록.
 * matched: 이 카페가 사용자의 '내 취향과 일치' 라벨이 붙어 노출된 상세페이지였는지 여부.
 * matched=true/false 두 그룹의 duration_ms 평균을 GA4에서 비교하면 라벨 유무에 따른
 * 체류시간 차이를 분석할 수 있다.
 */
export function trackDetailDwellTime(cafeId: string, matched: boolean, durationMs: number) {
  const params = { log_name: 'detail_dwell_time', cafe_id: cafeId, matched, duration_ms: Math.round(durationMs) };
  ait(params);
  ga('detail_dwell_time', params);
}
