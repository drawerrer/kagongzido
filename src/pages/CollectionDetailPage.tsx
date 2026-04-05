import { useState } from 'react';
import { useFavorites, FavoritedStore, RecentCafe } from '../context/FavoritesContext';

const SFPro = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif';

// ─── 타입 ─────────────────────────────────────────────────────
interface CollectionStore {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  timeLimit: string;
  photos: string[]; // 최대 4장, 없으면 빈 배열
  memo: string;
}

// ─── 네비게이션 바 ──────────────────────────────────────────
function NavBar({ onBack, onClose }: { onBack?: () => void; onClose?: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', height: 44,
      borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0, backgroundColor: '#fff',
    }}>
      {/* 왼쪽: 뒤로가기 + 앱명 */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
        <button
          onClick={onBack}
          style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#191f28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 15, color: '#191F28' }}>모음집</span>
      </div>
      {/* 오른쪽: Fixed Icon Area (TDS component/navigation~~) */}
      <div style={{ paddingRight: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 34, borderRadius: 99, backgroundColor: 'rgba(0,23,51,0.02)' }}>
          <button style={{ width: 46, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="#191f28">
              <circle cx="4" cy="10" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="16" cy="10" r="1.5" />
            </svg>
          </button>
          <div style={{ width: 1, height: 16, backgroundColor: 'rgba(0,27,55,0.1)', flexShrink: 0 }} />
          <button onClick={onClose} style={{ width: 46, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#191f28" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="5" x2="15" y2="15" /><line x1="15" y1="5" x2="5" y2="15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── 카드 아이템 ─────────────────────────────────────────────
function StoreCard({
  store,
  onDetailOpen,
}: {
  store: CollectionStore;
  onDetailOpen?: (id: string) => void;
}) {
  const [saved, setSaved] = useState(false);

  // 이미지 placeholder 색상 (실제 데이터 연동 전 임시)
  const placeholderColors = ['#D4C4B0', '#C4B4A0', '#B4A490', '#A49480'];

  return (
    <div
      style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer' }}
      onClick={() => onDetailOpen?.(store.id)}
    >
      {/* 상단: 상하 20px, 좌우 16px 패딩 */}
      <div style={{ padding: '20px 16px 0' }}>
        {/* Info 영역 + 하트 아이콘 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          {/* 텍스트 정보 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* 카페 이름 */}
            <p style={{
              fontFamily: SFPro, fontWeight: 700, fontSize: 17, color: 'rgba(0,12,30,0.8)',
              lineHeight: '23px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {store.name}
            </p>
            {/* 주소 */}
            <p style={{
              fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)',
              lineHeight: '17.6px', marginBottom: 4,
            }}>
              {store.address}
            </p>
            {/* 평점 + 리뷰 수 + 뱃지 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* 별 아이콘 */}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#FBBC04">
                <path d="M8 1.5l1.73 3.51 3.87.56-2.8 2.73.66 3.85L8 10.07l-3.46 1.82.66-3.85-2.8-2.73 3.87-.56L8 1.5z" />
              </svg>
              <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)' }}>
                {store.rating.toFixed(1)}
              </span>
              <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)' }}>
                ({store.reviewCount.toLocaleString()})
              </span>
              {/* 시간제한 뱃지 */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(0,27,55,0.1)', borderRadius: 9,
                padding: '3px 7px',
              }}>
                <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 10, color: 'rgba(3,18,40,0.7)' }}>
                  {store.timeLimit || '시간 제한 없음'}
                </span>
              </div>
            </div>
          </div>
          {/* 하트 아이콘 */}
          <button
            onClick={(e) => { e.stopPropagation(); setSaved(v => !v); }}
            style={{ width: 20, height: 20, background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, marginLeft: 12, marginTop: 2 }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill={saved ? '#FF3B30' : 'none'} stroke={saved ? '#FF3B30' : '#191f28'} strokeWidth="1.5">
              <path d="M10 17.5s-7-4.5-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 17 8.5c0 4.5-7 9-7 9z" />
            </svg>
          </button>
        </div>

        {/* 이미지 4장 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              style={{
                width: 80, height: 80, borderRadius: 4, flexShrink: 0, overflow: 'hidden',
                backgroundColor: placeholderColors[idx],
                backgroundImage: store.photos[idx] ? `url(${store.photos[idx]})` : undefined,
                backgroundSize: 'cover', backgroundPosition: 'center',
              }}
            />
          ))}
        </div>

        {/* 메모 */}
        {store.memo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 20 }}>
            {/* 연필 아이콘 */}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5a1.5 1.5 0 0 1 2.12 2.12L3.5 10.74 1 11l.26-2.5L8.5 1.5z" stroke="rgba(0,19,43,0.58)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{
              fontFamily: SFPro, fontWeight: 400, fontSize: 12, color: 'rgba(0,19,43,0.58)',
              lineHeight: '16.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
            }}>
              {store.memo}
            </span>
          </div>
        )}
        {!store.memo && <div style={{ paddingBottom: 20 }} />}
      </div>
    </div>
  );
}

// ─── 빈 상태 ─────────────────────────────────────────────────
function EmptyState({ collectionName }: { collectionName: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="20" fill="rgba(0,19,43,0.06)" />
        <path d="M24 14v10M24 28v2" stroke="rgba(0,19,43,0.25)" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <p style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 15, color: '#191F28' }}>
        {collectionName === '최근' ? '최근 방문한 카페가 없어요' : '저장된 카페가 없어요'}
      </p>
      <p style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.45)', textAlign: 'center', lineHeight: '19px' }}>
        {collectionName === '최근'
          ? '카페 상세 페이지를 방문하면\n최근 본 카페로 기록돼요'
          : '마음에 드는 카페를 저장해 보세요'}
      </p>
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────
export default function CollectionDetailPage({
  collectionName,
  collectionId,
  onBack,
  onClose,
  onDetailOpen,
}: {
  collectionName: string;
  collectionId: string;
  onBack?: () => void;
  onClose?: () => void;
  onDetailOpen?: (id: string) => void;
}) {
  const { recentlyViewed, favorites } = useFavorites();

  // 컬렉션 타입에 따라 표시할 스토어 결정
  const stores: CollectionStore[] = collectionId === 'recent'
    ? recentlyViewed.map((r: RecentCafe) => ({
        id: r.id,
        name: r.name,
        address: '주소 정보 없음',
        rating: 0,
        reviewCount: 0,
        timeLimit: '시간 제한 없음',
        photos: r.photo ? [r.photo] : [],
        memo: '',
      }))
    : favorites
        .map((f: FavoritedStore) => ({
          id: f.id,
          name: f.name,
          address: f.address,
          rating: f.rating,
          reviewCount: f.reviewCount,
          timeLimit: '시간 제한 없음',
          photos: [],
          memo: '',
        }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff' }}>
      {/* 네비게이션 */}
      <NavBar onBack={onBack} onClose={onClose} />

      {/* info_2 — 컬렉션 이름 중앙 정렬 (46px) */}
      <div style={{
        height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0, backgroundColor: '#fff',
      }}>
        <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 14, color: '#000000' }}>
          {collectionName}
        </span>
      </div>

      {/* Body — 카드 리스트 스크롤 */}
      {stores.length === 0 ? (
        <EmptyState collectionName={collectionName} />
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onDetailOpen={onDetailOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}
