import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ─── 찜한 매장 타입 ───────────────────────────────────────────
// 나중에 Supabase 연동 시 이 타입을 그대로 사용
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
  photo: string; // 대표 사진 URL (없으면 빈 문자열)
}

// ─── Context 타입 ─────────────────────────────────────────────
interface FavoritesContextType {
  favorites: FavoritedStore[];
  isFavorited: (id: string) => boolean;
  addFavorite: (store: FavoritedStore) => void;
  removeFavorite: (id: string) => void;
  // 최근 본 카페 (최대 4개, 최신순)
  recentlyViewed: RecentCafe[];
  addRecentlyViewed: (cafe: RecentCafe) => void;
}

// ─── Context 생성 ─────────────────────────────────────────────
const FavoritesContext = createContext<FavoritesContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoritedStore[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<RecentCafe[]>([]);

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

  return (
    <FavoritesContext.Provider value={{
      favorites, isFavorited, addFavorite, removeFavorite,
      recentlyViewed, addRecentlyViewed,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────
// 나중에 Supabase 붙일 때 이 hook 내부만 수정하면 됨
export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites는 FavoritesProvider 안에서 사용해야 해요');
  return ctx;
}
