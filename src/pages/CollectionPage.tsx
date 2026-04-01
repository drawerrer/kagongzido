import { useState, useCallback } from 'react';
import SegmentedControl from '../components/SegmentedControl';
import BottomSheet from '../components/BottomSheet';
import Snackbar from '../components/Snackbar';

// ─── 타입 정의 ───────────────────────────────────────────────
interface Store {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  badge?: string;
}

interface Collection {
  id: string;
  name: string;
}

type BottomSheetType = null | 'create' | 'select-collection' | 'rename';
type SnackbarType = null | 'deleted' | 'added';

// ─── 목업 데이터 (나중에 API로 교체) ─────────────────────────
const MOCK_STORES: Store[] = [
  { id: '1', name: '간장공장공장장은장공장장', address: '서울특별시 어쩌구 저쩌로 182길', rating: 5, reviewCount: 2543, badge: '시간 제한 없음' },
  { id: '2', name: '영주빵집', address: '서울특별시 어쩌구 저쩌로 182길', rating: 5, reviewCount: 100, badge: '시간 제한 없음' },
  { id: '3', name: '채원콩', address: '서울특별시 어쩌구 저쩌로 182길', rating: 5, reviewCount: 21, badge: '시간 제한 없음' },
];

const MOCK_COLLECTIONS: Collection[] = [
  { id: 'recent', name: '최근' },
  { id: '1', name: '진짜 내 취향' },
];

const SEGMENT_TABS = ['카공', '두쫀쿠', '버터떡'];

// ─── 서브 컴포넌트: 컬렉션 카드 ──────────────────────────────
function CollectionCard({
  label,
  isNew = false,
  isSelected = false,
  isEditMode = false,
  onPress,
}: {
  label: string;
  isNew?: boolean;
  isSelected?: boolean;
  isEditMode?: boolean;
  onPress?: () => void;
}) {
  return (
    <button
      onClick={onPress}
      style={{
        width: 120,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: 'none',
        padding: 0,
        position: 'relative',
      }}
    >
      {/* 카드 이미지 영역 */}
      <div style={{
        width: 120,
        height: 120,
        borderRadius: 'var(--radius-md)',
        backgroundColor: isNew ? '#F2F4F6' : '#E8F0FE',
        border: isSelected ? '2px solid var(--color-primary)' : '2px solid transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {isNew ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 24, color: 'var(--color-text-tertiary)' }}>+</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)' }}>새 컬렉션</span>
          </div>
        ) : (
          <span style={{ fontSize: 32 }}>📁</span>
        )}
        {/* 편집 모드 선택 체크 */}
        {isEditMode && !isNew && (
          <div style={{
            position: 'absolute', top: 6, right: 6,
            width: 22, height: 22,
            borderRadius: '50%',
            backgroundColor: isSelected ? 'var(--color-primary)' : 'rgba(255,255,255,0.8)',
            border: `2px solid ${isSelected ? 'var(--color-primary)' : '#ccc'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isSelected && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
          </div>
        )}
      </div>
      {/* 카드 라벨 */}
      <span style={{
        fontSize: 'var(--font-size-md)',
        fontWeight: 600,
        color: 'var(--color-text-primary)',
        textAlign: 'left',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100%',
      }}>
        {label}
      </span>
    </button>
  );
}

// ─── 서브 컴포넌트: 매장 리스트 아이템 ───────────────────────
function StoreListItem({
  store,
  isEditMode = false,
  isSelected = false,
  onSelect,
}: {
  store: Store;
  isEditMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}) {
  return (
    <div
      onClick={isEditMode ? onSelect : undefined}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '14px 0',
        gap: 12,
        borderBottom: '1px solid var(--color-border)',
        cursor: isEditMode ? 'pointer' : 'default',
        backgroundColor: isSelected ? 'var(--color-primary-light)' : 'transparent',
        borderRadius: isSelected ? 'var(--radius-sm)' : 0,
        paddingLeft: isSelected ? 8 : 0,
        paddingRight: isSelected ? 8 : 0,
        transition: 'background-color 0.15s',
      }}
    >
      {/* 선택 체크박스 (편집 모드) */}
      {isEditMode && (
        <div style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
          border: `2px solid ${isSelected ? 'var(--color-primary)' : '#C5CAD2'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isSelected && <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>✓</span>}
        </div>
      )}
      {/* 썸네일 */}
      <div style={{
        width: 56, height: 56, borderRadius: 'var(--radius-sm)',
        backgroundColor: '#E8F0FE', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
      }}>☕</div>
      {/* 텍스트 정보 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 17, fontWeight: 600,
          color: 'var(--color-text-primary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 3,
        }}>{store.name}</p>
        <p style={{
          fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 5,
        }}>{store.address}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {/* 별점 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <span style={{ color: '#FFB800', fontSize: 12 }}>★</span>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              {store.rating} ({store.reviewCount.toLocaleString()})
            </span>
          </div>
          {/* 뱃지 */}
          {store.badge && (
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: 'var(--color-primary)',
              backgroundColor: 'var(--color-primary-light)',
              padding: '2px 6px', borderRadius: 4,
            }}>{store.badge}</span>
          )}
        </div>
      </div>
      {/* 더보기 버튼 (일반 모드) */}
      {!isEditMode && (
        <button style={{ padding: 8, color: 'var(--color-text-tertiary)', fontSize: 20 }}>···</button>
      )}
    </div>
  );
}

// ─── 서브 컴포넌트: 빈 상태 ───────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 24px', gap: 12,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        backgroundColor: '#F2F4F6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, marginBottom: 4,
      }}>📍</div>
      <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        아직 저장한 매장이 없어요
      </p>
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
        방문하고 싶은 매장을 편하게 관리하세요
      </p>
      <button
        onClick={onAdd}
        style={{
          marginTop: 8,
          padding: '13px 24px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--color-primary)',
          color: '#fff',
          fontSize: 17, fontWeight: 600,
          width: '100%',
        }}
      >
        매장 추가하기
      </button>
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────
export default function CollectionPage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeSegment, setActiveSegment] = useState(0);
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set());
  const [collections, setCollections] = useState<Collection[]>(MOCK_COLLECTIONS);
  const [stores] = useState<Store[]>(MOCK_STORES);
  const [bottomSheet, setBottomSheet] = useState<BottomSheetType>(null);
  const [snackbar, setSnackbar] = useState<SnackbarType>(null);
  const [newCollectionName, setNewCollectionName] = useState('');

  const isEmpty = stores.length === 0;
  const hasSelection = selectedStoreIds.size > 0;

  // 스낵바 닫기
  const dismissSnackbar = useCallback(() => setSnackbar(null), []);

  // 편집 모드 진입/종료
  const toggleEditMode = () => {
    setIsEditMode((v) => !v);
    setSelectedStoreIds(new Set());
  };

  // 매장 선택 토글
  const toggleSelectStore = (id: string) => {
    setSelectedStoreIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // 선택 매장 삭제
  const deleteSelected = () => {
    setIsEditMode(false);
    setSelectedStoreIds(new Set());
    setSnackbar('deleted');
  };

  // 새 컬렉션 만들기 확인
  const createCollection = () => {
    if (newCollectionName.trim()) {
      setCollections((prev) => [...prev, { id: Date.now().toString(), name: newCollectionName.trim() }]);
      setNewCollectionName('');
    }
    setBottomSheet(null);
    setSnackbar('added');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--color-surface)' }}>

      {/* ── 헤더 ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px 12px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <h1 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {isEditMode ? '편집 모드' : '위시 리스트'}
        </h1>
        {isEditMode ? (
          <button
            onClick={toggleEditMode}
            style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-primary)' }}
          >완료</button>
        ) : (
          <button
            onClick={toggleEditMode}
            style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}
          >편집</button>
        )}
      </div>

      {/* ── 스크롤 본문 ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

        {/* 컬렉션 카드 가로 스크롤 */}
        <div style={{
          display: 'flex', gap: 12, overflowX: 'auto',
          paddingBottom: 4, marginBottom: 28,
          scrollbarWidth: 'none',
        }}>
          {collections.map((col) => (
            <CollectionCard
              key={col.id}
              label={col.name}
              isEditMode={isEditMode}
            />
          ))}
          <CollectionCard
            label="새 컬렉션"
            isNew
            onPress={() => setBottomSheet('create')}
          />
        </div>

        {/* 저장한 매장 섹션 */}
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 14 }}>
            저장한 매장
          </h2>

          {/* 세그먼트 탭 */}
          <div style={{ marginBottom: 16 }}>
            <SegmentedControl
              tabs={SEGMENT_TABS}
              activeIndex={activeSegment}
              onChange={setActiveSegment}
            />
          </div>

          {/* 매장 목록 또는 빈 상태 */}
          {isEmpty ? (
            <EmptyState onAdd={() => alert('지도에서 매장을 추가해주세요')} />
          ) : (
            <div>
              {stores.map((store) => (
                <StoreListItem
                  key={store.id}
                  store={store}
                  isEditMode={isEditMode}
                  isSelected={selectedStoreIds.has(store.id)}
                  onSelect={() => toggleSelectStore(store.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 편집 모드 하단 버튼 바 ── */}
      {isEditMode && (
        <div style={{
          display: 'flex', gap: 10,
          padding: '12px 20px',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
        }}>
          <button
            onClick={deleteSelected}
            disabled={!hasSelection}
            style={{
              flex: 1, padding: '14px 0', borderRadius: 'var(--radius-md)',
              fontSize: 17, fontWeight: 600,
              backgroundColor: hasSelection ? '#FF3B30' : '#F2F4F6',
              color: hasSelection ? '#fff' : 'var(--color-text-tertiary)',
              transition: 'all 0.2s',
            }}
          >삭제</button>
          <button
            onClick={() => hasSelection && setBottomSheet('select-collection')}
            disabled={!hasSelection}
            style={{
              flex: 1, padding: '14px 0', borderRadius: 'var(--radius-md)',
              fontSize: 17, fontWeight: 600,
              backgroundColor: hasSelection ? 'var(--color-primary)' : '#F2F4F6',
              color: hasSelection ? '#fff' : 'var(--color-text-tertiary)',
              transition: 'all 0.2s',
            }}
          >컬렉션 추가</button>
        </div>
      )}

      {/* ── 바텀시트: 새 컬렉션 만들기 ── */}
      <BottomSheet isOpen={bottomSheet === 'create'} onClose={() => setBottomSheet(null)}>
        <div style={{ padding: '8px 20px 24px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: 'var(--color-text-primary)' }}>
            새 컬렉션
          </h2>
          <input
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="컬렉션명"
            style={{
              width: '100%', padding: '14px 16px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 22, fontWeight: 600,
              color: 'var(--color-text-primary)',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: 16,
            }}
          />
          <button
            onClick={createCollection}
            style={{
              width: '100%', padding: '16px 0',
              borderRadius: 'var(--radius-md)',
              backgroundColor: newCollectionName.trim() ? 'var(--color-primary)' : '#F2F4F6',
              color: newCollectionName.trim() ? '#fff' : 'var(--color-text-tertiary)',
              fontSize: 17, fontWeight: 600,
              transition: 'all 0.2s',
            }}
          >적용하기</button>
        </div>
      </BottomSheet>

      {/* ── 바텀시트: 컬렉션 선택 ── */}
      <BottomSheet isOpen={bottomSheet === 'select-collection'} onClose={() => setBottomSheet(null)}>
        <div style={{ padding: '8px 20px 24px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: 'var(--color-text-primary)' }}>
            어디로 컬렉션을 추가할까요?
          </h2>
          {/* 새 컬렉션 추가 옵션 */}
          <button
            onClick={() => { setBottomSheet('create'); }}
            style={{
              width: '100%', textAlign: 'left', padding: '16px 0',
              fontSize: 17, fontWeight: 600, color: 'var(--color-primary)',
              borderBottom: '1px solid var(--color-border)',
            }}
          >+ 새 컬렉션 추가</button>
          {/* 기존 컬렉션 목록 */}
          {collections.filter(c => c.id !== 'recent').map((col) => (
            <button
              key={col.id}
              style={{
                width: '100%', textAlign: 'left', padding: '16px 0',
                fontSize: 17, color: 'var(--color-text-primary)',
                borderBottom: '1px solid var(--color-border)',
              }}
            >{col.name}</button>
          ))}
          {/* 하단 버튼 */}
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              onClick={() => setBottomSheet(null)}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 'var(--radius-md)',
                backgroundColor: '#F2F4F6', fontSize: 17, fontWeight: 600,
                color: 'var(--color-text-secondary)',
              }}
            >닫기</button>
            <button
              onClick={() => { setBottomSheet(null); setSnackbar('added'); setIsEditMode(false); }}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)', fontSize: 17, fontWeight: 600, color: '#fff',
              }}
            >확인</button>
          </div>
        </div>
      </BottomSheet>

      {/* ── 스낵바 ── */}
      {snackbar === 'deleted' && (
        <Snackbar
          message="매장을 삭제했어요"
          actionLabel="되돌리기"
          onAction={() => setSnackbar(null)}
          onDismiss={dismissSnackbar}
        />
      )}
      {snackbar === 'added' && (
        <Snackbar
          message="컬렉션에 담았어요"
          actionLabel="보러가기"
          onAction={() => setSnackbar(null)}
          onDismiss={dismissSnackbar}
        />
      )}
    </div>
  );
}
