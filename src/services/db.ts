import { supabase } from './supabase';
import type { FavoritedStore, Collection } from '../context/FavoritesContext';

// ─────────────────────────────────────────────────────────────
// 유저 (users)
// ─────────────────────────────────────────────────────────────

export interface UserInfo {
  id: string;
  nickname: string | null;
  isNew: boolean;
}

export async function getOrCreateUser(tossUserId: string): Promise<UserInfo | null> {
  if (!supabase) return null;

  const { data: existing } = await supabase
    .from('users')
    .select('id, nickname')
    .eq('toss_user_id', tossUserId)
    .maybeSingle();

  if (existing?.id) return { id: existing.id as string, nickname: (existing.nickname as string | null) ?? null, isNew: false };

  const { data: created, error } = await supabase
    .from('users')
    .insert({ toss_user_id: tossUserId })
    .select('id, nickname')
    .single();

  if (error) { console.error('getOrCreateUser:', error); return null; }
  return { id: (created as Record<string, string>).id, nickname: null, isNew: true };
}

/**
 * Supabase Anonymous Auth + RLS 모드용 사용자 조회/생성.
 * @param tossUserId 토스 익명 해시 (getAnonymousKey)
 * @param authUserId Supabase auth.uid() — signInAnonymously() 후 발급
 *
 * 동작:
 *  1) tossUserId 로 users 행 조회
 *  2) 있으면: auth_user_id 가 다르거나 비었으면 → 갱신 (localStorage 초기화 등으로 세션 재발급된 케이스)
 *  3) 없으면: INSERT (toss_user_id + auth_user_id)
 *
 * RLS 정책상 INSERT/UPDATE 모두 auth_user_id = auth.uid() 일 때만 허용됨.
 */
export async function getOrCreateUserWithAuth(
  tossUserId: string,
  authUserId: string,
): Promise<UserInfo | null> {
  if (!supabase) return null;

  // 1) 기존 row 조회
  const { data: existing, error: selErr } = await supabase
    .from('users')
    .select('id, nickname, auth_user_id')
    .eq('toss_user_id', tossUserId)
    .maybeSingle();

  if (selErr) {
    console.error('getOrCreateUserWithAuth select:', selErr);
    return null;
  }

  if (existing?.id) {
    const row = existing as { id: string; nickname: string | null; auth_user_id: string | null };
    // auth_user_id 재매핑이 필요한 경우 (NULL 또는 다른 값)
    if (row.auth_user_id !== authUserId) {
      const { error: updErr } = await supabase
        .from('users')
        .update({ auth_user_id: authUserId })
        .eq('id', row.id);
      if (updErr) console.error('getOrCreateUserWithAuth remap:', updErr);
    }
    return { id: row.id, nickname: row.nickname, isNew: false };
  }

  // 2) 신규 row INSERT
  const { data: created, error: insErr } = await supabase
    .from('users')
    .insert({ toss_user_id: tossUserId, auth_user_id: authUserId })
    .select('id, nickname')
    .single();

  if (insErr) {
    console.error('getOrCreateUserWithAuth insert:', insErr);
    return null;
  }
  return { id: (created as Record<string, string>).id, nickname: null, isNew: true };
}

export async function updateUserNickname(userId: string, nickname: string): Promise<void> {
  if (!supabase) return;
  await supabase.from('users').update({ nickname }).eq('id', userId);
}

// ─────────────────────────────────────────────────────────────
// 찜한 매장
// ─────────────────────────────────────────────────────────────

// UI 에서는 store 식별자로 api_place_id(text) 를 사용하지만
// DB(favorites/collection_stores)는 stores.id(uuid) FK 를 요구함.
// 두 ID 를 매핑하는 헬퍼.
function isUuid(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

async function resolveStoreUuid(maybeId: string): Promise<string | null> {
  if (!supabase) return null;
  if (isUuid(maybeId)) return maybeId; // 이미 UUID
  const { data } = await supabase
    .from('stores')
    .select('id')
    .eq('api_place_id', maybeId)
    .maybeSingle();
  return (data?.id as string | undefined) ?? null;
}

export async function fetchFavorites(userId: string): Promise<FavoritedStore[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('favorites')
    .select('store_id, sort_order, stores!inner(id, api_place_id, name, address_road, thumbnail_url, photo_urls, badges, closed_at)')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true });

  if (error) { console.error('fetchFavorites:', error); return []; }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const store = row.stores as Record<string, unknown> | null;
    return {
      // UI 에서는 api_place_id 를 식별자로 사용 (cafe.id, isFavorited 매칭)
      id: (store?.api_place_id ?? row.store_id) as string,
      name: (store?.name ?? '') as string,
      address: (store?.address_road ?? '') as string,
      rating: 0,
      reviewCount: 0,
      badge: ((store?.badges as string[] | null)?.[0]) ?? undefined,
      photos: (store?.photo_urls ?? []) as string[],
      closedAt: (store?.closed_at as string | null) ?? null,
    };
  });
}

export async function insertFavorite(userId: string, store: FavoritedStore, sortOrder: number): Promise<void> {
  if (!supabase) return;
  const storeUuid = await resolveStoreUuid(store.id);
  if (!storeUuid) {
    console.error('insertFavorite: stores 에서 해당 매장을 찾을 수 없어요', store.id);
    return;
  }
  const { error } = await supabase.from('favorites').upsert({
    user_id: userId,
    store_id: storeUuid,
    sort_order: sortOrder,
  }, { onConflict: 'user_id,store_id' });

  if (error) console.error('insertFavorite:', error);
}

export async function deleteFavorite(userId: string, storeId: string): Promise<void> {
  if (!supabase) return;
  const storeUuid = await resolveStoreUuid(storeId);
  if (!storeUuid) return;
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('store_id', storeUuid);

  if (error) console.error('deleteFavorite:', error);
}

export async function updateFavoritesOrder(userId: string, stores: FavoritedStore[]): Promise<void> {
  if (!supabase) return;

  // api_place_id 들을 한 번에 UUID 로 변환
  const resolved = await Promise.all(stores.map(s => resolveStoreUuid(s.id)));
  const updates = stores
    .map((_s, i) => resolved[i] ? ({
      user_id: userId,
      store_id: resolved[i] as string,
      sort_order: i,
    }) : null)
    .filter((u): u is { user_id: string; store_id: string; sort_order: number } => u !== null);

  if (updates.length === 0) return;

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
  // stores 조인하여 api_place_id 동시 수집 (UI 식별자와 일치시키기 위함)
  const { data: stores, error: storeErr } = await supabase
    .from('collection_stores')
    .select('collection_id, store_id, sort_order, memo, stores!inner(api_place_id)')
    .in('collection_id', colIds)
    .order('sort_order', { ascending: true });

  if (storeErr) { console.error('fetchCollectionStores:', storeErr); }

  return cols.map((col: Record<string, unknown>) => {
    const colStores = (stores ?? []).filter((s: Record<string, unknown>) => s.collection_id === col.id);
    const memos: Record<string, string> = {};
    colStores.forEach((s: Record<string, unknown>) => {
      const placeId = (s.stores as Record<string, unknown> | null)?.api_place_id as string | undefined;
      const key = placeId ?? (s.store_id as string);
      if (s.memo) memos[key] = s.memo as string;
    });

    return {
      id: col.id as string,
      name: col.name as string,
      // UI 가 api_place_id 로 storeIds 비교하므로 api_place_id 우선 반환 (fallback: store_id uuid)
      storeIds: colStores.map((s: Record<string, unknown>) => {
        const placeId = (s.stores as Record<string, unknown> | null)?.api_place_id as string | undefined;
        return placeId ?? (s.store_id as string);
      }),
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
      sort_order: sortOrder,
    })
    .select('id')
    .single();

  if (error) { console.error('insertCollection:', error); return null; }
  return (data as Record<string, string>)?.id ?? null;
}

export async function updateCollectionDB(
  id: string,
  updates: { name?: string; sort_order?: number }
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

  // api_place_id → stores.id(uuid) 변환
  const resolved = await Promise.all(storeIds.map(id => resolveStoreUuid(id)));
  const rows = resolved
    .map((uuid, i) => uuid ? ({
      collection_id: collectionId,
      store_id: uuid,
      sort_order: startOrder + i + 1,
    }) : null)
    .filter((r): r is { collection_id: string; store_id: string; sort_order: number } => r !== null);

  if (rows.length === 0) return;

  const { error } = await supabase
    .from('collection_stores')
    .upsert(rows, { onConflict: 'collection_id,store_id' });

  if (error) console.error('addStoresToCollectionDB:', error);
}

export async function removeStoresFromCollectionDB(collectionId: string, storeIds: string[]): Promise<void> {
  if (!supabase) return;
  const resolved = await Promise.all(storeIds.map(id => resolveStoreUuid(id)));
  const uuids = resolved.filter((u): u is string => !!u);
  if (uuids.length === 0) return;
  const { error } = await supabase
    .from('collection_stores')
    .delete()
    .eq('collection_id', collectionId)
    .in('store_id', uuids);

  if (error) console.error('removeStoresFromCollectionDB:', error);
}

export async function updateStoreMemo(collectionId: string, storeId: string, memo: string): Promise<void> {
  if (!supabase) return;
  const storeUuid = await resolveStoreUuid(storeId);
  if (!storeUuid) return;
  const { error } = await supabase
    .from('collection_stores')
    .update({ memo })
    .eq('collection_id', collectionId)
    .eq('store_id', storeUuid);

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
  author_nickname: string | null;  // users.nickname JOIN 결과 (없으면 null → UI 폴백)
  created_at: string;
  updated_at: string;
}

export async function fetchReviews(storeId: string): Promise<ReviewRow[]> {
  if (!supabase) return [];
  // storeId 가 api_place_id 로 들어와도 stores.id(uuid) 로 변환
  const storeUuid = await resolveStoreUuid(storeId);
  if (!storeUuid) return [];
  const { data, error } = await supabase
    .from('reviews')
    .select('*, reviews_likes(count), users(nickname)')
    .eq('store_id', storeUuid)
    .order('created_at', { ascending: false });

  if (error) { console.error('fetchReviews:', error); return []; }

  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...(row as Omit<ReviewRow, 'like_count' | 'author_nickname'>),
    like_count: (row.reviews_likes as { count: number }[])?.[0]?.count ?? 0,
    author_nickname: ((row.users as { nickname: string | null } | null)?.nickname) ?? null,
  }));
}

// ─────────────────────────────────────────────────────────────
// 카페 제보
// ─────────────────────────────────────────────────────────────

export interface UserReportRow {
  id: string;
  store_name: string;
  content: string;
  status: string;             // pending / reviewing / resolved / rejected
  admin_comment: string | null;
  created_at: string;
}

export async function fetchUserReports(userId: string): Promise<UserReportRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('reports')
    .select('id, store_name, content, status, admin_comment, created_at')
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

export async function updateReview(reviewId: string, content: string, photoUrls: string[]): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('reviews').update({ content, photo_urls: photoUrls }).eq('id', reviewId);
  if (error) { console.error('updateReview:', error); return false; }
  return true;
}

export async function insertReview(review: Omit<ReviewRow, 'id' | 'like_count' | 'author_nickname' | 'created_at' | 'updated_at'>): Promise<boolean> {
  if (!supabase) return false;

  // store_id 가 api_place_id 로 들어와도 stores.id(uuid) 로 변환
  const storeUuid = await resolveStoreUuid(review.store_id);
  if (!storeUuid) { console.error('insertReview: stores 에서 해당 매장을 찾을 수 없어요', review.store_id); return false; }

  // 사진 Storage 업로드 (base64 → URL 변환)
  const photoUrls = await uploadReviewPhotos(review.photo_urls ?? []);

  const { error } = await supabase.from('reviews').insert({
    user_id:        review.user_id,
    store_id:       storeUuid,
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
// 리뷰 좋아요 (reviews_likes)
// ─────────────────────────────────────────────────────────────

/**
 * 본인이 좋아요한 리뷰 ID 집합 조회 (UI 초기 상태 prefetch)
 * @param userId users.id (uuid)
 * @param reviewIds 표시 중인 리뷰 id 배열 (없으면 빈 Set 반환)
 */
export async function fetchUserLikedReviewIds(
  userId: string,
  reviewIds: string[],
): Promise<Set<string>> {
  if (!supabase || !userId || reviewIds.length === 0) return new Set();
  const { data, error } = await supabase
    .from('reviews_likes')
    .select('review_id')
    .eq('user_id', userId)
    .in('review_id', reviewIds);

  if (error) { console.error('fetchUserLikedReviewIds:', error); return new Set(); }
  return new Set((data ?? []).map((r: Record<string, unknown>) => r.review_id as string));
}

/**
 * 리뷰 좋아요 토글
 * @returns 토글 후 상태 (true = 좋아요됨)
 */
export async function toggleReviewLike(
  userId: string,
  reviewId: string,
): Promise<boolean> {
  if (!supabase || !userId || !reviewId) return false;

  // 1) 기존 좋아요 여부 확인
  const { data: existing, error: selectError } = await supabase
    .from('reviews_likes')
    .select('id')
    .eq('user_id', userId)
    .eq('review_id', reviewId)
    .maybeSingle();

  if (selectError) { console.error('toggleReviewLike select:', selectError); return false; }

  if (existing) {
    // 2a) 이미 있으면 삭제
    const { error } = await supabase
      .from('reviews_likes')
      .delete()
      .eq('id', (existing as { id: string }).id);
    if (error) { console.error('toggleReviewLike delete:', error); return true; }
    return false;
  } else {
    // 2b) 없으면 추가
    const { error } = await supabase
      .from('reviews_likes')
      .insert({ user_id: userId, review_id: reviewId });
    if (error) { console.error('toggleReviewLike insert:', error); return false; }
    return true;
  }
}

// ─────────────────────────────────────────────────────────────
// 공지사항 (notices)
// ─────────────────────────────────────────────────────────────

export interface NoticeRow {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

/** 사용자용: 발행된 공지 목록 (최신순) */
export async function fetchNotices(): Promise<NoticeRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  if (error) { console.error('fetchNotices:', error); return []; }
  return (data ?? []) as NoticeRow[];
}

/** 어드민용: 발행 여부 무관 전체 공지 목록 */
export async function fetchAllNotices(): Promise<NoticeRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .order('published_at', { ascending: false });

  if (error) { console.error('fetchAllNotices:', error); return []; }
  return (data ?? []) as NoticeRow[];
}

export async function insertNotice(
  notice: Pick<NoticeRow, 'title' | 'content'> & Partial<Pick<NoticeRow, 'is_published' | 'published_at'>>,
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('notices').insert({
    title: notice.title,
    content: notice.content,
    is_published: notice.is_published ?? true,
    published_at: notice.published_at ?? new Date().toISOString(),
  });
  if (error) { console.error('insertNotice:', error); return false; }
  return true;
}

export async function updateNotice(
  id: string,
  patch: Partial<Pick<NoticeRow, 'title' | 'content' | 'is_published' | 'published_at'>>,
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('notices').update(patch).eq('id', id);
  if (error) { console.error('updateNotice:', error); return false; }
  return true;
}

export async function deleteNotice(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('notices').delete().eq('id', id);
  if (error) { console.error('deleteNotice:', error); return false; }
  return true;
}

// ─────────────────────────────────────────────────────────────
// 회원탈퇴 — 유저 데이터 전체 삭제
// ─────────────────────────────────────────────────────────────

/**
 * 회원 탈퇴 — 사용자 데이터 전체 삭제 + Auth 세션 로그아웃.
 *
 * FK ON DELETE CASCADE 정책 덕분에 users 한 줄 삭제로 모두 정리됨:
 *   - favorites / collections / collection_stores
 *   - reviews / reviews_likes
 *   - reports
 *
 * 마지막으로 Supabase Auth 익명 세션도 로그아웃해 localStorage 토큰 제거.
 *
 * @returns 성공 여부 (true: 삭제 완료)
 */
export async function deleteUserData(userId: string): Promise<boolean> {
  if (!supabase) return false;

  // 1) users 행 삭제 → CASCADE 로 관련 데이터 모두 자동 삭제
  const { error: delErr } = await supabase.from('users').delete().eq('id', userId);
  if (delErr) { console.error('deleteUserData users:', delErr); return false; }

  // 2) Supabase Auth 익명 세션 로그아웃 (localStorage 토큰 제거)
  const { error: signOutErr } = await supabase.auth.signOut();
  if (signOutErr) console.error('deleteUserData signOut:', signOutErr);

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
  business_hours: Record<string, unknown> | null;
  website_url: string | null;
  seat_status: string;
  outlet_status: string;
  noise_status: string;
  vibe_tags: string[];
  base_price: number;
  amenities: string[];
  badges: string[];
  /** 폐업/휴업 시점 — NULL 이면 영업 중 */
  closed_at: string | null;
}

/**
 * 영업 중 매장 전체 조회 (지도/검색용).
 * 폐업/휴업 매장은 자동으로 제외됨.
 */
export async function fetchAllStores(): Promise<StoreRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('stores')
    .select('*')
    .is('closed_at', null);  // 폐업 매장 제외
  if (error) { console.error('fetchAllStores:', error); return []; }
  // Supabase에서 배열 컬럼이 null로 내려올 수 있으므로 빈 배열로 정규화
  return (data ?? []).map((row: Record<string, unknown>) => ({
    ...(row as unknown as StoreRow),
    photo_urls:  (row.photo_urls  as string[] | null) ?? [],
    vibe_tags:   (row.vibe_tags   as string[] | null) ?? [],
    amenities:   (row.amenities   as string[] | null) ?? [],
    badges:      (row.badges      as string[] | null) ?? [],
  }));
}

/**
 * 어드민 — 매장 폐업/휴업 처리 (closed_at = now).
 * UI 에서 'closed_at' 채워진 매장은 자동으로 "폐업" 표시되도록.
 */
export async function markStoreAsClosed(storeId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('stores')
    .update({ closed_at: new Date().toISOString() })
    .eq('id', storeId);
  if (error) { console.error('markStoreAsClosed:', error); return false; }
  return true;
}

/** 어드민 — 폐업 처리 취소 (재오픈). */
export async function reopenStore(storeId: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from('stores')
    .update({ closed_at: null })
    .eq('id', storeId);
  if (error) { console.error('reopenStore:', error); return false; }
  return true;
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
      ...(raw as unknown as StoreRow),
      photo_urls: (raw.photo_urls as string[] | null) ?? [],
      vibe_tags:  (raw.vibe_tags  as string[] | null) ?? [],
      amenities:  (raw.amenities  as string[] | null) ?? [],
      badges:     (raw.badges     as string[] | null) ?? [],
    } : {
      id: item.store_id, api_place_id: '', name: '알 수 없음', category: '',
      address_road: '', latitude: 0, longitude: 0, phone_number: null,
      thumbnail_url: '', photo_urls: [], business_hours: null, website_url: null,
      seat_status: '', outlet_status: '', noise_status: '', vibe_tags: [],
      base_price: 0, amenities: [], badges: [], closed_at: null,
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
