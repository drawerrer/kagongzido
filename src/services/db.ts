import { supabase } from './supabase';
import type { FavoritedStore, Collection } from '../context/FavoritesContext';

// ─────────────────────────────────────────────────────────────
// 찜한 매장
// ─────────────────────────────────────────────────────────────

export async function fetchFavorites(userId: string): Promise<FavoritedStore[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) { console.error('fetchFavorites:', error); return []; }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.store_id as string,
    name: row.name as string,
    address: row.address as string,
    rating: row.rating as number,
    reviewCount: row.review_count as number,
    badge: (row.badge ?? undefined) as string | undefined,
    photos: (row.photos ?? []) as string[],
  }));
}

export async function insertFavorite(userId: string, store: FavoritedStore, sortOrder: number): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('favorites').upsert({
    user_id: userId,
    store_id: store.id,
    name: store.name,
    address: store.address,
    rating: store.rating,
    review_count: store.reviewCount,
    badge: store.badge ?? null,
    photos: store.photos,
    sort_order: sortOrder,
  }, { onConflict: 'user_id,store_id' });

  if (error) console.error('insertFavorite:', error);
}

export async function deleteFavorite(userId: string, storeId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('store_id', storeId);

  if (error) console.error('deleteFavorite:', error);
}

export async function updateFavoritesOrder(userId: string, stores: FavoritedStore[]): Promise<void> {
  if (!supabase) return;
  const updates = stores.map((s, i) => ({
    user_id: userId,
    store_id: s.id,
    name: s.name,
    address: s.address,
    rating: s.rating,
    review_count: s.reviewCount,
    badge: s.badge ?? null,
    photos: s.photos,
    sort_order: i,
  }));

  const { error } = await supabase
    .from('favorites')
    .upsert(updates, { onConflict: 'user_id,store_id' });

  if (error) console.error('updateFavoritesOrder:', error);
}

// ─────────────────────────────────────────────────────────────
// 컬렉션
// ─────────────────────────────────────────────────────────────

export async function fetchCollections(userId: string): Promise<Collection[]> {
  if (!supabase) return [];
  const { data: cols, error: colErr } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (colErr) { console.error('fetchCollections:', colErr); return []; }
  if (!cols || cols.length === 0) return [];

  const colIds = cols.map((c: Record<string, unknown>) => c.id);
  const { data: stores, error: storeErr } = await supabase
    .from('collection_stores')
    .select('*')
    .in('collection_id', colIds)
    .order('sort_order', { ascending: true });

  if (storeErr) { console.error('fetchCollectionStores:', storeErr); }

  return cols.map((col: Record<string, unknown>) => {
    const colStores = (stores ?? []).filter((s: Record<string, unknown>) => s.collection_id === col.id);
    const memos: Record<string, string> = {};
    colStores.forEach((s: Record<string, unknown>) => { if (s.memo) memos[s.store_id as string] = s.memo as string; });

    return {
      id: col.id as string,
      name: col.name as string,
      memo: (col.memo ?? undefined) as string | undefined,
      storeIds: colStores.map((s: Record<string, unknown>) => s.store_id as string),
      memos,
    };
  });
}

export async function insertCollection(userId: string, col: Collection, sortOrder: number): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('collections').insert({
    id: col.id,
    user_id: userId,
    name: col.name,
    memo: col.memo ?? null,
    sort_order: sortOrder,
  });

  if (error) console.error('insertCollection:', error);
}

export async function updateCollectionDB(
  id: string,
  updates: { name?: string; memo?: string; sort_order?: number }
): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('collections')
    .update(updates)
    .eq('id', id);

  if (error) console.error('updateCollectionDB:', error);
}

export async function deleteCollectionDB(id: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id);

  if (error) console.error('deleteCollectionDB:', error);
}

export async function updateCollectionsOrder(userId: string, collections: Collection[]): Promise<void> {
  if (!supabase) return;
  const updates = collections
    .filter(c => c.id !== 'recent')
    .map((c, i) => ({ id: c.id, user_id: userId, name: c.name, sort_order: i + 1 }));

  const { error } = await supabase
    .from('collections')
    .upsert(updates, { onConflict: 'id' });

  if (error) console.error('updateCollectionsOrder:', error);
}

// ─────────────────────────────────────────────────────────────
// 컬렉션 ↔ 매장
// ─────────────────────────────────────────────────────────────

export async function addStoresToCollectionDB(collectionId: string, storeIds: string[]): Promise<void> {
  if (!supabase) return;
  const { data: existing } = await supabase
    .from('collection_stores')
    .select('sort_order')
    .eq('collection_id', collectionId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const startOrder = existing?.[0]?.sort_order ?? -1;

  const rows = storeIds.map((storeId, i) => ({
    collection_id: collectionId,
    store_id: storeId,
    sort_order: startOrder + i + 1,
  }));

  const { error } = await supabase
    .from('collection_stores')
    .upsert(rows, { onConflict: 'collection_id,store_id' });

  if (error) console.error('addStoresToCollectionDB:', error);
}

export async function removeStoresFromCollectionDB(collectionId: string, storeIds: string[]): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('collection_stores')
    .delete()
    .eq('collection_id', collectionId)
    .in('store_id', storeIds);

  if (error) console.error('removeStoresFromCollectionDB:', error);
}

export async function updateStoreMemo(collectionId: string, storeId: string, memo: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('collection_stores')
    .update({ memo })
    .eq('collection_id', collectionId)
    .eq('store_id', storeId);

  if (error) console.error('updateStoreMemo:', error);
}

// ─────────────────────────────────────────────────────────────
// 리뷰
// ─────────────────────────────────────────────────────────────

export interface ReviewRow {
  id: string;
  user_id: string;
  store_id: string;
  content: string;
  outlet_status: string;
  seat_status: string;
  noise_status: string;
  photo_urls?: string[];
  like_count: number;  // reviews_likes COUNT 집계값 (DB 컬럼 아님)
  created_at: string;
  updated_at: string;
}

export async function fetchReviews(storeId: string): Promise<ReviewRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('reviews')
    .select('*, reviews_likes(count)')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false });

  if (error) { console.error('fetchReviews:', error); return []; }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...(row as Omit<ReviewRow, 'like_count'>),
    like_count: (row.reviews_likes as { count: number }[])?.[0]?.count ?? 0,
  }));
}

// ─────────────────────────────────────────────────────────────
// 카페 제보
// ─────────────────────────────────────────────────────────────

export interface CafeReportRow {
  cafe_name: string;
  cafe_address: string;
  cafe_id?: string | null;
  outlet?: string | null;
  seat?: string | null;
  noise?: string | null;
  review: string;
  photos?: string[];
}

export async function insertCafeReport(report: CafeReportRow): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('cafe_reports').insert({
    cafe_name: report.cafe_name,
    cafe_address: report.cafe_address,
    cafe_id: report.cafe_id ?? null,
    outlet: report.outlet ?? null,
    seat: report.seat ?? null,
    noise: report.noise ?? null,
    review: report.review,
    photos: report.photos ?? [],
  });

  if (error) { console.error('insertCafeReport:', error); return false; }
  return true;
}

export async function insertReview(review: Omit<ReviewRow, 'id' | 'like_count' | 'created_at' | 'updated_at'>): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('reviews').insert({
    user_id: review.user_id,
    store_id: review.store_id,
    content: review.content,
    outlet_status: review.outlet_status,
    seat_status: review.seat_status,
    noise_status: review.noise_status,
    photo_urls: review.photo_urls ?? [],
  });

  if (error) { console.error('insertReview:', error); return false; }
  return true;
}

// ─────────────────────────────────────────────────────────────
// stores 테이블
// ─────────────────────────────────────────────────────────────

export interface StoreRow {
  id: string;           // UUID
  api_place_id: string;
  name: string;
  category: string;
  address_road: string;
  latitude: number;
  longitude: number;
  phone_number: string | null;
  thumbnail_url: string;
  photo_urls: string[];
  business_hours: Record<string, { open: string; close: string }> | null;
  website_url: string | null;
  seat_status: string;
  outlet_status: string;
  noise_status: string;
  vibe_tags: string[];
  base_price: number;
  amenities: string[];
  badges: string[];
}

export async function fetchAllStores(): Promise<StoreRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('stores').select('*');
  if (error) { console.error('fetchAllStores:', error); return []; }
  // Supabase에서 배열 컬럼이 null로 내려올 수 있으므로 빈 배열로 정규화
  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...(row as StoreRow),
    photo_urls:  (row.photo_urls  as string[] | null) ?? [],
    vibe_tags:   (row.vibe_tags   as string[] | null) ?? [],
    amenities:   (row.amenities   as string[] | null) ?? [],
    badges:      (row.badges      as string[] | null) ?? [],
  }));
}

export async function fetchStoreByPlaceId(apiPlaceId: string): Promise<StoreRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('api_place_id', apiPlaceId)
    .single();
  if (error) { console.error('fetchStoreByPlaceId:', error); return null; }
  return data as StoreRow;
}
