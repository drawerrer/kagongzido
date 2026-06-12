import { useState, useCallback, useRef, useEffect } from 'react';
import Snackbar from '../components/Snackbar';
import ShareSheet from '../components/ShareSheet';
import StoreCard from '../components/StoreCard/Collection';
import CollectionCard from '../components/CollectionCard';
import EmptyState from '../components/EmptyState';
import CollectionNameSheet from '../components/CollectionNameSheet';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import CollectionActionSheet from '../components/CollectionActionSheet';
import StoreCountBar from '../components/StoreCountBar';
import SectionHeader from '../components/SectionHeader';
import { useFavorites, FavoritedStore, haversineDistance, isRecentCollection } from '../context/FavoritesContext';
import { trackCollectionCreate } from '../services/analytics';
import { BottomSheet, BottomCTA, CTAButton, Toast } from '@toss/tds-mobile';
import FocusBottomCTA from '../components/FocusBottomCTA';
import { useBackEvent } from '../hooks/useBackEvent';

type BottomSheetType = null | 'create' | 'select-collection' | 'rename' | 'col-action';
type SnackbarType = null | 'deleted' | 'added' | 'renamed' | 'collection-deleted';

// ─── 메인 페이지 ──────────────────────────────────────────────
export default function CollectionPage({
  onDetailOpen,
  onCollectionOpen,
  onGoHome,
  onBack,
  onClose: _onClose,
  onPhotoMore,
  deletedCollection,
  onClearDeletedCollection,
  onEditModeChange,
  hasOverlay = false,
}: {
  onDetailOpen?: (id: string) => void;
  onCollectionOpen?: (id: string, name: string) => void;
  onGoHome?: () => void;
  onBack?: () => void;
  onClose?: () => void;
  onPhotoMore?: (storeId: string, photos: string[], cafeName: string) => void;
  deletedCollection?: { id: string; name: string; storeIds: string[] } | null;
  onClearDeletedCollection?: () => void;
  onEditModeChange?: (active: boolean) => void;
  /** CollectionDetailPage 등 오버레이가 열려 있을 때 true — backEvent 리스너 등록 억제 */
  hasOverlay?: boolean;
}) {
  const {
    favorites, addFavorite: addFavoriteFromContext, removeFavorite: removeFavoriteFromContext,
    reorderFavorites,
    recentlyViewed, collections, addCollection, updateCollection, removeCollection, addStoresToCollection,
    reorderCollections,
    allStores, userLocation,
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

  // 편집모드·오거나이즈모드·바텀시트 진입/종료 시 부모에 알림 (탭바 숨김/표시)
  // ※ bottomSheet 선언 이후에 위치해야 TDZ 에러 없음
  useEffect(() => {
    onEditModeChange?.(isEditMode || isOrganizeMode || bottomSheet !== null);
  }, [isEditMode, isOrganizeMode, bottomSheet]);
  const [snackbar, setSnackbar] = useState<SnackbarType>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [colActionTargetId, setColActionTargetId] = useState<string | null>(null);
  const [showColDeleteConfirm, setShowColDeleteConfirm] = useState(false);
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<Set<string>>(new Set());
  const [deletedStores, setDeletedStores] = useState<FavoritedStore[]>([]);
  const [, setAddedToCollectionIds] = useState<string[]>([]);
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
    trackCollectionCreate();
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

  // SDK 백 이벤트 — CollectionDetailPage 등 오버레이가 열려 있으면 등록 안 함
  // (두 리스너 동시 등록 시 SDK 가 순서대로 처리해 뒤로가기 두 번 눌러야 닫히는 버그 방지)
  const handleBack = useCallback(() => {
    // 모드별 단계적 백 처리
    if (isEditMode) { exitEditMode(); return; }
    if (isOrganizeMode) { exitOrganizeMode(); return; }
    // 일반 모드 — 홈으로 이동 (다른 탭 페이지와 동일 패턴)
    onBack?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, isOrganizeMode, onBack]);
  useBackEvent(handleBack, !hasOverlay);


  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', backgroundColor: '#F3F3F3', position: 'relative',
    }}>
      {/* 자체 PageHeader 제거 — 토스 공통 내비게이션 ('카공지도') 사용 */}

      {/* ── 스크롤 본문 ── 상단 패딩 20px 통일 (이전 가이드북 페이지와 동일) */}
      <div
        style={{ flex: 1, overflowY: 'auto', paddingTop: 20 }}
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
            padding: '0 20px 16px',
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
                  isRecentCollection(col)
                    ? recentlyViewed.slice(0, 4).map(r => r.photo).filter(Boolean)
                    : col.storeIds.slice(0, 4)
                        .map(id => favorites.find(f => f.id === id)?.photos?.[0])
                        .filter((p): p is string => !!p)
                }
                onRename={() => openRename(col.id)}
                onLongPress={!isEditMode && !isRecentCollection(col) ? () => { setColActionTargetId(col.id); setBottomSheet('col-action'); } : undefined}
                onPress={!isEditMode ? () => onCollectionOpen?.(col.id, col.name) : undefined}
                onHandlePointerDown={isEditMode && !isRecentCollection(col)
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
            <SectionHeader title="저장한 매장" />
          </div>
          <StoreCountBar count={orderedStores.length} />

          {isEmpty ? (
            <EmptyState
              flex={false}
              paddingBottom={48}
              title="아직 저장한 매장이 없어요"
              subtitle="방문하고 싶은 매장을 편하게 관리하세요"
              buttonLabel="매장 추가하기"
              buttonIcon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M12 5v14M5 12h14" stroke="#252525" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              }
              onButtonClick={() => onGoHome?.()}
            />
          ) : (
            <div
              ref={storeListRef}
              onPointerMove={isEditMode ? onListPointerMove : undefined}
              onPointerUp={isEditMode ? onListPointerUp : undefined}
              onPointerCancel={isEditMode ? onListPointerUp : undefined}
            >
              {orderedStores.map((store, index) => {
                // stores 테이블에서 photo_urls·좌표 조회 (api_place_id or id 기준)
                const storeRow = allStores.find(r => r.api_place_id === store.id || r.id === store.id);
                const enrichedPhotos = storeRow
                  ? [storeRow.thumbnail_url, ...(storeRow.photo_urls ?? [])].filter(Boolean) as string[]
                  : store.photos ?? [];
                const distance = userLocation && storeRow
                  ? haversineDistance(userLocation.lat, userLocation.lng, storeRow.latitude, storeRow.longitude)
                  : undefined;
                return (
                <div
                  key={store.id}
                  ref={el => { itemRefsArr.current[index] = el; }}
                >
                  <StoreCard
                    store={{ ...store, photos: enrichedPhotos, distance }}
                    isEditMode={isEditMode || isOrganizeMode}
                    isSelected={selectedStoreIds.has(store.id)}
                    isDragging={isEditMode && dragIndex === index}
                    isDragOver={isEditMode && dragOverIndex === index && dragIndex !== index}
                    onHandleDrag={isEditMode ? (e) => onHandlePointerDown(e, index) : undefined}
                    onSelect={() => { if (dragIndex === -1) toggleSelectStore(store.id); }}
                    onPress={() => onDetailOpen?.(store.id)}
                    onHeartTap={() => {
                      const isInCollection = collections.some(
                        c => !isRecentCollection(c) && c.storeIds.includes(store.id)
                      );
                      if (isInCollection) {
                        setRemoveStoreTarget(store);
                        setShowRemoveStoreConfirm(true);
                      } else {
                        setDeletedStores([store]);
                        removeFavoriteFromContext(store.id);
                        setSnackbar('deleted');
                      }
                    }}
                    onPhotoMore={() => onPhotoMore?.(store.id, enrichedPhotos, store.name)}
                  />
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 하단 여백 — 탭바/CTA 가림 방지 (편집모드: 탭바 숨김 → CTA만 88px, 일반: 탭바 76px) */}
        <div style={{ height: `calc(env(safe-area-inset-bottom, 0px) + ${(isEditMode || isOrganizeMode) ? 88 : 76}px)` }} />
      </div>

      {/* ── 편집 모드 Bottom CTA (FocusBottomCTA 통일) ── */}
      {isEditMode && (
        hasSelection ? (
          <FocusBottomCTA.Double
            leftLabel="삭제"
            leftOnClick={deleteSelected}
            rightLabel="완료"
            rightOnClick={exitEditMode}
          />
        ) : (
          <FocusBottomCTA.Single label="완료" onClick={exitEditMode} />
        )
      )}

      {/* ── 컬렉션 선택 모드 Bottom CTA (Figma: Organize_Default/Selected) ── */}
      {isOrganizeMode && (
        hasSelection ? (
          <FocusBottomCTA.Double
            leftLabel="취소"
            leftOnClick={exitOrganizeMode}
            rightLabel="완료"
            rightOnClick={() => setBottomSheet('select-collection')}
          />
        ) : (
          <FocusBottomCTA.Single label="완료" onClick={() => {}} disabled />
        )
      )}

      {/* ─────────── BottomSheet: 새 컬렉션 생성 ─────────── */}
      <CollectionNameSheet
        open={bottomSheet === 'create'}
        title="컬렉션명"
        value={newCollectionName}
        onChange={setNewCollectionName}
        onConfirm={createCollection}
        onClose={() => { setNewCollectionName(''); setBottomSheet(isOrganizeMode ? 'select-collection' : null); }}
        placeholder="노트북 열기 좋은 곳, 딥워크 존 등"
      />

      {/* ─────────── BottomSheet: 컬렉션명 변경 ─────────── */}
      <CollectionNameSheet
        open={bottomSheet === 'rename'}
        title={renameTargetName}
        value={renameValue}
        onChange={setRenameValue}
        onConfirm={applyRename}
        onClose={() => { setBottomSheet(null); setRenameTargetId(null); setRenameValue(''); }}
      />

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
        {collections.filter(c => !isRecentCollection(c)).map(col => (
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
      <CollectionActionSheet
        open={bottomSheet === 'col-action'}
        collectionName={collections.find(c => c.id === colActionTargetId)?.name ?? ''}
        onEdit={() => {
          setBottomSheet(null);
          if (colActionTargetId) openRename(colActionTargetId);
        }}
        onDelete={() => {
          setBottomSheet(null);
          setTimeout(() => setShowColDeleteConfirm(true), 200);
        }}
        onClose={() => { setBottomSheet(null); setColActionTargetId(null); }}
      />

      {/* ── 컬렉션 삭제 확인 다이얼로그 (롱프레스 → 삭제) ── */}
      {showColDeleteConfirm && (
        <DeleteConfirmDialog
          type="collection"
          onConfirm={() => {
            if (!colActionTargetId) return;
            // 되돌리기 위해 삭제 전 컬렉션 정보 저장
            const colToDelete = collections.find(c => c.id === colActionTargetId);
            if (colToDelete) {
              setDeletedCollectionStore({
                name: colToDelete.name,
                storeIds: [...colToDelete.storeIds],
              });
            }
            removeCollection(colActionTargetId);
            setShowColDeleteConfirm(false);
            setColActionTargetId(null);
            setSnackbar('collection-deleted');
          }}
          onCancel={() => { setShowColDeleteConfirm(false); setColActionTargetId(null); }}
        />
      )}

      {/* ── 매장 즐겨찾기 해제 확인 다이얼로그 ── */}
      {showRemoveStoreConfirm && (
        <DeleteConfirmDialog
          type="store"
          onConfirm={() => {
            if (!removeStoreTarget) return;
            setDeletedStores([removeStoreTarget]);
            removeFavoriteFromContext(removeStoreTarget.id);
            setSnackbar('deleted');
            setShowRemoveStoreConfirm(false);
            setRemoveStoreTarget(null);
          }}
          onCancel={() => { setShowRemoveStoreConfirm(false); setRemoveStoreTarget(null); }}
        />
      )}

      {/* ── 스낵바 ── */}
      {snackbar === 'deleted' && (
        <Snackbar type="negative" message="카페를 모음집에서 꺼냈어요" actionLabel="되돌리기"
          onAction={() => {
            deletedStores.forEach(s => addFavoriteFromContext(s));
            setDeletedStores([]);
            setSnackbar(null);
          }}
          onDismiss={dismissSnackbar} />
      )}
      <Toast
        open={snackbar === 'added'}
        position="top"
        text="카페를 컬렉션에 담았어요"
        duration={3000}
        onClose={() => setSnackbar(null)}
      />
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
      <Toast
        open={!!renameToast}
        position="top"
        text="컬렉션 이름을 바꿨어요"
        duration={2500}
        onClose={() => setRenameToast(null)}
      />

      {/* 공유 바텀시트 */}
      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        shareTitle="카공지도 모음집"
      />
    </div>
  );
}
