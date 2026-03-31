import { useState, useCallback, useRef, useEffect } from 'react';
import BottomSheet from '../components/BottomSheet';
import Snackbar from '../components/Snackbar';
import { useFavorites, RecentCafe } from '../context/FavoritesContext';

// SF Pro 시스템 폰트 (피그마 폰트와 매핑)
const SFPro = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif';

// ─── 타입 정의 ────────────────────────────────────────────────
interface Store {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  photos?: string[];
}

interface Collection {
  id: string;
  name: string;
}

type BottomSheetType = null | 'create' | 'select-collection' | 'rename';
type SnackbarType = null | 'deleted' | 'added' | 'renamed';

const MOCK_COLLECTIONS: Collection[] = [
  { id: 'recent', name: '최근' },
];

// ─── 컬렉션 카드 ──────────────────────────────────────────────
function CollectionCard({
  label,
  isNew = false,
  isSelected = false,
  isEditMode = false,
  onPress,
  onRename,
  recentItems = [],
}: {
  label: string;
  isNew?: boolean;
  isSelected?: boolean;
  isEditMode?: boolean;
  onPress?: () => void;
  onRename?: () => void;
  recentItems?: RecentCafe[];
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, position: 'relative' }}>
      <button
        onClick={onPress}
        style={{
          width: 122,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* 이미지 카드 */}
        <div style={{
          width: 122, height: 122,
          border: isNew ? '1px solid #c5c5c5' : isSelected ? '2px solid #3182F6' : 'none',
          borderRadius: 4, overflow: 'hidden', position: 'relative', flexShrink: 0,
          backgroundColor: '#ffffff',
        }}>
          {isNew ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 12, color: 'rgba(3, 24, 50, 0.46)', lineHeight: '22.5px' }}>새 컬렉션</span>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '60px 60px', gridTemplateRows: '60px 60px', rowGap: 2, columnGap: 2, width: 122, height: 122 }}>
              {[0, 1, 2, 3].map((i) => {
                const item = recentItems[i];
                return (
                  <div key={i} style={{ backgroundColor: item ? '#C8D6E5' : '#E8EDF4', overflow: 'hidden', position: 'relative' }}>
                    {item?.photo ? (
                      <img src={item.photo} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : item ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 11, color: 'rgba(0, 12, 30, 0.45)', textAlign: 'center', padding: '0 4px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{item.name}</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
          {/* 편집 모드 체크 */}
          {isEditMode && !isNew && (
            <div style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', backgroundColor: isSelected ? '#3182F6' : 'rgba(255,255,255,0.85)', border: `2px solid ${isSelected ? '#3182F6' : '#C5CAD2'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isSelected && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 4l3 3 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
          )}
        </div>
      </button>

      {/* 라벨 + 편집 모드 연필 아이콘 */}
      {!isNew && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: 122 }}>
          <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 15, color: '#191f28', lineHeight: '22.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
            {label}
          </span>
          {/* 편집 모드 연필 아이콘 — 컬렉션명 수정 */}
          {isEditMode && label !== '최근' && (
            <button onClick={onRename} style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,19,43,0.45)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

// ─── 매장 리스트 아이템 ───────────────────────────────────────
function StoreListItem({
  store,
  isEditMode = false,
  isSelected = false,
  onSelect,
  onPress,
}: {
  store: Store;
  isEditMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onPress?: () => void;
}) {
  return (
    <div
      onClick={isEditMode ? onSelect : onPress}
      style={{ paddingTop: 12, paddingBottom: 12, borderBottom: '1px solid rgba(0, 0, 0, 0.06)', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {/* 편집 모드 체크박스 */}
        {isEditMode && (
          <div style={{ width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 2, backgroundColor: isSelected ? '#3182F6' : 'transparent', border: `2px solid ${isSelected ? '#3182F6' : '#C5CAD2'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isSelected && <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 4l3 3 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        )}

        {/* 콘텐츠 전체 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* ① 텍스트 정보 */}
          <div style={{ marginBottom: 10 }}>
            <p style={{ fontFamily: SFPro, fontWeight: 700, fontSize: 17, lineHeight: '22.95px', color: 'rgba(0, 12, 30, 0.8)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.name}</p>
            <p style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, lineHeight: '17.55px', color: 'rgba(0, 19, 43, 0.58)', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{store.address}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5l1.647 3.337 3.682.535-2.664 2.597.629 3.666L8 9.75l-3.294 1.885.629-3.666L2.671 5.372l3.682-.535L8 1.5z" fill="#FFB800"/>
                </svg>
                <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0, 19, 43, 0.58)' }}>{store.rating}</span>
                <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0, 19, 43, 0.58)' }}>({store.reviewCount.toLocaleString()})</span>
              </div>
              {store.badge && (
                <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 10, lineHeight: '15px', color: 'rgba(3, 18, 40, 0.7)', backgroundColor: 'rgba(0, 27, 55, 0.1)', borderRadius: 9, padding: '3px 7px' }}>{store.badge}</span>
              )}
            </div>
          </div>
          {/* ② 사진 4장 가로 */}
          {store.photos && store.photos.length > 0 && (
            <div style={{ display: 'flex', gap: 12 }}>
              {store.photos.slice(0, 4).map((photo, i) => (
                <div key={i} style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: '#E8EDF4', flexShrink: 0, overflow: 'hidden' }}>
                  {photo && <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 더보기 버튼 (일반 모드) */}
        {!isEditMode && (
          <button style={{ padding: '0 4px', color: 'rgba(0, 19, 43, 0.35)', fontSize: 18, letterSpacing: 1, background: 'none', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', marginTop: 2 }}>···</button>
        )}
      </div>
    </div>
  );
}

// ─── 빈 상태 ──────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 52, paddingBottom: 48 }}>
      <p style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 13, lineHeight: '22.5px', color: '#4e5968', marginBottom: 2 }}>아직 저장한 매장이 없어요</p>
      <p style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 13, lineHeight: '22.5px', color: '#4e5968', textAlign: 'center', marginBottom: 24 }}>방문하고 싶은 매장을 편하게 관리하세요</p>
      <button onClick={onAdd} style={{ width: 165, height: 48, borderRadius: 14, backgroundColor: 'rgba(222, 222, 255, 0.19)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 17, lineHeight: '21.28px', color: '#2365cf' }}>매장 추가하기</span>
      </button>
    </div>
  );
}

// ─── 팝오버 메뉴 ─────────────────────────────────────────────
function Popover({ onEdit, onClose }: { onEdit: () => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const items = [
    { label: '편집하기', action: onEdit },
    { label: '공유하기', action: onClose },
    { label: '정보 수정 제안하기', action: onClose },
  ];
  return (
    <div ref={ref} style={{ position: 'absolute', top: 48, right: 16, zIndex: 100, backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', minWidth: 180, overflow: 'hidden' }}>
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => { item.action(); onClose(); }}
          style={{ width: '100%', textAlign: 'left', padding: '14px 16px', fontFamily: SFPro, fontSize: 15, fontWeight: 510, color: 'rgba(0, 12, 30, 0.8)', background: 'none', border: 'none', borderBottom: i < items.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none', cursor: 'pointer' }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────
export default function CollectionPage({
  onDetailOpen,
  onGoHome,
  onBack,
  onClose,
}: {
  onDetailOpen?: (id: string) => void;
  onGoHome?: () => void;
  onBack?: () => void;
  onClose?: () => void;
}) {
  const { favorites, removeFavorite: removeFavoriteFromContext, recentlyViewed } = useFavorites();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set());
  const [collections, setCollections] = useState<Collection[]>(MOCK_COLLECTIONS);
  const stores = favorites;
  const [bottomSheet, setBottomSheet] = useState<BottomSheetType>(null);
  const [snackbar, setSnackbar] = useState<SnackbarType>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [renameTargetId, setRenameTargetId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showPopover, setShowPopover] = useState(false);

  const isEmpty = stores.length === 0;
  const hasSelection = selectedStoreIds.size > 0;

  const dismissSnackbar = useCallback(() => setSnackbar(null), []);

  const enterEditMode = () => {
    setIsEditMode(true);
    setSelectedStoreIds(new Set());
    setShowPopover(false);
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setSelectedStoreIds(new Set());
  };

  const toggleSelectStore = (id: string) => {
    setSelectedStoreIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const deleteSelected = () => {
    selectedStoreIds.forEach(id => removeFavoriteFromContext(id));
    exitEditMode();
    setSnackbar('deleted');
  };

  const createCollection = () => {
    if (newCollectionName.trim()) {
      setCollections((prev) => [...prev, { id: Date.now().toString(), name: newCollectionName.trim() }]);
      setNewCollectionName('');
    }
    setBottomSheet(null);
    setSnackbar('added');
  };

  const openRename = (colId: string) => {
    const col = collections.find(c => c.id === colId);
    if (!col) return;
    setRenameTargetId(colId);
    setRenameValue(col.name);
    setBottomSheet('rename');
  };

  const applyRename = () => {
    if (!renameTargetId || !renameValue.trim()) return;
    const existing = collections.find(c => c.id === renameTargetId);
    if (existing && renameValue.trim() === existing.name) { setBottomSheet(null); return; }
    setCollections(prev => prev.map(c => c.id === renameTargetId ? { ...c, name: renameValue.trim() } : c));
    setBottomSheet(null);
    setRenameTargetId(null);
    setSnackbar('renamed');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#ffffff', position: 'relative' }}>

      {/* ── 헤더 (피그마: Top Navigation AppInToss, 44px) ── */}
      <div style={{ display: 'flex', alignItems: 'center', height: 44, borderBottom: '1px solid rgba(0, 0, 0, 0.06)', position: 'relative', flexShrink: 0 }}>

        {/* Left: 뒤로가기 + 타이틀 */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          {/* 뒤로가기 버튼 — 44×44px */}
          <button
            onClick={onBack ?? onGoHome}
            style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#191f28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          {/* 타이틀 */}
          <h1 style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 15, lineHeight: '22.5px', color: '#191f28', whiteSpace: 'nowrap' }}>
            {isEditMode ? '편집 모드' : '모음집'}
          </h1>
        </div>

        {/* Right: 더보기 + 구분선 + 닫기 (일반 모드) / 완료 (편집 모드) */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, paddingRight: 8 }}>
          {isEditMode ? (
            <button onClick={exitEditMode} style={{ height: 44, padding: '0 16px', fontFamily: SFPro, fontWeight: 590, fontSize: 17, color: '#3182F6', background: 'none', border: 'none', cursor: 'pointer' }}>완료</button>
          ) : (
            /* Fixed Icon Area — 피그마 TDS "component/navigation~~" pill container */
            <div style={{ display: 'flex', alignItems: 'center', height: 34, borderRadius: 99, backgroundColor: 'rgba(0, 23, 51, 0.02)', overflow: 'hidden' }}>
              {/* 더보기(...) 아이콘 버튼 */}
              <button onClick={() => setShowPopover(v => !v)} style={{ width: 46, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="#191f28">
                  <circle cx="4" cy="10" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/>
                </svg>
              </button>
              {/* 구분선 — 1×16px */}
              <div style={{ width: 1, height: 16, backgroundColor: 'rgba(0, 27, 55, 0.1)', flexShrink: 0 }} />
              {/* 닫기(X) 버튼 */}
              <button onClick={onClose ?? onGoHome} style={{ width: 46, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#191f28" strokeWidth="2" strokeLinecap="round">
                  <line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/>
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* 팝오버 드롭다운 */}
        {showPopover && <Popover onEdit={enterEditMode} onClose={() => setShowPopover(false)} />}
      </div>

      {/* ── 스크롤 본문 ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* 컬렉션 카드 가로 스크롤 */}
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '20px 16px 0', scrollbarWidth: 'none' }}>
          {collections.map((col) => (
            <CollectionCard
              key={col.id}
              label={col.name}
              isEditMode={isEditMode}
              recentItems={col.id === 'recent' ? recentlyViewed : []}
              onRename={() => openRename(col.id)}
            />
          ))}
          <CollectionCard label="새 컬렉션" isNew onPress={() => setBottomSheet('create')} />
        </div>

        {/* 저장한 매장 섹션 */}
        <div style={{ padding: '20px 16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 0 }}>
            <h2 style={{ fontFamily: SFPro, fontWeight: 700, fontSize: 20, lineHeight: '25px', color: 'rgba(0, 12, 30, 0.8)' }}>저장한 매장</h2>
          </div>
          {isEmpty ? (
            <EmptyState onAdd={() => onGoHome?.() } />
          ) : (
            <div>
              {stores.map((store) => (
                <StoreListItem
                  key={store.id}
                  store={store}
                  isEditMode={isEditMode}
                  isSelected={selectedStoreIds.has(store.id)}
                  onSelect={() => toggleSelectStore(store.id)}
                  onPress={() => onDetailOpen?.(store.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 편집 모드 하단 버튼 바 ── */}
      {isEditMode && (
        <div style={{ display: 'flex', gap: 10, padding: '12px 20px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', borderTop: '1px solid rgba(0, 0, 0, 0.06)', backgroundColor: '#ffffff' }}>
          {hasSelection ? (
            <>
              <button onClick={deleteSelected} style={{ flex: 1, padding: '14px 0', borderRadius: 12, fontFamily: SFPro, fontSize: 17, fontWeight: 590, backgroundColor: '#FF3B30', color: '#fff', border: 'none', cursor: 'pointer' }}>삭제</button>
              <button onClick={() => setBottomSheet('select-collection')} style={{ flex: 1, padding: '14px 0', borderRadius: 12, fontFamily: SFPro, fontSize: 17, fontWeight: 590, backgroundColor: '#3182F6', color: '#fff', border: 'none', cursor: 'pointer' }}>컬렉션 추가</button>
            </>
          ) : (
            <button onClick={exitEditMode} style={{ flex: 1, padding: '14px 0', borderRadius: 12, fontFamily: SFPro, fontSize: 17, fontWeight: 590, backgroundColor: '#F2F4F6', color: 'rgba(0, 19, 43, 0.58)', border: 'none', cursor: 'pointer' }}>완료</button>
          )}
        </div>
      )}

      {/* ── 바텀시트: 새 컬렉션 ── */}
      <BottomSheet isOpen={bottomSheet === 'create'} onClose={() => setBottomSheet(null)}>
        <div style={{ padding: '8px 20px 24px' }}>
          <h2 style={{ fontFamily: SFPro, fontWeight: 700, fontSize: 20, color: 'rgba(0, 12, 30, 0.8)', marginBottom: 20 }}>새 컬렉션</h2>
          <input
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="컬렉션명"
            maxLength={10}
            style={{ width: '100%', padding: '14px 16px', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: 12, fontFamily: SFPro, fontSize: 22, fontWeight: 590, color: 'rgba(0, 12, 30, 0.8)', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
          />
          <button onClick={createCollection} style={{ width: '100%', padding: '16px 0', borderRadius: 12, fontFamily: SFPro, fontSize: 17, fontWeight: 590, backgroundColor: newCollectionName.trim() ? '#3182F6' : '#F2F4F6', color: newCollectionName.trim() ? '#fff' : 'rgba(0, 19, 43, 0.35)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}>적용하기</button>
        </div>
      </BottomSheet>

      {/* ── 바텀시트: 컬렉션명 수정 ── */}
      <BottomSheet isOpen={bottomSheet === 'rename'} onClose={() => setBottomSheet(null)}>
        <div style={{ padding: '8px 20px 24px' }}>
          <h2 style={{ fontFamily: SFPro, fontWeight: 700, fontSize: 20, color: 'rgba(0, 12, 30, 0.8)', marginBottom: 20 }}>컬렉션명 수정</h2>
          <input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="컬렉션명"
            maxLength={10}
            autoFocus
            style={{ width: '100%', padding: '14px 16px', border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: 12, fontFamily: SFPro, fontSize: 22, fontWeight: 590, color: 'rgba(0, 12, 30, 0.8)', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
          />
          <button
            onClick={applyRename}
            disabled={!renameValue.trim() || renameValue.trim() === collections.find(c => c.id === renameTargetId)?.name}
            style={{ width: '100%', padding: '16px 0', borderRadius: 12, fontFamily: SFPro, fontSize: 17, fontWeight: 590, backgroundColor: (renameValue.trim() && renameValue.trim() !== collections.find(c => c.id === renameTargetId)?.name) ? '#3182F6' : '#F2F4F6', color: (renameValue.trim() && renameValue.trim() !== collections.find(c => c.id === renameTargetId)?.name) ? '#fff' : 'rgba(0, 19, 43, 0.35)', border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
          >적용하기</button>
        </div>
      </BottomSheet>

      {/* ── 바텀시트: 컬렉션 선택 ── */}
      <BottomSheet isOpen={bottomSheet === 'select-collection'} onClose={() => setBottomSheet(null)}>
        <div style={{ padding: '8px 20px 24px' }}>
          <h2 style={{ fontFamily: SFPro, fontWeight: 700, fontSize: 20, color: 'rgba(0, 12, 30, 0.8)', marginBottom: 20 }}>어디로 컬렉션을 추가할까요?</h2>
          <button onClick={() => setBottomSheet('create')} style={{ width: '100%', textAlign: 'left', padding: '16px 0', fontFamily: SFPro, fontSize: 17, fontWeight: 590, color: '#3182F6', background: 'none', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer' }}>+ 새 컬렉션 추가</button>
          {collections.filter((c) => c.id !== 'recent').map((col) => (
            <button key={col.id} style={{ width: '100%', textAlign: 'left', padding: '16px 0', fontFamily: SFPro, fontSize: 17, fontWeight: 510, color: 'rgba(0, 12, 30, 0.8)', background: 'none', border: 'none', borderBottom: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer' }}>{col.name}</button>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button onClick={() => setBottomSheet(null)} style={{ flex: 1, padding: '14px 0', borderRadius: 12, fontFamily: SFPro, fontSize: 17, fontWeight: 590, backgroundColor: '#F2F4F6', color: 'rgba(0, 19, 43, 0.58)', border: 'none', cursor: 'pointer' }}>닫기</button>
            <button onClick={() => { setBottomSheet(null); setSnackbar('added'); exitEditMode(); }} style={{ flex: 1, padding: '14px 0', borderRadius: 12, fontFamily: SFPro, fontSize: 17, fontWeight: 590, backgroundColor: '#3182F6', color: '#fff', border: 'none', cursor: 'pointer' }}>확인</button>
          </div>
        </div>
      </BottomSheet>

      {/* ── 스낵바 ── */}
      {snackbar === 'deleted' && <Snackbar message="매장을 삭제했어요" actionLabel="되돌리기" onAction={() => setSnackbar(null)} onDismiss={dismissSnackbar} />}
      {snackbar === 'added' && <Snackbar message="컬렉션에 담았어요" actionLabel="보러가기" onAction={() => setSnackbar(null)} onDismiss={dismissSnackbar} />}
      {snackbar === 'renamed' && <Snackbar message="컬렉션 이름이 변경되었어요" actionLabel="확인" onAction={() => setSnackbar(null)} onDismiss={dismissSnackbar} />}
    </div>
  );
}
