import { useState, useCallback, useRef, useEffect } from 'react';
import Snackbar from '../components/Snackbar';
import ShareSheet from '../components/ShareSheet';
import { useFavorites, FavoritedStore } from '../context/FavoritesContext';
import { BottomSheet, BottomCTA, CTAButton, Button, ConfirmDialog } from '@toss/tds-mobile';
import IcDelete from '../assets/icons/icon_delete.svg?react';
import IcPencil from '../assets/icons/icon_pencil.svg?react';
import IcArrowUpDown from '../assets/icons/icon_arrowupdown.svg?react';
import { graniteEvent } from '@apps-in-toss/web-framework';

// ─── 타입 ────────────────────────────────────────────────────
interface Store {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  photos?: string[];
  distance?: number;
}

type BottomSheetType = null | 'create' | 'select-collection' | 'rename' | 'col-action';
type SnackbarType = null | 'deleted' | 'added' | 'renamed' | 'collection-deleted';

// ─── 컬렉션 카드 (Figma: 121×121px card, 6px gap, 23px label) ─
function CollectionCard({
  label,
  size = 121,
  isNew = false,
  isEditMode = false,
  isDragging = false,
  isDragOver = false,
  wiggleDelay = 0,
  onPress,
  onLongPress,
  onRename,
  onHandlePointerDown,
  previewPhotos = [],
}: {
  label: string;
  size?: number;
  isNew?: boolean;
  isEditMode?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  wiggleDelay?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  onRename?: () => void;
  onHandlePointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  previewPhotos?: string[];
}) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerDown = (_e: React.PointerEvent<HTMLButtonElement>) => {
    if (!onLongPress || isEditMode || isNew) return;
    longPressTimer.current = setTimeout(() => { onLongPress(); }, 500);
  };
  const cancelLongPress = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0,
      opacity: isDragging ? 0.4 : isEditMode ? 0.7 : 1,
      borderLeft: isDragOver ? '2px solid #252525' : '2px solid transparent',
      transition: 'opacity 0.15s',
    }}>
      <button
        onClick={onPress}
        onPointerDown={handlePointerDown}
        onPointerUp={cancelLongPress}
        onPointerLeave={cancelLongPress}
        onPointerCancel={cancelLongPress}
        style={{
          width: size,
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer', position: 'relative',
        }}
      >
        {/* 이미지 카드 size×size */}
        <div style={{
          width: size, height: size,
          border: isNew ? '1px dashed #c5c5c5' : 'none',
          borderRadius: 4, overflow: 'hidden',
          backgroundColor: '#F3F3F3', position: 'relative',
        }}>
          {isNew ? (
            /* 새 컬렉션 */
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{
                fontWeight: 590, fontSize: 12,
                color: 'rgba(3,24,50,0.46)', lineHeight: '22.5px',
              }}>새 컬렉션</span>
            </div>
          ) : (
            /* 2×2 이미지 그리드 (60×60, gap 1px) */
            <div style={{
              display: 'grid',
              gridTemplateColumns: `${Math.floor((size - 1) / 2)}px ${Math.floor((size - 1) / 2)}px`,
              gridTemplateRows: `${Math.floor((size - 1) / 2)}px ${Math.floor((size - 1) / 2)}px`,
              gap: 1,
              width: size, height: size,
            }}>
              {[0, 1, 2, 3].map((i) => {
                const photo = previewPhotos[i];
                return (
                  <div key={i} style={{
                    backgroundColor: '#E8EDF4',
                    overflow: 'hidden',
                  }}>
                    {photo ? (
                      <img src={photo} alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {/* 편집 모드: 드래그 소트 오버레이 (최근 제외) */}
          {isEditMode && !isNew && label !== '최근' && (
            <div
              onPointerDown={onHandlePointerDown}
              style={{
                position: 'absolute', inset: 0,
                backgroundColor: 'rgba(232,232,253,0.36)',
                borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'grab', touchAction: 'none',
              }}
            >
              {/* 아이콘 90도 회전 → ←→ 수평 방향 */}
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none"
                style={{ transform: 'rotate(90deg)' }}>
                <g fill="rgba(0,19,43,0.3)" fillRule="evenodd" clipRule="evenodd">
                  <path d="M10.293 7.707a1 1 0 0 1 0-1.414l3-3a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0"/>
                  <path d="M17.707 7.707a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 1.414-1.414l3 3a1 1 0 0 1 0 1.414"/>
                  <path d="M14 5a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1m-4.293 7.293a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414l3-3a1 1 0 0 1 1.414 0"/>
                  <path d="M2.293 12.293a1 1 0 0 1 1.414 0l3 3a1 1 0 1 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414"/>
                  <path d="M6 15a1 1 0 0 1-1-1V6a1 1 0 1 1 2 0v8a1 1 0 0 1-1 1"/>
                </g>
              </svg>
            </div>
          )}
        </div>
      </button>

      {/* 라벨 (새 컬렉션 제외) */}
      {!isNew && (
        isEditMode && label !== '최근' ? (
          /* 편집모드: 텍스트+연필 전체 터치 가능 */
          <button
            type="button"
            aria-label={`${label} 이름 변경`}
            onClick={onRename}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, width: size,
              background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left',
            }}
          >
            <span
              className="collection-name-wiggle"
              style={{
                fontWeight: 590, fontSize: 15,
                color: '#191f28', lineHeight: '22.5px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
                ['--wiggle-delay' as string]: wiggleDelay,
              }}
            >
              {label}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="rgba(0,19,43,0.45)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        ) : (
          /* 일반모드: 텍스트만 */
          <div style={{ display: 'flex', alignItems: 'center', width: size }}>
            <span style={{
              fontWeight: 590, fontSize: 15,
              color: '#191f28', lineHeight: '22.5px',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {label}
            </span>
          </div>
        )
      )}
    </div>
  );
}

// ─── 매장 카드 ────────────────────────────────────────────────
function StoreCard({
  store,
  isEditMode = false,
  isSelected = false,
  isDragging = false,
  isDragOver = false,
  onSelect,
  onPress,
  onHandlePointerDown,
  onRemoveFavorite,
}: {
  store: Store;
  isEditMode?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onSelect?: () => void;
  onPress?: () => void;
  onHandlePointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onRemoveFavorite?: () => void;
}) {
  const fmtDist = (m: number) => m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`;

  return (
    <div
      onClick={isEditMode ? onSelect : onPress}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderBottom: isDragOver ? 'none' : '1px solid #F2F4F6',
        outline: isDragOver ? '2px solid #252525' : 'none',
        cursor: 'pointer',
        opacity: isDragging ? 0.4 : (isEditMode && !isSelected ? 0.7 : 1),
        transition: 'opacity 0.15s',
        userSelect: 'none',
      }}
    >
      {/* 편집 모드 체크박스 */}
      {isEditMode && (
        <button
          type="button"
          aria-label={isSelected ? '선택 해제' : '선택'}
          aria-pressed={isSelected}
          onClick={(e) => { e.stopPropagation(); onSelect?.(); }}
          style={{
            width: 24, height: 24, flexShrink: 0,
            background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            {isSelected ? (
              <>
                <circle cx="12" cy="12" r="12" fill="#252525" />
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

      {/* 썸네일 80×80 */}
      <div style={{
        width: 80, height: 80, borderRadius: 10, flexShrink: 0,
        background: '#F2F4F6', overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {store.photos?.[0]
          ? <img src={store.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 28 }}>☕</span>
        }
      </div>

      {/* 카페 정보 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        {/* 이름 */}
        <p style={{
          fontWeight: 700, fontSize: 17,
          lineHeight: '22.95px', color: 'rgba(0,12,30,0.8)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{store.name}</p>

        {/* 주소 */}
        <p style={{
          fontWeight: 510, fontSize: 13,
          lineHeight: '17.55px', color: 'rgba(0,19,43,0.58)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{store.address}</p>

        {/* 거리 · 리뷰 */}
        <span style={{ fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)' }}>
          {store.distance !== undefined
            ? `${fmtDist(store.distance)} · 리뷰 ${store.reviewCount.toLocaleString()}`
            : `리뷰 ${store.reviewCount.toLocaleString()}`}
        </span>

        {/* 뱃지 */}
        {store.badge && (
          <span style={{
            display: 'inline-block', alignSelf: 'flex-start',
            fontWeight: 590, fontSize: 10, lineHeight: '15px',
            color: 'rgba(3,18,40,0.7)', backgroundColor: 'rgba(0,27,55,0.1)',
            borderRadius: 9, padding: '3px 7px',
          }}>{store.badge}</span>
        )}
      </div>

      {/* 정렬 핸들 (편집모드) / 하트 (기본모드) */}
      {onHandlePointerDown ? (
        <div
          onPointerDown={onHandlePointerDown}
          style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'grab', touchAction: 'none' }}
        >
          <IcArrowUpDown width={22} height={22} style={{ color: 'rgba(0,29,58,0.18)' }} />
        </div>
      ) : !isEditMode ? (
        <button
          type="button"
          aria-label="즐겨찾기 해제"
          onClick={(e) => { e.stopPropagation(); onRemoveFavorite?.(); }}
          style={{ width: 44, height: 44, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd"
              d="M10.9038 21.2884C11.5698 21.7284 12.4288 21.7284 13.0938 21.2884C15.2088 19.8924 19.8138 16.5554 21.7978 12.8214C24.4128 7.89542 21.3418 2.98242 17.2818 2.98242C14.9678 2.98242 13.5758 4.19142 12.8058 5.23042C12.4818 5.67542 11.8588 5.77442 11.4128 5.45042C11.3278 5.38942 11.2538 5.31442 11.1928 5.23042C10.4228 4.19142 9.03076 2.98242 6.71676 2.98242C2.65676 2.98242 -0.414244 7.89542 2.20176 12.8214C4.18376 16.5554 8.79076 19.8924 10.9038 21.2884Z"
              fill="#252525"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

// ─── 빈 상태 ─────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', paddingTop: 52, paddingBottom: 48,
    }}>
      <p style={{ fontWeight: 590, fontSize: 13, lineHeight: '22.5px', color: '#4e5968', margin: 0, textAlign: 'center' }}>
        아직 저장한 매장이 없어요
      </p>
      <p style={{ fontWeight: 590, fontSize: 13, lineHeight: '22.5px', color: '#4e5968', margin: 0, textAlign: 'center' }}>
        방문하고 싶은 매장을 편하게 관리하세요
      </p>
      <button
        onClick={onAdd}
        style={{
          marginTop: 52,
          height: 38,
          borderRadius: 10,
          backgroundColor: 'rgba(211,211,223,0.19)',
          border: 'none', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center',
          padding: '0 16px',
          gap: 6,
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 590, fontSize: 15, color: '#252525', whiteSpace: 'nowrap' }}>매장 추가하기</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path d="M12 5v14M5 12h14" stroke="#252525" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}


// ─── 메인 페이지 ──────────────────────────────────────────────
export default function CollectionPage({
  onDetailOpen,
  onCollectionOpen,
  onGoHome,
  onBack,
  onClose: _onClose,
  onPhotoMore: _onPhotoMore,
  deletedCollection,
  onClearDeletedCollection,
}: {
  onDetailOpen?: (id: string) => void;
  onCollectionOpen?: (id: string, name: string) => void;
  onGoHome?: () => void;
  onBack?: () => void;
  onClose?: () => void;
  onPhotoMore?: (storeId: string, photos: string[], cafeName: string) => void;
  deletedCollection?: { id: string; name: string; storeIds: string[] } | null;
  onClearDeletedCollection?: () => void;
}) {
  const {
    favorites, addFavorite: addFavoriteFromContext, removeFavorite: removeFavoriteFromContext,
    reorderFavorites,
    recentlyViewed, collections, addCollection, updateCollection, removeCollection, addStoresToCollection,
    reorderCollections,
  } = useFavorites();


  // 반응형 카드 크기 (375px 기준 121px)
  const [screenW, setScreenW] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setScreenW(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  const colCardSize = Math.round(screenW * 121 / 375);

  const [isEditMode, setIsEditMode] = useState(false);
  const [isOrganizeMode, setIsOrganizeMode] = useState(false); // 컬렉션 선택 모드
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set());

  // ── 드래그 순서 변경 ──
  const [orderedStores, setOrderedStores] = useState<FavoritedStore[]>([]);
  const [dragIndex, setDragIndex] = useState(-1);
  const [dragOverIndex, setDragOverIndex] = useState(-1);
  const storeListRef = useRef<HTMLDivElement>(null);
  const itemRefsArr = useRef<(HTMLDivElement | null)[]>([]);

  // favorites 변경 시 순서 동기화 (드래그 중 아닐 때)
  useEffect(() => {
    if (dragIndex === -1) setOrderedStores([...favorites]);
  }, [favorites, dragIndex]);

  // ── 컬렉션 수평 드래그 ──
  const [orderedCollections, setOrderedCollections] = useState<typeof collections>([]);
  const [colDragIndex, setColDragIndex] = useState(-1);
  const [colDragOverIndex, setColDragOverIndex] = useState(-1);
  const colRowRef = useRef<HTMLDivElement>(null);
  const colRefsArr = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (colDragIndex === -1) setOrderedCollections([...collections]);
  }, [collections, colDragIndex]);

  const onColHandlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setColDragIndex(index);
    setColDragOverIndex(index);
    colRowRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const onColRowPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (colDragIndex === -1) return;
    const x = e.clientX;
    let newOver = colRefsArr.current.length - 1;
    for (let i = 0; i < colRefsArr.current.length; i++) {
      const rect = colRefsArr.current[i]?.getBoundingClientRect();
      if (!rect) continue;
      if (x < rect.left + rect.width / 2) { newOver = i; break; }
    }
    if (newOver !== colDragOverIndex) setColDragOverIndex(newOver);
  }, [colDragIndex, colDragOverIndex]);

  const onColRowPointerUp = useCallback(() => {
    if (colDragIndex !== -1 && colDragOverIndex !== -1 && colDragIndex !== colDragOverIndex) {
      setOrderedCollections(prev => {
        const arr = [...prev];
        const [moved] = arr.splice(colDragIndex, 1);
        arr.splice(colDragOverIndex, 0, moved);
        reorderCollections(arr);
        return arr;
      });
    }
    setColDragIndex(-1);
    setColDragOverIndex(-1);
  }, [colDragIndex, colDragOverIndex, reorderCollections]);

  const [bottomSheet, setBottomSheet] = useState<BottomSheetType>(null);
  const [snackbar, setSnackbar] = useState<SnackbarType>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [colActionTargetId, setColActionTargetId] = useState<string | null>(null);
  const [showColDeleteConfirm, setShowColDeleteConfirm] = useState(false);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<Set<string>>(new Set());
  const [deletedStores, setDeletedStores] = useState<FavoritedStore[]>([]);
  const [addedToCollectionIds, setAddedToCollectionIds] = useState<string[]>([]);
  const [renameToast, setRenameToast] = useState<string | null>(null);
  const [deletedCollectionStore, setDeletedCollectionStore] = useState<{ name: string; storeIds: string[] } | null>(null);
  const [showRemoveStoreConfirm, setShowRemoveStoreConfirm] = useState(false);
  const [removeStoreTarget, setRemoveStoreTarget] = useState<FavoritedStore | null>(null);

  // ── 컬렉션 삭제 스낵바 (CollectionDetailPage에서 전달) ──
  useEffect(() => {
    if (!deletedCollection) return;
    setDeletedCollectionStore({ name: deletedCollection.name, storeIds: deletedCollection.storeIds });
    setSnackbar('collection-deleted');
    onClearDeletedCollection?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedCollection]);

  const isEmpty = orderedStores.length === 0;
  const hasSelection = selectedStoreIds.size > 0;
  const dismissSnackbar = useCallback(() => setSnackbar(null), []);

  // 이름 변경 토스트 자동 소멸
  useEffect(() => {
    if (!renameToast) return;
    const t = setTimeout(() => setRenameToast(null), 2500);
    return () => clearTimeout(t);
  }, [renameToast]);

  // ── 드래그 핸들러 ──
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
      setOrderedStores(prev => {
        const arr = [...prev];
        const [moved] = arr.splice(dragIndex, 1);
        arr.splice(dragOverIndex, 0, moved);
        reorderFavorites(arr);
        return arr;
      });
    }
    setDragIndex(-1);
    setDragOverIndex(-1);
  }, [dragIndex, dragOverIndex, reorderFavorites]);


  const exitOrganizeMode = () => {
    setIsOrganizeMode(false);
    setSelectedStoreIds(new Set());
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setSelectedStoreIds(new Set());
  };

  const toggleSelectStore = (id: string) => {
    setSelectedStoreIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const deleteSelected = () => {
    const toDelete = orderedStores.filter(s => selectedStoreIds.has(s.id));
    setDeletedStores(toDelete);
    toDelete.forEach(s => removeFavoriteFromContext(s.id));
    setSelectedStoreIds(new Set());
    setSnackbar('deleted');
  };

  const createCollection = () => {
    if (!newCollectionName.trim()) return;
    const newId = addCollection({ name: newCollectionName.trim() });
    setNewCollectionName('');

    if (isOrganizeMode) {
      // 오거나이즈 모드: 바로 담지 않고 select-collection 시트로 돌아가
      // 방금 만든 컬렉션을 선택 상태로 미리 표시
      setSelectedCollectionIds(new Set([newId]));
      setBottomSheet('select-collection');
    } else {
      setBottomSheet(null);
    }
  };

  const openRename = (colId: string) => {
    const col = collections.find(c => c.id === colId);
    if (!col) return;
    setRenameTargetId(colId);
    setRenameValue('');
    setBottomSheet('rename');
  };

  const applyRename = () => {
    if (!renameTargetId || !renameValue.trim()) return;
    const newName = renameValue.trim();
    updateCollection(renameTargetId, { name: newName });
    setBottomSheet(null);
    setRenameTargetId(null);
    setRenameToast(`'${newName}'으로 변경됐어요`);
  };

  // 현재 rename 대상 컬렉션 이름
  const renameTargetName = collections.find(c => c.id === renameTargetId)?.name ?? '';

  // SDK 네이티브 백 이벤트 등록 (Toss 앱 외부 환경에서는 무시)
  useEffect(() => {
    const handleBack = () => {
      if (isEditMode) { exitEditMode(); return; }
      if (isOrganizeMode) { exitOrganizeMode(); return; }
      if (onBack) { onBack(); return; }
      onGoHome?.();
    };
    try {
      const unsubscribe = graniteEvent.addEventListener('backEvent', {
        onEvent: handleBack,
        onError: (err) => console.error(err),
      });
      return unsubscribe;
    } catch {
      return undefined;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, isOrganizeMode]);


  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', backgroundColor: '#F3F3F3', position: 'relative',
    }}>
      {/* ── info_2 bar (Figma: 46px, Medium 510 14px centered) ── */}
      <div style={{
        height: 46, backgroundColor: '#F3F3F3',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, position: 'relative',
      }}>
        <span style={{
          fontWeight: 510, fontSize: 14,
          color: '#000000', lineHeight: '25.5px',
        }}>{isEditMode ? '편집모드' : isOrganizeMode ? '컬렉션 선택' : '모음집'}</span>
      </div>

      {/* ── 스크롤 본문 ── */}
      <div
        style={{ flex: 1, overflowY: 'auto' }}
      >

        {/* 컬렉션 카드 가로 스크롤 — 오거나이즈 모드에서 숨김 */}
        {!isOrganizeMode && <div
          ref={colRowRef}
          onPointerMove={isEditMode ? onColRowPointerMove : undefined}
          onPointerUp={isEditMode ? onColRowPointerUp : undefined}
          onPointerCancel={isEditMode ? onColRowPointerUp : undefined}
          style={{
            display: 'flex', gap: 10,
            overflowX: isEditMode ? 'hidden' : 'auto',
            padding: '12px 20px 16px',
            scrollbarWidth: 'none',
            touchAction: isEditMode ? 'none' : 'pan-x',
          }}>
          {orderedCollections.map((col, index) => (
            <div
              key={col.id}
              ref={el => { colRefsArr.current[index] = el; }}
            >
              <CollectionCard
                label={col.name}
                size={colCardSize}
                isEditMode={isEditMode}
                isDragging={isEditMode && colDragIndex === index}
                isDragOver={isEditMode && colDragOverIndex === index && colDragIndex !== index}
                wiggleDelay={index * 80}
                previewPhotos={
                  col.id === 'recent'
                    ? recentlyViewed.slice(0, 4).map(r => r.photo).filter(Boolean)
                    : col.storeIds.slice(0, 4)
                        .map(id => favorites.find(f => f.id === id)?.photos?.[0])
                        .filter((p): p is string => !!p)
                }
                onRename={() => openRename(col.id)}
                onLongPress={!isEditMode && col.id !== 'recent' ? () => { setColActionTargetId(col.id); setBottomSheet('col-action'); } : undefined}
                onPress={!isEditMode ? () => onCollectionOpen?.(col.id, col.name) : undefined}
                onHandlePointerDown={isEditMode && col.id !== 'recent'
                  ? (e) => onColHandlePointerDown(e, index)
                  : undefined}
              />
            </div>
          ))}
          <CollectionCard
            label="새 컬렉션" isNew size={colCardSize}
            onPress={() => setBottomSheet('create')}
          />
        </div>}

        {/* 저장한 매장 (Figma: Listheader 41px, Bold 700 17px) */}
        <div>
          <div style={{
            height: 41, display: 'flex', alignItems: 'flex-end',
            paddingLeft: 20, paddingRight: 20, paddingBottom: 4,
          }}>
            <h2 style={{
              fontWeight: 700, fontSize: 17,
              lineHeight: '21.25px', color: 'rgba(0,12,30,0.8)',
              margin: 0,
            }}>저장한 매장</h2>
          </div>
          <div style={{
            height: 32, display: 'flex', alignItems: 'center',
            paddingLeft: 20, paddingRight: 20,
          }}>
            <span style={{ fontWeight: 600, fontSize: 12, lineHeight: '16.2px' }}>
              <span style={{ color: '#6B7684' }}>총 </span>
              <span style={{ color: '#4E5968' }}>{orderedStores.length}</span>
              <span style={{ color: '#6B7684' }}>개</span>
            </span>
          </div>

          {isEmpty ? (
            <EmptyState onAdd={() => onGoHome?.()} />
          ) : (
            <div
              ref={storeListRef}
              onPointerMove={isEditMode ? onListPointerMove : undefined}
              onPointerUp={isEditMode ? onListPointerUp : undefined}
              onPointerCancel={isEditMode ? onListPointerUp : undefined}
            >
              {orderedStores.map((store, index) => (
                <div
                  key={store.id}
                  ref={el => { itemRefsArr.current[index] = el; }}
                >
                  <StoreCard
                    store={store}
                    isEditMode={isEditMode || isOrganizeMode}
                    isSelected={selectedStoreIds.has(store.id)}
                    isDragging={isEditMode && dragIndex === index}
                    isDragOver={isEditMode && dragOverIndex === index && dragIndex !== index}
                    onHandlePointerDown={isEditMode ? (e) => onHandlePointerDown(e, index) : undefined}
                    onSelect={() => { if (dragIndex === -1) toggleSelectStore(store.id); }}
                    onPress={() => onDetailOpen?.(store.id)}
                    onRemoveFavorite={() => {
                      setRemoveStoreTarget(store);
                      setShowRemoveStoreConfirm(true);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 여백 — 탭바/CTA 가림 방지 */}
        <div style={{ height: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }} />
      </div>

      {/* ── 편집 모드 Bottom CTA ── */}
      {isEditMode && (
        hasSelection ? (
          <BottomCTA.Double
            fixed
            leftButton={<CTAButton color="dark" variant="weak" onClick={deleteSelected}>삭제</CTAButton>}
            rightButton={<CTAButton onClick={exitEditMode}>완료</CTAButton>}
          />
        ) : (
          <BottomCTA.Single fixed>
            <CTAButton color="dark" variant="weak" onClick={exitEditMode}>완료</CTAButton>
          </BottomCTA.Single>
        )
      )}

      {/* ── 컬렉션 선택 모드 Bottom CTA (Figma: Organize_Default/Selected) ── */}
      {isOrganizeMode && (
        hasSelection ? (
          <BottomCTA.Double
            fixed
            leftButton={<CTAButton color="dark" variant="weak" onClick={exitOrganizeMode}>취소</CTAButton>}
            rightButton={<CTAButton onClick={() => setBottomSheet('select-collection')}>완료</CTAButton>}
          />
        ) : (
          <BottomCTA.Single fixed>
            <CTAButton disabled>완료</CTAButton>
          </BottomCTA.Single>
        )
      )}

      {/* ─────────── BottomSheet: 새 컬렉션 생성 ─────────── */}
      <BottomSheet
        open={bottomSheet === 'create'}
        header={<BottomSheet.Header>컬렉션명</BottomSheet.Header>}
        onClose={() => {
          setNewCollectionName('');
          setBottomSheet(isOrganizeMode ? 'select-collection' : null);
        }}
        hasTextField
      >
        <style>{`.bs-input::placeholder { color: #8b95a1; }`}</style>
        <div style={{ padding: '16px 24px 14px' }}>
          <div style={{ borderBottom: '1px solid #f2f4f6' }}>
            <input
              className="bs-input"
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              placeholder="노트북 열기 좋은 곳, 딥워크 존 등"
              maxLength={10}
              autoFocus
              style={{
                width: '100%', padding: '4px 0 8px',
                border: 'none', outline: 'none',
                fontWeight: 590, fontSize: 22,
                color: '#191F28', backgroundColor: 'transparent',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
        <Button color="primary" size="xlarge" style={{ width: '100%' }} onClick={createCollection} disabled={!newCollectionName.trim()}>적용하기</Button>
      </BottomSheet>

      {/* ─────────── BottomSheet: 컬렉션명 변경 ─────────── */}
      <BottomSheet
        open={bottomSheet === 'rename'}
        header={<BottomSheet.Header>{renameTargetName}</BottomSheet.Header>}
        onClose={() => { setBottomSheet(null); setRenameTargetId(null); setRenameValue(''); }}
        hasTextField
      >
        <div style={{ padding: '16px 24px 14px' }}>
          <div style={{ borderBottom: '1px solid #f2f4f6' }}>
            <input
              className="bs-input"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              placeholder="컬렉션명"
              maxLength={10}
              autoFocus
              style={{
                width: '100%', padding: '4px 0 8px',
                border: 'none', outline: 'none',
                fontWeight: 590, fontSize: 22,
                color: '#191F28', backgroundColor: 'transparent',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
        <Button color="primary" size="xlarge" style={{ width: '100%' }} onClick={applyRename} disabled={!renameValue.trim()}>적용하기</Button>
      </BottomSheet>

      {/* ─────────── BottomSheet: 컬렉션 선택 ─────────── */}
      <BottomSheet
        open={bottomSheet === 'select-collection'}
        header={<BottomSheet.Header>어디로 컬렉션을 추가할까요?</BottomSheet.Header>}
        headerDescription={selectedCollectionIds.size > 0
          ? <BottomSheet.HeaderDescription>{selectedCollectionIds.size}개의 컬렉션을 선택했어요</BottomSheet.HeaderDescription>
          : undefined}
        onClose={() => { setBottomSheet(null); setSelectedCollectionIds(new Set()); }}
      >

        {/* 새 컬렉션 추가 행 (62px) */}
        <button
          onClick={() => { setBottomSheet('create'); setSelectedCollectionIds(new Set()); }}
          style={{
            width: '100%', height: 62, padding: '0 24px',
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'none', border: 'none', cursor: 'pointer',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          {/* + 아이콘 서클 */}
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            backgroundColor: '#e5e8eb', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="#252525" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{
            fontWeight: 700, fontSize: 17,
            color: 'rgba(0,12,30,0.8)',
          }}>새 컬렉션 추가</span>
        </button>

        {/* 기존 컬렉션 목록 (최근 제외) */}
        {collections.filter(c => c.id !== 'recent').map(col => (
          <button
            key={col.id}
            onClick={() => setSelectedCollectionIds(prev => {
              const next = new Set(prev);
              next.has(col.id) ? next.delete(col.id) : next.add(col.id);
              return next;
            })}
            style={{
              width: '100%', minHeight: 62, padding: '0 24px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* 썸네일 */}
              <div style={{
                width: 30, height: 30, borderRadius: 4,
                backgroundColor: '#e8edf4', flexShrink: 0, overflow: 'hidden',
              }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr',
                  gridTemplateRows: '1fr 1fr', width: '100%', height: '100%', gap: 1,
                }}>
                  {[0,1,2,3].map(i => (
                    <div key={i} style={{ backgroundColor: '#c8d6e5' }} />
                  ))}
                </div>
              </div>
              <span style={{
                fontWeight: 700, fontSize: 17,
                color: 'rgba(0,12,30,0.8)',
              }}>{col.name}</span>
            </div>
            {/* 체크 서클 */}
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              border: `2px solid ${selectedCollectionIds.has(col.id) ? '#252525' : 'rgba(0,19,43,0.2)'}`,
              backgroundColor: selectedCollectionIds.has(col.id) ? '#252525' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {selectedCollectionIds.has(col.id) && (
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                  <path d="M1 4l3.5 3.5L11 1" stroke="#fff" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </button>
        ))}

        {/* 버튼 영역 (Figma: 20px 좌우 패딩, 8px gap, 각 h56 cornerRadius16) */}
        <BottomCTA.Double
          leftButton={<CTAButton color="dark" variant="weak" onClick={() => { setBottomSheet(null); setSelectedCollectionIds(new Set()); }}>닫기</CTAButton>}
          rightButton={<CTAButton
            disabled={selectedCollectionIds.size === 0}
            onClick={() => {
              if (selectedCollectionIds.size === 0) return;
              // 선택된 모든 컬렉션에 매장 추가
              const addedIds = [...selectedCollectionIds];
              addedIds.forEach(colId => {
                addStoresToCollection(colId, [...selectedStoreIds]);
              });
              setAddedToCollectionIds(addedIds);
              setBottomSheet(null);
              setSelectedCollectionIds(new Set());
              setSnackbar('added');
              if (isOrganizeMode) exitOrganizeMode();
              else exitEditMode();
            }}
          >확인</CTAButton>}
        />
      </BottomSheet>

      {/* ─────────── BottomSheet: 컬렉션 편집/삭제 ─────────── */}
      <BottomSheet
        open={bottomSheet === 'col-action'}
        header={<BottomSheet.Header>{collections.find(c => c.id === colActionTargetId)?.name}</BottomSheet.Header>}
        onClose={() => { setBottomSheet(null); setColActionTargetId(null); }}
      >
        {/* 편집 */}
        <button
          onClick={() => {
            setBottomSheet(null);
            if (colActionTargetId) openRename(colActionTargetId);
          }}
          style={{
            width: '100%', height: 56, display: 'flex', alignItems: 'center', gap: 12,
            paddingLeft: 20, background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 510, fontSize: 17, color: '#000C1E',
          }}
        >
          <IcPencil width={20} height={20} color="#333D4B" style={{ display: 'block', flexShrink: 0 }} />
          <span style={{ lineHeight: '20px' }}>편집</span>
        </button>
        {/* 삭제 */}
        <button
          onClick={() => {
            setBottomSheet(null);
            setTimeout(() => setShowColDeleteConfirm(true), 200);
          }}
          style={{
            width: '100%', height: 56, display: 'flex', alignItems: 'center', gap: 12,
            paddingLeft: 20, background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 510, fontSize: 17, color: '#000C1E',
          }}
        >
          <IcDelete width={20} height={20} color="#333D4B" style={{ display: 'block', flexShrink: 0 }} />
          <span style={{ lineHeight: '20px' }}>삭제</span>
        </button>
        <div style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }} />
      </BottomSheet>

      {/* ── 컬렉션 삭제 확인 다이얼로그 (롱프레스 → 삭제) ── */}
      {showColDeleteConfirm && (
        <ConfirmDialog
          open={true}
          title={<ConfirmDialog.Title>컬렉션을 삭제할까요?</ConfirmDialog.Title>}
          description={<ConfirmDialog.Description>만들어둔 컬렉션이 사라져요.{'\n'}담아둔 매장은 전체 모음집에서 계속 볼 수 있어요.</ConfirmDialog.Description>}
          cancelButton={<ConfirmDialog.CancelButton onClick={() => { setShowColDeleteConfirm(false); setColActionTargetId(null); }}>닫기</ConfirmDialog.CancelButton>}
          confirmButton={
            <ConfirmDialog.ConfirmButton
              color="danger"
              variant="weak"
              onClick={() => {
                if (!colActionTargetId) return;
                removeCollection(colActionTargetId);
                setShowColDeleteConfirm(false);
                setColActionTargetId(null);
                setSnackbar('collection-deleted');
              }}
            >삭제하기</ConfirmDialog.ConfirmButton>
          }
          onClose={() => { setShowColDeleteConfirm(false); setColActionTargetId(null); }}
        />
      )}

      {/* ── 매장 즐겨찾기 해제 확인 다이얼로그 ── */}
      {showRemoveStoreConfirm && (
        <ConfirmDialog
          open={true}
          title={<ConfirmDialog.Title>매장을 삭제할까요?</ConfirmDialog.Title>}
          description={<ConfirmDialog.Description>모음집에서 매장이 사라져요.{'\n'}담아둔 컬렉션에서도 함께 지워져요.</ConfirmDialog.Description>}
          cancelButton={
            <ConfirmDialog.CancelButton onClick={() => { setShowRemoveStoreConfirm(false); setRemoveStoreTarget(null); }}>
              닫기
            </ConfirmDialog.CancelButton>
          }
          confirmButton={
            <ConfirmDialog.ConfirmButton
              color="danger"
              variant="weak"
              onClick={() => {
                if (!removeStoreTarget) return;
                setDeletedStores([removeStoreTarget]);
                removeFavoriteFromContext(removeStoreTarget.id);
                setSnackbar('deleted');
                setShowRemoveStoreConfirm(false);
                setRemoveStoreTarget(null);
              }}
            >
              삭제하기
            </ConfirmDialog.ConfirmButton>
          }
          onClose={() => { setShowRemoveStoreConfirm(false); setRemoveStoreTarget(null); }}
        />
      )}

      {/* ── 스낵바 ── */}
      {snackbar === 'deleted' && (
        <Snackbar type="negative" message="매장을 삭제했어요" actionLabel="되돌리기"
          onAction={() => {
            deletedStores.forEach(s => addFavoriteFromContext(s));
            setDeletedStores([]);
            setSnackbar(null);
          }}
          onDismiss={dismissSnackbar} />
      )}
      {snackbar === 'added' && (
        <Snackbar type="positive" message="컬렉션에 담았어요" actionLabel="보러가기"
          onAction={() => {
            const firstId = addedToCollectionIds[0];
            const col = collections.find(c => c.id === firstId);
            if (col) onCollectionOpen?.(col.id, col.name);
            setSnackbar(null);
          }}
          onDismiss={dismissSnackbar} />
      )}
      {snackbar === 'collection-deleted' && (
        <Snackbar type="negative" message="컬렉션을 삭제했어요" actionLabel="되돌리기"
          onAction={() => {
            if (deletedCollectionStore) {
              const newId = addCollection({ name: deletedCollectionStore.name });
              if (deletedCollectionStore.storeIds.length > 0) {
                addStoresToCollection(newId, deletedCollectionStore.storeIds);
              }
              setDeletedCollectionStore(null);
            }
            setSnackbar(null);
          }}
          onDismiss={dismissSnackbar} />
      )}

      {/* ── 이름 변경 토스트 (Collection/Main_Toast_Rename) ── */}
      {renameToast && (
        <div style={{
          position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#ffffff', borderRadius: 9999,
          padding: '10px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
          zIndex: 200, whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          <span style={{
            fontWeight: 590, fontSize: 15,
            color: 'rgba(0,12,30,0.8)', lineHeight: '22.5px',
          }}>{renameToast}</span>
        </div>
      )}

      {/* 공유 바텀시트 */}
      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        shareTitle="카페인덱스 모음집"
      />
    </div>
  );
}
