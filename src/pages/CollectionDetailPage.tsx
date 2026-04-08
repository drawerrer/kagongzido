import { useState, useRef, useEffect, useCallback } from 'react';
import { useFavorites, FavoritedStore, RecentCafe } from '../context/FavoritesContext';
import Snackbar from '../components/Snackbar';
import ShareSheet from '../components/ShareSheet';

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
  const MAX = 45;
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
  const [expanded, setExpanded] = useState(false);
  const dragStartY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSelection = selectedIds.size > 0;

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // 핸들 드래그 (위: 확장, 아래: 축소)
  const onHandlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onHandlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const dy = dragStartY.current - e.clientY;
    if (dy > 30) setExpanded(true);
    if (dy < -30) setExpanded(false);
  };

  // 콘텐츠 드래그 — 스크롤 최상단일 때만 시트 확장/축소로 인식
  const dragStartScrollTop = useRef(0);
  const onContentPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartY.current = e.clientY;
    dragStartScrollTop.current = scrollRef.current?.scrollTop ?? 0;
  };
  const onContentPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const dy = dragStartY.current - e.clientY;
    const wasAtTop = dragStartScrollTop.current === 0;
    if (!expanded && wasAtTop && dy > 40) {
      setExpanded(true);
    } else if (expanded && wasAtTop && dy < -40) {
      setExpanded(false);
    }
  };

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.4)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: expanded ? '92%' : '55%',
          backgroundColor: '#ffffff',
          borderRadius: '20px 20px 0 0',
          display: 'flex', flexDirection: 'column',
          transition: 'height 0.3s cubic-bezier(0.32,0.72,0,1)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 드래그 핸들 */}
        <div
          onPointerDown={onHandlePointerDown}
          onPointerUp={onHandlePointerUp}
          style={{
            height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, cursor: 'grab', touchAction: 'none',
          }}
        >
          <div style={{ width: 36, height: 4, borderRadius: 40, backgroundColor: '#e5e8eb' }} />
        </div>

        {/* 타이틀 */}
        <div style={{ padding: '4px 20px 0', flexShrink: 0 }}>
          <p style={{ fontFamily: SFPro, fontWeight: 700, fontSize: 20, color: 'rgba(0,12,30,0.8)', marginBottom: 0 }}>
            어떤 매장을 추가할까요?
          </p>
          {hasSelection && (
            <p style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 14, color: 'rgba(0,19,43,0.45)', marginTop: 4, marginBottom: 0 }}>
              {selectedIds.size}개의 매장을 선택했어요
            </p>
          )}
        </div>

        {/* 매장 리스트 */}
        <div
          ref={scrollRef}
          style={{ flex: 1, overflowY: 'auto', marginTop: 12 }}
          onPointerDown={onContentPointerDown}
          onPointerUp={onContentPointerUp}
        >
          {availableStores.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 14, color: 'rgba(0,19,43,0.45)' }}>
                저장한 매장이 없어요
              </p>
            </div>
          ) : (
            availableStores.map(store => {
              const isSelected = selectedIds.has(store.id);
              const placeholderColors = ['#D4C4B0', '#C4B4A0', '#B4A490', '#A49480'];
              return (
                <div
                  key={store.id}
                  onClick={() => toggle(store.id)}
                  style={{ padding: '16px 16px 0', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    {/* 이름·주소·별점 */}
                    <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                      <p style={{ fontFamily: SFPro, fontWeight: 700, fontSize: 17, color: 'rgba(0,12,30,0.8)', lineHeight: '23px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {store.name}
                      </p>
                      <p style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)', lineHeight: '17.6px', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {store.address}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="#FBBC04">
                          <path d="M8 1.5l1.73 3.51 3.87.56-2.8 2.73.66 3.85L8 10.07l-3.46 1.82.66-3.85-2.8-2.73 3.87-.56L8 1.5z" />
                        </svg>
                        <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)' }}>{store.rating.toFixed(1)}</span>
                        <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)' }}>({store.reviewCount.toLocaleString()})</span>
                      </div>
                    </div>
                    {/* 체크 서클 */}
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${isSelected ? '#3182f6' : 'rgba(0,19,43,0.2)'}`,
                      backgroundColor: isSelected ? '#3182f6' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                        <path d="M1 4l3.5 3.5L11 1" stroke={isSelected ? '#fff' : 'rgba(0,19,43,0.2)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  {/* 사진 4장 */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                    {Array.from({ length: 4 }, (_, idx) => (
                      <div key={idx} style={{
                        flex: 1, aspectRatio: '1', borderRadius: 4, overflow: 'hidden',
                        backgroundColor: store.photos[idx] ? undefined : placeholderColors[idx % 4],
                      }}>
                        {store.photos[idx] && (
                          <img src={store.photos[idx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}

          {/* 새로운 매장 찾아보기 */}
          <div
            onClick={(e) => { e.stopPropagation(); onGoHome?.(); }}
            style={{
              padding: '12px 16px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              backgroundColor: 'rgba(0,27,55,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="rgba(0,12,30,0.8)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 17, color: 'rgba(0,12,30,0.8)' }}>새로운 매장 찾아보기</span>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 16px 20px', flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, height: 56, borderRadius: 16, backgroundColor: 'rgba(7,25,76,0.05)', border: 'none', cursor: 'pointer', fontFamily: SFPro, fontWeight: 590, fontSize: 17, color: 'rgba(3,18,40,0.7)' }}
          >닫기</button>
          <button
            onClick={() => hasSelection && onConfirm([...selectedIds])}
            style={{ flex: 1, height: 56, borderRadius: 16, backgroundColor: hasSelection ? '#3182f6' : 'rgba(26,122,249,0.47)', border: 'none', cursor: hasSelection ? 'pointer' : 'default', fontFamily: SFPro, fontWeight: 590, fontSize: 17, color: '#ffffff' }}
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
  isDragging = false,
  isDragOver = false,
  onToggleSelect,
  onMemoTap,
  onDetailOpen,
  onHeartTap,
  onPhotoMore,
  onHandleDrag,
}: {
  store: CollectionStore;
  isEditMode: boolean;
  isSelected: boolean;
  heartFilled: boolean;
  showMemo?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onToggleSelect: (id: string) => void;
  onMemoTap: (id: string) => void;
  onDetailOpen?: (id: string) => void;
  onHeartTap?: (id: string) => void;
  onPhotoMore?: () => void;
  onHandleDrag?: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  const placeholderColors = ['#D4C4B0', '#C4B4A0', '#B4A490', '#A49480'];

  return (
    <div
      onClick={() => isEditMode && onToggleSelect(store.id)}
      style={{
        cursor: isEditMode ? 'pointer' : 'default',
        opacity: isDragging ? 0.4 : 1,
        borderTop: isDragOver ? '2px solid #3182F6' : '2px solid transparent',
        transition: 'opacity 0.15s',
      }}
    >
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
                <>
                  <circle cx="12" cy="12" r="11" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" fill="none" />
                  <path d="M7 12l3.5 3.5L17 8" stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </svg>
          </button>
        )}

        {/* 메인 콘텐츠 */}
        <div
          style={{ flex: 1, minWidth: 0, cursor: isEditMode ? 'default' : 'pointer' }}
          onClick={(e) => { if (!isEditMode) { e.stopPropagation(); onDetailOpen?.(store.id); } }}
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
              <div
                onPointerDown={onHandleDrag}
                style={{ width: 24, height: 24, flexShrink: 0, marginLeft: 8, marginTop: 2, cursor: 'grab', touchAction: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <g fill="rgba(0,19,43,0.3)" fillRule="evenodd" clipRule="evenodd">
                    <path d="M10.293 7.707a1 1 0 0 1 0-1.414l3-3a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0"/>
                    <path d="M17.707 7.707a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 1.414-1.414l3 3a1 1 0 0 1 0 1.414"/>
                    <path d="M14 5a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1m-4.293 7.293a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414l3-3a1 1 0 0 1 1.414 0"/>
                    <path d="M2.293 12.293a1 1 0 0 1 1.414 0l3 3a1 1 0 1 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414"/>
                    <path d="M6 15a1 1 0 0 1-1-1V6a1 1 0 1 1 2 0v8a1 1 0 0 1-1 1"/>
                  </g>
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
          onClick={(e) => { if (!isEditMode) { e.stopPropagation(); onMemoTap(store.id); } }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
            <path d="M8.5 1.5a1.5 1.5 0 0 1 2.12 2.12L3.5 10.74 1 11l.26-2.5L8.5 1.5z"
              stroke="rgba(0,19,43,0.38)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {store.memo ? (
            <span style={{
              fontFamily: SFPro, fontWeight: 400, fontSize: 12, color: 'rgba(0,19,43,0.58)',
              lineHeight: '16.2px', flex: 1,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            } as React.CSSProperties}>{store.memo}</span>
          ) : (
            <span style={{
              fontFamily: SFPro, fontWeight: 400, fontSize: 12, color: 'rgba(0,19,43,0.25)',
              lineHeight: '16.2px',
            }}>이곳을 기억하고 싶은 특별한 이유를 적어두세요</span>
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
    addStoresToCollection, removeStoresFromCollection, updateCollectionMemo, updateCollection,
  } = useFavorites();

  const [showPopover, setShowPopover] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
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

  // ── 드래그 순서변경 ──
  const [orderedStoreIds, setOrderedStoreIds] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState(-1);
  const [dragOverIndex, setDragOverIndex] = useState(-1);
  const storeListRef = useRef<HTMLDivElement>(null);
  const itemRefsArr = useRef<(HTMLDivElement | null)[]>([]);

  const isRecent = collectionId === 'recent';
  const collection = collections.find(c => c.id === collectionId);

  // 드래그 중이 아닐 때 collection storeIds와 동기화
  useEffect(() => {
    if (!isRecent && dragIndex === -1) {
      setOrderedStoreIds(collection?.storeIds ?? []);
    }
  }, [collection?.storeIds, dragIndex, isRecent]);

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
    : orderedStoreIds
        .map((id) => favorites.find((f: FavoritedStore) => f.id === id))
        .filter((f): f is FavoritedStore => !!f)
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


  const onHandlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragIndex(index);
    setDragOverIndex(index);
    storeListRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const onListPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragIndex === -1) return;
    const y = e.clientY;
    let newOver = itemRefsArr.current.length - 1;
    for (let i = 0; i < itemRefsArr.current.length; i++) {
      const el = itemRefsArr.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (y < rect.top + rect.height / 2) { newOver = i; break; }
    }
    if (newOver !== dragOverIndex) setDragOverIndex(newOver);
  }, [dragIndex, dragOverIndex]);

  const onListPointerUp = useCallback(() => {
    if (dragIndex !== -1 && dragOverIndex !== -1 && dragIndex !== dragOverIndex) {
      setOrderedStoreIds(prev => {
        const arr = [...prev];
        const [moved] = arr.splice(dragIndex, 1);
        arr.splice(dragOverIndex, 0, moved);
        updateCollection(collectionId, { storeIds: arr });
        return arr;
      });
    }
    setDragIndex(-1);
    setDragOverIndex(-1);
  }, [dragIndex, dragOverIndex, updateCollection, collectionId]);

  // ── 팝오버 아이템 (컨텍스트별) ──
  const popoverItems = isRecent
    ? [
        { label: '공유하기', action: () => setShowShareSheet(true) },
        { label: '정보 수정 제안하기', action: () => {} },
      ]
    : stores.length === 0
    ? [
        { label: '삭제하기', action: () => setShowDeleteCollectionDialog(true) },
        { label: '매장 추가하기', action: () => setShowAddStoreSheet(true) },
        { label: '공유하기', action: () => setShowShareSheet(true) },
        { label: '정보 수정 제안하기', action: () => {} },
      ]
    : [
        { label: '편집하기', action: enterEditMode },
        { label: '컬렉션 삭제하기', action: () => setShowDeleteCollectionDialog(true) },
        { label: '매장 추가하기', action: () => setShowAddStoreSheet(true) },
        { label: '공유하기', action: () => setShowShareSheet(true) },
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
        // 최근 탭: 다이얼로그 없이 바로 삭제 + 스낵바
        const favStore = favorites.find(f => f.id === storeId);
        removeFavorite(storeId);
        if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
        setSnackbar({
          msg: '매장을 삭제했어요',
          actionLabel: '되돌리기',
          undoFn: () => {
            if (favStore) addFavorite(favStore);
            setSnackbar(null);
          },
        });
        snackbarTimerRef.current = setTimeout(() => setSnackbar(null), 3000);
      } else {
        // 찜 안됨 → 추가
        const store = stores.find(s => s.id === storeId);
        if (store) {
          addFavorite({ id: store.id, name: store.name, address: store.address, rating: store.rating, reviewCount: store.reviewCount, photos: store.photos });
          showSnackbar('모음집에 저장했어요', '보기');
        }
      }
    } else {
      // 커스텀 컬렉션 → 다이얼로그 → 삭제
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
          {isEditMode ? '편집모드' : `${collectionName} (${stores.length})`}
        </span>
      </div>

      {/* ── Body ── */}
      {stores.length === 0 && !isEditMode ? (
        isRecent ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
            <p style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 13, color: '#191F28', textAlign: 'center', lineHeight: '19px', marginBottom: 4 }}>아직 최근에 본 매장이 없어요</p>
            <p style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.45)', textAlign: 'center', lineHeight: '19px', marginBottom: 20 }}>홈에서 카페를 탐색하면 여기에 기록돼요</p>
            <button
              onClick={onGoHome}
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
              매장 보러가기
            </button>
          </div>
        ) : (
          <EmptyState onAddStore={() => setShowAddStoreSheet(true)} />
        )
      ) : (
        <div
          ref={storeListRef}
          style={{ flex: 1, overflowY: 'auto' }}
          onScroll={() => showPopover && setShowPopover(false)}
          onPointerMove={isEditMode ? onListPointerMove : undefined}
          onPointerUp={isEditMode ? onListPointerUp : undefined}
          onPointerCancel={isEditMode ? onListPointerUp : undefined}
        >
          {stores.map((store, index) => (
            <div
              key={store.id}
              ref={el => { itemRefsArr.current[index] = el; }}
            >
              <StoreCard
                store={store}
                isEditMode={isEditMode}
                isSelected={selectedIds.has(store.id)}
                heartFilled={isRecent ? isFavorited(store.id) : true}
                showMemo={!isRecent}
                isDragging={isEditMode && dragIndex === index}
                isDragOver={isEditMode && dragOverIndex === index && dragIndex !== index}
                onToggleSelect={toggleSelect}
                onMemoTap={(id) => setMemoTargetId(id)}
                onDetailOpen={onDetailOpen}
                onHeartTap={handleHeartTap}
                onPhotoMore={() => onPhotoMore?.(store.id, store.photos, store.name)}
                onHandleDrag={isEditMode && !isRecent ? (e) => onHandlePointerDown(e, index) : undefined}
              />
            </div>
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
          availableStores={favorites}
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

      {/* 공유 바텀시트 */}
      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        shareTitle={collectionName}
      />
    </div>
  );
}
