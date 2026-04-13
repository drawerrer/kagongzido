import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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
  storeIds: string[]; // 이 컬렉션에 속한 매장 ID 목록
  memos?: Record<string, string>; // storeId → 메모 텍스트
}

const DEFAULT_COLLECTIONS: Collection[] = [
  { id: 'recent', name: '최근', storeIds: [] },
];

// ─── Context 타입 ─────────────────────────────────────────────
interface FavoritesContextType {
  favorites: FavoritedStore[];
  isFavorited: (id: string) => boolean;
  addFavorite: (store: FavoritedStore) => void;
  removeFavorite: (id: string) => void;
  reorderFavorites: (newOrder: FavoritedStore[]) => void;
  // 최근 본 카페 (최대 4개, 최신순)
  recentlyViewed: RecentCafe[];
  addRecentlyViewed: (cafe: RecentCafe) => void;
  // 컬렉션 목록 (화면 이동해도 유지)
  collections: Collection[];
  addCollection: (col: Omit<Collection, 'id' | 'storeIds'>) => string; // 생성된 컬렉션 id 반환
  updateCollection: (id: string, updates: Partial<Omit<Collection, 'id'>>) => void;
  removeCollection: (id: string) => void;
  addStoresToCollection: (collectionId: string, storeIds: string[]) => void;
  removeStoresFromCollection: (collectionId: string, storeIds: string[]) => void;
  updateCollectionMemo: (collectionId: string, storeId: string, memo: string) => void;
  reorderCollections: (newOrder: Collection[]) => void;
}

// ─── Context 생성 ─────────────────────────────────────────────
const FavoritesContext = createContext<FavoritesContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoritedStore[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentCafe[]>([]);
  const [collections, setCollections] = useState<Collection[]>(DEFAULT_COLLECTIONS);

  const isFavorited = (id: string) => favorites.some(f => f.id === id);

  const addFavorite = (store: FavoritedStore) => {
    setFavorites(prev =>
      prev.some(f => f.id === store.id) ? prev : [...prev, store]
    );
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  // 중복 제거 후 최신순 앞에 추가, 최대 4개 유지
  const addRecentlyViewed = useCallback((cafe: RecentCafe) => {
    setRecentlyViewed(prev => {
      const filtered = prev.filter(r => r.id !== cafe.id);
      return [cafe, ...filtered].slice(0, 4);
    });
  }, []);

  // 컬렉션 추가 ('recent'는 항상 첫 번째 고정) — 생성된 id 반환
  const addCollection = useCallback((col: Omit<Collection, 'id' | 'storeIds'>) => {
    const newId = Date.now().toString();
    const newCol: Collection = { id: newId, storeIds: [], ...col };
    setCollections(prev => {
      const recent = prev.find(c => c.id === 'recent')!;
      const rest = prev.filter(c => c.id !== 'recent');
      return [recent, newCol, ...rest];
    });
    return newId;
  }, []);

  // 컬렉션 수정
  const updateCollection = useCallback((id: string, updates: Partial<Omit<Collection, 'id'>>) => {
    setCollections(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  // 찜 목록 순서 변경
  const reorderFavorites = useCallback((newOrder: FavoritedStore[]) => {
    setFavorites([...newOrder]);
  }, []);

  // 컬렉션에 매장 추가 (중복 제거)
  const addStoresToCollection = useCallback((collectionId: string, storeIds: string[]) => {
    setCollections(prev => prev.map(c =>
      c.id === collectionId
        ? { ...c, storeIds: [...new Set([...c.storeIds, ...storeIds])] }
        : c
    ));
  }, []);

  // 컬렉션 삭제 ('recent'는 삭제 불가)
  const removeCollection = useCallback((id: string) => {
    if (id === 'recent') return;
    setCollections(prev => prev.filter(c => c.id !== id));
  }, []);

  // 컬렉션에서 매장 제거
  const removeStoresFromCollection = useCallback((collectionId: string, storeIds: string[]) => {
    const idSet = new Set(storeIds);
    setCollections(prev => prev.map(c =>
      c.id === collectionId
        ? { ...c, storeIds: c.storeIds.filter(id => !idSet.has(id)) }
        : c
    ));
  }, []);

  // 컬렉션 내 특정 매장의 메모 저장
  const updateCollectionMemo = useCallback((collectionId: string, storeId: string, memo: string) => {
    setCollections(prev => prev.map(c =>
      c.id === collectionId
        ? { ...c, memos: { ...(c.memos ?? {}), [storeId]: memo } }
        : c
    ));
  }, []);

  const reorderCollections = useCallback((newOrder: Collection[]) => {
    setCollections(prev => {
      const recent = prev.find(c => c.id === 'recent');
      const rest = newOrder.filter(c => c.id !== 'recent');
      return recent ? [recent, ...rest] : rest;
    });
  }, []);

  return (
    <FavoritesContext.Provider value={{
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
