import { useState, useCallback } from 'react';
import BottomSheet from '../components/BottomSheet';
import Snackbar from '../components/Snackbar';

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
  photos?: string[]; // 최대 4장 (피그마: 80×80px 가로 스트립)
}

interface Collection {
  id: string;
  name: string;
}

type BottomSheetType = null | 'create' | 'select-collection';
type SnackbarType = null | 'deleted' | 'added';

// ─── 목업 데이터 ──────────────────────────────────────────────
const MOCK_STORES: Store[] = [
  {
    id: '1',
    name: '간장공장공장장은장공장장',
    address: '서울특별시 어쩌구 저쩌로 182길',
    rating: 5,
    reviewCount: 2543,
    badge: '시간 제한 없음',
    photos: ['', '', '', ''],
  },
  {
    id: '2',
    name: '영주빵집',
    address: '서울특별시 어쩌구 저쩌로 182길',
    rating: 5,
    reviewCount: 100,
    badge: '시간 제한 없음',
    photos: ['', '', '', ''],
  },
  {
    id: '3',
    name: '채원콩',
    address: '서울특별시 어쩌구 저쩌로 182길',
    rating: 5,
    reviewCount: 21,
    badge: '시간 제한 없음',
    photos: ['', '', '', ''],
  },
];

const MOCK_COLLECTIONS: Collection[] = [
  { id: 'recent', name: '최근' },
  { id: '1', name: '진짜 내 취향' },
];

// ─── 컬렉션 카드 ──────────────────────────────────────────────
// 피그마: 121×121px 이미지 + 아래 라벨 15px Semibold
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
        width: 121,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        position: 'relative',
        textAlign: 'left',
      }}
    >
      {/* 이미지 카드 — 피그마: 121×121px */}
      <div style={{
        width: 121,
        height: 121,
        border: isNew
          ? '1px solid #c5c5c5'
          : isSelected
          ? '2px solid #3182F6'
          : 'none',
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        backgroundColor: '#ffffff',
      }}>
        {isNew ? (
          // 새 컬렉션: + 아이콘 + "새 컬렉션" 텍스트
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 4,
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span style={{
              fontFamily: SFPro,
              fontWeight: 590,
              fontSize: 12,
              color: 'rgba(3, 24, 50, 0.46)',
              lineHeight: '22.5px',
            }}>새 컬렉션</span>
          </div>
        ) : (
          // 일반 컬렉션: 2×2 이미지 그리드 (피그마: 각 60×60px)
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 60px',
            gridTemplateRows: '60px 60px',
            width: 121,
            height: 121,
          }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ width: 60, height: 60, backgroundColor: '#E8EDF4' }} />
            ))}
          </div>
        )}

        {/* 편집 모드 체크 */}
        {isEditMode && !isNew && (
          <div style={{
            position: 'absolute', top: 6, right: 6,
            width: 22, height: 22, borderRadius: '50%',
            backgroundColor: isSelected ? '#3182F6' : 'rgba(255,255,255,0.85)',
            border: `2px solid ${isSelected ? '#3182F6' : '#C5CAD2'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isSelected && (
              <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                <path d="M1 4l3 3 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        )}
      </div>

      {/* 라벨 — 피그마: SF Pro Semibold 15, #191f28 */}
      {!isNew && (
        <span style={{
          fontFamily: SFPro,
          fontWeight: 590,
          fontSize: 15,
          color: '#191f28',
          lineHeight: '22.5px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          width: 121,
          display: 'block',
        }}>
          {label}
        </span>
      )}
    </button>
  );
}

// ─── 매장 리스트 아이템 ───────────────────────────────────────
// 피그마 구조: [텍스트 정보] 위 + [사진 4장 가로] 아래
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
        paddingTop: 12,
        paddingBottom: 12,
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        cursor: isEditMode ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>

        {/* 편집 모드 체크박스 */}
        {isEditMode && (
          <div style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            marginTop: 2,
            backgroundColor: isSelected ? '#3182F6' : 'transparent',
            border: `2px solid ${isSelected ? '#3182F6' : '#C5CAD2'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isSelected && (
              <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                <path d="M1 4l3 3 6-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        )}

        {/* 콘텐츠 전체 */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* ① 텍스트 정보 */}
          <div style={{ marginBottom: 10 }}>
            {/* 가게명 — 피그마: Bold 700, 17px, rgba(0,12,30,0.8) */}
            <p style={{
              fontFamily: SFPro,
              fontWeight: 700,
              fontSize: 17,
              lineHeight: '22.95px',
              color: 'rgba(0, 12, 30, 0.8)',
              marginBottom: 2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{store.name}</p>

            {/* 주소 — 피그마: Medium 510, 13px, rgba(0,19,43,0.58) */}
            <p style={{
              fontFamily: SFPro,
              fontWeight: 510,
              fontSize: 13,
              lineHeight: '17.55px',
              color: 'rgba(0, 19, 43, 0.58)',
              marginBottom: 5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>{store.address}</p>

            {/* 별점 + 리뷰수 + 뱃지 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                {/* 별 아이콘 — 피그마: 16×16px */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 1.5l1.647 3.337 3.682.535-2.664 2.597.629 3.666L8 9.75l-3.294 1.885.629-3.666L2.671 5.372l3.682-.535L8 1.5z"
                    fill="#FFB800"
                  />
                </svg>
                <span style={{
                  fontFamily: SFPro, fontWeight: 510, fontSize: 13,
                  color: 'rgba(0, 19, 43, 0.58)',
                }}>{store.rating}</span>
                <span style={{
                  fontFamily: SFPro, fontWeight: 510, fontSize: 13,
                  color: 'rgba(0, 19, 43, 0.58)',
                }}>({store.reviewCount.toLocaleString()})</span>
              </div>

              {/* 뱃지 — 피그마: bg rgba(0,27,55,0.1), borderRadius 9, 10px */}
              {store.badge && (
                <span style={{
                  fontFamily: SFPro, fontWeight: 590, fontSize: 10,
                  lineHeight: '15px',
                  color: 'rgba(3, 18, 40, 0.7)',
                  backgroundColor: 'rgba(0, 27, 55, 0.1)',
                  borderRadius: 9,
                  padding: '3px 7px',
                }}>{store.badge}</span>
              )}
            </div>
          </div>

          {/* ② 사진 4장 가로 — 피그마: 각 80×80px, gap 12px, borderRadius 12 */}
          {store.photos && store.photos.length > 0 && (
            <div style={{ display: 'flex', gap: 12 }}>
              {store.photos.slice(0, 4).map((photo, i) => (
                <div key={i} style={{
                  width: 80, height: 80, borderRadius: 12,
                  backgroundColor: '#E8EDF4', flexShrink: 0, overflow: 'hidden',
                }}>
                  {photo && (
                    <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 더보기 버튼 (일반 모드) */}
        {!isEditMode && (
          <button style={{
            padding: '0 4px', color: 'rgba(0, 19, 43, 0.35)',
            fontSize: 18, letterSpacing: 1,
            background: 'none', border: 'none', cursor: 'pointer',
            alignSelf: 'flex-start', marginTop: 2,
          }}>···</button>
        )}
      </div>
    </div>
  );
}

// ─── 빈 상태 ──────────────────────────────────────────────────
// 피그마: 텍스트 2줄 + "매장 추가하기" (165×48px, rgba(222,222,255,0.19))
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', paddingTop: 52, paddingBottom: 48,
    }}>
      <p style={{
        fontFamily: SFPro, fontWeight: 590, fontSize: 13,
        lineHeight: '22.5px', color: '#4e5968', marginBottom: 2,
      }}>아직 저장한 매장이 없어요</p>

      <p style={{
        fontFamily: SFPro, fontWeight: 590, fontSize: 13,
        lineHeight: '22.5px', color: '#4e5968',
        textAlign: 'center', marginBottom: 24,
      }}>방문하고 싶은 매장을 편하게 관리하세요</p>

      {/* 버튼 — 피그마: 165×48, rgba(222,222,255,0.19), #2365cf, borderRadius 14 */}
      <button
        onClick={onAdd}
        style={{
          width: 165, height: 48, borderRadius: 14,
          backgroundColor: 'rgba(222, 222, 255, 0.19)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{
          fontFamily: SFPro, fontWeight: 590, fontSize: 17,
          lineHeight: '21.28px', color: '#2365cf',
        }}>매장 추가하기</span>
      </button>
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────
export default function CollectionPage() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set());
  const [collections, setCollections] = useState<Collection[]>(MOCK_COLLECTIONS);
  const [stores] = useState<Store[]>(MOCK_STORES);
  const [bottomSheet, setBottomSheet] = useState<BottomSheetType>(null);
  const [snackbar, setSnackbar] = useState<SnackbarType>(null);
  const [newCollectionName, setNewCollectionName] = useState('');

  const isEmpty = stores.length === 0;
  const hasSelection = selectedStoreIds.size > 0;

  const dismissSnackbar = useCallback(() => setSnackbar(null), []);

  const toggleEditMode = () => {
    setIsEditMode((v) => !v);
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
    setIsEditMode(false);
    setSelectedStoreIds(new Set());
    setSnackbar('deleted');
  };

  const createCollection = () => {
    if (newCollectionName.trim()) {
      setCollections((prev) => [
        ...prev,
        { id: Date.now().toString(), name: newCollectionName.trim() },
      ]);
      setNewCollectionName('');
    }
    setBottomSheet(null);
    setSnackbar('added');
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', backgroundColor: '#ffffff',
    }}>

      {/* ── 헤더 ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px 12px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
      }}>
        <h1 style={{
          fontFamily: SFPro, fontWeight: 590, fontSize: 15,
          lineHeight: '22.5px', color: '#191f28',
        }}>
          {isEditMode ? '편집 모드' : '위시 리스트'}
        </h1>
        <button
          onClick={toggleEditMode}
          style={{
            fontFamily: SFPro,
            fontWeight: isEditMode ? 590 : 510,
            fontSize: isEditMode ? 17 : 13,
            color: isEditMode ? '#3182F6' : 'rgba(0, 19, 43, 0.58)',
            background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          {isEditMode ? '완료' : '편집'}
        </button>
      </div>

      {/* ── 스크롤 본문 ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* 컬렉션 카드 가로 스크롤 — 피그마: padding 12px, gap 10px */}
        <div style={{
          display: 'flex', gap: 10, overflowX: 'auto',
          padding: '12px 20px', scrollbarWidth: 'none',
        }}>
          {collections.map((col) => (
            <CollectionCard key={col.id} label={col.name} isEditMode={isEditMode} />
          ))}
          <CollectionCard label="새 컬렉션" isNew onPress={() => setBottomSheet('create')} />
        </div>

        {/* 저장한 매장 섹션 */}
        <div style={{ padding: '0 20px' }}>

          {/* 섹션 헤더 — 피그마: Bold 700, 20px, rgba(0,12,30,0.8), height 45 */}
          <div style={{ height: 45, display: 'flex', alignItems: 'center' }}>
            <h2 style={{
              fontFamily: SFPro, fontWeight: 700, fontSize: 20,
              lineHeight: '25px', color: 'rgba(0, 12, 30, 0.8)',
            }}>저장한 매장</h2>
          </div>

          {/* 매장 목록 or 빈 상태 */}
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
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          backgroundColor: '#ffffff',
        }}>
          <button
            onClick={deleteSelected}
            disabled={!hasSelection}
            style={{
              flex: 1, padding: '14px 0', borderRadius: 12,
              fontFamily: SFPro, fontSize: 17, fontWeight: 590,
              backgroundColor: hasSelection ? '#FF3B30' : '#F2F4F6',
              color: hasSelection ? '#fff' : 'rgba(0, 19, 43, 0.35)',
              border: 'none', cursor: hasSelection ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
          >삭제</button>
          <button
            onClick={() => hasSelection && setBottomSheet('select-collection')}
            disabled={!hasSelection}
            style={{
              flex: 1, padding: '14px 0', borderRadius: 12,
              fontFamily: SFPro, fontSize: 17, fontWeight: 590,
              backgroundColor: hasSelection ? '#3182F6' : '#F2F4F6',
              color: hasSelection ? '#fff' : 'rgba(0, 19, 43, 0.35)',
              border: 'none', cursor: hasSelection ? 'pointer' : 'default',
              transition: 'all 0.2s',
            }}
          >컬렉션 추가</button>
        </div>
      )}

      {/* ── 바텀시트: 새 컬렉션 ── */}
      <BottomSheet isOpen={bottomSheet === 'create'} onClose={() => setBottomSheet(null)}>
        <div style={{ padding: '8px 20px 24px' }}>
          <h2 style={{
            fontFamily: SFPro, fontWeight: 700, fontSize: 20,
            color: 'rgba(0, 12, 30, 0.8)', marginBottom: 20,
          }}>새 컬렉션</h2>
          <input
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="컬렉션명"
            style={{
              width: '100%', padding: '14px 16px',
              border: '1px solid rgba(0, 0, 0, 0.1)', borderRadius: 12,
              fontFamily: SFPro, fontSize: 22, fontWeight: 590,
              color: 'rgba(0, 12, 30, 0.8)', outline: 'none',
              boxSizing: 'border-box', marginBottom: 16,
            }}
          />
          <button
            onClick={createCollection}
            style={{
              width: '100%', padding: '16px 0', borderRadius: 12,
              fontFamily: SFPro, fontSize: 17, fontWeight: 590,
              backgroundColor: newCollectionName.trim() ? '#3182F6' : '#F2F4F6',
              color: newCollectionName.trim() ? '#fff' : 'rgba(0, 19, 43, 0.35)',
              border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            }}
          >적용하기</button>
        </div>
      </BottomSheet>

      {/* ── 바텀시트: 컬렉션 선택 ── */}
      <BottomSheet isOpen={bottomSheet === 'select-collection'} onClose={() => setBottomSheet(null)}>
        <div style={{ padding: '8px 20px 24px' }}>
          <h2 style={{
            fontFamily: SFPro, fontWeight: 700, fontSize: 20,
            color: 'rgba(0, 12, 30, 0.8)', marginBottom: 20,
          }}>어디로 컬렉션을 추가할까요?</h2>

          <button
            onClick={() => setBottomSheet('create')}
            style={{
              width: '100%', textAlign: 'left', padding: '16px 0',
              fontFamily: SFPro, fontSize: 17, fontWeight: 590, color: '#3182F6',
              background: 'none', border: 'none',
              borderBottom: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer',
            }}
          >+ 새 컬렉션 추가</button>

          {collections.filter((c) => c.id !== 'recent').map((col) => (
            <button
              key={col.id}
              style={{
                width: '100%', textAlign: 'left', padding: '16px 0',
                fontFamily: SFPro, fontSize: 17, fontWeight: 510,
                color: 'rgba(0, 12, 30, 0.8)',
                background: 'none', border: 'none',
                borderBottom: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer',
              }}
            >{col.name}</button>
          ))}

          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              onClick={() => setBottomSheet(null)}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 12,
                fontFamily: SFPro, fontSize: 17, fontWeight: 590,
                backgroundColor: '#F2F4F6', color: 'rgba(0, 19, 43, 0.58)',
                border: 'none', cursor: 'pointer',
              }}
            >닫기</button>
            <button
              onClick={() => { setBottomSheet(null); setSnackbar('added'); setIsEditMode(false); }}
              style={{
                flex: 1, padding: '14px 0', borderRadius: 12,
                fontFamily: SFPro, fontSize: 17, fontWeight: 590,
                backgroundColor: '#3182F6', color: '#fff',
                border: 'none', cursor: 'pointer',
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
