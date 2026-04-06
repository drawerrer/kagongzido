import { useState, useRef, useEffect } from 'react';
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
  photos: string[];
  memo: string;
}

// ─── 팝오버 메뉴 ──────────────────────────────────────────────
function Popover({
  onDelete,
  onAddStore,
  onSuggestInfo,
  onClose,
}: {
  onDelete: () => void;
  onAddStore: () => void;
  onSuggestInfo: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [onClose]);

  const items = [
    { label: '삭제하기', action: onDelete },
    { label: '매장 추가하기', action: onAddStore },
    { label: '정보 수정 제안하기', action: onSuggestInfo },
  ];

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 49, right: 10, zIndex: 100,
      width: 180,
      backgroundColor: 'rgba(253,253,254,0.89)',
      border: '1px solid rgba(253,253,255,0.75)',
      borderRadius: 20,
      boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
      overflow: 'hidden',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      {/* 타이틀 "메뉴" */}
      <div style={{ height: 30, display: 'flex', alignItems: 'center', paddingLeft: 16 }}>
        <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 13, color: '#031832' }}>메뉴</span>
      </div>
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => { item.action(); onClose(); }}
          style={{
            width: '100%', height: 44,
            display: 'flex', alignItems: 'center', paddingLeft: 16,
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: SFPro, fontWeight: 510, fontSize: 17,
            color: 'rgba(3,18,40,0.7)',
          }}
        >{item.label}</button>
      ))}
    </div>
  );
}

// ─── 카드 아이템 ──────────────────────────────────────────────
function StoreCard({
  store,
  onDetailOpen,
}: {
  store: CollectionStore;
  onDetailOpen?: (id: string) => void;
}) {
  const placeholderColors = ['#D4C4B0', '#C4B4A0', '#B4A490', '#A49480'];

  return (
    <div
      style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer' }}
      onClick={() => onDetailOpen?.(store.id)}
    >
      {/* Info + 이미지 영역 (Left+Text: 343×154, paddingLeft/Right 16px) */}
      <div style={{ padding: '20px 16px 0' }}>
        {/* Info: 카페명 + 주소 + 평점 + 하트 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontFamily: SFPro, fontWeight: 700, fontSize: 17, color: 'rgba(0,12,30,0.8)',
              lineHeight: '23px', marginBottom: 2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{store.name}</p>
            <p style={{
              fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)',
              lineHeight: '17.6px', marginBottom: 4,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{store.address}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#FBBC04">
                <path d="M8 1.5l1.73 3.51 3.87.56-2.8 2.73.66 3.85L8 10.07l-3.46 1.82.66-3.85-2.8-2.73 3.87-.56L8 1.5z"/>
              </svg>
              <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)' }}>
                {store.rating.toFixed(1)}
              </span>
              <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)' }}>
                ({store.reviewCount.toLocaleString()})
              </span>
              {store.timeLimit && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center',
                  backgroundColor: 'rgba(0,27,55,0.1)', borderRadius: 9, padding: '3px 7px',
                }}>
                  <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 10, color: 'rgba(3,18,40,0.7)' }}>
                    {store.timeLimit}
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* 하트 아이콘 */}
          <div style={{ width: 20, height: 20, flexShrink: 0, marginLeft: 12, marginTop: 2 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="rgba(0,19,43,0.15)" stroke="rgba(0,19,43,0.2)" strokeWidth="1"/>
            </svg>
          </div>
        </div>

        {/* 이미지 4장 (80×80, r4, gap 8px) */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              style={{
                width: 80, height: 80, borderRadius: 4, flexShrink: 0, overflow: 'hidden',
                backgroundColor: store.photos[idx] ? undefined : placeholderColors[idx],
              }}
            >
              {store.photos[idx] && (
                <img src={store.photos[idx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 메모 영역 (343×40, paddingLeft/Right 16px) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px 20px',
        minHeight: 40,
      }}>
        {store.memo ? (
          <>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5a1.5 1.5 0 0 1 2.12 2.12L3.5 10.74 1 11l.26-2.5L8.5 1.5z"
                stroke="rgba(0,19,43,0.58)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{
              fontFamily: SFPro, fontWeight: 400, fontSize: 12, color: 'rgba(0,19,43,0.58)',
              lineHeight: '16.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1,
            }}>{store.memo}</span>
          </>
        ) : (
          <div style={{ height: 10 }} />
        )}
      </div>
    </div>
  );
}

// ─── 빈 상태 (Figma: Collection/Custom_Empty_Popover) ─────────
function EmptyState({ onAddStore }: { onAddStore?: () => void }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '0 20px',
    }}>
      <p style={{
        fontFamily: SFPro, fontWeight: 590, fontSize: 13, color: '#191F28',
        textAlign: 'center', lineHeight: '19px', marginBottom: 0,
      }}>아직 컬렉션에 담은 매장이 없어요</p>
      <p style={{
        fontFamily: SFPro, fontWeight: 590, fontSize: 13, color: 'rgba(0,19,43,0.45)',
        textAlign: 'center', lineHeight: '19px', marginBottom: 12,
      }}>저장해 둔 매장을 목적에 맞게 쏙쏙 골라 담아보세요</p>
      {/* 매장 추가하기 버튼 (Figma: 165×48, r14) */}
      <button
        onClick={onAddStore}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          width: 165, height: 48, borderRadius: 14,
          backgroundColor: 'rgba(0,27,55,0.06)',
          border: 'none', cursor: 'pointer',
          fontFamily: SFPro, fontWeight: 590, fontSize: 17, color: 'rgba(0,12,30,0.8)',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4v12M4 10h12" stroke="rgba(0,12,30,0.8)" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        매장 추가하기
      </button>
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
  const { recentlyViewed, favorites, removeCollection } = useFavorites();
  const [showPopover, setShowPopover] = useState(false);

  const stores: CollectionStore[] = collectionId === 'recent'
    ? recentlyViewed.map((r: RecentCafe) => ({
        id: r.id,
        name: r.name,
        address: '주소 정보 없음',
        rating: 0,
        reviewCount: 0,
        timeLimit: '',
        photos: r.photo ? [r.photo] : [],
        memo: '',
      }))
    : favorites.map((f: FavoritedStore) => ({
        id: f.id,
        name: f.name,
        address: f.address,
        rating: f.rating,
        reviewCount: f.reviewCount,
        timeLimit: '',
        photos: f.photos ?? [],
        memo: '',
      }));

  const handleDelete = () => {
    removeCollection(collectionId);
    onBack?.();
  };

  const isRecent = collectionId === 'recent';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', position: 'relative' }}>
      {/* ── NavBar (44px) ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        height: 44, paddingRight: 8,
        flexShrink: 0, position: 'relative',
      }}>
        {/* 뒤로가기 */}
        <button
          onClick={onBack}
          style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#191f28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <div style={{ flex: 1 }} />

        {/* ···|X 우측 버튼 */}
        <div style={{
          display: 'flex', alignItems: 'center',
          height: 34, borderRadius: 99,
          backgroundColor: 'rgba(0,23,51,0.02)', overflow: 'hidden',
        }}>
          {/* 최근 컬렉션은 ··· 버튼 없음 */}
          {!isRecent && (
            <>
              <button
                onClick={() => setShowPopover(v => !v)}
                style={{ width: 46, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="#191f28">
                  <circle cx="4" cy="10" r="1.5"/>
                  <circle cx="10" cy="10" r="1.5"/>
                  <circle cx="16" cy="10" r="1.5"/>
                </svg>
              </button>
              <div style={{ width: 1, height: 16, backgroundColor: 'rgba(0,27,55,0.1)' }}/>
            </>
          )}
          <button
            onClick={onClose ?? onBack}
            style={{ width: 46, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#191f28" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="5" x2="15" y2="15"/>
              <line x1="15" y1="5" x2="5" y2="15"/>
            </svg>
          </button>
        </div>

        {/* 팝오버 */}
        {showPopover && (
          <Popover
            onDelete={handleDelete}
            onAddStore={() => setShowPopover(false)}
            onSuggestInfo={() => setShowPopover(false)}
            onClose={() => setShowPopover(false)}
          />
        )}
      </div>

      {/* ── info_2 (46px, 컬렉션명 중앙) ── */}
      <div style={{
        height: 46, backgroundColor: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 14, color: '#000000' }}>
          {collectionName}
        </span>
      </div>

      {/* ── Body ── */}
      {stores.length === 0 ? (
        <EmptyState onAddStore={() => onBack?.()} />
      ) : (
        <div
          style={{ flex: 1, overflowY: 'auto' }}
          onScroll={() => showPopover && setShowPopover(false)}
        >
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} onDetailOpen={onDetailOpen} />
          ))}
        </div>
      )}
    </div>
  );
}
