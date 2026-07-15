/** stores.vibe_tags 원본 배열을 개별 태그 목록으로 정규화 (줄바꿈/& 구분자 분해) */
export function splitVibeTags(raw?: string[] | null): string[] {
  return (raw ?? [])
    .flatMap(t => t.split('\n').flatMap(s => s.split('&')))
    .map(t => t.trim())
    .filter(Boolean);
}

/** 조명 태그를 먼저, 그 다음 무드(재질 등) 태그 순으로 정렬 — sort는 안정 정렬이라 그룹 내 원래 순서 유지 */
export function sortVibeTagsByLightFirst(tags: string[]): string[] {
  return [...tags].sort((a, b) => Number(!a.includes('조명')) - Number(!b.includes('조명')));
}
