import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import NicknameRequiredSheet from '../components/NicknameRequiredSheet';
import { updateCachedNickname } from '../utils/userCache';
import { getCurrentLocation, Accuracy } from '@apps-in-toss/web-framework';
import {
  fetchFavorites, insertFavorite, deleteFavorite, updateFavoritesOrder,
  fetchCollections, insertCollection, updateCollectionDB, deleteCollectionDB,
  updateCollectionsOrder, addStoresToCollectionDB, removeStoresFromCollectionDB,
  updateStoreMemo, fetchAllStores, updateUserNickname, fetchReviewCounts, type StoreRow, type PlaceKind,
} from '../services/db';
import { trackCafeFavoriteAdd, trackCollectionAddCafe } from '../services/analytics';

// ─── 거리 계산 유틸 (Haversine) ───────────────────────────────
export function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function fmtDist(m: number): string {
  return m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`;
}

/** 직선거리 기반 도보 소요시간 근사치 — 도보 속도 67m/분, 실도로 굴곡 보정계수 1.3배 */
export function fmtWalkMinutes(m: number): string {
  const min = Math.max(1, Math.round((m * 1.3) / 67));
  return `${min}분`;
}

// ─── 찜한 매장 타입 ───────────────────────────────────────────
export interface FavoritedStore {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  photos: string[];
  distance?: number;
  /** 폐업/휴업 시점 — 채워져 있으면 UI에 "폐업" 표시 */
  closedAt?: string | null;
  /** 카페 / 도서관 / 공유공간 — 미지정 시 카페로 취급 (기존 데이터 하위 호환) */
  placeType?: PlaceKind;
}

// ─── 최근 본 카페 타입 ────────────────────────────────────────
export interface RecentCafe {
  id: string;
  name: string;
  photo: string;
  photos?: string[];
  address?: string;
}

// ─── 컬렉션 타입 ─────────────────────────────────────────────
export interface Collection {
  id: string;
  name: string;
  storeIds: string[];
  /** 매장별 메모 (collection_stores.memo) — key: store id */
  memos?: Record<string, string>;
}

const DEFAULT_COLLECTIONS: Collection[] = [
  { id: 'recent', name: '최근', storeIds: [] },
];

/**
 * '최근' 컬렉션 판별 헬퍼
 * - 로컬 기본값('recent' 하드코딩 ID) 과 DB 저장본(UUID) 모두 커버
 * - DB 동기화 후 UUID가 들어와도 정상 매칭됨
 */
export function isRecentCollection(col: { id: string; name: string }): boolean {
  return col.id === 'recent' || col.name === '최근';
}

// ─── localStorage 헬퍼 ────────────────────────────────────────
function lsGet<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── Context 타입 ─────────────────────────────────────────────
interface FavoritesContextType {
  userId: string;
  nickname: string | null;
  updateNickname: (name: string) => Promise<boolean>;
  /**
   * 닉네임이 이미 있으면 즉시 true 반환.
   * 없으면 닉네임 입력 시트 노출 → 저장 시 true / 취소 시 false 로 resolve.
   *
   * 사용 예 (리뷰 작성 진입 시):
   *   const ok = await requireNickname();
   *   if (!ok) return;
   *   setShowWriteReview(true);
   */
  requireNickname: () => Promise<boolean>;
  isLoading: boolean;
  allStores: StoreRow[];
  /** 장소(카페/도서관/공유공간)별 실제 리뷰 개수 — 키: 카페=api_place_id, 도서관/공유공간=UUID */
  reviewCounts: Record<string, number>;
  userLocation: { lat: number; lng: number } | null;
  favorites: FavoritedStore[];
  isFavorited: (id: string) => boolean;
  addFavorite: (store: FavoritedStore) => void;
  removeFavorite: (id: string) => void;
  reorderFavorites: (newOrder: FavoritedStore[]) => void;
  recentlyViewed: RecentCafe[];
  addRecentlyViewed: (cafe: RecentCafe) => void;
  collections: Collection[];
  addCollection: (col: Omit<Collection, 'id' | 'storeIds'>) => string;
  updateCollection: (id: string, updates: Partial<Omit<Collection, 'id'>>) => void;
  removeCollection: (id: string) => void;
  addStoresToCollection: (collectionId: string, storeIds: string[]) => void;
  removeStoresFromCollection: (collectionId: string, storeIds: string[]) => void;
  updateCollectionMemo: (collectionId: string, storeId: string, memo: string) => void;
  reorderCollections: (newOrder: Collection[]) => void;
}

const FavoritesContext = createContext<FavoritesContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────
export function FavoritesProvider({
  userId,
  initialNickname,
  children,
}: {
  userId: string;
  initialNickname: string | null;
  children: ReactNode;
}) {
  // localStorage에서 즉시 초기값 로드 → 새로고침 후에도 데이터 즉시 표시
  const [isLoading, setIsLoading] = useState(true);
  const [nickname, setNickname] = useState<string | null>(initialNickname);
  // 저장 성공 여부(true/false)를 반환 — 실패했는데도 로컬 state/캐시를 먼저
  // 갱신해버리면, 이후 그 화면상 "성공한 것처럼 보이는" nickname/userId 로
  // 리뷰 작성 등을 시도하다가 뒤늦게 실패하는 문제가 있어 DB 반영 확인 후 갱신함
  const updateNickname = useCallback(async (name: string): Promise<boolean> => {
    const ok = await updateUserNickname(userId, name);
    if (ok) {
      setNickname(name);
      updateCachedNickname(name);   // 로컬 캐시 갱신 — 다음 콜드 런치 시 새 이름 노출
    }
    return ok;
  }, [userId]);

  // ── 닉네임 입력 시트 (전역 1개) ───────────────────────────────
  // 어디서든 requireNickname() 호출 시 nickname 없으면 시트 표시.
  // 사용자 동작 결과를 Promise 로 호출자에게 전달.
  const [nicknameSheetOpen, setNicknameSheetOpen] = useState(false);
  const nicknameResolverRef = useRef<((ok: boolean) => void) | null>(null);

  const requireNickname = useCallback((): Promise<boolean> => {
    // 이미 닉네임 있으면 즉시 통과
    if (nickname && nickname.trim()) return Promise.resolve(true);
    return new Promise<boolean>((resolve) => {
      nicknameResolverRef.current = resolve;
      setNicknameSheetOpen(true);
    });
  }, [nickname]);

  const handleNicknameSubmit = useCallback(async (name: string): Promise<boolean> => {
    const ok = await updateUserNickname(userId, name);
    if (ok) {
      setNickname(name);
      updateCachedNickname(name);
      setNicknameSheetOpen(false);
      nicknameResolverRef.current?.(true);
      nicknameResolverRef.current = null;
    }
    // 실패 시 시트를 열어둔 채로 둠 — NicknameRequiredSheet 가 에러 메시지를 보여주고
    // 재시도할 수 있게 함 (여기서 resolve(false) 해버리면 시트가 곧장 닫혀버림)
    return ok;
  }, [userId]);

  const handleNicknameClose = useCallback(() => {
    setNicknameSheetOpen(false);
    nicknameResolverRef.current?.(false);
    nicknameResolverRef.current = null;
  }, []);

  // 전체 매장 데이터 (앱 시작 시 1회 로드, 컬렉션·검색 등에서 공유)
  const [allStores, setAllStores] = useState<StoreRow[]>([]);

  // 장소별 실제 리뷰 개수 (앱 시작 시 1회 로드, 홈/모음집 리스트 카드에서 공유)
  const [reviewCounts, setReviewCounts] = useState<Record<string, number>>({});

  // 사용자 현재 위치 (거리 계산용)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    getCurrentLocation({ accuracy: Accuracy.Balanced })
      .then(loc => setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude }))
      .catch(() => {}); // 위치 권한 거부 시 null 유지
  }, []);

  // 앱 실행 시 마지막 접속 시간 기록
  useEffect(() => {
    lsSet('lastVisitTime', Date.now());
  }, []);

  const [favorites, setFavorites] = useState<FavoritedStore[]>(() =>
    lsGet<FavoritedStore[]>(`favorites_${userId}`, [])
  );

  const [recentlyViewed, setRecentlyViewed] = useState<RecentCafe[]>(() => {
    // 2일 이상 앱 미사용 시 최근 본 카페 자동 삭제
    const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
    const lastVisit = lsGet<number>('lastVisitTime', 0);
    const now = Date.now();
    if (lastVisit > 0 && now - lastVisit > TWO_DAYS_MS) {
      lsSet('recentlyViewed', []);
      return [];
    }
    return lsGet<RecentCafe[]>('recentlyViewed', []);
  });

  const [collections, setCollections] = useState<Collection[]>(() => {
    const cached = lsGet<Collection[]>(`collections_${userId}`, []);
    if (cached.length > 0) return cached;
    return DEFAULT_COLLECTIONS;
  });

  // ── 앱 시작 시 Supabase에서 최신 데이터 동기화 ──────────
  useEffect(() => {
    if (!userId) return;
    const sync = async () => {
      setIsLoading(true);
      const [favs, cols, stores, counts] = await Promise.all([
        fetchFavorites(userId),
        fetchCollections(userId),
        fetchAllStores(),
        fetchReviewCounts(),
      ]);

      setAllStores(stores);
      setReviewCounts(counts);

      // favorites — Supabase에 데이터가 있을 때만 덮어씀.
      // 빈 배열 반환은 세션/RLS 오류일 수 있으므로 로컬 캐시를 유지함.
      if (favs.length > 0) {
        // fetchFavorites()는 reviewCount를 항상 0으로 채워서 반환하므로
        // (즐겨찾기 join 쿼리에는 리뷰 집계가 없음) 방금 조회한 실제 개수로 덮어씀
        const favsWithCounts = favs.map(f => ({ ...f, reviewCount: counts[f.id] ?? f.reviewCount }));
        setFavorites(favsWithCounts);
        lsSet(`favorites_${userId}`, favsWithCounts);
      }

      // collections
      if (cols.length > 0) {
        // 과거 버그로 DB에 '최근'이 중복 저장되었을 수 있음 — 첫 항목만 남기고 나머지는 제외
        let seenRecent = false;
        const deduped = cols.filter(c => {
          if (c.name === '최근') {
            if (seenRecent) return false;
            seenRecent = true;
          }
          return true;
        });

        // '최근' 컬렉션이 아예 없으면 DB에 생성 후 UUID 추가
        if (!seenRecent) {
          const recentId = await insertCollection(userId, { name: '최근' }, 0);
          const recentCol: Collection = { id: recentId ?? 'recent', name: '최근', storeIds: [] };
          const next = [recentCol, ...deduped];
          setCollections(next);
          lsSet(`collections_${userId}`, next);
        } else {
          setCollections(deduped);
          lsSet(`collections_${userId}`, deduped);
        }
      } else {
        // Supabase 빈 결과: 세션 오류인지 진짜 첫 접속인지 구분
        const localCols = lsGet<Collection[]>(`collections_${userId}`, []);
        if (localCols.length === 0) {
          // 진짜 첫 접속 또는 전체 삭제: 기본 컬렉션 DB에 생성
          const recentId = await insertCollection(userId, { name: '최근' }, 0);
          const recentCol: Collection = { id: recentId ?? 'recent', name: '최근', storeIds: [] };
          setCollections([recentCol]);
          lsSet(`collections_${userId}`, [recentCol]);
        }
        // else: 로컬에 데이터 있음 → 세션 오류일 가능성 → 로컬 유지
      }

      setIsLoading(false);
    };
    sync();
  }, [userId]);

  // ── 찜하기 ───────────────────────────────────────────────
  const isFavorited = (id: string) => favorites.some(f => f.id === id);

  const addFavorite = useCallback((store: FavoritedStore) => {
    setFavorites(prev => {
      if (prev.some(f => f.id === store.id)) return prev;
      const next = [...prev, store];
      insertFavorite(userId, store, next.length - 1, store.placeType ?? 'cafe');
      lsSet(`favorites_${userId}`, next);
      trackCafeFavoriteAdd(store.id);
      return next;
    });
  }, [userId]);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const target = prev.find(f => f.id === id);
      const next = prev.filter(f => f.id !== id);
      lsSet(`favorites_${userId}`, next);
      deleteFavorite(userId, id, target?.placeType ?? 'cafe');
      return next;
    });
  }, [userId]);

  const reorderFavorites = useCallback((newOrder: FavoritedStore[]) => {
    setFavorites(newOrder);
    lsSet(`favorites_${userId}`, newOrder);
    updateFavoritesOrder(userId, newOrder);
  }, [userId]);

  // ── 최근 본 카페 (localStorage 유지) ────────────────────
  const addRecentlyViewed = useCallback((cafe: RecentCafe) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(r => r.id !== cafe.id);
      const next = [cafe, ...filtered].slice(0, 20);
      lsSet('recentlyViewed', next);
      return next;
    });
  }, []);

  // ── 컬렉션 (로컬 + Supabase) ─────────────────────────────
  const addCollection = useCallback((col: Omit<Collection, 'id' | 'storeIds'>) => {
    const tempId = 'temp_' + Date.now().toString();
    const newCol: Collection = { id: tempId, storeIds: [], ...col };
    setCollections(prev => {
      const recent = prev.find(c => c.name === '최근');
      const rest = prev.filter(c => c.name !== '최근');
      const next = recent ? [recent, newCol, ...rest] : [newCol, ...rest];
      lsSet(`collections_${userId}`, next);
      return next;
    });
    // DB에 저장 후 실제 UUID로 id 교체
    insertCollection(userId, newCol, 1).then(uuid => {
      if (uuid) {
        setCollections(prev => {
          const next = prev.map(c => c.id === tempId ? { ...c, id: uuid } : c);
          lsSet(`collections_${userId}`, next);
          return next;
        });
      }
    });
    return tempId;
  }, [userId]);

  const updateCollection = useCallback((id: string, updates: Partial<Omit<Collection, 'id'>>) => {
    setCollections(prev => {
      const next = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      lsSet(`collections_${userId}`, next);
      return next;
    });
    const { memos: _m, storeIds: _s, ...dbUpdates } = updates as Collection;
    if (Object.keys(dbUpdates).length > 0) updateCollectionDB(id, dbUpdates);
  }, [userId]);

  const removeCollection = useCallback((id: string) => {
    setCollections(prev => {
      // '최근' 컬렉션은 삭제 불가
      if (prev.find(c => c.id === id)?.name === '최근') return prev;
      const next = prev.filter(c => c.id !== id);
      lsSet(`collections_${userId}`, next);
      deleteCollectionDB(id);
      return next;
    });
  }, [userId]);

  const reorderCollections = useCallback((newOrder: Collection[]) => {
    setCollections(prev => {
      const recent = prev.find(c => c.name === '최근');
      const rest = newOrder.filter(c => c.name !== '최근');
      const next = recent ? [recent, ...rest] : rest;
      lsSet(`collections_${userId}`, next);
      updateCollectionsOrder(userId, next);
      return next;
    });
  }, [userId]);

  const addStoresToCollection = useCallback((collectionId: string, storeIds: string[]) => {
    setCollections(prev => {
      const next = prev.map(c =>
        c.id === collectionId
          ? { ...c, storeIds: [...new Set([...c.storeIds, ...storeIds])] }
          : c
      );
      lsSet(`collections_${userId}`, next);
      return next;
    });
    addStoresToCollectionDB(collectionId, storeIds);
    storeIds.forEach(id => trackCollectionAddCafe(id));
  }, [userId]);

  const removeStoresFromCollection = useCallback((collectionId: string, storeIds: string[]) => {
    const idSet = new Set(storeIds);
    setCollections(prev => {
      const next = prev.map(c =>
        c.id === collectionId
          ? { ...c, storeIds: c.storeIds.filter(id => !idSet.has(id)) }
          : c
      );
      lsSet(`collections_${userId}`, next);
      return next;
    });
    removeStoresFromCollectionDB(collectionId, storeIds);
  }, [userId]);

  const updateCollectionMemo = useCallback((collectionId: string, storeId: string, memo: string) => {
    setCollections(prev => {
      const next = prev.map(c =>
        c.id === collectionId
          ? { ...c, memos: { ...(c.memos ?? {}), [storeId]: memo } }
          : c
      );
      lsSet(`collections_${userId}`, next);
      return next;
    });
    updateStoreMemo(collectionId, storeId, memo);
  }, [userId]);

  return (
    <FavoritesContext.Provider value={{
      userId, nickname, updateNickname, requireNickname, isLoading,
      allStores, reviewCounts, userLocation,
      favorites, isFavorited, addFavorite, removeFavorite, reorderFavorites,
      recentlyViewed, addRecentlyViewed,
      collections, addCollection, updateCollection, removeCollection,
      addStoresToCollection, removeStoresFromCollection, updateCollectionMemo,
      reorderCollections,
    }}>
      {children}
      {/* 어디서든 requireNickname() 호출 시 노출되는 전역 시트
          — 조건부 렌더로 표시 제어 (MemoSheet 와 동일 패턴) */}
      {nicknameSheetOpen && (
        <NicknameRequiredSheet
          initialName={nickname}
          onSubmit={handleNicknameSubmit}
          onClose={handleNicknameClose}
        />
      )}
    </FavoritesContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites는 FavoritesProvider 안에서 사용해야 해요');
  return ctx;
}
