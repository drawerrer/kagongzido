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
  onEdit,
  onDelete,
  onAddStore,
  onSuggestInfo,
  onClose,
}: {
  onEdit: () => void;
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
    { label: '편집하기', action: onEdit },
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

// ─── 삭제 확인 다이얼로그 ─────────────────────────────────────
function DeleteDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200,
      backgroundColor: 'rgba(0,0,0,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 311, borderRadius: 24,
        backgroundColor: '#ffffff',
        overflow: 'hidden',
      }}>
        {/* 텍스트 영역 */}
        <div style={{ padding: '22px 22px 0' }}>
          <p style={{
            fontFamily: SFPro, fontWeight: 700, fontSize: 20,
            color: 'rgba(0,12,30,0.8)', lineHeight: '27px', marginBottom: 8,
          }}>컬렉션을 삭제할까요?</p>
          <p style={{
            fontFamily: SFPro, fontWeight: 400, fontSize: 15,
            color: 'rgba(3,18,40,0.7)', lineHeight: '24px',
          }}>
            만들어둔 컬렉션이 사라져요.{'\n'}
            담아둔 매장은 전체 모음집에서 계속 볼 수 있어요.
          </p>
        </div>
        {/* 버튼 영역 */}
        <div style={{ display: 'flex', gap: 8, padding: '20px 16px 16px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, height: 48, borderRadius: 14,
              background: 'rgba(7,25,76,0.05)',
              border: 'none', cursor: 'pointer',
              fontFamily: SFPro, fontWeight: 590, fontSize: 17,
              color: 'rgba(3,18,40,0.7)',
            }}
          >취소</button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, height: 48, borderRadius: 14,
              background: 'rgba(240,68,82,0.16)',
              border: 'none', cursor: 'pointer',
              fontFamily: SFPro, fontWeight: 590, fontSize: 17,
              color: '#e42939',
            }}
          >삭제하기</button>
        </div>
      </div>
    </div>
  );
}

// ─── 메모 바텀시트 ─────────────────────────────────────────────
function MemoSheet({
  initialMemo,
  onApply,
  onClose,
}: {
  initialMemo: string;
  onApply: (memo: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initialMemo);

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{ margin: '0 10px' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '28px 28px 0 0',
          overflow: 'hidden',
        }}>
          {/* 핸들 */}
          <div style={{ height: 41, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 4, borderRadius: 40, backgroundColor: '#e5e8eb' }} />
          </div>
          {/* 제목 */}
          <div style={{ padding: '0 24px 16px' }}>
            <span style={{
              fontFamily: SFPro, fontWeight: 700, fontSize: 20,
              color: 'rgba(0,12,30,0.8)',
            }}>메모</span>
          </div>
          {/* 입력 */}
          <div style={{ padding: '0 24px 16px' }}>
            <div style={{ borderBottom: '1px solid #f2f4f6', paddingBottom: 12 }}>
              <input
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="남기고 싶은 메모를 적을 수 있어요"
                style={{
                  width: '100%', border: 'none', outline: 'none',
                  fontFamily: SFPro, fontWeight: 590, fontSize: 17,
                  color: '#191f28', backgroundColor: 'transparent',
                  '::placeholder': { color: '#8b95a1' },
                } as React.CSSProperties}
                autoFocus
              />
            </div>
          </div>
          {/* 적용하기 버튼 */}
          <button
            onClick={() => onApply(value)}
            style={{
              width: '100%', height: 56,
              backgroundColor: '#3182f6',
              border: 'none', cursor: 'pointer',
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
      position: 'absolute', top: 160, left: '50%', transform: 'translateX(-50%)',
      zIndex: 300,
      backgroundColor: '#ffffff',
      borderRadius: 9999,
      padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 8,
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        fontFamily: SFPro, fontWeight: 590, fontSize: 15,
        color: 'rgba(0,12,30,0.8)',
      }}>{message}</span>
    </div>
  );
}

// ─── 스낵바 ────────────────────────────────────────────────────
function SnackBar({
  message,
  onUndo,
}: {
  message: string;
  onUndo?: () => void;
}) {
  return (
    <div style={{
      position: 'absolute', bottom: 120, left: '50%', transform: 'translateX(-50%)',
      zIndex: 300,
      width: 315, minHeight: 59,
      backgroundColor: '#8b95a1',
      borderRadius: 9999,
      display: 'flex', alignItems: 'center',
      padding: '0 12px 0 20px',
      gap: 8,
      boxSizing: 'border-box',
    }}>
      <span style={{
        flex: 1,
        fontFamily: SFPro, fontWeight: 590, fontSize: 15, color: '#ffffff',
      }}>{message}</span>
      {onUndo && (
        <button
          onClick={onUndo}
          style={{
            height: 31, borderRadius: 100,
            backgroundColor: 'rgba(0,25,54,0.31)',
            border: 'none', cursor: 'pointer',
            padding: '0 14px',
            fontFamily: SFPro, fontWeight: 590, fontSize: 13,
            color: 'rgba(253,253,254,0.89)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >되돌리기</button>
      )}
    </div>
  );
}

// ─── 카드 아이템 ──────────────────────────────────────────────
function StoreCard({
  store,
  isEditMode,
  isSelected,
  onToggleSelect,
  onMemoTap,
  onDetailOpen,
  onHeartTap,
}: {
  store: CollectionStore;
  isEditMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onMemoTap: (id: string) => void;
  onDetailOpen?: (id: string) => void;
  onHeartTap?: (id: string) => void;
}) {
  const placeholderColors = ['#D4C4B0', '#C4B4A0', '#B4A490', '#A49480'];

  return (
    <div style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
      <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'flex-start' }}>
        {/* 체크박스 (편집모드) */}
        {isEditMode && (
          <button
            onClick={() => onToggleSelect(store.id)}
            style={{
              width: 24, height: 24, flexShrink: 0, marginRight: 10, marginTop: 2,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
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
                  <path d="M8 1.5l1.73 3.51 3.87.56-2.8 2.73.66 3.85L8 10.07l-3.46 1.82.66-3.85-2.8-2.73 3.87-.56L8 1.5z" />
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
            {/* 편집모드: 순서 핸들 / 기본: 하트 아이콘 */}
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill="#3182f6" stroke="#3182f6" strokeWidth="0.5" />
                </svg>
              </button>
            )}
          </div>

          {/* 이미지 4장 (편집모드: 그라디언트 페이드 처리) */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
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
            {/* 편집모드 오버플로우 그라디언트 */}
            {isEditMode && (
              <div style={{
                position: 'absolute', top: 0, right: 0, bottom: 0, width: 80,
                background: 'linear-gradient(to right, transparent, #ffffff)',
                pointerEvents: 'none',
              }} />
            )}
          </div>
        </div>
      </div>

      {/* 메모 영역 */}
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
    </div>
  );
}

// ─── 빈 상태 ──────────────────────────────────────────────────
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
}: {
  collectionName: string;
  collectionId: string;
  onBack?: () => void;
  onClose?: () => void;
  onDetailOpen?: (id: string) => void;
}) {
  const {
    recentlyViewed, favorites, collections,
    removeCollection, removeFavorite,
    addStoresToCollection, removeStoresFromCollection, updateCollectionMemo,
  } = useFavorites();

  const [showPopover, setShowPopover] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [memoTargetId, setMemoTargetId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ msg: string; undoFn?: () => void } | null>(null);
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

  // ── 편집모드 ──
  const enterEditMode = () => {
    setIsEditMode(true);
    setSelectedIds(new Set());
    setShowPopover(false);
  };

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

    // 스낵바 표시
    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    setSnackbar({
      msg: `${deletedIds.length}개의 매장을 삭제했어요`,
      undoFn: () => {
        addStoresToCollection(collectionId, deletedIds);
        setSnackbar(null);
      },
    });
    snackbarTimerRef.current = setTimeout(() => setSnackbar(null), 4000);
  };

  // ── 컬렉션 삭제 ──
  const handleDeleteCollection = () => {
    removeCollection(collectionId);
    onBack?.();
  };

  // ── 메모 저장 ──
  const handleApplyMemo = (memo: string) => {
    if (!memoTargetId || isRecent) return;
    updateCollectionMemo(collectionId, memoTargetId, memo);
    setMemoTargetId(null);

    // 토스트 표시
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast('메모를 저장했어요');
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  };

  const currentMemo = memoTargetId
    ? (collection?.memos?.[memoTargetId] ?? '')
    : '';

  // ── 네비게이션 뒤로 버튼 동작 ──
  const handleBack = () => {
    if (isEditMode) { exitEditMode(); return; }
    onBack?.();
  };

  // ── X 버튼 동작 ──
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
        {/* 뒤로가기 */}
        <button
          onClick={handleBack}
          style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#191f28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div style={{ flex: 1 }} />

        {/* ···|X 우측 버튼 */}
        <div style={{
          display: 'flex', alignItems: 'center',
          height: 34, borderRadius: 99,
          backgroundColor: 'rgba(0,23,51,0.02)', overflow: 'hidden',
        }}>
          {/* 최근 컬렉션 & 편집모드에는 ··· 버튼 없음 */}
          {!isRecent && !isEditMode && (
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
          <Popover
            onEdit={enterEditMode}
            onDelete={() => { setShowDeleteDialog(true); }}
            onAddStore={() => setShowPopover(false)}
            onSuggestInfo={() => setShowPopover(false)}
            onClose={() => setShowPopover(false)}
          />
        )}
      </div>

      {/* ── info_2 (46px) ── */}
      <div style={{
        height: 46, backgroundColor: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 14, color: '#000000' }}>
          {isEditMode ? '편집모드' : collectionName}
        </span>
      </div>

      {/* ── Body ── */}
      {stores.length === 0 && !isEditMode ? (
        <EmptyState onAddStore={() => onBack?.()} />
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
              onToggleSelect={toggleSelect}
              onMemoTap={(id) => setMemoTargetId(id)}
              onDetailOpen={onDetailOpen}
              onHeartTap={isRecent ? undefined : (id) => removeFavorite(id)}
            />
          ))}
        </div>
      )}

      {/* ── 편집모드 하단 CTA ── */}
      {isEditMode && (
        <div style={{ flexShrink: 0, position: 'relative' }}>
          {/* 상단 그라디언트 */}
          <div style={{
            height: 36,
            background: 'linear-gradient(to bottom, transparent, #ffffff)',
            pointerEvents: 'none',
          }} />
          {/* 버튼 영역 */}
          <div style={{
            height: 76, backgroundColor: '#ffffff',
            display: 'flex', alignItems: 'center',
            padding: '0 20px',
          }}>
            {selectedIds.size > 0 ? (
              // 선택됨: [삭제 | 완료]
              <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                <button
                  onClick={handleDeleteSelected}
                  style={{
                    flex: 1, height: 56, borderRadius: 16,
                    backgroundColor: 'rgba(49,130,246,0.16)',
                    border: 'none', cursor: 'pointer',
                    fontFamily: SFPro, fontWeight: 590, fontSize: 17,
                    color: '#2272eb',
                  }}
                >삭제</button>
                <button
                  onClick={exitEditMode}
                  style={{
                    flex: 1, height: 56, borderRadius: 16,
                    backgroundColor: '#3182f6',
                    border: 'none', cursor: 'pointer',
                    fontFamily: SFPro, fontWeight: 590, fontSize: 17,
                    color: '#ffffff',
                  }}
                >완료</button>
              </div>
            ) : (
              // 미선택: 회색 완료 (비활성)
              <button
                onClick={exitEditMode}
                style={{
                  width: '100%', height: 56, borderRadius: 16,
                  backgroundColor: '#f2f4f6',
                  border: 'none', cursor: 'pointer',
                  fontFamily: SFPro, fontWeight: 590, fontSize: 17,
                  color: 'rgba(0,19,43,0.58)',
                }}
              >완료</button>
            )}
          </div>
        </div>
      )}

      {/* ── 오버레이 레이어들 ── */}

      {/* 컬렉션 삭제 다이얼로그 */}
      {showDeleteDialog && (
        <DeleteDialog
          onConfirm={handleDeleteCollection}
          onCancel={() => setShowDeleteDialog(false)}
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

      {/* 토스트 (메모 저장 후) */}
      {toast && <ToastBar message={toast} />}

      {/* 스낵바 (매장 삭제 후) */}
      {snackbar && (
        <SnackBar
          message={snackbar.msg}
          onUndo={snackbar.undoFn}
        />
      )}
    </div>
  );
}
