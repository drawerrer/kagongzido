/**
 * 사용자 정보 로컬 캐시 헬퍼.
 *
 * 목적
 *  - 토스 미니앱 콜드 런치 시 Supabase 세션이 복원되기 전 즉시 닉네임 표시
 *  - 네트워크 실패·Auth 지연 등으로 DB 조회가 실패해도 마지막 알려진 상태 보존
 *
 * 캐시 키 (단일 슬롯)
 *  - { tossId, userId, nickname }
 *  - tossId 가 바뀌면 (다른 사용자 진입) 새로 덮어쓰기
 */

const USER_CACHE_KEY = 'cafeindex_user_v2';

interface UserCacheData {
  tossId: string;
  userId: string;
  nickname: string;
}

/** 캐시 조회 — tossId 일치하고 닉네임 있을 때만 hit */
export function getCachedUser(tossId: string): { userId: string; nickname: string } | null {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<UserCacheData>;
    if (data.tossId === tossId && data.userId && data.nickname) {
      return { userId: data.userId, nickname: data.nickname };
    }
  } catch {
    // localStorage 차단/JSON 깨짐 등 — 무시하고 미스 처리
  }
  return null;
}

/** 캐시 전체 갱신 (진입 시) */
export function setCachedUser(tossId: string, userId: string, nickname: string): void {
  try {
    localStorage.setItem(
      USER_CACHE_KEY,
      JSON.stringify({ tossId, userId, nickname } satisfies UserCacheData),
    );
  } catch {
    // 무시
  }
}

/**
 * 닉네임만 갱신 — 마이/리뷰/제보 시점에 닉네임 변경했을 때.
 * 기존 캐시가 없으면 무동작 (다음 콜드 런치 시 정상 흐름으로 캐시 채워짐).
 */
export function updateCachedNickname(nickname: string): void {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as Partial<UserCacheData>;
    if (!data.tossId || !data.userId) return;
    localStorage.setItem(
      USER_CACHE_KEY,
      JSON.stringify({ tossId: data.tossId, userId: data.userId, nickname } satisfies UserCacheData),
    );
  } catch {
    // 무시
  }
}

/** 캐시 비우기 — 회원 탈퇴 / 로그아웃 등 */
export function clearCachedUser(): void {
  try {
    localStorage.removeItem(USER_CACHE_KEY);
  } catch {
    // 무시
  }
}
