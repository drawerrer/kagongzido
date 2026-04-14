import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Snackbar from '../components/Snackbar';
import ShareSheet from '../components/ShareSheet';
import { useFavorites } from '../context/FavoritesContext';
import { TextButton } from '@toss/tds-mobile';
import { openURL, graniteEvent } from '@apps-in-toss/web-framework';
import NavBar from '../components/NavBar';

// ─── 아이콘 ────────────────────────────────────────────────────
function IcSeat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 16v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2H4zm1 2h14v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1zM7 4h10a1 1 0 0 1 1 1v5H6V5a1 1 0 0 1 1-1z"/>
    </svg>
  );
}
function IcOutlet() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
    </svg>
  );
}


// ─── 타입 ─────────────────────────────────────────────────────
interface MockStore {
  id: string;
  district: string;
  name: string;
  seats: number;
  outlet: '충분' | '보통' | '적음';
  gradient: [string, string];
  photos: string[]; // CSS background 값 (mock)
}

interface MockGuidebook {
  id: string;
  title: string;
  subtitle: string;
  gradient: [string, string];
  stores: MockStore[];
}

type GuideView = 'main' | 'detail' | 'past';

// 목 이미지: 그라디언트 색상 기반으로 10장 생성
function mkPhotos(c1: string, c2: string): string[] {
  const angles = [160, 200, 140, 180, 220, 150, 170, 190, 135, 165];
  return angles.map((a, i) =>
    i % 2 === 0
      ? `linear-gradient(${a}deg, ${c1}, ${c2})`
      : `linear-gradient(${a}deg, ${c2}, ${c1})`
  );
}

// ─── 목 데이터 ────────────────────────────────────────────────
const FEATURE_STORES: MockStore[] = [
  { id: 'gs1', district: '서울 영등포구', name: '도트커피', seats: 15, outlet: '충분', gradient: ['#C4A882', '#7A5A3C'], photos: mkPhotos('#C4A882', '#7A5A3C') },
  { id: 'gs2', district: '서울 마포구', name: '프릳츠 커피', seats: 20, outlet: '보통', gradient: ['#A89276', '#5E4030'], photos: mkPhotos('#A89276', '#5E4030') },
  { id: 'gs3', district: '서울 성동구', name: '어니언', seats: 30, outlet: '충분', gradient: ['#9B8B7A', '#4A3A2C'], photos: mkPhotos('#9B8B7A', '#4A3A2C') },
  { id: 'gs4', district: '서울 강남구', name: '오르에르', seats: 25, outlet: '충분', gradient: ['#C8B8A2', '#6E5E4C'], photos: mkPhotos('#C8B8A2', '#6E5E4C') },
  { id: 'gs5', district: '경기 성남시', name: '스탠딩커피', seats: 10, outlet: '적음', gradient: ['#B0A090', '#5A4A3C'], photos: mkPhotos('#B0A090', '#5A4A3C') },
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
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F3F3F3' }}>
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
        <TextButton size="medium" onClick={onPastPress}>
          지난 가이드북
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#333333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 4 10 8 6 12"/>
          </svg>
        </TextButton>
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

function openKakaoMapWeb(store: MockStore) {
  const query = encodeURIComponent(`${store.name} ${store.district}`);
  openURL(`https://map.kakao.com/link/search/${query}`);
}

function GuideBookDetailView({
  guidebook,
  onDetailOpen,
  onDetailOpenToReview,
  onSave,
  initialStoreIndex,
  onStoreIndexChange,
}: {
  guidebook: MockGuidebook;
  onDetailOpen?: (id: string) => void;
  onDetailOpenToReview?: (id: string) => void;
  onSave: (store: MockStore) => void;
  initialStoreIndex?: number;
  onStoreIndexChange?: (index: number) => void;
}) {
  const stores = guidebook.stores;

  // 무한 루프용 3중 배열
  const loopedStores = useMemo(() => [...stores, ...stores, ...stores], [stores]);

  const [absIndex, setAbsIndex] = useState(stores.length + (initialStoreIndex ?? 0));
  const [photoIndex, setPhotoIndex] = useState(0);
  const [containerH, setContainerH] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRepositioning = useRef(false);
  const isFirstMount = useRef(true);

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

  // 컨테이너 높이 측정 (동적 CARD_H)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const h = entries[0].contentRect.height;
      if (h > 0) setContainerH(h);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 마운트 시 초기 스크롤
  useEffect(() => {
    const startAbs = stores.length + (initialStoreIndex ?? 0);
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = startAbs * ITEM_W;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 가이드북 바뀔 때 초기화 (최초 마운트는 건너뜀 — initialStoreIndex 유지)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    setAbsIndex(stores.length);
    if (scrollRef.current) scrollRef.current.scrollLeft = stores.length * ITEM_W;
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
    setPhotoIndex(0);
  }, [currentStoreIndex, onStoreIndexChange]);

  const store = stores[currentStoreIndex];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f2f4f6', overflow: 'hidden' }}>

      {/* 헤더 — 피그마: 61px, 가이드북명 14px/590 + n places 14px/400 */}
      <div style={{ height: 61, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <p style={{
          fontWeight: 590, fontSize: 14, color: '#000000',
          lineHeight: '22.5px', marginBottom: 2,
        }}>
          {guidebook.title.replace('\n', ' ')}
        </p>
        <p style={{ fontWeight: 400, fontSize: 14, color: '#000000' }}>
          {guidebook.stores.length} places
        </p>
      </div>

      {/* 수평 무한 캐러셀 — 이미지+정보 통합 카드 */}
      <div ref={containerRef} style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <style>{`.guide-carousel::-webkit-scrollbar { display: none; } .card-img-scroll::-webkit-scrollbar { display: none; }`}</style>
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
            alignItems: 'flex-start',
            gap: CARD_GAP,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            paddingLeft: CAROUSEL_PADDING,
            paddingRight: CAROUSEL_PADDING,
            scrollbarWidth: 'none',
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            cursor: 'grab',
          }}
        >
          {loopedStores.map((s, i) => {
            const isActive = i === absIndex;
            const cardH = containerH > 0 ? containerH : CARD_H + 132;
            const imgH = cardH - 132;
            return (
              <div
                key={i}
                style={{
                  width: CARD_W,
                  height: cardH,
                  flexShrink: 0,
                  scrollSnapAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: isActive ? 1 : 0.55,
                  transition: 'opacity 0.25s ease',
                }}
              >
                {/* 이미지 영역 */}
                <div style={{
                  height: imgH,
                  flexShrink: 0,
                  borderRadius: '6px 6px 0 0',
                  overflow: 'hidden',
                  position: 'relative',
                  background: `linear-gradient(160deg, ${s.gradient[0]}, ${s.gradient[1]})`,
                }}>
                  {/* 내부 이미지 가로 스크롤 */}
                  <div
                    className="card-img-scroll"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      overflowX: 'auto',
                      overflowY: 'hidden',
                      display: 'flex',
                      scrollSnapType: 'x mandatory',
                      scrollbarWidth: 'none',
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onScroll={isActive ? (e) => {
                      const el = e.currentTarget;
                      const idx = Math.round(el.scrollLeft / el.clientWidth);
                      setPhotoIndex(idx);
                    } : undefined}
                  >
                    {s.photos.map((photo, pi) => {
                      const isLastPhoto = pi === s.photos.length - 1;
                      return (
                        <div
                          key={pi}
                          style={{
                            width: CARD_W,
                            height: '100%',
                            flexShrink: 0,
                            scrollSnapAlign: 'start',
                            background: photo,
                            position: 'relative',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isLastPhoto) onDetailOpen?.(s.id);
                            else onDetailOpenToReview?.(s.id);
                          }}
                        >
                          {isLastPhoto && (
                            <div style={{
                              position: 'absolute',
                              inset: 0,
                              background: 'rgba(0,0,0,0.52)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <span style={{ color: 'white', fontSize: 18, fontWeight: 590 }}>+{s.photos.length - 1}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {/* 그라디언트 오버레이 */}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(23,20,20,0.56) 100%)', pointerEvents: 'none' }} />
                  {/* 페이지네이션 점 */}
                  {isActive && (
                    <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5, pointerEvents: 'none' }}>
                      {s.photos.map((_, di) => (
                        <div key={di} style={{
                          width: 6,
                          height: 6,
                          borderRadius: 99,
                          backgroundColor: di === photoIndex ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)',
                          transition: 'background-color 0.25s ease',
                        }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* 매장 정보 영역 */}
                <div style={{
                  height: 132,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 16px',
                  backgroundColor: '#f2f4f6',
                  borderRadius: '0 0 6px 6px',
                }}>
                  <p style={{ fontWeight: 510, fontSize: 12, color: '#6b7684', textAlign: 'center', lineHeight: '22.5px', marginBottom: 0 }}>
                    {s.district}
                  </p>
                  <p style={{ fontWeight: 590, fontSize: 20, color: '#000000', textAlign: 'center', lineHeight: '22.5px', marginBottom: 8 }}>
                    {s.name}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(0,0,0,0.45)' }}>
                      <IcSeat />
                      <span style={{ fontWeight: 510, fontSize: 14, color: '#000000' }}>좌석</span>
                      <span style={{ fontWeight: 400, fontSize: 14, color: '#777777' }}>{s.seats}석</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'rgba(0,0,0,0.45)' }}>
                      <IcOutlet />
                      <span style={{ fontWeight: 510, fontSize: 14, color: '#000000' }}>콘센트</span>
                      <span style={{ fontWeight: 400, fontSize: 14, color: '#777777' }}>{s.outlet}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['길찾기', '리뷰보기', '저장하기'] as const).map((label) => (
                      <button
                        key={label}
                        style={{
                          height: 32,
                          padding: '0 12px',
                          borderRadius: 8,
                          backgroundColor: 'rgba(211,211,223,0.19)',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 590,
                          fontSize: 13,
                          color: '#252525',
                          whiteSpace: 'nowrap',
                        }}
                        onClick={() => {
                          if (label === '저장하기') onSave(s);
                          else if (label === '리뷰보기') onDetailOpenToReview?.(s.id);
                          else if (label === '길찾기') openKakaoMapWeb(s);
                          else onDetailOpen?.(s.id);
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단 CTA */}
      <div style={{ flexShrink: 0, padding: '12px 20px 16px', backgroundColor: '#f2f4f6' }}>
        <button
          onClick={() => onDetailOpen?.(store.id)}
          style={{
            width: '100%', height: 52,
            borderRadius: 16,
            backgroundColor: '#4e5968',
            border: 'none', cursor: 'pointer',
            color: '#ffffff', fontWeight: 700, fontSize: 17,
          }}
        >
          자세히보기
        </button>
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
    <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#F3F3F3' }}>
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
  onBack,
  onClose,
  initialView,
  onViewChange,
  initialStoreIndex,
  onStoreIndexChange,
}: {
  onDetailOpen?: (id: string) => void;
  onDetailOpenToReview?: (id: string) => void;
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
  const [showShareSheet, setShowShareSheet] = useState(false);

  const changeView = (v: GuideView) => {
    setView(v);
    onViewChange?.(v);
  };

  const handleBack = useCallback(() => {
    if (view !== 'main') {
      changeView('main');
    } else {
      onBack?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // SDK 네이티브 백 이벤트 등록 (Toss 앱 외부 환경에서는 무시)
  useEffect(() => {
    try {
      const unsubscribe = graniteEvent.addEventListener('backEvent', {
        onEvent: handleBack,
        onError: (err) => console.error(err),
      });
      return unsubscribe;
    } catch {
      return undefined;
    }
  }, [handleBack]);

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

  const isTossApp = !!(window as any).ReactNativeWebView;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#F3F3F3', position: 'relative' }}>
      {!isTossApp && <NavBar onBack={handleBack} onClose={onClose ?? onBack} />}
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


      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        shareTitle="카페인덱스 가이드북"
      />

      {snackbar && <Snackbar message={snackbar} onDismiss={dismissSnackbar} />}
    </div>
  );
}
