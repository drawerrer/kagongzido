import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Snackbar from '../components/Snackbar';
import { useFavorites } from '../context/FavoritesContext';

const SFPro = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif';

// ─── 타입 ─────────────────────────────────────────────────────
interface MockStore {
  id: string;
  district: string;
  name: string;
  seats: number;
  outlet: '충분' | '보통' | '적음';
  gradient: [string, string];
}

interface MockGuidebook {
  id: string;
  title: string;
  subtitle: string;
  count: number;
  gradient: [string, string];
  stores: MockStore[];
}

type GuideView = 'main' | 'detail' | 'past';

// ─── 목 데이터 ────────────────────────────────────────────────
const FEATURE_STORES: MockStore[] = [
  { id: 'gs1', district: '서울 영등포구', name: '도트커피', seats: 15, outlet: '충분', gradient: ['#C4A882', '#7A5A3C'] },
  { id: 'gs2', district: '서울 마포구', name: '프릳츠 커피', seats: 20, outlet: '보통', gradient: ['#A89276', '#5E4030'] },
  { id: 'gs3', district: '서울 성동구', name: '어니언', seats: 30, outlet: '충분', gradient: ['#9B8B7A', '#4A3A2C'] },
  { id: 'gs4', district: '서울 강남구', name: '오르에르', seats: 25, outlet: '충분', gradient: ['#C8B8A2', '#6E5E4C'] },
  { id: 'gs5', district: '경기 성남시', name: '스탠딩커피', seats: 10, outlet: '적음', gradient: ['#B0A090', '#5A4A3C'] },
];

const FEATURED: MockGuidebook = {
  id: 'featured',
  title: '서울 근교\n신상 카페',
  subtitle: '커피에 진심인 바리스타의 스페셜티 로스터리',
  count: 5,
  gradient: ['#C4A882', '#5A3C24'],
  stores: FEATURE_STORES,
};

const PAST_GUIDEBOOKS: MockGuidebook[] = [
  { id: 'p1', title: '빵 냄새 가득\n포근한 분위기', subtitle: '따뜻하고 아늑한 베이커리 카페 모음', count: 5, gradient: ['#C4A882', '#8B6B4A'], stores: FEATURE_STORES },
  { id: 'p2', title: '햇볕은 쨍쨍\n바람은 살랑살랑', subtitle: '뷰 맛집 야외 테라스 카페', count: 4, gradient: ['#87CEEB', '#3A80C0'], stores: FEATURE_STORES },
  { id: 'p3', title: '나만 알고싶은\n카페', subtitle: '숨은 보석 같은 카페들', count: 6, gradient: ['#D4B8A0', '#7A5A42'], stores: FEATURE_STORES },
  { id: 'p4', title: '화이트와 우드톤의\n만남', subtitle: '감성 인테리어 카페 큐레이션', count: 5, gradient: ['#E8DDD0', '#B0A090'], stores: FEATURE_STORES },
  { id: 'p5', title: '집중력 가득', subtitle: '카공하기 딱 좋은 조용한 카페', count: 7, gradient: ['#4A4042', '#1A181C'], stores: FEATURE_STORES },
];

// ─── 공통 네비게이션 바 ───────────────────────────────────────
function NavBar({ onBack, onClose }: { onBack?: () => void; onClose?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', height: 44, borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0, backgroundColor: '#fff' }}>
      {/* Left: 뒤로가기 + 앱 아이콘 + 앱명 */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
        <button
          onClick={onBack}
          style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#191f28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: 5, backgroundColor: '#3182F6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 9, lineHeight: '1' }}>☕</span>
          </div>
          <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 15, color: '#191F28' }}>카공지도</span>
        </div>
      </div>
      {/* Right: Fixed Icon Area 필 컨테이너 (TDS component/navigation~~) */}
      <div style={{ paddingRight: 8, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 34, borderRadius: 99, backgroundColor: 'rgba(0,23,51,0.02)', overflow: 'hidden' }}>
          <button style={{ width: 46, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="#191f28">
              <circle cx="4" cy="10" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="16" cy="10" r="1.5"/>
            </svg>
          </button>
          <div style={{ width: 1, height: 16, backgroundColor: 'rgba(0,27,55,0.1)', flexShrink: 0 }} />
          <button onClick={onClose} style={{ width: 46, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#191f28" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── GuideBook/Main — 메인 큐레이션 카드 화면 ─────────────────
function GuideBookMainView({
  guidebook,
  onCardPress,
  onPastPress,
}: {
  guidebook: MockGuidebook;
  onCardPress: () => void;
  onPastPress: () => void;
}) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fff' }}>
      {/* 메인 큐레이션 카드 — 풀스크린 하이라이트 */}
      <div style={{ padding: '20px 16px 0' }}>
        <button
          onClick={onCardPress}
          style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', display: 'block' }}
        >
          <div style={{
            width: '100%',
            height: 460,
            borderRadius: 20,
            overflow: 'hidden',
            position: 'relative',
            background: `linear-gradient(160deg, ${guidebook.gradient[0]}, ${guidebook.gradient[1]})`,
          }}>
            {/* 딤 오버레이 — Top 33% 투명 → Bottom 100% 어둡게 */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0) 33%, rgba(23,20,20,0.92) 100%)',
            }} />
            {/* 텍스트 오버레이 */}
            <div style={{ position: 'absolute', bottom: 28, left: 24 }}>
              <p style={{
                fontFamily: SFPro, fontWeight: 700, fontSize: 30, lineHeight: '38px',
                color: '#fff', whiteSpace: 'pre-line', marginBottom: 10,
              }}>
                {guidebook.title}
              </p>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 99,
                padding: '4px 12px',
              }}>
                <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 13, color: '#fff' }}>
                  {guidebook.count} places
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* 지난 가이드북 링크 */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 32 }}>
        <button
          onClick={onPastPress}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px' }}
        >
          <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 15, color: '#191F28' }}>지난 가이드북</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#191F28" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 4 10 8 6 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── GuideBook/Main/Detail — 무한 수평 스크롤 캐러셀 화면 ────
// 버티컬 스크롤 없음 / 중앙 카드 크게·좌우 작게 / 무한 루프
const CARD_W = 261;
const CARD_H = 360;
const CARD_H_INACTIVE = 354; // 좌우 3px씩 작음
const CARD_GAP = 20;
const CAROUSEL_PADDING = (375 - CARD_W) / 2; // 57px — 중앙 카드가 화면 정중앙
const ITEM_W = CARD_W + CARD_GAP;

function GuideBookDetailView({
  guidebook,
  onDetailOpen,
  onSave,
}: {
  guidebook: MockGuidebook;
  onDetailOpen?: (id: string) => void;
  onSave: (store: MockStore) => void;
}) {
  const stores = guidebook.stores;

  // 무한 루프용 3중 배열 (앞·중간·뒤 각 1세트씩)
  const loopedStores = useMemo(() => [...stores, ...stores, ...stores], [stores]);

  // absIndex: loopedStores 기준 현재 중앙 카드 인덱스 (중간 세트부터 시작)
  const [absIndex, setAbsIndex] = useState(stores.length);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRepositioning = useRef(false);

  // 마우스 드래그 스크롤 (데스크탑 테스트용)
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    dragStartX.current = e.pageX;
    dragScrollLeft.current = scrollRef.current.scrollLeft;
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.userSelect = 'none';
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const dx = e.pageX - dragStartX.current;
    scrollRef.current.scrollLeft = dragScrollLeft.current - dx;
  }, []);

  const onMouseUp = useCallback(() => {
    if (!scrollRef.current) return;
    isDragging.current = false;
    scrollRef.current.style.cursor = 'grab';
    scrollRef.current.style.removeProperty('user-select');
  }, []);

  // 가이드북 바뀔 때 초기화
  useEffect(() => {
    setAbsIndex(stores.length);
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = stores.length * ITEM_W;
    }
  }, [guidebook.id, stores.length]);

  const handleScroll = useCallback(() => {
    if (isRepositioning.current || !scrollRef.current) return;
    const el = scrollRef.current;
    const newAbs = Math.round(el.scrollLeft / ITEM_W);
    setAbsIndex(newAbs);

    // 스크롤 멈춘 뒤 필요하면 중간 세트로 순간이동 (무한 루프 효과)
    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      if (!scrollRef.current || isRepositioning.current) return;
      const curAbs = Math.round(scrollRef.current.scrollLeft / ITEM_W);
      if (curAbs < stores.length) {
        isRepositioning.current = true;
        const next = scrollRef.current.scrollLeft + stores.length * ITEM_W;
        scrollRef.current.scrollLeft = next;
        setAbsIndex(Math.round(next / ITEM_W));
        setTimeout(() => { isRepositioning.current = false; }, 80);
      } else if (curAbs >= stores.length * 2) {
        isRepositioning.current = true;
        const next = scrollRef.current.scrollLeft - stores.length * ITEM_W;
        scrollRef.current.scrollLeft = next;
        setAbsIndex(Math.round(next / ITEM_W));
        setTimeout(() => { isRepositioning.current = false; }, 80);
      }
    }, 200);
  }, [stores.length]);

  // 현재 중앙 카드에 해당하는 실제 스토어 인덱스
  const currentStoreIndex = ((absIndex % stores.length) + stores.length) % stores.length;
  const store = stores[currentStoreIndex];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff', overflow: 'hidden' }}>

      {/* 섹션명 — 큐레이션 이름 + 장소 수 */}
      <div style={{ paddingTop: 16, paddingBottom: 12, textAlign: 'center', flexShrink: 0 }}>
        <p style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 15, color: '#191F28', lineHeight: '23px' }}>
          {guidebook.title.replace('\n', ' ')}
        </p>
        <p style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.45)', marginTop: 2 }}>
          {guidebook.count} places
        </p>
      </div>

      {/* 수평 무한 캐러셀 — 중앙 크게, 좌우 3px 작게, 버티컬 센터 */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        <style>{`.guide-carousel::-webkit-scrollbar { display: none; }`}</style>
        <div
          ref={scrollRef}
          className="guide-carousel"
          onScroll={handleScroll}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: CARD_GAP,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            paddingLeft: CAROUSEL_PADDING,
            paddingRight: CAROUSEL_PADDING,
            scrollbarWidth: 'none',
            width: '100%',
            boxSizing: 'border-box',
            cursor: 'grab',
          }}
        >
          {loopedStores.map((s, i) => {
            const isActive = i === absIndex;
            return (
              <div
                key={i}
                style={{
                  width: CARD_W,
                  height: isActive ? CARD_H : CARD_H_INACTIVE,
                  flexShrink: 0,
                  scrollSnapAlign: 'center',
                  borderRadius: 16,
                  overflow: 'hidden',
                  position: 'relative',
                  background: `linear-gradient(160deg, ${s.gradient[0]}, ${s.gradient[1]})`,
                  transition: 'height 0.25s ease',
                }}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(23,20,20,0.6) 100%)' }} />
                {/* 페이지네이션 점 — 중앙 카드에만 */}
                {isActive && (
                  <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
                    {stores.map((_, di) => (
                      <div key={di} style={{
                        width: di === currentStoreIndex ? 18 : 6,
                        height: 6,
                        borderRadius: 99,
                        backgroundColor: di === currentStoreIndex ? '#fff' : 'rgba(255,255,255,0.45)',
                        transition: 'all 0.25s ease',
                      }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 카페 디테일 — 현재 중앙 이미지에 해당하는 정보 */}
      <div style={{ flexShrink: 0, padding: '16px 16px 0', textAlign: 'center' }}>
        <p style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.45)', marginBottom: 4 }}>
          {store.district}
        </p>
        <p style={{ fontFamily: SFPro, fontWeight: 700, fontSize: 20, color: '#191F28', lineHeight: '27px', marginBottom: 10 }}>
          {store.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C6.34 2 5 3.34 5 5v1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1V5c0-1.66-1.34-3-3-3z" fill="rgba(0,19,43,0.45)"/>
            </svg>
            <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)' }}>좌석</span>
            <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 13, color: '#191F28' }}>{store.seats}석</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2v3H4l2 3H5l2 4 1-3h1l-2-3h2L6 2z" fill="rgba(0,19,43,0.45)"/>
            </svg>
            <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)' }}>콘센트</span>
            <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 13, color: '#191F28' }}>{store.outlet}</span>
          </div>
        </div>
        {/* 퀵 액션 칩 — 고정 텍스트 / 해당 카페 상세로 이동 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {(['길찾기', '리뷰보기', '저장하기'] as const).map((label) => (
            <button
              key={label}
              onClick={() => {
                if (label === '저장하기') onSave(store);
                else onDetailOpen?.(store.id);
              }}
              style={{
                padding: '7px 14px',
                borderRadius: 99,
                backgroundColor: 'rgba(0,27,55,0.06)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: SFPro,
                fontWeight: 510,
                fontSize: 13,
                color: '#191F28',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* CTA — 현재 중앙 카페 상세 페이지로 이동 */}
      <div style={{ flexShrink: 0, padding: '14px 16px', paddingBottom: 'calc(14px + env(safe-area-inset-bottom))' }}>
        <button
          onClick={() => onDetailOpen?.(store.id)}
          style={{
            width: '100%',
            height: 52,
            borderRadius: 14,
            backgroundColor: 'rgba(0,12,30,0.82)',
            border: 'none',
            cursor: 'pointer',
            fontFamily: SFPro,
            fontWeight: 590,
            fontSize: 17,
            color: '#fff',
          }}
        >
          자세히보기
        </button>
      </div>
    </div>
  );
}

// ─── GuideBook/Past — 지난 가이드북 그리드 ───────────────────
function GuideBookPastView({
  guidebooks,
  onCardPress,
}: {
  guidebooks: MockGuidebook[];
  onCardPress: (g: MockGuidebook) => void;
}) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fff' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        padding: 12,
      }}>
        {guidebooks.map((g) => (
          <button
            key={g.id}
            onClick={() => onCardPress(g)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', display: 'block' }}
          >
            <div style={{
              width: '100%',
              aspectRatio: '1 / 1.3',
              borderRadius: 14,
              overflow: 'hidden',
              position: 'relative',
              background: `linear-gradient(160deg, ${g.gradient[0]}, ${g.gradient[1]})`,
            }}>
              {/* 그라디언트 오버레이 */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 33%, rgba(0,0,0,0.72) 100%)' }} />
              {/* 텍스트 */}
              <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
                <p style={{
                  fontFamily: SFPro, fontWeight: 700, fontSize: 14, lineHeight: '19px',
                  color: '#fff', whiteSpace: 'pre-line', marginBottom: 5,
                }}>
                  {g.title}
                </p>
                <p style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
                  {g.count} places
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 메인 페이지 ──────────────────────────────────────────────
export default function GuidebookPage({
  onDetailOpen,
  onBack,
  onClose,
}: {
  onDetailOpen?: (id: string) => void;
  onBack?: () => void;
  onClose?: () => void;
}) {
  const { addFavorite, isFavorited } = useFavorites();
  const [view, setView] = useState<GuideView>('main');
  const [activeGuidebook, setActiveGuidebook] = useState<MockGuidebook>(FEATURED);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const dismissSnackbar = useCallback(() => setSnackbar(null), []);

  const handleBack = () => {
    if (view !== 'main') {
      setView('main');
    } else {
      onBack?.();
    }
  };

  const handleSave = (store: MockStore) => {
    if (!isFavorited(store.id)) {
      addFavorite({
        id: store.id,
        name: store.name,
        address: store.district,
        rating: 0,
        reviewCount: 0,
      });
    }
    setSnackbar('모음집에 담았어요');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff' }}>
      <NavBar onBack={handleBack} onClose={onClose ?? onBack} />

      {view === 'main' && (
        <GuideBookMainView
          guidebook={FEATURED}
          onCardPress={() => { setActiveGuidebook(FEATURED); setView('detail'); }}
          onPastPress={() => setView('past')}
        />
      )}
      {view === 'detail' && (
        <GuideBookDetailView
          guidebook={activeGuidebook}
          onDetailOpen={onDetailOpen}
          onSave={handleSave}
        />
      )}
      {view === 'past' && (
        <GuideBookPastView
          guidebooks={PAST_GUIDEBOOKS}
          onCardPress={(g) => { setActiveGuidebook(g); setView('detail'); }}
        />
      )}

      {snackbar && <Snackbar message={snackbar} onDismiss={dismissSnackbar} />}
    </div>
  );
}
