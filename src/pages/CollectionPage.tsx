import { useState, useCallback, useRef, useEffect } from 'react';
import BottomSheet from '../components/BottomSheet';
import Snackbar from '../components/Snackbar';
import { useFavorites, RecentCafe, FavoritedStore } from '../context/FavoritesContext';

// SF Pro 시스템 폰트
const SFPro = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif';

// ─── 타입 ────────────────────────────────────────────────────
interface Store {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  photos?: string[];
}

type BottomSheetType = null | 'create' | 'select-collection' | 'rename';
type SnackbarType = null | 'deleted' | 'added' | 'renamed';

// ─── 컬렉션 카드 (Figma: 121×121px card, 6px gap, 23px label) ─
function CollectionCard({
  label,
  isNew = false,
  isEditMode = false,
  onPress,
  onRename,
  recentItems = [],
}: {
  label: string;
  isNew?: boolean;
  isEditMode?: boolean;
  onPress?: () => void;
  onRename?: () => void;
  recentItems?: RecentCafe[];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
      <button
        onClick={onPress}
        style={{
          width: 121,
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer', position: 'relative',
        }}
      >
        {/* 이미지 카드 121×121 */}
        <div style={{
          width: 121, height: 121,
          border: isNew ? '1px dashed #c5c5c5' : 'none',
          borderRadius: 4, overflow: 'hidden',
          backgroundColor: '#ffffff', position: 'relative',
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
                fontFamily: SFPro, fontWeight: 590, fontSize: 12,
                color: 'rgba(3,24,50,0.46)', lineHeight: '22.5px',
              }}>새 컬렉션</span>
            </div>
          ) : (
            /* 2×2 이미지 그리드 (60×60, gap 1px) */
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 60px',
              gridTemplateRows: '60px 60px',
              gap: 1,
              width: 121, height: 121,
            }}>
              {[0, 1, 2, 3].map((i) => {
                const item = recentItems[i];
                return (
                  <div key={i} style={{
                    backgroundColor: item ? '#C8D6E5' : '#E8EDF4',
                    overflow: 'hidden',
                  }}>
                    {item?.photo ? (
                      <img src={item.photo} alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : item ? (
                      <div style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{
                          fontFamily: SFPro, fontWeight: 590, fontSize: 10,
                          color: 'rgba(0,12,30,0.45)', textAlign: 'center',
                          padding: '0 3px', overflow: 'hidden',
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical' as const,
                        }}>{item.name}</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {/* 편집 모드: 드래그 소트 오버레이 (최근 제외) */}
          {isEditMode && !isNew && label !== '최근' && (
            <div style={{
              position: 'absolute', inset: 0,
              backgroundColor: 'rgba(232,232,253,0.36)',
              borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* ↑↓ 아이콘 — pepicons-pop:down-up */}
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none">
                <g fill="rgba(0,19,43,0.58)" fillRule="evenodd" clipRule="evenodd">
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: 121 }}>
          <span style={{
            fontFamily: SFPro, fontWeight: 590, fontSize: 15,
            color: '#191f28', lineHeight: '22.5px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
          }}>
            {label}
          </span>
          {/* 편집 모드 연필 (최근 제외) */}
          {isEditMode && label !== '최근' && (
            <button
              onClick={onRename}
              style={{
                background: 'none', border: 'none', padding: 2,
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="rgba(0,19,43,0.45)" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          )}
        </div>
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
  return (
    <div
      onClick={isEditMode ? onSelect : onPress}
      style={{
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        borderTop: isDragOver ? '2px solid #3182F6' : 'none',
        cursor: 'pointer',
        paddingTop: 20, paddingBottom: 20,
        opacity: isDragging ? 0.4 : (isEditMode && !isSelected ? 0.7 : 1),
        transition: 'opacity 0.15s',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', paddingLeft: 16, paddingRight: 16 }}>
        {/* 편집 모드 체크박스 (Figma: 24×24) */}
        {isEditMode && (
          <div style={{
            width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
            marginRight: 10, marginTop: 1,
            backgroundColor: isSelected ? '#3182F6' : 'transparent',
            border: `2px solid ${isSelected ? '#3182F6' : 'rgba(0,19,43,0.2)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isSelected && (
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path d="M1 4l3.5 3.5L11 1" stroke="#fff" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        )}

        {/* 텍스트 콘텐츠 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 이름 + 아이콘 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
            <p style={{
              fontFamily: SFPro, fontWeight: 700, fontSize: 17,
              lineHeight: '22.95px', color: 'rgba(0,12,30,0.8)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              flex: 1, marginRight: 8,
            }}>{store.name}</p>

            {/* 정렬핸들: 편집모드만 (onHandlePointerDown 있을 때) / 기본모드: 하트 / 오거나이즈: 없음 */}
            {onHandlePointerDown ? (
              <div
                onPointerDown={onHandlePointerDown}
                style={{
                  width: 24, height: 24, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'grab', touchAction: 'none',
                }}
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
            ) : !isEditMode ? (
              <button
                onClick={(e) => { e.stopPropagation(); onRemoveFavorite?.(); }}
                style={{ width: 20, height: 20, flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    fill="#3182f6" stroke="#3182f6" strokeWidth="0.5"/>
                </svg>
              </button>
            ) : null}
          </div>

          {/* 주소 */}
          <p style={{
            fontFamily: SFPro, fontWeight: 510, fontSize: 13,
            lineHeight: '17.55px', color: 'rgba(0,19,43,0.58)',
            marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{store.address}</p>

          {/* 별점 + 뱃지 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="#FFB800">
                <path d="M8 1.5l1.647 3.337 3.682.535-2.664 2.597.629 3.666L8 9.75l-3.294 1.885.629-3.666L2.671 5.372l3.682-.535L8 1.5z"/>
              </svg>
              <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)' }}>
                {store.rating}
              </span>
              <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)' }}>
                ({store.reviewCount.toLocaleString()})
              </span>
            </div>
            {store.badge && (
              <span style={{
                fontFamily: SFPro, fontWeight: 590, fontSize: 10, lineHeight: '15px',
                color: 'rgba(3,18,40,0.7)',
                backgroundColor: 'rgba(0,27,55,0.1)',
                borderRadius: 9, padding: '3px 7px',
              }}>{store.badge}</span>
            )}
          </div>

          {/* 이미지 4장 (Kit Card: 80×80, cornerRadius 4, gap 8px) — 사진 없으면 플레이스홀더 */}
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {[0, 1, 2, 3].map((i) => {
                const photo = store.photos?.[i];
                return (
                  <div key={i} style={{
                    width: 80, height: 80, borderRadius: 4,
                    backgroundColor: '#E8EDF4', flexShrink: 0, overflow: 'hidden',
                  }}>
                    {photo && <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  </div>
                );
              })}
            </div>
            {/* 우측 그라데이션 페이드 */}
            <div style={{
              position: 'absolute', top: 0, right: 0, bottom: 0, width: 60,
              background: 'linear-gradient(to right, rgba(255,255,255,0), #ffffff)',
              pointerEvents: 'none',
            }} />
          </div>
        </div>
      </div>
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
      <p style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 13, lineHeight: '22.5px', color: '#4e5968', marginBottom: 2 }}>
        아직 저장한 매장이 없어요
      </p>
      <p style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 13, lineHeight: '22.5px', color: '#4e5968', textAlign: 'center', marginBottom: 24 }}>
        방문하고 싶은 매장을 편하게 관리하세요
      </p>
      <button
        onClick={onAdd}
        style={{
          width: 165, height: 48, borderRadius: 14,
          backgroundColor: 'rgba(222,222,255,0.19)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 17, color: '#2365cf' }}>
          매장 추가하기
        </span>
      </button>
    </div>
  );
}

// ─── 팝오버 메뉴 ─────────────────────────────────────────────
function Popover({
  hasSavedStores,
  onEdit,
  onAddToCollection,
  onSuggestInfo,
  onClose,
}: {
  hasSavedStores: boolean;
  onEdit: () => void;
  onAddToCollection: () => void;
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

  const items = hasSavedStores
    ? [
        { label: '편집하기', action: onEdit },
        { label: '컬렉션에 추가하기', action: onAddToCollection },
        { label: '정보 수정 제안하기', action: onSuggestInfo },
      ]
    : [
        { label: '편집하기', action: onEdit },
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
      {/* 타이틀 "메뉴" — Figma: 13px/590/#031832, height 30px */}
      <div style={{
        height: 30,
        display: 'flex', alignItems: 'center',
        paddingLeft: 16,
      }}>
        <span style={{
          fontFamily: SFPro, fontWeight: 590, fontSize: 13,
          color: '#031832',
        }}>메뉴</span>
      </div>
      {/* 메뉴 항목 — Figma: 17px/510/#031228, height 44px */}
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => { item.action(); onClose(); }}
          style={{
            width: '100%', height: 44,
            display: 'flex', alignItems: 'center',
            paddingLeft: 16,
            fontFamily: SFPro, fontSize: 17, fontWeight: 510,
            color: '#031228',
            background: 'none', border: 'none',
            cursor: 'pointer', textAlign: 'left',
            borderRadius: 12,
          }}
        >{item.label}</button>
      ))}
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────
export default function CollectionPage({
  onDetailOpen,
  onCollectionOpen,
  onGoHome,
  onBack,
  onClose,
}: {
  onDetailOpen?: (id: string) => void;
  onCollectionOpen?: (id: string, name: string) => void;
  onGoHome?: () => void;
  onBack?: () => void;
  onClose?: () => void;
}) {
  const {
    favorites, removeFavorite: removeFavoriteFromContext,
    reorderFavorites,
    recentlyViewed, collections, addCollection, updateCollection, addStoresToCollection,
  } = useFavorites();

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
  const [bottomSheet, setBottomSheet] = useState<BottomSheetType>(null);
  const [snackbar, setSnackbar] = useState<SnackbarType>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showPopover, setShowPopover] = useState(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const isEmpty = orderedStores.length === 0;
  const hasSelection = selectedStoreIds.size > 0;
  const dismissSnackbar = useCallback(() => setSnackbar(null), []);

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

  const enterEditMode = () => {
    setIsEditMode(true);
    setSelectedStoreIds(new Set());
    setShowPopover(false);
  };

  // 삭제하기 / 컬렉션에 추가하기: 컬렉션 선택 모드(Organize) 진입
  const enterOrganizeMode = () => {
    setIsOrganizeMode(true);
    setSelectedStoreIds(new Set());
    setShowPopover(false);
  };

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
    selectedStoreIds.forEach(id => removeFavoriteFromContext(id));
    // 삭제 후 선택 초기화만 — 편집모드는 유지 (Edit_Default 단일 완료 버튼으로 원복)
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
      setSelectedCollectionId(newId);
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
    updateCollection(renameTargetId, { name: renameValue.trim() });
    setBottomSheet(null);
    setRenameTargetId(null);
    setSnackbar('renamed');
  };

  // 현재 rename 대상 컬렉션 이름
  const renameTargetName = collections.find(c => c.id === renameTargetId)?.name ?? '';

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', backgroundColor: '#ffffff', position: 'relative',
    }}>
      {/* ── NavBar (Figma: Top Navigation AppInToss, 44px) ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        height: 44, paddingLeft: 0, paddingRight: 8,
        position: 'relative', flexShrink: 0,
      }}>
        {/* 왼쪽: 뒤로가기 + 타이틀 */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <button
            onClick={isEditMode ? exitEditMode : isOrganizeMode ? exitOrganizeMode : (onBack ?? onGoHome)}
            style={{
              width: 44, height: 44, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#191f28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>

        {/* 오른쪽: 항상 고정 표시 */}
        <div style={{
            display: 'flex', alignItems: 'center',
            height: 34, borderRadius: 99,
            backgroundColor: 'rgba(0,23,51,0.02)', overflow: 'hidden',
          }}>
            <button
              onClick={() => setShowPopover(v => !v)}
              style={{
                width: 46, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="#191f28">
                <circle cx="4" cy="10" r="1.5"/>
                <circle cx="10" cy="10" r="1.5"/>
                <circle cx="16" cy="10" r="1.5"/>
              </svg>
            </button>
            <div style={{ width: 1, height: 16, backgroundColor: 'rgba(0,27,55,0.1)' }} />
            <button
              onClick={isEditMode ? exitEditMode : isOrganizeMode ? exitOrganizeMode : (onClose ?? onGoHome)}
              style={{
                width: 46, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                stroke="#191f28" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="5" x2="15" y2="15"/>
                <line x1="15" y1="5" x2="5" y2="15"/>
              </svg>
            </button>
          </div>

        {/* 팝오버 */}
        {showPopover && (
          <Popover
            hasSavedStores={!isEmpty}
            onEdit={enterEditMode}
            onAddToCollection={enterOrganizeMode}
            onSuggestInfo={() => setShowPopover(false)}
            onClose={() => setShowPopover(false)}
          />
        )}
      </div>

      {/* ── info_2 bar (Figma: 46px, Medium 510 14px centered) ── */}
      <div style={{
        height: 46, backgroundColor: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: SFPro, fontWeight: 510, fontSize: 14,
          color: '#000000', lineHeight: '25.5px',
        }}>{isEditMode ? '편집모드' : isOrganizeMode ? '컬렉션 선택' : '모음집'}</span>
      </div>

      {/* ── 스크롤 본문 ── */}
      <div
        style={{ flex: 1, overflowY: 'auto' }}
        onScroll={() => showPopover && setShowPopover(false)}
      >

        {/* 컬렉션 카드 가로 스크롤 — 오거나이즈 모드에서 숨김 */}
        {!isOrganizeMode && <div style={{
          display: 'flex', gap: 10,
          overflowX: 'auto', padding: '12px 20px 16px',
          scrollbarWidth: 'none',
        }}>
          {collections.map((col) => (
            <CollectionCard
              key={col.id}
              label={col.name}
              isEditMode={isEditMode}
              recentItems={col.id === 'recent' ? recentlyViewed : []}
              onRename={() => openRename(col.id)}
              onPress={!isEditMode ? () => onCollectionOpen?.(col.id, col.name) : undefined}
            />
          ))}
          <CollectionCard
            label="새 컬렉션" isNew
            onPress={() => setBottomSheet('create')}
          />
        </div>}

        {/* 저장한 매장 (Figma: Listheader 41px, Bold 700 17px) */}
        <div>
          <div style={{
            height: 41, display: 'flex', alignItems: 'center',
            paddingLeft: 20, paddingRight: 20,
          }}>
            <h2 style={{
              fontFamily: SFPro, fontWeight: 700, fontSize: 17,
              lineHeight: '21.25px', color: 'rgba(0,12,30,0.8)',
              margin: 0,
            }}>저장한 매장</h2>
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
                    onRemoveFavorite={() => removeFavoriteFromContext(store.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 편집/오거나이즈 모드 하단 여백 */}
        {(isEditMode || isOrganizeMode) && <div style={{ height: 112 }} />}
      </div>

      {/* ── 편집 모드 Bottom CTA ── */}
      {isEditMode && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <div style={{ height: 36, background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, #ffffff 100%)' }} />
          <div style={{
            height: 76, backgroundColor: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            paddingLeft: 20, paddingRight: 20, gap: 8,
          }}>
            {hasSelection ? (
              <>
                {/* 삭제 — rgba(49,130,246,0.16) bg, #2272eb text */}
                <button onClick={deleteSelected} style={{
                  flex: 1, height: 56, borderRadius: 16,
                  fontFamily: SFPro, fontSize: 17, fontWeight: 590,
                  backgroundColor: 'rgba(49,130,246,0.16)', color: '#2272eb',
                  border: 'none', cursor: 'pointer',
                }}>삭제</button>
                {/* 완료 — #3182f6 bg */}
                <button onClick={exitEditMode} style={{
                  flex: 1, height: 56, borderRadius: 16,
                  fontFamily: SFPro, fontSize: 17, fontWeight: 590,
                  backgroundColor: '#3182f6', color: '#ffffff',
                  border: 'none', cursor: 'pointer',
                }}>완료</button>
              </>
            ) : (
              /* 완료 단일 — #f2f4f6 bg */
              <button onClick={exitEditMode} style={{
                flex: 1, height: 56, borderRadius: 16,
                fontFamily: SFPro, fontSize: 17, fontWeight: 590,
                backgroundColor: '#f2f4f6', color: 'rgba(0,19,43,0.58)',
                border: 'none', cursor: 'pointer',
              }}>완료</button>
            )}
          </div>
        </div>
      )}

      {/* ── 컬렉션 선택 모드 Bottom CTA (Figma: Organize_Default/Selected) ── */}
      {isOrganizeMode && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <div style={{ height: 36, background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, #ffffff 100%)' }} />
          <div style={{
            height: 76, backgroundColor: '#ffffff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            paddingLeft: 20, paddingRight: 20, gap: 8,
          }}>
            {hasSelection ? (
              <>
                {/* 취소 — 오거나이즈 모드 종료 */}
                <button onClick={exitOrganizeMode} style={{
                  flex: 1, height: 56, borderRadius: 16,
                  fontFamily: SFPro, fontSize: 17, fontWeight: 590,
                  backgroundColor: 'rgba(49,130,246,0.16)', color: '#2272eb',
                  border: 'none', cursor: 'pointer',
                }}>취소</button>
                {/* 완료 — 목적지 컬렉션 선택 바텀시트 호출 */}
                <button onClick={() => setBottomSheet('select-collection')} style={{
                  flex: 1, height: 56, borderRadius: 16,
                  fontFamily: SFPro, fontSize: 17, fontWeight: 590,
                  backgroundColor: '#3182f6', color: '#ffffff',
                  border: 'none', cursor: 'pointer',
                }}>완료</button>
              </>
            ) : (
              /* 완료 — Disabled: 선택 없을 때 인터랙션 비활성화 */
              <button disabled style={{
                flex: 1, height: 56, borderRadius: 16,
                fontFamily: SFPro, fontSize: 17, fontWeight: 590,
                backgroundColor: '#f2f4f6', color: 'rgba(0,19,43,0.38)',
                border: 'none', cursor: 'not-allowed', opacity: 1,
              }}>완료</button>
            )}
          </div>
        </div>
      )}

      {/* ─────────── BottomSheet: 새 컬렉션 생성 ─────────── */}
      {/* Figma: 컬렉션명 Bold 20px / 입력 Semibold 22px #8b95a1 / 버튼 355×56 #3182f6 */}
      <BottomSheet
        isOpen={bottomSheet === 'create'}
        onClose={() => {
          setNewCollectionName('');
          // 오거나이즈 모드에서 뒤로가면 select-collection 시트로 복귀
          setBottomSheet(isOrganizeMode ? 'select-collection' : null);
        }}
      >
        <style>{`.bs-input::placeholder { color: #8b95a1; }`}</style>
        {/* 타이틀 - 24px 좌우 패딩 */}
        <div style={{ padding: '21px 24px 0' }}>
          <p style={{
            fontFamily: SFPro, fontWeight: 700, fontSize: 20,
            color: 'rgba(0,12,30,0.8)', marginBottom: 0,
            lineHeight: '27px',
          }}>컬렉션명</p>
        </div>
        {/* 입력 컨테이너 */}
        <div style={{ padding: '46px 24px 14px' }}>
          <div style={{ borderBottom: '1px solid #f2f4f6' }}>
            <input
              className="bs-input"
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              placeholder="노트북 열기 좋은 곳, 딥워크 존 등"
              maxLength={20}
              autoFocus
              style={{
                width: '100%', padding: '4px 0 8px',
                border: 'none', outline: 'none',
                fontFamily: SFPro, fontWeight: 590, fontSize: 22,
                color: '#191F28', backgroundColor: 'transparent',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
        {/* 버튼 — 전체 너비 */}
        <button
          onClick={createCollection}
          disabled={!newCollectionName.trim()}
          style={{
            width: '100%', height: 56,
            fontFamily: SFPro, fontSize: 17, fontWeight: 590,
            backgroundColor: newCollectionName.trim() ? '#3182F6' : 'rgba(26,122,249,0.47)',
            color: '#ffffff',
            border: 'none', cursor: newCollectionName.trim() ? 'pointer' : 'default',
          }}
        >적용하기</button>
      </BottomSheet>

      {/* ─────────── BottomSheet: 컬렉션명 변경 ─────────── */}
      {/* Figma: 기존 컬렉션명 Bold 20px / 입력 Semibold 22px #8b95a1 / 버튼 전체너비 #3182f6 */}
      <BottomSheet
        isOpen={bottomSheet === 'rename'}
        onClose={() => { setBottomSheet(null); setRenameTargetId(null); setRenameValue(''); }}
      >
        {/* 타이틀: 기존 컬렉션명 */}
        <div style={{ padding: '21px 24px 0' }}>
          <p style={{
            fontFamily: SFPro, fontWeight: 700, fontSize: 20,
            color: 'rgba(0,12,30,0.8)', lineHeight: '27px', marginBottom: 0,
          }}>{renameTargetName}</p>
        </div>
        {/* 입력 */}
        <div style={{ padding: '46px 24px 14px' }}>
          <div style={{ borderBottom: '1px solid #f2f4f6' }}>
            <input
              className="bs-input"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              placeholder="컬렉션명"
              maxLength={20}
              autoFocus
              style={{
                width: '100%', padding: '4px 0 8px',
                border: 'none', outline: 'none',
                fontFamily: SFPro, fontWeight: 590, fontSize: 22,
                color: '#191F28', backgroundColor: 'transparent',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
        {/* 버튼 */}
        <button
          onClick={applyRename}
          disabled={!renameValue.trim()}
          style={{
            width: '100%', height: 56,
            fontFamily: SFPro, fontSize: 17, fontWeight: 590,
            backgroundColor: renameValue.trim() ? '#3182F6' : 'rgba(26,122,249,0.47)',
            color: '#ffffff',
            border: 'none', cursor: renameValue.trim() ? 'pointer' : 'default',
          }}
        >적용하기</button>
      </BottomSheet>

      {/* ─────────── BottomSheet: 컬렉션 선택 ─────────── */}
      {/* Figma: 타이틀 Bold 20px / 행 62px / 버튼 반반(8px gap) h56 cornerRadius16 */}
      <BottomSheet
        isOpen={bottomSheet === 'select-collection'}
        onClose={() => { setBottomSheet(null); setSelectedCollectionId(null); }}
      >
        {/* 타이틀 */}
        <div style={{ padding: '8px 24px 0' }}>
          <p style={{
            fontFamily: SFPro, fontWeight: 700, fontSize: 20,
            color: 'rgba(0,12,30,0.8)', lineHeight: '27px', marginBottom: 0,
          }}>어디로 컬렉션을 추가할까요?</p>
        </div>

        {/* 새 컬렉션 추가 행 (62px) */}
        <button
          onClick={() => { setBottomSheet('create'); setSelectedCollectionId(null); }}
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
              <path d="M8 3v10M3 8h10" stroke="#3182f6" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span style={{
            fontFamily: SFPro, fontWeight: 700, fontSize: 17,
            color: 'rgba(0,12,30,0.8)',
          }}>새 컬렉션 추가</span>
        </button>

        {/* 기존 컬렉션 목록 (최근 제외) */}
        {collections.filter(c => c.id !== 'recent').map(col => (
          <button
            key={col.id}
            onClick={() => setSelectedCollectionId(prev => prev === col.id ? null : col.id)}
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
                fontFamily: SFPro, fontWeight: 700, fontSize: 17,
                color: 'rgba(0,12,30,0.8)',
              }}>{col.name}</span>
            </div>
            {/* 체크 서클 */}
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              border: `2px solid ${selectedCollectionId === col.id ? '#3182f6' : 'rgba(0,19,43,0.2)'}`,
              backgroundColor: selectedCollectionId === col.id ? '#3182f6' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              {selectedCollectionId === col.id && (
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                  <path d="M1 4l3.5 3.5L11 1" stroke="#fff" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </button>
        ))}

        {/* 버튼 영역 (Figma: 20px 좌우 패딩, 8px gap, 각 h56 cornerRadius16) */}
        <div style={{ padding: '16px 20px', display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setBottomSheet(null); setSelectedCollectionId(null); }}
            style={{
              flex: 1, height: 56, borderRadius: 16,
              fontFamily: SFPro, fontSize: 17, fontWeight: 590,
              backgroundColor: 'rgba(7,25,76,0.05)',
              color: 'rgba(3,18,40,0.7)',
              border: 'none', cursor: 'pointer',
            }}
          >닫기</button>
          <button
            onClick={() => {
              if (!selectedCollectionId) return;
              // 선택된 매장들을 선택한 컬렉션에 실제로 추가
              addStoresToCollection(selectedCollectionId, [...selectedStoreIds]);
              setBottomSheet(null);
              setSelectedCollectionId(null);
              setSnackbar('added');
              if (isOrganizeMode) exitOrganizeMode();
              else exitEditMode();
            }}
            style={{
              flex: 1, height: 56, borderRadius: 16,
              fontFamily: SFPro, fontSize: 17, fontWeight: 590,
              backgroundColor: selectedCollectionId ? '#3182F6' : 'rgba(26,122,249,0.47)',
              color: '#ffffff',
              border: 'none', cursor: selectedCollectionId ? 'pointer' : 'default',
            }}
          >확인</button>
        </div>
      </BottomSheet>

      {/* ── 스낵바 ── */}
      {snackbar === 'deleted' && (
        <Snackbar message="삭제되었습니다" actionLabel="실행 취소"
          onAction={() => setSnackbar(null)} onDismiss={dismissSnackbar} />
      )}
      {snackbar === 'added' && (
        <Snackbar message="컬렉션에 담았어요" actionLabel="보러가기"
          onAction={() => setSnackbar(null)} onDismiss={dismissSnackbar} />
      )}
      {snackbar === 'renamed' && (
        <Snackbar message="컬렉션 이름이 변경되었어요" actionLabel="확인"
          onAction={() => setSnackbar(null)} onDismiss={dismissSnackbar} />
      )}
    </div>
  );
}
