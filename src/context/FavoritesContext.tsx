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
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoritedStore[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentCafe[]>([]);
  const [collections, setCollections] = useState<Collection[]>(DEFAULT_COLLECTIONS);

  // ── 앱 시작 시 Supabase에서 데이터 불러오기 ──────────────
  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setIsLoading(true);
      const [favs, cols] = await Promise.all([
        fetchFavorites(userId),
        fetchCollections(userId),
      ]);
      setFavorites(favs);
      if (cols.length > 0) {
        const hasRecent = cols.some(c => c.id === 'recent');
        setCollections(hasRecent ? cols : [{ id: 'recent', name: '최근', storeIds: [] }, ...cols]);
      } else {
        // 첫 접속: 기본 컬렉션 DB에 생성
        await insertCollection(userId, DEFAULT_COLLECTIONS[0], 0);
        setCollections(DEFAULT_COLLECTIONS);
      }
      setIsLoading(false);
    };
    load();
  }, [userId]);

  // ── 찜하기 ───────────────────────────────────────────────
  const isFavorited = (id: string) => favorites.some(f => f.id === id);

  const addFavorite = useCallback((store: FavoritedStore) => {
    setFavorites(prev => {
      if (prev.some(f => f.id === store.id)) return prev;
      const next = [...prev, store];
      insertFavorite(userId, store, next.length - 1);
      return next;
    });
  }, [userId]);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
    deleteFavorite(userId, id);
  }, [userId]);

  const reorderFavorites = useCallback((newOrder: FavoritedStore[]) => {
    setFavorites(newOrder);
    updateFavoritesOrder(userId, newOrder);
  }, [userId]);

  // ── 최근 본 카페 (로컬만 유지) ───────────────────────────
  const addRecentlyViewed = useCallback((cafe: RecentCafe) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(r => r.id !== cafe.id);
      return [cafe, ...filtered].slice(0, 4);
    });
  }, []);

  // ── 컬렉션 ───────────────────────────────────────────────
  const addCollection = useCallback((col: Omit<Collection, 'id' | 'storeIds'>) => {
    const newId = Date.now().toString();
    const newCol: Collection = { id: newId, storeIds: [], ...col };
    setCollections(prev => {
      const recent = prev.find(c => c.id === 'recent')!;
      const rest = prev.filter(c => c.id !== 'recent');
      insertCollection(userId, newCol, 1);
      return [recent, newCol, ...rest];
    });
    return newId;
  }, [userId]);

  const updateCollection = useCallback((id: string, updates: Partial<Omit<Collection, 'id'>>) => {
    setCollections(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    const { memos: _m, storeIds: _s, ...dbUpdates } = updates as Collection;
    if (Object.keys(dbUpdates).length > 0) updateCollectionDB(id, dbUpdates);
  }, []);

  const removeCollection = useCallback((id: string) => {
    if (id === 'recent') return;
    setCollections(prev => prev.filter(c => c.id !== id));
    deleteCollectionDB(id);
  }, []);

  const reorderCollections = useCallback((newOrder: Collection[]) => {
    setCollections(prev => {
      const recent = prev.find(c => c.id === 'recent');
      const rest = newOrder.filter(c => c.id !== 'recent');
      const next = recent ? [recent, ...rest] : rest;
      updateCollectionsOrder(userId, next);
      return next;
    });
  }, [userId]);

  const addStoresToCollection = useCallback((collectionId: string, storeIds: string[]) => {
    setCollections(prev => prev.map(c =>
      c.id === collectionId
        ? { ...c, storeIds: [...new Set([...c.storeIds, ...storeIds])] }
        : c
    ));
    addStoresToCollectionDB(collectionId, storeIds);
  }, []);

  const removeStoresFromCollection = useCallback((collectionId: string, storeIds: string[]) => {
    const idSet = new Set(storeIds);
    setCollections(prev => prev.map(c =>
      c.id === collectionId
        ? { ...c, storeIds: c.storeIds.filter(id => !idSet.has(id)) }
        : c
    ));
    removeStoresFromCollectionDB(collectionId, storeIds);
  }, []);

  const updateCollectionMemo = useCallback((collectionId: string, storeId: string, memo: string) => {
    setCollections(prev => prev.map(c =>
      c.id === collectionId
        ? { ...c, memos: { ...(c.memos ?? {}), [storeId]: memo } }
        : c
    ));
    updateStoreMemo(collectionId, storeId, memo);
  }, []);

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
