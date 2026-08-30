// 카카오 로컬 API — 키워드 검색 (어드민 장소 등록 자동 채움용)
// 문서: https://developers.kakao.com/docs/latest/ko/local/dev-guide#search-by-keyword

export interface KakaoPlaceDoc {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  road_address_name: string;
  address_name: string;
  phone: string;
  x: string; // 경도
  y: string; // 위도
  place_url: string;
}

export async function searchKakaoPlaces(
  query: string,
  opts?: { categoryGroupCode?: string },
): Promise<KakaoPlaceDoc[]> {
  const key = import.meta.env.VITE_KAKAO_REST_KEY as string | undefined;
  if (!key) throw new Error('VITE_KAKAO_REST_KEY가 설정되어 있지 않아요.');

  const url = new URL('https://dapi.kakao.com/v2/local/search/keyword.json');
  url.searchParams.set('query', query);
  url.searchParams.set('size', '10');
  if (opts?.categoryGroupCode) url.searchParams.set('category_group_code', opts.categoryGroupCode);

  const res = await fetch(url, { headers: { Authorization: `KakaoAK ${key}` } });
  if (!res.ok) throw new Error(`카카오 API 오류: ${res.status} ${res.statusText}`);

  const json = await res.json();
  return (json.documents ?? []) as KakaoPlaceDoc[];
}
