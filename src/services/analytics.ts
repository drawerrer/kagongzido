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
