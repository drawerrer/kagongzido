import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import {
  fetchFavorites, insertFavorite, deleteFavorite, updateFavoritesOrder,
  fetchCollections, insertCollection, updateCollectionDB, deleteCollectionDB,
  updateCollectionsOrder, addStoresToCollectionDB, removeStoresFromCollectionDB,
  updateStoreMemo,
} from '../services/db';

// ─── 찜한 매장 타입 ───────────────────────────────────────────
export interface FavoritedStore {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  photos: string[];
}

// ─── 최근 본 카페 타입 ────────────────────────────────────────
export interface RecentCafe {
  id: string;
  name: string;
  photo: string;
}

// ─── 컬렉션 타입 ─────────────────────────────────────────────
export interface Collection {
  id: string;
  name: string;
  memo?: string;
  storeIds: string[];
  memos?: Record<string, string>;
}

const DEFAULT_COLLECTIONS: Collection[] = [
  { id: 'recent', name: '최근', storeIds: [] },
];

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
  isLoading: boolean;
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
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  // localStorage에서 즉시 초기값 로드 → 새로고침 후에도 데이터 즉시 표시
  const [isLoading, setIsLoading] = useState(true);

  const [favorites, setFavorites] = useState<FavoritedStore[]>(() =>
    lsGet<FavoritedStore[]>(`favorites_${userId}`, [])
  );

  const [recentlyViewed, setRecentlyViewed] = useState<RecentCafe[]>(() =>
    lsGet<RecentCafe[]>('recentlyViewed', [])
  );

  const [collections, setCollections] = useState<Collection[]>(() => {
    const cached = lsGet<Collection[]>(`collections_${userId}`, []);
    if (cached.length > 0) {
      const hasRecent = cached.some(c => c.id === 'recent');
      return hasRecent ? cached : [{ id: 'recent', name: '최근', storeIds: [] }, ...cached];
    }
    return DEFAULT_COLLECTIONS;
  });

  // ── 앱 시작 시 Supabase에서 최신 데이터 동기화 ──────────
  useEffect(() => {
    if (!userId) return;
    const sync = async () => {
      setIsLoading(true);
      const [favs, cols] = await Promise.all([
        fetchFavorites(userId),
        fetchCollections(userId),
      ]);

      // favorites — 항상 Supabase 결과로 덮어씀 (빈 배열 포함)
      setFavorites(favs);
      lsSet(`favorites_${userId}`, favs);

      // collections
      if (cols.length > 0) {
        const hasRecent = cols.some(c => c.id === 'recent');
        const next = hasRecent ? cols : [{ id: 'recent', name: '최근', storeIds: [] }, ...cols];
        setCollections(next);
        lsSet(`collections_${userId}`, next);
      } else {
        // 첫 접속 또는 전체 삭제: 기본 컬렉션 DB에 생성
        await insertCollection(userId, DEFAULT_COLLECTIONS[0], 0);
        setCollections(DEFAULT_COLLECTIONS);
        lsSet(`collections_${userId}`, DEFAULT_COLLECTIONS);
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
      insertFavorite(userId, store, next.length - 1);
      lsSet(`favorites_${userId}`, next);
      return next;
    });
  }, [userId]);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = prev.filter(f => f.id !== id);
      lsSet(`favorites_${userId}`, next);
      return next;
    });
    deleteFavorite(userId, id);
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
    const newId = Date.now().toString();
    const newCol: Collection = { id: newId, storeIds: [], ...col };
    setCollections(prev => {
      const recent = prev.find(c => c.id === 'recent')!;
      const rest = prev.filter(c => c.id !== 'recent');
      const next = [recent, newCol, ...rest];
      insertCollection(userId, newCol, 1);
      lsSet(`collections_${userId}`, next);
      return next;
    });
    return newId;
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
    if (id === 'recent') return;
    setCollections(prev => {
      const next = prev.filter(c => c.id !== id);
      lsSet(`collections_${userId}`, next);
      return next;
    });
    deleteCollectionDB(id);
  }, [userId]);

  const reorderCollections = useCallback((newOrder: Collection[]) => {
    setCollections(prev => {
      const recent = prev.find(c => c.id === 'recent');
      const rest = newOrder.filter(c => c.id !== 'recent');
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
      userId, isLoading,
      favorites, isFavorited, addFavorite, removeFavorite, reorderFavorites,
      recentlyViewed, addRecentlyViewed,
      collections, addCollection, updateCollection, removeCollection,
      addStoresToCollection, removeStoresFromCollection, updateCollectionMemo,
      reorderCollections,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites는 FavoritesProvider 안에서 사용해야 해요');
  return ctx;
}
