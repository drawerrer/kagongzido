import { supabase } from './supabase';
import type { FavoritedStore, Collection } from '../context/FavoritesContext';

// ─────────────────────────────────────────────────────────────
// 유저 (users)
// ─────────────────────────────────────────────────────────────

export async function getOrCreateUser(tossUserId: string): Promise<string | null> {
  if (!supabase) return null;

  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('toss_user_id', tossUserId)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data: created, error } = await supabase
    .from('users')
    .insert({ toss_user_id: tossUserId })
    .select('id')
    .single();

  if (error) { console.error('getOrCreateUser:', error); return null; }
  return (created as Record<string, string>)?.id ?? null;
}

// ─────────────────────────────────────────────────────────────
// 찜한 매장
// ─────────────────────────────────────────────────────────────

export async function fetchFavorites(userId: string): Promise<FavoritedStore[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('favorites')
    .select('store_id, sort_order, stores!inner(id, name, address_road, thumbnail_url, photo_urls, badges)')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) { console.error('fetchFavorites:', error); return []; }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const store = row.stores as Record<string, unknown> | null;
    return {
      id: row.store_id as string,
      name: (store?.name ?? '') as string,
      address: (store?.address_road ?? '') as string,
      rating: 0,
      reviewCount: 0,
      badge: ((store?.badges as string[] | null)?.[0]) ?? undefined,
      photos: (store?.photo_urls ?? []) as string[],
    };
  });
}

export async function insertFavorite(userId: string, store: FavoritedStore, sortOrder: number): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('favorites').upsert({
    user_id: userId,
    store_id: store.id,
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

// id는 DB가 자동 생성 — 생성된 UUID를 반환
export async function insertCollection(userId: string, col: Omit<Collection, 'id' | 'storeIds'>, sortOrder: number): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('collections')
    .insert({
      user_id: userId,
      name: col.name,
      memo: col.memo ?? null,
      sort_order: sortOrder,
    })
    .select('id')
    .single();

  if (error) { console.error('insertCollection:', error); return null; }
  return (data as Record<string, string>)?.id ?? null;
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

export interface UserReportRow {
  id: string;
  store_name: string;
  content: string;
  created_at: string;
}

export async function fetchUserReports(userId: string): Promise<UserReportRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('reports')
    .select('id, store_name, content, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) { console.error('fetchUserReports:', error); return []; }
  return (data ?? []) as UserReportRow[];
}

export interface CafeReportRow {
  user_id?: string;
  store_name: string;
  outlet_status?: string | null;
  seat_status?: string | null;
  noise_status?: string | null;
  content: string;
  photos?: string[];
}

async function uploadReportPhotos(photos: string[]): Promise<string[]> {
  if (!supabase || photos.length === 0) return [];
  const urls: string[] = [];
  const reportId = crypto.randomUUID();
  for (let i = 0; i < photos.length; i++) {
    try {
      const res = await fetch(photos[i]);
      const blob = await res.blob();
      const path = `${reportId}/photo_${i + 1}.jpg`;
      const { data, error } = await supabase.storage
        .from('report-photos')
        .upload(path, blob, { contentType: 'image/jpeg', upsert: false });
      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from('report-photos')
          .getPublicUrl(data.path);
        urls.push(urlData.publicUrl);
      }
    } catch (e) {
      console.error('uploadReportPhotos:', e);
    }
  }
  return urls;
}

export async function insertCafeReport(report: CafeReportRow): Promise<boolean> {
  if (!supabase) return false;

  const photoUrls = await uploadReportPhotos(report.photos ?? []);

  const { error } = await supabase.from('reports').insert({
    user_id: report.user_id ?? null,
    store_name: report.store_name,
    outlet_status: report.outlet_status ?? null,
    seat_status: report.seat_status ?? null,
    noise_status: report.noise_status ?? null,
    content: report.content,
    photo_urls: photoUrls,
  });

  if (error) { console.error('insertCafeReport:', error); return false; }
  return true;
}

// base64 URI → Supabase Storage(review-photos 버킷) 업로드 후 공개 URL 반환
async function uploadReviewPhotos(photos: string[]): Promise<string[]> {
  if (!supabase || photos.length === 0) return [];
  const urls: string[] = [];
  const folderId = crypto.randomUUID(); // 리뷰별 폴더 구분
  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    // 이미 URL이면 그대로 사용 (재업로드 방지)
    if (!photo.startsWith('data:')) { urls.push(photo); continue; }
    try {
      const res  = await fetch(photo);
      const blob = await res.blob();
      const ext  = blob.type === 'image/png' ? 'png' : 'jpg';
      const path = `${folderId}/photo_${i + 1}.${ext}`;
      const { data, error } = await supabase.storage
        .from('review-photos')
        .upload(path, blob, { contentType: blob.type || 'image/jpeg', upsert: false });
      if (!error && data) {
        const { data: urlData } = supabase.storage
          .from('review-photos')
          .getPublicUrl(data.path);
        urls.push(urlData.publicUrl);
      } else if (error) {
        console.error(`uploadReviewPhotos [${i}]:`, error.message);
      }
    } catch (e) {
      console.error(`uploadReviewPhotos [${i}]:`, e);
    }
  }
  return urls;
}

export interface UserReviewRow {
  id: string;
  store_id: string;
  store_name: string;
  store_address: string;
  store_thumbnail: string;
  content: string;
  photo_urls: string[];
  created_at: string;
}

export async function fetchUserReviews(userId: string): Promise<UserReviewRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('reviews')
    .select('id, store_id, content, photo_urls, created_at, stores(name, address_road, thumbnail_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) { console.error('fetchUserReviews:', error); return []; }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const store = row.stores as Record<string, unknown> | null;
    return {
      id: row.id as string,
      store_id: row.store_id as string,
      store_name: (store?.name ?? '') as string,
      store_address: (store?.address_road ?? '') as string,
      store_thumbnail: (store?.thumbnail_url ?? '') as string,
      content: row.content as string,
      photo_urls: (row.photo_urls ?? []) as string[],
      created_at: row.created_at as string,
    };
  });
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
  if (error) { console.error('deleteReview:', error); return false; }
  return true;
}

export async function insertReview(review: Omit<ReviewRow, 'id' | 'like_count' | 'created_at' | 'updated_at'>): Promise<boolean> {
  if (!supabase) return false;

  // 사진 Storage 업로드 (base64 → URL 변환)
  const photoUrls = await uploadReviewPhotos(review.photo_urls ?? []);

  const { error } = await supabase.from('reviews').insert({
    user_id:        review.user_id,
    store_id:       review.store_id,
    content:        review.content,
    outlet_status:  review.outlet_status,
    seat_status:    review.seat_status,
    noise_status:   review.noise_status,
    photo_urls:     photoUrls,
  });

  if (error) { console.error('insertReview:', error); return false; }
  return true;
}

// ─────────────────────────────────────────────────────────────
// 회원탈퇴 — 유저 데이터 전체 삭제
// ─────────────────────────────────────────────────────────────

export async function deleteUserData(userId: string): Promise<void> {
  if (!supabase) return;

  // 1) 해당 유저의 collection id 목록 조회
  const { data: cols } = await supabase
    .from('collections')
    .select('id')
    .eq('user_id', userId);

  const colIds = (cols ?? []).map((c: Record<string, unknown>) => c.id as string);

  // 2) collection_stores 삭제 (FK)
  if (colIds.length > 0) {
    const { error } = await supabase
      .from('collection_stores')
      .delete()
      .in('collection_id', colIds);
    if (error) console.error('deleteUserData collection_stores:', error);
  }

  // 3) collections 삭제
  const { error: colErr } = await supabase
    .from('collections')
    .delete()
    .eq('user_id', userId);
  if (colErr) console.error('deleteUserData collections:', colErr);

  // 4) favorites 삭제
  const { error: favErr } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId);
  if (favErr) console.error('deleteUserData favorites:', favErr);

  // 5) reviews 삭제
  const { error: revErr } = await supabase
    .from('reviews')
    .delete()
    .eq('user_id', userId);
  if (revErr) console.error('deleteUserData reviews:', revErr);
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
  business_hours: Record<string, unknown> | null;
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

// ─────────────────────────────────────────────────────────────
// 가이드북
// ─────────────────────────────────────────────────────────────

export interface GuidebookRow {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
}

export interface GuidebookItemRow {
  id: string;
  guidebook_id: string;
  store_id: string;
  comment: string | null;
  sort_order: number;
}

export async function fetchPublishedGuidebooks(): Promise<GuidebookRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('guidebooks')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error) { console.error('fetchPublishedGuidebooks:', error); return []; }
  return (data ?? []) as GuidebookRow[];
}

export async function fetchGuidebookItems(guidebookId: string): Promise<(GuidebookItemRow & { store: StoreRow })[]> {
  if (!supabase) return [];

  // Step 1: guidebook_items 조회 (join 없이)
  const { data: rawItems, error: itemsError } = await supabase
    .from('guidebook_items')
    .select('id, guidebook_id, store_id, comment, sort_order')
    .eq('guidebook_id', guidebookId)
    .order('sort_order', { ascending: true });
  if (itemsError) { console.error('fetchGuidebookItems:', itemsError); return []; }
  if (!rawItems?.length) return [];

  // Step 2: 관련 stores 조회
  const storeIds = rawItems.map(i => i.store_id);
  const { data: storeRows, error: storesError } = await supabase
    .from('stores')
    .select('*')
    .in('id', storeIds);
  if (storesError) { console.error('fetchGuidebookItems stores:', storesError); return []; }

  const storeMap = new Map((storeRows ?? []).map((s: Record<string, unknown>) => [s.id as string, s]));

  return rawItems.map(item => {
    const raw = storeMap.get(item.store_id) as Record<string, unknown> | undefined;
    const store: StoreRow = raw ? {
      ...(raw as StoreRow),
      photo_urls: (raw.photo_urls as string[] | null) ?? [],
      vibe_tags:  (raw.vibe_tags  as string[] | null) ?? [],
      amenities:  (raw.amenities  as string[] | null) ?? [],
      badges:     (raw.badges     as string[] | null) ?? [],
    } : {
      id: item.store_id, api_place_id: '', name: '알 수 없음', category: '',
      address_road: '', latitude: 0, longitude: 0, phone_number: null,
      thumbnail_url: '', photo_urls: [], business_hours: null, website_url: null,
      seat_status: '', outlet_status: '', noise_status: '', vibe_tags: [],
      base_price: 0, amenities: [], badges: [],
    };
    return { ...item, store };
  });
}

export async function fetchStoreByPlaceId(apiPlaceId: string): Promise<StoreRow | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .eq('api_place_id', apiPlaceId)
    .single();
  if (error) { console.error('fetchStoreByPlaceId:', error); return null; }
  // fetchAllStores와 동일하게 null 배열 정규화
  const row = data as unknown as StoreRow;
  return {
    ...row,
    photo_urls: (row.photo_urls as string[] | null) ?? [],
    vibe_tags:  (row.vibe_tags  as string[] | null) ?? [],
    amenities:  (row.amenities  as string[] | null) ?? [],
    badges:     (row.badges     as string[] | null) ?? [],
  };
}
