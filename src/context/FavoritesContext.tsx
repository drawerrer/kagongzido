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
}

const DEFAULT_COLLECTIONS: Collection[] = [
  { id: 'recent', name: '최근' },
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
  addCollection: (col: Omit<Collection, 'id'>) => void;
  updateCollection: (id: string, updates: Partial<Omit<Collection, 'id'>>) => void;
  removeCollection: (id: string) => void;
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

  // 컬렉션 추가 ('recent'는 항상 첫 번째 고정)
  const addCollection = useCallback((col: Omit<Collection, 'id'>) => {
    const newCol: Collection = { id: Date.now().toString(), ...col };
    setCollections(prev => {
      const recent = prev.find(c => c.id === 'recent')!;
      const rest = prev.filter(c => c.id !== 'recent');
      return [recent, newCol, ...rest];
    });
  }, []);

  // 컬렉션 수정
  const updateCollection = useCallback((id: string, updates: Partial<Omit<Collection, 'id'>>) => {
    setCollections(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  // 찜 목록 순서 변경
  const reorderFavorites = useCallback((newOrder: FavoritedStore[]) => {
    setFavorites([...newOrder]);
  }, []);

  // 컬렉션 삭제 ('recent'는 삭제 불가)
  const removeCollection = useCallback((id: string) => {
    if (id === 'recent') return;
    setCollections(prev => prev.filter(c => c.id !== id));
  }, []);

  return (
    <FavoritesContext.Provider value={{
      favorites, isFavorited, addFavorite, removeFavorite, reorderFavorites,
      recentlyViewed, addRecentlyViewed,
      collections, addCollection, updateCollection, removeCollection,
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
