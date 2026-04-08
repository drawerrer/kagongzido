import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Snackbar from '../components/Snackbar';
import ShareSheet from '../components/ShareSheet';
import { useFavorites } from '../context/FavoritesContext';
import NavBar from '../components/NavBar';

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
  gradient: ['#C4A882', '#5A3C24'],
  stores: FEATURE_STORES,
};

const PAST_GUIDEBOOKS: MockGuidebook[] = [
  { id: 'p1', title: '빵 냄새 가득\n포근한 분위기', subtitle: '따뜻하고 아늑한 베이커리 카페 모음', gradient: ['#C4A882', '#8B6B4A'], stores: FEATURE_STORES },
  { id: 'p2', title: '햇볕은 쨍쨍\n바람은 살랑살랑', subtitle: '뷰 맛집 야외 테라스 카페', gradient: ['#87CEEB', '#3A80C0'], stores: FEATURE_STORES },
  { id: 'p3', title: '나만 알고싶은\n카페', subtitle: '숨은 보석 같은 카페들', gradient: ['#D4B8A0', '#7A5A42'], stores: FEATURE_STORES },
  { id: 'p4', title: '화이트와 우드톤의\n만남', subtitle: '감성 인테리어 카페 큐레이션', gradient: ['#E8DDD0', '#B0A090'], stores: FEATURE_STORES },
  { id: 'p5', title: '집중력 가득', subtitle: '카공하기 딱 좋은 조용한 카페', gradient: ['#4A4042', '#1A181C'], stores: FEATURE_STORES },
];


// ─── GuideBook/Main — 메인 큐레이션 카드 화면 ─────────────────
// Figma: card cornerRadius=6, height=500, padding=30px, title=28px/590
//        count="5 places" 18px no pill, "지난 가이드북" 18px #333333
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
      {/* 메인 큐레이션 카드 — 피그마: padding 75px top, 30px horizontal */}
      <div style={{ paddingTop: 75, paddingLeft: 30, paddingRight: 30 }}>
        <button
          onClick={onCardPress}
          style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', display: 'block' }}
        >
          <div style={{
            width: '100%',
            height: 500,
            borderRadius: 6,
            overflow: 'hidden',
            position: 'relative',
            background: `linear-gradient(160deg, ${guidebook.gradient[0]}, ${guidebook.gradient[1]})`,
          }}>
            {/* 딤 오버레이 — Top 33% 투명 → Bottom 56% 어둡게 */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0) 33%, rgba(23,20,20,0.92) 100%)',
            }} />
            {/* 텍스트 오버레이 — 피그마: bottom 28, left 24 */}
            <div style={{ position: 'absolute', bottom: 28, left: 24 }}>
              {/* 제목 — 28px/590, 줄바꿈 */}
              <p style={{
                fontFamily: SFPro,
                fontWeight: 590,
                fontSize: 28,
                lineHeight: '33.4px',
                color: '#fff',
                whiteSpace: 'pre-line',
                marginBottom: 8,
              }}>
                {guidebook.title}
              </p>
              {/* count — 18px/400, 배경 없음 */}
              <span style={{
                fontFamily: SFPro,
                fontWeight: 400,
                fontSize: 18,
                color: '#fff',
              }}>
                {guidebook.stores.length} places
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* 지난 가이드북 링크 — 피그마: 20px 아래, 가운데 정렬, 18px/590 #333333 */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 20 }}>
        <button
          onClick={onPastPress}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '12px 16px' }}
        >
          <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 18, color: '#333333' }}>지난 가이드북</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#333333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 4 10 8 6 12"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── GuideBook/Main/Detail — 수평 캐러셀 화면 ────────────────
// Figma: bg #f2f4f6, card cornerRadius=6, active 261×373, inactive 258×365
//        dots 6×6 (active #6b7684, inactive #d9d9d9)
//        address 12px #6b7684, storename 20px #000
//        info label 14px/510 #000, value 14px/400 #777777
//        buttons radius=8, height=32, bg rgba(7,25,76,0.05), text 13px/590 rgba(3,18,40,0.7)
//        CTA: height=56, radius=16, bg #4e5968, gradient fade

const CARD_W = 261;
const CARD_H = 373;
const CARD_H_INACTIVE = 365;
const CARD_GAP = 20;
const CAROUSEL_PADDING = (375 - CARD_W) / 2; // 57px — 중앙 카드 화면 정중앙
const ITEM_W = CARD_W + CARD_GAP;

function GuideBookDetailView({
  guidebook,
  onDetailOpen,
  onDetailOpenToReview,
  onDirectionsOpen,
  onSave,
  initialStoreIndex,
  onStoreIndexChange,
}: {
  guidebook: MockGuidebook;
  onDetailOpen?: (id: string) => void;
  onDetailOpenToReview?: (id: string) => void;
  onDirectionsOpen?: (id: string) => void;
  onSave: (store: MockStore) => void;
  initialStoreIndex?: number;
  onStoreIndexChange?: (index: number) => void;
}) {
  const stores = guidebook.stores;

  // 무한 루프용 3중 배열
  const loopedStores = useMemo(() => [...stores, ...stores, ...stores], [stores]);

  const [absIndex, setAbsIndex] = useState(stores.length + (initialStoreIndex ?? 0));
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRepositioning = useRef(false);

  // 마우스 드래그 (데스크탑 테스트용)
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

  // 마운트 시 초기 스크롤
  useEffect(() => {
    const startAbs = stores.length + (initialStoreIndex ?? 0);
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = startAbs * ITEM_W;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const currentStoreIndex = ((absIndex % stores.length) + stores.length) % stores.length;

  useEffect(() => {
    onStoreIndexChange?.(currentStoreIndex);
  }, [currentStoreIndex, onStoreIndexChange]);

  const store = stores[currentStoreIndex];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f2f4f6', overflow: 'hidden' }}>

      {/* 헤더 — 피그마: 61px, 가이드북명 14px/590 + n places 14px/400 */}
      <div style={{ height: 61, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <p style={{
          fontFamily: SFPro, fontWeight: 590, fontSize: 14, color: '#000000',
          lineHeight: '22.5px', marginBottom: 2,
        }}>
          {guidebook.title.replace('\n', ' ')}
        </p>
        <p style={{ fontFamily: SFPro, fontWeight: 400, fontSize: 14, color: '#000000' }}>
          {guidebook.stores.length} places
        </p>
      </div>

      {/* 수평 무한 캐러셀 — 피그마: 413px 영역, 중앙 크게·좌우 작게 */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
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
                  borderRadius: 6,
                  overflow: 'hidden',
                  position: 'relative',
                  background: `linear-gradient(160deg, ${s.gradient[0]}, ${s.gradient[1]})`,
                  transition: 'height 0.25s ease',
                }}
              >
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 33%, rgba(23,20,20,0.56) 100%)' }} />
                {/* 페이지네이션 점 — 피그마: 6×6, active #6b7684, inactive #d9d9d9 */}
                {isActive && (
                  <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
                    {stores.map((_, di) => (
                      <div key={di} style={{
                        width: 6,
                        height: 6,
                        borderRadius: 99,
                        backgroundColor: di === currentStoreIndex ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
                        transition: 'background-color 0.25s ease',
                      }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 카페 정보 — 피그마: 132px, 중앙 정렬, padding 0 50px */}
      <div style={{
        flexShrink: 0,
        height: 132,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 50px',
      }}>
        {/* 주소 — 12px/510 #6b7684 */}
        <p style={{
          fontFamily: SFPro, fontWeight: 510, fontSize: 12,
          color: '#6b7684', textAlign: 'center',
          lineHeight: '22.5px', marginBottom: 0,
        }}>
          {store.district}
        </p>
        {/* 매장명 — 20px/590 #000 */}
        <p style={{
          fontFamily: SFPro, fontWeight: 590, fontSize: 20,
          color: '#000000', textAlign: 'center',
          lineHeight: '22.5px', marginBottom: 12,
        }}>
          {store.name}
        </p>

        {/* 정보 행 — 좌석/콘센트 — 14px, 라벨 510 #000, 값 400 #777 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M5 2v2H3.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5H4v1l-1 5h1l.5-2.5h3L8 12h1L8 7v-1h.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H7V2H5zm2 3.5H5.5V4h1.5v1.5z" fill="rgba(0,0,0,0.45)"/>
            </svg>
            <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 14, color: '#000000' }}>좌석</span>
            <span style={{ fontFamily: SFPro, fontWeight: 400, fontSize: 14, color: '#777777' }}>{store.seats}석</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M6 1v3H4l2 3H5l2 4 1-3h1l-2-3h2L6 1z" fill="rgba(0,0,0,0.45)"/>
            </svg>
            <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 14, color: '#000000' }}>콘센트</span>
            <span style={{ fontFamily: SFPro, fontWeight: 400, fontSize: 14, color: '#777777' }}>{store.outlet}</span>
          </div>
        </div>

        {/* 퀵 액션 버튼 — 피그마: radius=8, height=32, bg rgba(7,25,76,0.05), 13px/590 */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['길찾기', '리뷰보기', '저장하기'] as const).map((label) => (
            <button
              key={label}
              onClick={() => {
                if (label === '저장하기') onSave(store);
                else if (label === '리뷰보기') onDetailOpenToReview?.(store.id);
                else if (label === '길찾기') onDirectionsOpen?.(store.id);
                else onDetailOpen?.(store.id);
              }}
              style={{
                height: 32,
                padding: '0 14px',
                borderRadius: 8,
                backgroundColor: 'rgba(7,25,76,0.05)',
                border: 'none',
                cursor: 'pointer',
                fontFamily: SFPro,
                fontWeight: 590,
                fontSize: 13,
                color: 'rgba(3,18,40,0.7)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 하단 CTA — 피그마: 그라디언트 페이드 36px + 흰 컨테이너 76px */}
      <div style={{ flexShrink: 0 }}>
        {/* 그라디언트 페이드 — rgba(255,255,255,0) → #ffffff */}
        <div style={{
          height: 36,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0), #ffffff)',
        }} />
        {/* 흰색 컨테이너 + 버튼 */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '0 20px',
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
        }}>
          <button
            onClick={() => onDetailOpen?.(store.id)}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 16,
              backgroundColor: '#4e5968',
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
    </div>
  );
}

// ─── GuideBook/Past — 지난 가이드북 그리드 ───────────────────
// Figma: padding=20px, gap=16px, card radius=4, title 16px/590, count 9px/400
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
        gap: 16,
        padding: 20,
      }}>
        {guidebooks.map((g) => (
          <button
            key={g.id}
            onClick={() => onCardPress(g)}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', display: 'block' }}
          >
            <div style={{
              width: '100%',
              aspectRatio: '159 / 232',
              borderRadius: 4,
              overflow: 'hidden',
              position: 'relative',
              background: `linear-gradient(160deg, ${g.gradient[0]}, ${g.gradient[1]})`,
            }}>
              {/* 딤 오버레이 */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 33%, rgba(23,20,20,0.56) 100%)' }} />
              {/* 텍스트 — 피그마: bottom~16px, left 16px */}
              <div style={{ position: 'absolute', bottom: 16, left: 16, right: 8 }}>
                {/* 제목 — 16px/590 white */}
                <p style={{
                  fontFamily: SFPro,
                  fontWeight: 590,
                  fontSize: 16,
                  lineHeight: '19px',
                  color: '#fff',
                  whiteSpace: 'pre-line',
                  marginBottom: 4,
                }}>
                  {g.title}
                </p>
                {/* count — 9px/400 white */}
                <p style={{
                  fontFamily: SFPro,
                  fontWeight: 400,
                  fontSize: 9,
                  color: '#fff',
                }}>
                  {g.stores.length} places
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
  onDetailOpenToReview,
  onDirectionsOpen,
  onBack,
  onClose,
  initialView,
  onViewChange,
  initialStoreIndex,
  onStoreIndexChange,
}: {
  onDetailOpen?: (id: string) => void;
  onDetailOpenToReview?: (id: string) => void;
  onDirectionsOpen?: (id: string) => void;
  onBack?: () => void;
  onClose?: () => void;
  initialView?: GuideView;
  onViewChange?: (view: GuideView) => void;
  initialStoreIndex?: number;
  onStoreIndexChange?: (index: number) => void;
}) {
  const { addFavorite, isFavorited } = useFavorites();
  const [view, setView] = useState<GuideView>(initialView ?? 'main');
  const [activeGuidebook, setActiveGuidebook] = useState<MockGuidebook>(FEATURED);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const dismissSnackbar = useCallback(() => setSnackbar(null), []);
  const [showPopover, setShowPopover] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);

  const changeView = (v: GuideView) => {
    setView(v);
    onViewChange?.(v);
  };

  const handleBack = () => {
    if (view !== 'main') {
      changeView('main');
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
        photos: [],
      });
    }
    setSnackbar('모음집에 담았어요');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', position: 'relative' }}>
      <NavBar
        onBack={handleBack}
        onClose={onClose ?? onBack}
        onMore={() => setShowPopover(v => !v)}
      />

      {view === 'main' && (
        <GuideBookMainView
          guidebook={FEATURED}
          onCardPress={() => { setActiveGuidebook(FEATURED); changeView('detail'); }}
          onPastPress={() => changeView('past')}
        />
      )}
      {view === 'detail' && (
        <GuideBookDetailView
          guidebook={activeGuidebook}
          onDetailOpen={onDetailOpen}
          onDetailOpenToReview={onDetailOpenToReview}
          onDirectionsOpen={onDirectionsOpen}
          onSave={handleSave}
          initialStoreIndex={initialStoreIndex}
          onStoreIndexChange={onStoreIndexChange}
        />
      )}
      {view === 'past' && (
        <GuideBookPastView
          guidebooks={PAST_GUIDEBOOKS}
          onCardPress={(g) => { setActiveGuidebook(g); changeView('detail'); }}
        />
      )}

      {/* ─── 팝오버 메뉴 — 피그마: GuideBook/Main_Popover ─── */}
      {showPopover && (
        <>
          {/* 투명 backdrop — 팝오버 외부 터치 시 닫기 */}
          <div
            style={{ position: 'absolute', inset: 0, zIndex: 99 }}
            onClick={() => setShowPopover(false)}
          />
          {/* 메뉴 팝오버 — 피그마: radius=20, bg rgba(253,253,254,0.89), stroke rgba(253,253,255,0.75) */}
          <div
            style={{
              position: 'absolute',
              top: 49,          // nav(44px) + gap(5px)
              right: 10,        // 피그마: frame 우측에서 10px
              width: 180,
              borderRadius: 20,
              backgroundColor: 'rgba(253,253,254,0.89)',
              border: '1px solid rgba(253,253,255,0.75)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
              zIndex: 100,
              overflow: 'hidden',
            }}
          >
            {/* 타이틀 영역 — 피그마: height=30, 13px/590, rgba(3,24,50,0.46) */}
            <div style={{ height: 30, display: 'flex', alignItems: 'center', paddingLeft: 16, paddingTop: 2 }}>
              <span style={{
                fontFamily: SFPro,
                fontWeight: 590,
                fontSize: 13,
                color: 'rgba(3,24,50,0.46)',
                lineHeight: '19.5px',
              }}>
                메뉴
              </span>
            </div>

            {/* 메뉴 아이템: 공유하기 — 피그마: height=44, 17px/510, rgba(3,18,40,0.7) */}
            <button
              onClick={() => { setShowPopover(false); setShowShareSheet(true); }}
              style={{
                display: 'flex', alignItems: 'center',
                width: '100%', height: 44,
                paddingLeft: 16, paddingRight: 16,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: SFPro, fontWeight: 510, fontSize: 17,
                color: 'rgba(3,18,40,0.7)',
                textAlign: 'left', borderRadius: 12,
                boxSizing: 'border-box',
              }}
            >
              공유하기
            </button>

            {/* 메뉴 아이템: 정보 수정 제안하기 — 피그마: height=44, 동일 스타일 */}
            <button
              onClick={() => { setShowPopover(false); }}
              style={{
                display: 'flex', alignItems: 'center',
                width: '100%', height: 44,
                paddingLeft: 16, paddingRight: 16,
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: SFPro, fontWeight: 510, fontSize: 17,
                color: 'rgba(3,18,40,0.7)',
                textAlign: 'left', borderRadius: 12,
                boxSizing: 'border-box',
              }}
            >
              정보 수정 제안하기
            </button>

            {/* 하단 여백 — 피그마: 총 height 138 = 30+44+44+10(padding) */}
            <div style={{ height: 10 }} />
          </div>
        </>
      )}

      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        shareTitle="카공지도 가이드북"
      />

      {snackbar && <Snackbar message={snackbar} onDismiss={dismissSnackbar} />}
    </div>
  );
}
