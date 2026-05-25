import { useState, useRef, useEffect, useCallback } from 'react';
import { useFavorites, RecentCafe, haversineDistance, isRecentCollection } from '../context/FavoritesContext';
import Snackbar from '../components/Snackbar';
import ShareSheet from '../components/ShareSheet';
import StoreCard, { type StoreItem } from '../components/StoreCard/Collection';
import MemoSheet from '../components/MemoSheet';
import AddStoreSheet from '../components/AddStoreSheet';
import CollectionNameSheet from '../components/CollectionNameSheet';
import EmptyState from '../components/EmptyState';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import CollectionActionSheet from '../components/CollectionActionSheet';
import PageHeader from '../components/PageHeader';
import StoreCountBar from '../components/StoreCountBar';
import { Toast } from '@toss/tds-mobile';
import FocusBottomCTA from '../components/FocusBottomCTA';
import { useBackEvent } from '../hooks/useBackEvent';
import IcPencil from '../assets/icons/icon_pencil.svg?react';
import { type StoreRow } from '../services/db';


// ─── 팝오버 메뉴 ──────────────────────────────────────────────

// ─── 빈 상태 아이콘 (EmptyState buttonIcon 전용) ──────────────
const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M12 5v14M5 12h14" stroke="#252525" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M5 12h14M13 6l6 6-6 6" stroke="#252525" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── 메인 페이지 ──────────────────────────────────────────────
export default function CollectionDetailPage({
  collectionName,
  collectionId,
  onBack,
  onClose: _onClose,
  onDetailOpen,
  onPhotoMore,
  onCollectionDeleted,
  onGoHome,
  onEditModeChange,
}: {
  collectionName: string;
  collectionId: string;
  onBack?: () => void;
  onClose?: () => void;
  onDetailOpen?: (id: string) => void;
  onPhotoMore?: (storeId: string, photos: string[], cafeName: string) => void;
  onCollectionDeleted?: (data: { id: string; name: string; storeIds: string[] }) => void;
  onGoHome?: () => void;
  onEditModeChange?: (active: boolean) => void;
}) {
  const {
    recentlyViewed, allStores, userLocation, favorites, collections,
    removeCollection, removeFavorite, addFavorite, isFavorited,
    addStoresToCollection, removeStoresFromCollection, updateCollectionMemo, updateCollection,
    reorderCollections,
  } = useFavorites();

  // allStores는 FavoritesContext에서 앱 시작 시 로드된 데이터 사용
  const storeRows: StoreRow[] = allStores;


  const [showShareSheet, setShowShareSheet] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [showDeleteCollectionDialog, setShowDeleteCollectionDialog] = useState(false);
  const [showDeleteStoreId, setShowDeleteStoreId] = useState<string | null>(null);
  const [showAddStoreSheet, setShowAddStoreSheet] = useState(false);

  const [memoTargetId, setMemoTargetId] = useState<string | null>(null);

  // 편집모드·매장추가시트·메모시트 진입/종료 시 부모에 알림 (탭바 숨김/표시)
  useEffect(() => {
    onEditModeChange?.(isEditMode || showAddStoreSheet || memoTargetId !== null);
  }, [isEditMode, showAddStoreSheet, memoTargetId]);
  const [snackbar, setSnackbar] = useState<{ msg: string; actionLabel?: string; undoFn?: () => void; type?: 'positive' | 'negative' } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const snackbarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 드래그 순서변경 ──
  const [orderedStoreIds, setOrderedStoreIds] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState(-1);
  const [dragOverIndex, setDragOverIndex] = useState(-1);
  const storeListRef = useRef<HTMLDivElement>(null);
  const itemRefsArr = useRef<(HTMLDivElement | null)[]>([]);

  // '최근' 컬렉션이 DB UUID로 들어와도 칩 id ('recent') 와 일치하도록 정규화
  const [activeTab, setActiveTab] = useState<string>(() => {
    const incoming = collections.find(c => c.id === collectionId);
    if (incoming && isRecentCollection(incoming)) return 'recent';
    return collectionId;
  });
  const [tabManageTargetId, setTabManageTargetId] = useState<string | null>(null);
  const [deleteTabTargetId, setDeleteTabTargetId] = useState<string | null>(null);
  const [renameTabId, setRenameTabId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 칩 드래그 상태 ──
  const [chipDragId, setChipDragId] = useState<string | null>(null);
  const [chipDragOrderState, setChipDragOrderState] = useState<string[]>([]);
  const chipDragOrderRef = useRef<string[]>([]);
  const chipLongPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chipDragPointerIdRef = useRef<number>(-1);
  const chipContainerRef = useRef<HTMLDivElement>(null);

  // activeTab은 'recent'(하드코딩 ID) 또는 DB UUID 둘 다 올 수 있음.
  // DB UUID로 들어와도 '최근' 컬렉션이면 recentlyViewed 화면을 보여주도록 매칭.
  const activeCollection = collections.find(c => c.id === activeTab);
  const isActiveRecent = activeTab === 'recent' || (activeCollection ? isRecentCollection(activeCollection) : false);
  // '최근' 탭은 한 번만 — DB 동기화로 UUID가 들어와도 isRecentCollection 으로 제외하여 중복 방지
  const allTabs = [
    { id: 'recent', name: '최근' },
    ...collections
      .filter(c => !isRecentCollection(c))
      .map(c => ({ id: c.id, name: c.name })),
  ];

  // 드래그 중이 아닐 때 collection storeIds와 동기화
  useEffect(() => {
    if (!isActiveRecent && dragIndex === -1) {
      setOrderedStoreIds(activeCollection?.storeIds ?? []);
    }
  }, [activeCollection?.storeIds, dragIndex, isActiveRecent]);

  const stores: StoreItem[] = isActiveRecent
    ? recentlyViewed.map((r: RecentCafe): StoreItem => ({
        id: r.id,
        name: r.name,
        address: r.address ?? '',
        rating: 0,
        reviewCount: 0,
        photos: r.photos && r.photos.length > 0
          ? r.photos
          : r.photo ? [r.photo] : [],
        memo: '',
      }))
    : orderedStoreIds
        .map((id): StoreItem | null => {
          // collection_stores.store_id = stores.api_place_id → stores 테이블에서 조회
          // collection_stores.store_id가 UUID인지 api_place_id인지 모두 커버
          const row = storeRows.find(r => r.id === id || r.api_place_id === id);
          if (!row) return null;
          return {
            id: row.api_place_id,
            name: row.name,
            address: row.address_road,
            rating: 0,
            reviewCount: 0,
            distance: userLocation
              ? haversineDistance(userLocation.lat, userLocation.lng, row.latitude, row.longitude)
              : undefined,
            photos: [row.thumbnail_url, ...(row.photo_urls ?? [])].filter(Boolean) as string[],
            memo: activeCollection?.memos?.[id] ?? '',
          };
        })
        .filter((s): s is StoreItem => s !== null);


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
        updateCollection(activeTab, { storeIds: arr });
        return arr;
      });
    }
    setDragIndex(-1);
    setDragOverIndex(-1);
  }, [dragIndex, dragOverIndex, updateCollection, activeTab]);


  // ── 편집모드 ──
  function enterEditMode(targetTabId?: string) {
    const userCollections = collections.filter(c => !isRecentCollection(c));

    // 사용자 생성 컬렉션이 없으면 토스트 표시 후 편집 비활성화
    if (userCollections.length === 0) {
      showToast('기본 폴더는 수정하거나 삭제할 수 없어요');
      return;
    }

    // 최근 탭에서 편집 진입 시 첫 번째 사용자 컬렉션으로 자동 이동
    const resolvedTab = targetTabId ?? activeTab;
    if (resolvedTab === 'recent') {
      setActiveTab(userCollections[0].id);
    }

    setIsEditMode(true);
    setSelectedIds(new Set());
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
    removeStoresFromCollection(activeTab, deletedIds);
    exitEditMode();

    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    setSnackbar({
      msg: `${deletedIds.length}개의 매장을 삭제했어요`,
      actionLabel: '되돌리기',
      type: 'negative',
      undoFn: () => {
        addStoresToCollection(activeTab, deletedIds);
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
    if (isActiveRecent) {
      if (isFavorited(storeId)) {
        // 최근 탭: 다이얼로그 없이 바로 삭제 + 스낵바
        const favStore = favorites.find(f => f.id === storeId);
        removeFavorite(storeId);
        if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
        setSnackbar({
          msg: '카페를 모음집에서 꺼냈어요',
          actionLabel: '되돌리기',
          type: 'negative',
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
          showSnackbar('카페를 모음집에 담았어요', '보러가기', onBack);
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
      msg: '카페를 모음집에서 꺼냈어요',
      actionLabel: '되돌리기',
      type: 'negative',
      undoFn: () => {
        if (favStore) addFavorite(favStore);
        setSnackbar(null);
      },
    });
    snackbarTimerRef.current = setTimeout(() => setSnackbar(null), 3000);
  };

  // ── 매장 추가 확인 ──
  const handleAddStoreConfirm = (selectedStoreIds: string[]) => {
    addStoresToCollection(activeTab, selectedStoreIds);
    setShowAddStoreSheet(false);
    showToast('카페를 컬렉션에 담았어요');
  };

  // ── 메모 저장 ──
  const handleApplyMemo = (memo: string) => {
    if (!memoTargetId || isActiveRecent) return;
    updateCollectionMemo(activeTab, memoTargetId, memo);
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

  // ── 칩 이름 변경 시트 열기 ──
  const openRenameTab = (tabId: string) => {
    const col = collections.find(c => c.id === tabId);
    setRenameValue(col?.name ?? '');
    setRenameTabId(tabId);
  };

  // ── 칩 포인터 이벤트 (일반 모드: 탭 관리 시트 / 편집 모드: 드래그) ──
  const handleChipPointerDown = (tabId: string, e: React.PointerEvent) => {
    if (isEditMode) {
      chipDragPointerIdRef.current = e.pointerId;
      chipLongPressTimerRef.current = setTimeout(() => {
        chipLongPressTimerRef.current = null;
        if (tabId === 'recent') {
          showToast('기본 폴더는 수정하거나 삭제할 수 없어요');
          return;
        }
        if (navigator.vibrate) navigator.vibrate(50);
        const initialOrder = allTabs.map(t => t.id);
        chipDragOrderRef.current = initialOrder;
        setChipDragOrderState(initialOrder);
        setChipDragId(tabId);
      }, 500);
    } else {
      longPressTimerRef.current = setTimeout(() => {
        longPressTimerRef.current = null;
        if (navigator.vibrate) navigator.vibrate(50);
        if (tabId === 'recent') {
          showToast('기본 폴더는 수정하거나 삭제할 수 없어요');
        } else {
          setTabManageTargetId(tabId);
        }
      }, 500);
    }
  };

  const handleChipPointerUp = () => {
    if (chipLongPressTimerRef.current) {
      clearTimeout(chipLongPressTimerRef.current);
      chipLongPressTimerRef.current = null;
    }
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // ── 칩 드래그 전역 이벤트 ──
  useEffect(() => {
    if (!chipDragId) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== chipDragPointerIdRef.current) return;
      const container = chipContainerRef.current;
      if (!container) return;

      const chipEls = Array.from(container.querySelectorAll('[data-chip-id]')) as HTMLElement[];
      const pointerX = e.clientX;

      // 드래그 중인 칩과 최근 탭 제외한 나머지 칩의 중심 위치 수집
      const positions: { id: string; center: number }[] = [];
      for (const el of chipEls) {
        const id = el.getAttribute('data-chip-id');
        if (id && id !== 'recent' && id !== chipDragId) {
          const rect = el.getBoundingClientRect();
          positions.push({ id, center: rect.left + rect.width / 2 });
        }
      }

      // 포인터 위치 기반으로 삽입 위치 결정
      let insertAfterIndex = -1;
      for (let i = 0; i < positions.length; i++) {
        if (pointerX > positions[i].center) insertAfterIndex = i;
        else break;
      }

      const others = positions.map(p => p.id);
      others.splice(insertAfterIndex + 1, 0, chipDragId);
      const newOrder = ['recent', ...others];

      chipDragOrderRef.current = newOrder;
      setChipDragOrderState(newOrder);
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== chipDragPointerIdRef.current) return;

      const finalOrder = chipDragOrderRef.current.filter(id => id !== 'recent');
      const newCollectionOrder = finalOrder
        .map(id => collections.find(c => c.id === id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c));
      if (newCollectionOrder.length === collections.filter(c => !isRecentCollection(c)).length) {
        reorderCollections(newCollectionOrder);
      }
      setChipDragId(null);
      setChipDragOrderState([]);
      chipDragOrderRef.current = [];
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
  }, [chipDragId, collections, reorderCollections]);

  // ── 탭(컬렉션) 삭제 ──
  const handleTabDelete = (tabId: string) => {
    const col = collections.find(c => c.id === tabId);
    if (!col) return;
    const snapshotName = col.name;
    const snapshotStoreIds = [...col.storeIds];

    removeCollection(tabId);
    setTabManageTargetId(null);
    // 삭제된 탭이 현재 활성 탭이면 '최근'으로 이동
    if (activeTab === tabId) {
      setActiveTab('recent');
    }
    if (tabId === collectionId && onCollectionDeleted) {
      // 진입한 컬렉션이 삭제됨 → 부모로 알려서 페이지 닫기 + 상위 스낵바 표시
      onCollectionDeleted({ id: tabId, name: snapshotName, storeIds: snapshotStoreIds });
      return;
    }

    // 진입 컬렉션이 아닌 다른 탭 삭제 → 로컬 스낵바 표시
    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    setSnackbar({
      msg: `'${snapshotName}' 컬렉션을 삭제했어요`,
      type: 'negative',
    });
    snackbarTimerRef.current = setTimeout(() => setSnackbar(null), 3000);
  };

  // ── 탭(컬렉션) 이름 변경 ──
  const handleTabRenameConfirm = () => {
    if (!renameTabId || !renameValue.trim()) return;
    updateCollection(renameTabId, { name: renameValue.trim() });
    setRenameTabId(null);
    setRenameValue('');
    showToast('컬렉션 이름을 바꿨어요');
  };

  const currentMemo = memoTargetId ? (activeCollection?.memos?.[memoTargetId] ?? '') : '';

  const handleBack = useCallback(() => {
    if (isEditMode) { exitEditMode(); return; }
    onBack?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);


  // SDK 백 이벤트 — handleBack 에서 편집모드/일반모드 분기 처리
  useBackEvent(handleBack);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#F3F3F3', position: 'relative' }}>
      <PageHeader
        title={isEditMode ? '편집모드' : '컬렉션'}
        rightButton={!isEditMode ? (
          <button
            onClick={() => enterEditMode()}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: 510, fontSize: 13,
              color: 'rgba(0,19,43,0.55)',
              padding: '4px 0',
            }}
          >
            편집
          </button>
        ) : undefined}
      />

      {/* ── 탭 칩 (가로 스크롤) ── */}
      <style>{`
        @keyframes chip-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25%       { transform: rotate(-2deg); }
          75%       { transform: rotate(2deg); }
        }
      `}</style>
      <div
        ref={chipContainerRef}
        style={{
          display: 'flex', gap: 8, padding: '10px 16px',
          overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0,
        }}
      >
        {(isEditMode && chipDragOrderState.length > 0
          ? chipDragOrderState.map(id => allTabs.find(t => t.id === id)!).filter(Boolean)
          : allTabs
        ).map((tab) => {
          const isCustom = tab.id !== 'recent';
          const showPencil = isEditMode && isCustom;
          const isDragging = chipDragId === tab.id;
          const wiggle = isEditMode && isCustom && !isDragging;
          return (
            <div
              key={tab.id}
              data-chip-id={tab.id}
              onPointerDown={(e) => handleChipPointerDown(tab.id, e)}
              onPointerUp={handleChipPointerUp}
              onPointerCancel={handleChipPointerUp}
              onClick={() => {
                if (isEditMode && tab.id === 'recent') {
                  showToast('기본 폴더는 수정하거나 삭제할 수 없어요');
                  return;
                }
                setActiveTab(tab.id);
              }}
              style={{
                height: 32,
                padding: showPencil ? '0 2px 0 10px' : '0 10px',
                borderRadius: 8,
                backgroundColor: activeTab === tab.id ? '#252525' : 'rgba(46,46,46,0.08)',
                color: activeTab === tab.id ? '#ffffff' : 'rgba(0,0,0,0.7)',
                fontWeight: 590,
                fontSize: 13,
                lineHeight: '16px',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 4,
                cursor: 'pointer',
                userSelect: 'none',
                touchAction: 'none',
                position: 'relative',
                zIndex: isDragging ? 10 : 1,
                animation: wiggle ? 'chip-wiggle 0.45s ease-in-out infinite' : 'none',
                transformOrigin: 'center bottom',
                transform: isDragging ? 'scale(1.02) translateY(-2px)' : 'none',
                boxShadow: isDragging ? '0 4px 10px rgba(0,0,0,0.12)' : 'none',
                transition: isDragging ? 'none' : 'transform 0.15s, box-shadow 0.15s',
              }}
            >
              <span style={{ pointerEvents: 'none' }}>{tab.name}</span>
              {showPencil && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); openRenameTab(tab.id); }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '8px 7px',
                    margin: '-8px -2px -8px 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IcPencil
                    width={12} height={12}
                    color={activeTab === tab.id ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'}
                    style={{ flexShrink: 0 }}
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <StoreCountBar count={stores.length} />

      {/* ── 편집 모드 — 매장 추가하기 행 ── */}
      {isEditMode && !isActiveRecent && (
        <button
          onClick={() => setShowAddStoreSheet(true)}
          style={{
            height: 64, width: '100%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 17, color: 'rgba(0,12,30,0.8)' }}>매장 추가하기</span>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            backgroundColor: '#E5E5E5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </button>
      )}

      {/* ── Body ── */}
      {stores.length === 0 && !isEditMode ? (
        isActiveRecent ? (
          <EmptyState
            title="아직 최근에 본 매장이 없어요"
            subtitle="홈에서 카페를 탐색하면 여기에 기록돼요"
            buttonLabel="매장 보러가기"
            buttonIcon={<IconArrow />}
            onButtonClick={onGoHome}
          />
        ) : (
          <EmptyState
            title="아직 컬렉션에 담은 매장이 없어요"
            subtitle="저장해 둔 매장을 목적에 맞게 쏙쏙 골라 담아보세요"
            buttonLabel="매장 추가하기"
            buttonIcon={<IconPlus />}
            onButtonClick={() => setShowAddStoreSheet(true)}
          />
        )
      ) : (
        <div
          ref={storeListRef}
          style={{ flex: 1, overflowY: 'auto' }}
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
                heartFilled={isFavorited(store.id)}
                showHeart={isActiveRecent}
                showMemo={!isActiveRecent}
                isDragging={isEditMode && dragIndex === index}
                isDragOver={isEditMode && dragOverIndex === index && dragIndex !== index}
                onSelect={toggleSelect}
                onMemoTap={(id) => setMemoTargetId(id)}
                onPress={onDetailOpen}
                onHeartTap={handleHeartTap}
                onPhotoMore={() => onPhotoMore?.(store.id, store.photos, store.name)}
                onHandleDrag={isEditMode && !isActiveRecent ? (e) => onHandlePointerDown(e, index) : undefined}
              />
            </div>
          ))}
          {/* 하단 여백 — 탭바/CTA 가림 방지 (편집모드: 탭바 숨김 → CTA만 88px, 일반: 탭바 76px) */}
          <div style={{ height: `calc(env(safe-area-inset-bottom, 0px) + ${isEditMode ? 88 : 76}px)` }} />
        </div>
      )}

      {/* ── 편집모드 하단 CTA (FocusBottomCTA 통일) ── */}
      {isEditMode && (
        selectedIds.size > 0 ? (
          <FocusBottomCTA.Double
            leftLabel="삭제"
            leftOnClick={handleDeleteSelected}
            rightLabel="완료"
            rightOnClick={exitEditMode}
          />
        ) : (
          <FocusBottomCTA.Single label="완료" onClick={exitEditMode} />
        )
      )}

      {/* ── 오버레이 레이어들 ── */}

      {/* 컬렉션 삭제 다이얼로그 */}
      {showDeleteCollectionDialog && (
        <DeleteConfirmDialog
          type="collection"
          onConfirm={handleDeleteCollection}
          onCancel={() => setShowDeleteCollectionDialog(false)}
        />
      )}

      {/* 매장 삭제 다이얼로그 */}
      {showDeleteStoreId && (
        <DeleteConfirmDialog
          type="store"
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
          availableStores={favorites
            .filter(f => !activeCollection?.storeIds.includes(f.id))
            .map(f => {
              const row = storeRows.find(r => r.api_place_id === f.id);
              return {
                ...f,
                photos: row
                  ? [row.thumbnail_url, ...(row.photo_urls ?? [])].filter(Boolean) as string[]
                  : f.photos ?? [],
              };
            })}
          onConfirm={handleAddStoreConfirm}
          onClose={() => setShowAddStoreSheet(false)}
          onGoHome={() => { setShowAddStoreSheet(false); onGoHome?.(); }}
        />
      )}

      {/* 탭 관리 바텀시트 (롱프레스) */}
      <CollectionActionSheet
        open={!!tabManageTargetId}
        collectionName={collections.find(c => c.id === tabManageTargetId)?.name ?? ''}
        onEdit={() => {
          const targetId = tabManageTargetId!;
          setTabManageTargetId(null);
          setActiveTab(targetId);
          enterEditMode(targetId);
        }}
        onDelete={() => {
          const id = tabManageTargetId;
          setTabManageTargetId(null);
          setTimeout(() => setDeleteTabTargetId(id), 200);
        }}
        onClose={() => setTabManageTargetId(null)}
      />

      {/* 탭 삭제 확인 다이얼로그 */}
      {deleteTabTargetId && (
        <DeleteConfirmDialog
          type="collection"
          onConfirm={() => { handleTabDelete(deleteTabTargetId); setDeleteTabTargetId(null); }}
          onCancel={() => setDeleteTabTargetId(null)}
        />
      )}

      {/* 컬렉션명 변경 바텀시트 */}
      <CollectionNameSheet
        open={!!renameTabId}
        title="컬렉션명 변경"
        value={renameValue}
        onChange={setRenameValue}
        onConfirm={handleTabRenameConfirm}
        onClose={() => { setRenameTabId(null); setRenameValue(''); }}
        confirmLabel="변경하기"
      />

      {/* 토스트 (메모/추가 후) — TDS Toast */}
      <Toast
        open={!!toast}
        position="top"
        text={toast ?? ''}
        duration={2500}
        onClose={() => setToast(null)}
      />

      {/* 스낵바 */}
      {snackbar && (
        <Snackbar
          message={snackbar.msg}
          actionLabel={snackbar.actionLabel}
          onAction={snackbar.undoFn}
          onDismiss={() => setSnackbar(null)}
          type={snackbar.type ?? 'positive'}
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
