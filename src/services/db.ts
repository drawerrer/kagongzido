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

  return (data ?? []).map(row => ({
    id: row.store_id,
    name: row.name,
    address: row.address,
    rating: row.rating,
    reviewCount: row.review_count,
    badge: row.badge ?? undefined,
    photos: row.photos ?? [],
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

  const colIds = cols.map(c => c.id);
  const { data: stores, error: storeErr } = await supabase
    .from('collection_stores')
    .select('*')
    .in('collection_id', colIds)
    .order('sort_order', { ascending: true });

  if (storeErr) { console.error('fetchCollectionStores:', storeErr); }

  return cols.map(col => {
    const colStores = (stores ?? []).filter(s => s.collection_id === col.id);
    const memos: Record<string, string> = {};
    colStores.forEach(s => { if (s.memo) memos[s.store_id] = s.memo; });

    return {
      id: col.id,
      name: col.name,
      memo: col.memo ?? undefined,
      storeIds: colStores.map(s => s.store_id),
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
