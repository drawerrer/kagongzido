import { useState, useRef, useEffect } from 'react';
import { useFavorites, FavoritedStore, RecentCafe } from '../context/FavoritesContext';
import Snackbar from '../components/Snackbar';

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
  items,
  onClose,
}: {
  items: { label: string; action: () => void; destructive?: boolean }[];
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
            color: item.destructive ? '#e42939' : 'rgba(3,18,40,0.7)',
            textAlign: 'left',
          }}
        >{item.label}</button>
      ))}
    </div>
  );
}

// ─── 컬렉션 삭제 다이얼로그 ───────────────────────────────────
function DeleteCollectionDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      backgroundColor: 'rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 311, borderRadius: 24, backgroundColor: '#ffffff', overflow: 'hidden' }}>
        <div style={{ padding: '22px 22px 0' }}>
          <p style={{ fontFamily: SFPro, fontWeight: 700, fontSize: 20, color: 'rgba(0,12,30,0.8)', lineHeight: '27px', marginBottom: 8 }}>
            컬렉션을 삭제할까요?
          </p>
          <p style={{ fontFamily: SFPro, fontWeight: 400, fontSize: 15, color: 'rgba(3,18,40,0.7)', lineHeight: '24px' }}>
            만들어둔 컬렉션이 사라져요.{'\n'}
            담아둔 매장은 전체 모음집에서 계속 볼 수 있어요.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '20px 16px 16px' }}>
          <button onClick={onCancel} style={{ flex: 1, height: 48, borderRadius: 14, background: 'rgba(7,25,76,0.05)', border: 'none', cursor: 'pointer', fontFamily: SFPro, fontWeight: 590, fontSize: 17, color: 'rgba(3,18,40,0.7)' }}>취소</button>
          <button onClick={onConfirm} style={{ flex: 1, height: 48, borderRadius: 14, background: 'rgba(240,68,82,0.16)', border: 'none', cursor: 'pointer', fontFamily: SFPro, fontWeight: 590, fontSize: 17, color: '#e42939' }}>삭제하기</button>
        </div>
      </div>
    </div>
  );
}

// ─── 매장 삭제 다이얼로그 ─────────────────────────────────────
function DeleteStoreDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      backgroundColor: 'rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{ width: 311, borderRadius: 24, backgroundColor: '#ffffff', overflow: 'hidden' }}>
        <div style={{ padding: '22px 22px 0' }}>
          <p style={{ fontFamily: SFPro, fontWeight: 700, fontSize: 20, color: 'rgba(0,12,30,0.8)', lineHeight: '27px', marginBottom: 8 }}>
            매장을 삭제할까요?
          </p>
          <p style={{ fontFamily: SFPro, fontWeight: 400, fontSize: 15, color: 'rgba(3,18,40,0.7)', lineHeight: '24px' }}>
            모음집에서 매장이 사라져요.{'\n'}
            담아둔 컬렉션에서도 함께 지워져요.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, padding: '20px 16px 16px' }}>
          <button onClick={onCancel} style={{ flex: 1, height: 48, borderRadius: 14, background: 'rgba(7,25,76,0.05)', border: 'none', cursor: 'pointer', fontFamily: SFPro, fontWeight: 590, fontSize: 17, color: 'rgba(3,18,40,0.7)' }}>취소</button>
          <button onClick={onConfirm} style={{ flex: 1, height: 48, borderRadius: 14, background: 'rgba(240,68,82,0.16)', border: 'none', cursor: 'pointer', fontFamily: SFPro, fontWeight: 590, fontSize: 17, color: '#e42939' }}>삭제하기</button>
        </div>
      </div>
    </div>
  );
}

// ─── 메모 바텀시트 ─────────────────────────────────────────────
function MemoSheet({ initialMemo, onApply, onClose }: { initialMemo: string; onApply: (memo: string) => void; onClose: () => void }) {
  const [value, setValue] = useState(initialMemo);
  const MAX = 60;
  const isActive = value.trim().length > 0;

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div style={{ margin: '0 10px' }} onClick={e => e.stopPropagation()}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '28px 28px 0 0', overflow: 'hidden' }}>
          {/* 핸들 */}
          <div style={{ height: 41, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 4, borderRadius: 40, backgroundColor: '#e5e8eb' }} />
          </div>
          {/* 제목 */}
          <div style={{ padding: '0 24px 16px' }}>
            <span style={{ fontFamily: SFPro, fontWeight: 700, fontSize: 20, color: 'rgba(0,12,30,0.8)' }}>메모</span>
          </div>
          {/* 입력 */}
          <div style={{ padding: '0 24px 16px' }}>
            <div style={{ borderBottom: '1px solid #f2f4f6', paddingBottom: 4 }}>
              <input
                value={value}
                onChange={e => setValue(e.target.value.slice(0, MAX))}
                placeholder="남기고 싶은 메모를 적을 수 있어요"
                style={{
                  width: '100%', border: 'none', outline: 'none',
                  fontFamily: SFPro, fontWeight: 590, fontSize: 17,
                  color: '#191f28', backgroundColor: 'transparent',
                } as React.CSSProperties}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <span style={{ fontFamily: SFPro, fontWeight: 400, fontSize: 12, color: 'rgba(0,19,43,0.38)' }}>{value.length}/{MAX}</span>
            </div>
          </div>
          {/* 적용하기 버튼 */}
          <button
            onClick={() => isActive && onApply(value)}
            style={{
              width: '100%', height: 56,
              backgroundColor: isActive ? '#3182f6' : 'rgba(26,122,249,0.47)',
              border: 'none', cursor: isActive ? 'pointer' : 'default',
              fontFamily: SFPro, fontWeight: 590, fontSize: 17,
              color: '#ffffff',
            }}
          >적용하기</button>
        </div>
      </div>
    </div>
  );
}

// ─── 토스트 ────────────────────────────────────────────────────
function ToastBar({ message }: { message: string }) {
  return (
    <div style={{
      position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
      zIndex: 300,
      backgroundColor: '#ffffff',
      borderRadius: 9999,
      padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    }}>
      {/* 초록색 체크 아이콘 */}
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="9" fill="#00C471" />
        <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 15, color: 'rgba(0,12,30,0.8)' }}>{message}</span>
    </div>
  );
}

// ─── 매장 추가 바텀시트 ─────────────────────────────────────────
function AddStoreSheet({
  availableStores,
  onConfirm,
  onClose,
  onGoHome,
}: {
  availableStores: FavoritedStore[];
  onConfirm: (ids: string[]) => void;
  onClose: () => void;
  onGoHome?: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const hasSelection = selectedIds.size > 0;

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          margin: '0 10px',
          maxHeight: '82%',
          display: 'flex', flexDirection: 'column',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '28px 28px 0 0',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          maxHeight: '100%',
        }}>
          {/* 핸들 */}
          <div style={{ height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, paddingTop: 8 }}>
            <div style={{ width: 36, height: 4, borderRadius: 40, backgroundColor: '#e5e8eb' }} />
          </div>

          {/* 타이틀 */}
          <div style={{ padding: '12px 20px 0', flexShrink: 0 }}>
            <p style={{ fontFamily: SFPro, fontWeight: 700, fontSize: 20, color: 'rgba(0,12,30,0.8)', marginBottom: 0 }}>
              어떤 매장을 추가할까요?
            </p>
          </div>

          {/* 선택 개수 서브헤더 */}
          {hasSelection && (
            <div style={{ padding: '6px 20px 0', flexShrink: 0 }}>
              <p style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 14, color: '#3182f6', marginBottom: 0 }}>
                {selectedIds.size}개의 매장을 선택했어요
              </p>
            </div>
          )}

          {/* 매장 리스트 */}
          <div style={{ flex: 1, overflowY: 'auto', marginTop: 8 }}>
            {availableStores.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 14, color: 'rgba(0,19,43,0.45)' }}>
                  추가할 수 있는 매장이 없어요
                </p>
              </div>
            ) : (
              availableStores.map(store => {
                const isSelected = selectedIds.has(store.id);
                return (
                  <button
                    key={store.id}
                    onClick={() => toggle(store.id)}
                    style={{
                      width: '100%', padding: '16px 20px',
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      background: 'none', border: 'none', cursor: 'pointer',
                      opacity: isSelected ? 1 : 0.7,
                      transition: 'opacity 0.15s',
                      textAlign: 'left',
                    }}
                  >
                    {/* 이미지 썸네일 */}
                    <div style={{
                      width: 56, height: 56, borderRadius: 8, flexShrink: 0, overflow: 'hidden',
                      backgroundColor: '#e8edf4',
                    }}>
                      {store.photos[0] && (
                        <img src={store.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      )}
                    </div>
                    {/* 텍스트 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: SFPro, fontWeight: 700, fontSize: 15, color: 'rgba(0,12,30,0.8)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.name}</p>
                      <p style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 12, color: 'rgba(0,19,43,0.58)', marginBottom: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.address}</p>
                    </div>
                    {/* 체크 서클 */}
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      border: `2px solid ${isSelected ? '#3182f6' : 'rgba(0,19,43,0.2)'}`,
                      backgroundColor: isSelected ? '#3182f6' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && (
                        <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                          <path d="M1 4l3.5 3.5L11 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })
            )}

            {/* 새로운 매장 찾아보기 */}
            <button
              onClick={onGoHome}
              style={{
                width: '100%', height: 56,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: SFPro, fontWeight: 590, fontSize: 15,
                color: '#3182f6',
              }}
            >
              + 새로운 매장 찾아보기
            </button>
          </div>

          {/* 확인 버튼 */}
          <button
            onClick={() => hasSelection && onConfirm([...selectedIds])}
            style={{
              width: '100%', height: 56, flexShrink: 0,
              backgroundColor: hasSelection ? '#3182f6' : 'rgba(26,122,249,0.47)',
              border: 'none', cursor: hasSelection ? 'pointer' : 'default',
              fontFamily: SFPro, fontWeight: 590, fontSize: 17,
              color: '#ffffff',
            }}
          >확인</button>
        </div>
      </div>
    </div>
  );
}

// ─── 카드 아이템 ──────────────────────────────────────────────
function StoreCard({
  store,
  isEditMode,
  isSelected,
  heartFilled,
  showMemo = true,
  onToggleSelect,
  onMemoTap,
  onDetailOpen,
  onHeartTap,
  onPhotoMore,
}: {
  store: CollectionStore;
  isEditMode: boolean;
  isSelected: boolean;
  heartFilled: boolean;
  showMemo?: boolean;
  onToggleSelect: (id: string) => void;
  onMemoTap: (id: string) => void;
  onDetailOpen?: (id: string) => void;
  onHeartTap?: (id: string) => void;
  onPhotoMore?: () => void;
}) {
  const placeholderColors = ['#D4C4B0', '#C4B4A0', '#B4A490', '#A49480'];

  return (
    <div>
      <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'flex-start' }}>
        {/* 체크박스 (편집모드) */}
        {isEditMode && (
          <button
            onClick={() => onToggleSelect(store.id)}
            style={{ width: 24, height: 24, flexShrink: 0, marginRight: 10, marginTop: 2, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {isSelected ? (
                <>
                  <circle cx="12" cy="12" r="12" fill="#3182F6" />
                  <path d="M7 12l3.5 3.5L17 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : (
                <circle cx="12" cy="12" r="11" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" fill="none" />
              )}
            </svg>
          </button>
        )}

        {/* 메인 콘텐츠 */}
        <div
          style={{ flex: 1, minWidth: 0, cursor: isEditMode ? 'default' : 'pointer' }}
          onClick={() => !isEditMode && onDetailOpen?.(store.id)}
        >
          {/* Info + 아이콘 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: SFPro, fontWeight: 700, fontSize: 17, color: 'rgba(0,12,30,0.8)', lineHeight: '23px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {store.name}
              </p>
              <p style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)', lineHeight: '17.6px', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {store.address}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="#FBBC04">
                  <path d="M8 1.5l1.73 3.51 3.87.56-2.8 2.73.66 3.85L8 10.07l-3.46 1.82.66-3.85-2.8-2.73 3.87-.56L8 1.5z" />
                </svg>
                <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)' }}>{store.rating.toFixed(1)}</span>
                <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)' }}>({store.reviewCount.toLocaleString()})</span>
                {store.timeLimit && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'rgba(0,27,55,0.1)', borderRadius: 9, padding: '3px 7px' }}>
                    <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 10, color: 'rgba(3,18,40,0.7)' }}>{store.timeLimit}</span>
                  </div>
                )}
              </div>
            </div>
            {/* 편집모드: 순서 핸들 / 기본: 하트 */}
            {isEditMode ? (
              <div style={{ width: 24, height: 24, flexShrink: 0, marginLeft: 8, marginTop: 2 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M4 8h16M4 12h16M4 16h16" stroke="rgba(0,29,58,0.18)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onHeartTap?.(store.id); }}
                style={{ width: 20, height: 20, flexShrink: 0, marginLeft: 12, marginTop: 2, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                {heartFilled ? (
                  /* 채워진 하트 (파란색) */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      fill="#3182f6" stroke="#3182f6" strokeWidth="0.5" />
                  </svg>
                ) : (
                  /* 빈 하트 (회색) */
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" />
                  </svg>
                )}
              </button>
            )}
          </div>

          {/* 이미지 10장 — 가로 스크롤 */}
          <div
            style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
            onWheel={(e) => { e.preventDefault(); (e.currentTarget as HTMLDivElement).scrollLeft += e.deltaY; }}
          >
            <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
              {Array.from({ length: 10 }, (_, idx) => {
                const isLast = idx === 9;
                const showOverlay = isLast && !isEditMode;
                return (
                  <div key={idx} style={{
                    position: 'relative', width: 80, height: 80, borderRadius: 4, flexShrink: 0, overflow: 'hidden',
                    backgroundColor: store.photos[idx] ? undefined : placeholderColors[idx % 4],
                  }}>
                    {store.photos[idx] && (
                      <img src={store.photos[idx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                    {showOverlay && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onPhotoMore?.(); }}
                        style={{
                          position: 'absolute', inset: 0,
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: 'none', cursor: 'pointer', borderRadius: 4,
                        }}
                      >
                        <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 14, color: '#ffffff' }}>더보기</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 메모 영역 (최근 탭에서는 숨김) */}
      {showMemo && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px 20px',
            minHeight: 40,
            cursor: isEditMode ? 'default' : 'pointer',
          }}
          onClick={() => !isEditMode && onMemoTap(store.id)}
        >
          {store.memo ? (
            <>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5a1.5 1.5 0 0 1 2.12 2.12L3.5 10.74 1 11l.26-2.5L8.5 1.5z"
                  stroke="rgba(0,19,43,0.58)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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
      )}
      {!showMemo && <div style={{ paddingBottom: 20 }} />}
    </div>
  );
}

// ─── 빈 상태 ──────────────────────────────────────────────────
function EmptyState({ onAddStore }: { onAddStore?: () => void }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '60px 20px',
    }}>
      <p style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 13, color: '#191F28', textAlign: 'center', lineHeight: '19px', marginBottom: 0 }}>
        아직 컬렉션에 담은 매장이 없어요
      </p>
      <p style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 13, color: 'rgba(0,19,43,0.45)', textAlign: 'center', lineHeight: '19px', marginBottom: 12 }}>
        저장해 둔 매장을 목적에 맞게 쏙쏙 골라 담아보세요
      </p>
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
          <path d="M10 4v12M4 10h12" stroke="rgba(0,12,30,0.8)" strokeWidth="1.8" strokeLinecap="round" />
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
  onPhotoMore,
  onCollectionDeleted,
  onGoHome,
}: {
  collectionName: string;
  collectionId: string;
  onBack?: () => void;
  onClose?: () => void;
  onDetailOpen?: (id: string) => void;
  onPhotoMore?: (storeId: string, photos: string[], cafeName: string) => void;
  onCollectionDeleted?: (data: { id: string; name: string; storeIds: string[] }) => void;
  onGoHome?: () => void;
}) {
  const {
    recentlyViewed, favorites, collections,
    removeCollection, removeFavorite, addFavorite, isFavorited,
    addStoresToCollection, removeStoresFromCollection, updateCollectionMemo,
  } = useFavorites();

  const [showPopover, setShowPopover] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteCollectionDialog, setShowDeleteCollectionDialog] = useState(false);
  const [showDeleteStoreId, setShowDeleteStoreId] = useState<string | null>(null);
  const [showAddStoreSheet, setShowAddStoreSheet] = useState(false);
  const [memoTargetId, setMemoTargetId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ msg: string; actionLabel?: string; undoFn?: () => void } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const snackbarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isRecent = collectionId === 'recent';
  const collection = collections.find(c => c.id === collectionId);
  const collectionStoreIds = new Set(collection?.storeIds ?? []);

  const stores: CollectionStore[] = isRecent
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
    : favorites
        .filter((f: FavoritedStore) => collectionStoreIds.has(f.id))
        .map((f: FavoritedStore) => ({
          id: f.id,
          name: f.name,
          address: f.address,
          rating: f.rating,
          reviewCount: f.reviewCount,
          timeLimit: '',
          photos: f.photos ?? [],
          memo: collection?.memos?.[f.id] ?? '',
        }));

  // 매장 추가 시트에 보여줄 매장: favorites 중 이 컬렉션에 없는 것
  const addableStores = favorites.filter(f => !collectionStoreIds.has(f.id));

  // ── 팝오버 아이템 (컨텍스트별) ──
  const popoverItems = isRecent
    ? [{ label: '정보 수정 제안하기', action: () => {} }]
    : stores.length === 0
    ? [
        { label: '삭제하기', action: () => setShowDeleteCollectionDialog(true) },
        { label: '매장 추가하기', action: () => setShowAddStoreSheet(true) },
        { label: '정보 수정 제안하기', action: () => {} },
      ]
    : [
        { label: '편집하기', action: enterEditMode },
        { label: '컬렉션 삭제하기', action: () => setShowDeleteCollectionDialog(true) },
        { label: '매장 추가하기', action: () => setShowAddStoreSheet(true) },
        { label: '정보 수정 제안하기', action: () => {} },
      ];

  // ── 편집모드 ──
  function enterEditMode() {
    setIsEditMode(true);
    setSelectedIds(new Set());
    setShowPopover(false);
  }

  const exitEditMode = () => {
    setIsEditMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── 선택 매장 삭제 ──
  const handleDeleteSelected = () => {
    const deletedIds = [...selectedIds];
    removeStoresFromCollection(collectionId, deletedIds);
    exitEditMode();

    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    setSnackbar({
      msg: `${deletedIds.length}개의 매장을 삭제했어요`,
      actionLabel: '되돌리기',
      undoFn: () => {
        addStoresToCollection(collectionId, deletedIds);
        setSnackbar(null);
      },
    });
    snackbarTimerRef.current = setTimeout(() => setSnackbar(null), 3000);
  };

  // ── 컬렉션 삭제 ──
  const handleDeleteCollection = () => {
    const col = collections.find(c => c.id === collectionId);
    removeCollection(collectionId);
    setShowDeleteCollectionDialog(false);
    if (onCollectionDeleted) {
      onCollectionDeleted({ id: collectionId, name: collectionName, storeIds: col?.storeIds ?? [] });
    } else {
      onBack?.();
    }
  };

  // ── 매장 하트 탭 ──
  const handleHeartTap = (storeId: string) => {
    if (isRecent) {
      if (isFavorited(storeId)) {
        // 이미 찜됨 → 삭제 확인
        setShowDeleteStoreId(storeId);
      } else {
        // 찜 안됨 → 추가
        const store = stores.find(s => s.id === storeId);
        if (store) {
          addFavorite({ id: store.id, name: store.name, address: store.address, rating: store.rating, reviewCount: store.reviewCount, photos: store.photos });
          showSnackbar('모음집에 저장했어요', '보기');
        }
      }
    } else {
      // 커스텀 컬렉션 → 삭제 확인
      setShowDeleteStoreId(storeId);
    }
  };

  // ── 매장 삭제 확인 ──
  const handleStoreDeleteConfirm = () => {
    const storeId = showDeleteStoreId!;
    const favStore = favorites.find(f => f.id === storeId);
    removeFavorite(storeId);
    setShowDeleteStoreId(null);

    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    setSnackbar({
      msg: '1개의 매장을 삭제했어요',
      actionLabel: '되돌리기',
      undoFn: () => {
        if (favStore) addFavorite(favStore);
        setSnackbar(null);
      },
    });
    snackbarTimerRef.current = setTimeout(() => setSnackbar(null), 3000);
  };

  // ── 매장 추가 확인 ──
  const handleAddStoreConfirm = (selectedStoreIds: string[]) => {
    addStoresToCollection(collectionId, selectedStoreIds);
    setShowAddStoreSheet(false);
    showToast('매장을 추가했어요');
  };

  // ── 메모 저장 ──
  const handleApplyMemo = (memo: string) => {
    if (!memoTargetId || isRecent) return;
    updateCollectionMemo(collectionId, memoTargetId, memo);
    setMemoTargetId(null);
    showToast('메모를 저장했어요');
  };

  // ── 스낵바/토스트 유틸 ──
  function showSnackbar(msg: string, actionLabel?: string, undoFn?: () => void) {
    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    setSnackbar({ msg, actionLabel, undoFn });
    snackbarTimerRef.current = setTimeout(() => setSnackbar(null), 3000);
  }

  function showToast(msg: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }

  const currentMemo = memoTargetId ? (collection?.memos?.[memoTargetId] ?? '') : '';

  const handleBack = () => {
    if (isEditMode) { exitEditMode(); return; }
    onBack?.();
  };

  const handleClose = () => {
    if (isEditMode) { exitEditMode(); return; }
    (onClose ?? onBack)?.();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', position: 'relative' }}>
      {/* ── NavBar (44px) ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        height: 44, paddingRight: 8,
        flexShrink: 0, position: 'relative',
      }}>
        <button
          onClick={handleBack}
          style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#191f28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', height: 34, borderRadius: 99, backgroundColor: 'rgba(0,23,51,0.02)', overflow: 'hidden' }}>
          {/* 편집모드에는 ··· 없음 */}
          {!isEditMode && (
            <>
              <button
                onClick={() => setShowPopover(v => !v)}
                style={{ width: 46, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="#191f28">
                  <circle cx="4" cy="10" r="1.5" />
                  <circle cx="10" cy="10" r="1.5" />
                  <circle cx="16" cy="10" r="1.5" />
                </svg>
              </button>
              <div style={{ width: 1, height: 16, backgroundColor: 'rgba(0,27,55,0.1)' }} />
            </>
          )}
          <button
            onClick={handleClose}
            style={{ width: 46, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#191f28" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="5" x2="15" y2="15" />
              <line x1="15" y1="5" x2="5" y2="15" />
            </svg>
          </button>
        </div>

        {/* 팝오버 */}
        {showPopover && (
          <Popover items={popoverItems} onClose={() => setShowPopover(false)} />
        )}
      </div>

      {/* ── info_2 (46px) ── */}
      <div style={{ height: 46, backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 14, color: '#000000' }}>
          {isEditMode ? '편집모드' : collectionName}
        </span>
      </div>

      {/* ── Body ── */}
      {stores.length === 0 && !isEditMode ? (
        isRecent ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
            <p style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 13, color: '#191F28', textAlign: 'center', lineHeight: '19px', marginBottom: 4 }}>아직 최근 본 매장이 없어요</p>
            <p style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.45)', textAlign: 'center', lineHeight: '19px' }}>홈에서 카페를 탐색하면 여기에 기록돼요</p>
          </div>
        ) : (
          <EmptyState onAddStore={() => setShowAddStoreSheet(true)} />
        )
      ) : (
        <div
          style={{ flex: 1, overflowY: 'auto' }}
          onScroll={() => showPopover && setShowPopover(false)}
        >
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              isEditMode={isEditMode}
              isSelected={selectedIds.has(store.id)}
              heartFilled={isRecent ? isFavorited(store.id) : true}
              showMemo={!isRecent}
              onToggleSelect={toggleSelect}
              onMemoTap={(id) => setMemoTargetId(id)}
              onDetailOpen={onDetailOpen}
              onHeartTap={handleHeartTap}
              onPhotoMore={() => onPhotoMore?.(store.id, store.photos, store.name)}
            />
          ))}
        </div>
      )}

      {/* ── 편집모드 하단 CTA ── */}
      {isEditMode && (
        <div style={{ flexShrink: 0, position: 'relative' }}>
          <div style={{ height: 36, background: 'linear-gradient(to bottom, transparent, #ffffff)', pointerEvents: 'none' }} />
          <div style={{ height: 76, backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
            {selectedIds.size > 0 ? (
              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                <button
                  onClick={handleDeleteSelected}
                  style={{ flex: 1, height: 56, borderRadius: 16, backgroundColor: 'rgba(49,130,246,0.16)', border: 'none', cursor: 'pointer', fontFamily: SFPro, fontWeight: 590, fontSize: 17, color: '#2272eb' }}
                >삭제</button>
                <button
                  onClick={exitEditMode}
                  style={{ flex: 1, height: 56, borderRadius: 16, backgroundColor: '#3182f6', border: 'none', cursor: 'pointer', fontFamily: SFPro, fontWeight: 590, fontSize: 17, color: '#ffffff' }}
                >완료</button>
              </div>
            ) : (
              <button
                onClick={exitEditMode}
                style={{ width: '100%', height: 56, borderRadius: 16, backgroundColor: '#f2f4f6', border: 'none', cursor: 'pointer', fontFamily: SFPro, fontWeight: 590, fontSize: 17, color: 'rgba(0,19,43,0.58)' }}
              >완료</button>
            )}
          </div>
        </div>
      )}

      {/* ── 오버레이 레이어들 ── */}

      {/* 컬렉션 삭제 다이얼로그 */}
      {showDeleteCollectionDialog && (
        <DeleteCollectionDialog
          onConfirm={handleDeleteCollection}
          onCancel={() => setShowDeleteCollectionDialog(false)}
        />
      )}

      {/* 매장 삭제 다이얼로그 */}
      {showDeleteStoreId && (
        <DeleteStoreDialog
          onConfirm={handleStoreDeleteConfirm}
          onCancel={() => setShowDeleteStoreId(null)}
        />
      )}

      {/* 메모 바텀시트 */}
      {memoTargetId && (
        <MemoSheet
          initialMemo={currentMemo}
          onApply={handleApplyMemo}
          onClose={() => setMemoTargetId(null)}
        />
      )}

      {/* 매장 추가 바텀시트 */}
      {showAddStoreSheet && (
        <AddStoreSheet
          availableStores={addableStores}
          onConfirm={handleAddStoreConfirm}
          onClose={() => setShowAddStoreSheet(false)}
          onGoHome={() => { setShowAddStoreSheet(false); onGoHome?.(); }}
        />
      )}

      {/* 토스트 (메모/추가 후) */}
      {toast && <ToastBar message={toast} />}

      {/* 스낵바 */}
      {snackbar && (
        <Snackbar
          message={snackbar.msg}
          actionLabel={snackbar.actionLabel}
          onAction={snackbar.undoFn}
          onDismiss={() => setSnackbar(null)}
          duration={3000}
        />
      )}
    </div>
  );
}
