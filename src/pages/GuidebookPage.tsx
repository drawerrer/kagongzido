import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Snackbar from '../components/Snackbar';
import ShareSheet from '../components/ShareSheet';
import { useFavorites } from '../context/FavoritesContext';
import { openURL, graniteEvent } from '@apps-in-toss/web-framework';

// ─── 아이콘 ────────────────────────────────────────────────────
function IcSeat() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M7.69094 9.81278V13.0568H16.3139V9.81278C16.3153 8.90112 16.6782 8.02722 17.3231 7.38286C17.9681 6.7385 18.8423 6.37631 19.7539 6.37578H20.0449V6.28478C20.0447 5.19491 19.6115 4.14978 18.8408 3.37922C18.07 2.60866 17.0248 2.17578 15.9349 2.17578H8.07094C6.98107 2.17578 5.93583 2.60866 5.16508 3.37922C4.39434 4.14978 3.9612 5.19491 3.96094 6.28478V6.37578H4.25394C5.16516 6.37684 6.03876 6.73929 6.68309 7.38362C7.32743 8.02796 7.68988 8.90156 7.69094 9.81278Z" fill="#333D4B"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M23.3642 9.46095C23.2122 8.52495 22.5682 7.87695 21.6182 7.87695H20.0482C19.9962 7.87695 19.9492 7.88695 19.8992 7.89195C19.8502 7.88795 19.8012 7.87695 19.7532 7.87695C19.4987 7.87682 19.2466 7.92682 19.0114 8.02409C18.7763 8.12136 18.5625 8.26401 18.3825 8.44387C18.2024 8.62374 18.0596 8.83731 17.9621 9.07239C17.8645 9.30747 17.8143 9.55945 17.8142 9.81395V14.1C17.8143 14.16 17.8026 14.2195 17.7796 14.275C17.7567 14.3305 17.7231 14.3809 17.6806 14.4234C17.6381 14.4659 17.5877 14.4995 17.5322 14.5224C17.4767 14.5454 17.4172 14.5571 17.3572 14.557H6.64816C6.58811 14.5571 6.52862 14.5454 6.47312 14.5224C6.41761 14.4995 6.36718 14.4659 6.32472 14.4234C6.28225 14.3809 6.2486 14.3305 6.22568 14.275C6.20276 14.2195 6.19103 14.16 6.19116 14.1V9.81395C6.19116 8.74395 5.32416 7.87695 4.25516 7.87695C4.20316 7.87695 4.15616 7.88695 4.10616 7.89195C4.05616 7.88795 4.01016 7.87695 3.95916 7.87695H2.38716C1.43716 7.87695 0.788158 8.52495 0.635158 9.46195C0.465158 10.509 0.919158 11.432 1.87116 11.642C1.98968 11.6687 2.0956 11.7349 2.17155 11.8298C2.2475 11.9246 2.28897 12.0424 2.28916 12.164L2.31616 14V18.407C2.31616 18.992 2.79116 19.467 3.37716 19.467H3.96116V20.826C3.96116 21.0912 4.06652 21.3455 4.25405 21.5331C4.44159 21.7206 4.69594 21.826 4.96116 21.826H6.93116C7.19637 21.826 7.45073 21.7206 7.63827 21.5331C7.8258 21.3455 7.93116 21.0912 7.93116 20.826V19.466H16.0762V20.826C16.0762 21.0912 16.1815 21.3455 16.3691 21.5331C16.5566 21.7206 16.8109 21.826 17.0762 21.826H19.0462C19.5972 21.826 20.0462 21.378 20.0462 20.826V19.466H20.6292C20.9103 19.466 21.1799 19.3543 21.3787 19.1555C21.5775 18.9567 21.6892 18.6871 21.6892 18.406V14.001L21.7192 12.165C21.7191 12.0438 21.7603 11.9262 21.8359 11.8316C21.9115 11.7369 22.017 11.6707 22.1352 11.644C23.0872 11.433 23.5352 10.51 23.3652 9.46295" fill="#333D4B"/>
    </svg>
  );
}
function IcOutlet() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <g clipPath="url(#clip_plug_guidebook)">
        <path d="M8.72512 8.01953L7.91992 8.01953L7.91992 2.79113C7.91992 2.68452 7.96228 2.58226 8.03767 2.50688C8.11306 2.43149 8.21531 2.38913 8.32192 2.38913C8.42854 2.38913 8.53079 2.43149 8.60618 2.50688C8.68157 2.58226 8.72392 2.68452 8.72392 2.79113L8.72512 8.01953Z" fill="#333D4B"/>
        <path d="M6.99463 2.79051L6.99463 8.94531L9.65143 8.94531L9.65143 2.79051C9.65143 2.4382 9.51147 2.10032 9.26235 1.85119C9.01323 1.60207 8.67534 1.46211 8.32303 1.46211C7.97072 1.46211 7.63283 1.60207 7.38371 1.85119C7.13459 2.10032 6.99463 2.4382 6.99463 2.79051Z" fill="#333D4B"/>
        <path d="M16.1532 8.01953L15.3486 8.01953L15.3486 2.79113C15.3527 2.68712 15.3968 2.58871 15.4718 2.51655C15.5468 2.44438 15.6468 2.40407 15.7509 2.40407C15.855 2.40407 15.9551 2.44438 16.0301 2.51655C16.1051 2.58871 16.1492 2.68712 16.1532 2.79113L16.1532 8.01953Z" fill="#333D4B"/>
        <path d="M14.4224 2.79051L14.4224 8.94531L17.0798 8.94531L17.0798 2.79051C17.0724 2.44301 16.9291 2.11223 16.6808 1.86907C16.4324 1.62592 16.0986 1.48975 15.7511 1.48975C15.4035 1.48975 15.0697 1.62592 14.8214 1.86907C14.573 2.11223 14.4297 2.44301 14.4224 2.79051Z" fill="#333D4B"/>
        <path d="M19.6537 7.56985L4.42089 7.56985C4.25735 7.56978 4.09539 7.60192 3.94427 7.66445C3.79315 7.72698 3.65583 7.81868 3.54016 7.93429C3.42449 8.04991 3.33273 8.18719 3.27012 8.33828C3.20752 8.48936 3.17529 8.65131 3.17529 8.81485L3.17529 10.9395L20.8987 10.9395L20.8987 8.81485C20.8987 8.65136 20.8665 8.48946 20.8039 8.33841C20.7414 8.18736 20.6496 8.05011 20.534 7.93451C20.4184 7.8189 20.2812 7.72719 20.1301 7.66462C19.9791 7.60206 19.8172 7.56985 19.6537 7.56985Z" fill="#333D4B"/>
        <path d="M15.1051 22.4629L8.96949 22.4629C8.72866 22.463 8.49304 22.3928 8.29157 22.2608C8.09011 22.1289 7.93159 21.9409 7.83549 21.7201L3.17529 10.9399L20.8987 10.9399L16.2385 21.7201C16.1425 21.9409 15.9841 22.1288 15.7827 22.2608C15.5814 22.3927 15.3458 22.463 15.1051 22.4629Z" fill="#333D4B"/>
      </g>
      <defs>
        <clipPath id="clip_plug_guidebook">
          <rect width="24" height="24" fill="white" transform="translate(1.04907e-06 24) rotate(-90)"/>
        </clipPath>
      </defs>
    </svg>
  );
}


// ─── 타입 ─────────────────────────────────────────────────────
interface MockStore {
  id: string;
  district: string;
  name: string;
  message?: string;
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
  { id: 'gs1', district: '서울 영등포구', name: '도트커피', message: '감각적인 공간에서 즐기는 스페셜티 커피. 조용하고 넓은 좌석이 카공하기 딱 좋아요.', seats: 15, outlet: '충분', gradient: ['#C4A882', '#7A5A3C'], photos: mkPhotos('#C4A882', '#7A5A3C') },
  { id: 'gs2', district: '서울 마포구', name: '프릳츠 커피', message: '도넛과 커피의 완벽한 조화. 아늑한 분위기 속에서 오래 머물고 싶은 공간이에요.', seats: 20, outlet: '보통', gradient: ['#A89276', '#5E4030'], photos: mkPhotos('#A89276', '#5E4030') },
  { id: 'gs3', district: '서울 성동구', name: '어니언', message: '빈티지한 건물을 개조한 복합 문화 공간. 넓은 실내와 루프탑이 매력적이에요.', seats: 30, outlet: '충분', gradient: ['#9B8B7A', '#4A3A2C'], photos: mkPhotos('#9B8B7A', '#4A3A2C') },
  { id: 'gs4', district: '서울 강남구', name: '오르에르', message: '미니멀한 인테리어와 정성 가득한 브런치. 조용한 분위기 덕분에 집중하기 좋아요.', seats: 25, outlet: '충분', gradient: ['#C8B8A2', '#6E5E4C'], photos: mkPhotos('#C8B8A2', '#6E5E4C') },
  { id: 'gs5', district: '경기 성남시', name: '스탠딩커피', message: '로스터리 감성의 작은 카페. 핸드드립 커피 한 잔의 여유를 느낄 수 있는 곳이에요.', seats: 10, outlet: '적음', gradient: ['#B0A090', '#5A4A3C'], photos: mkPhotos('#B0A090', '#5A4A3C') },
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
    <div style={{ flex: 1, overflow: 'hidden', backgroundColor: '#F3F3F3', display: 'flex', flexDirection: 'column', padding: '80px 30px calc(env(safe-area-inset-bottom, 0px) + 76px)' }}>
      {/* 메인 큐레이션 카드 — flex: 1 로 남은 공간 전부 차지 */}
      <button
        onClick={onCardPress}
        style={{ flex: 1, minHeight: 0, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', display: 'block', width: '100%' }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          borderRadius: 6,
          overflow: 'hidden',
          position: 'relative',
          background: `linear-gradient(160deg, ${guidebook.gradient[0]}, ${guidebook.gradient[1]})`,
        }}>
          {/* 딤 오버레이 */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0) 33%, rgba(23,20,20,0.92) 100%)',
          }} />
          {/* 텍스트 오버레이 */}
          <div style={{ position: 'absolute', bottom: 28, left: 24 }}>
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
            <span style={{ fontWeight: 400, fontSize: 18, color: '#fff' }}>
              {guidebook.stores.length} places
            </span>
          </div>
        </div>
      </button>

      {/* 지난 가이드북 링크 */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 30, flexShrink: 0 }}>
        <button
          onClick={onPastPress}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontWeight: 590,
            fontSize: 16,
            color: '#333333',
            padding: '4px 8px',
          }}
        >
          지난 가이드북
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

const CARD_GAP = 20;
const CARD_W_RATIO = 261 / 375; // 기준 비율 (375px 기준)

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

  // 반응형 카드 크기
  const [screenW, setScreenW] = useState(window.innerWidth);
  useEffect(() => {
    const handler = () => setScreenW(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  const cardW = Math.round(screenW * CARD_W_RATIO);
  const carouselPadding = Math.round((screenW - cardW) / 2);
  const itemW = cardW + CARD_GAP;

  // 캐러셀 컨테이너 실제 높이 측정 (기기별 유동 대응)
  const carouselWrapperRef = useRef<HTMLDivElement>(null);
  const [carouselH, setCarouselH] = useState(0);
  useEffect(() => {
    const el = carouselWrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      setCarouselH(entries[0].contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const INFO_H = 220; // 정보 영역 고정 높이
  const cardH = carouselH > 0 ? carouselH : Math.round(cardW * 0.85) + 40 + INFO_H; // 첫 렌더 fallback
  const imgH = Math.max(cardH - INFO_H, 0);

  // 무한 루프용 3중 배열
  const loopedStores = useMemo(() => [...stores, ...stores, ...stores], [stores]);

  const [absIndex, setAbsIndex] = useState(stores.length + (initialStoreIndex ?? 0));
  const [photoIndex, setPhotoIndex] = useState(0);
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

  // 마운트 시 초기 스크롤
  useEffect(() => {
    const startAbs = stores.length + (initialStoreIndex ?? 0);
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = startAbs * itemW;
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
    if (scrollRef.current) scrollRef.current.scrollLeft = stores.length * itemW;
  }, [guidebook.id, stores.length, itemW]);

  const handleScroll = useCallback(() => {
    if (isRepositioning.current || !scrollRef.current) return;
    const el = scrollRef.current;
    const newAbs = Math.round(el.scrollLeft / itemW);
    setAbsIndex(newAbs);

    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      if (!scrollRef.current || isRepositioning.current) return;
      const curAbs = Math.round(scrollRef.current.scrollLeft / itemW);
      if (curAbs < stores.length) {
        isRepositioning.current = true;
        const next = scrollRef.current.scrollLeft + stores.length * itemW;
        scrollRef.current.scrollLeft = next;
        setAbsIndex(Math.round(next / itemW));
        setTimeout(() => { isRepositioning.current = false; }, 80);
      } else if (curAbs >= stores.length * 2) {
        isRepositioning.current = true;
        const next = scrollRef.current.scrollLeft - stores.length * itemW;
        scrollRef.current.scrollLeft = next;
        setAbsIndex(Math.round(next / itemW));
        setTimeout(() => { isRepositioning.current = false; }, 80);
      }
    }, 200);
  }, [stores.length, itemW]);

  const currentStoreIndex = ((absIndex % stores.length) + stores.length) % stores.length;

  useEffect(() => {
    onStoreIndexChange?.(currentStoreIndex);
    setPhotoIndex(0);
  }, [currentStoreIndex, onStoreIndexChange]);

  const store = stores[currentStoreIndex];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f2f4f6', overflow: 'hidden' }}>

      {/* 헤더 — 피그마: 61px, 가이드북명 14px/590 + n places 14px/400 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', flexShrink: 0, paddingTop: 16, paddingBottom: 20 }}>
        <p style={{
          fontWeight: 590, fontSize: 14, color: '#000000',
          lineHeight: '22.5px', marginBottom: 5,
        }}>
          {guidebook.title.replace('\n', ' ')}
        </p>
        <p style={{ fontWeight: 400, fontSize: 14, color: '#000000' }}>
          {guidebook.stores.length} places
        </p>
      </div>

      {/* 수평 무한 캐러셀 — 이미지+정보 통합 카드 */}
      <div ref={carouselWrapperRef} style={{ flex: 1, overflow: 'hidden' }}>
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
            paddingLeft: carouselPadding,
            paddingRight: carouselPadding,
            scrollbarWidth: 'none',
            width: '100%',
            height: cardH,
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
                  width: cardW,
                  height: cardH,
                  flexShrink: 0,
                  scrollSnapAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: isActive ? 1 : 0.55,
                  transition: 'opacity 0.25s ease',
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                {/* 이미지 영역 */}
                <div style={{
                  height: imgH,
                  flexShrink: 0,
                  position: 'relative',
                  borderRadius: 6,
                  overflow: 'hidden',
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
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      if (scrollRef.current) scrollRef.current.style.overflowX = 'hidden';
                    }}
                    onTouchEnd={() => {
                      setTimeout(() => {
                        if (scrollRef.current) scrollRef.current.style.overflowX = 'auto';
                      }, 50);
                    }}
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
                            width: cardW,
                            height: '100%',
                            flexShrink: 0,
                            scrollSnapAlign: 'start',
                            background: photo,
                            position: 'relative',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDetailOpen?.(s.id);
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
                  height: 220,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 16px',
                  backgroundColor: '#f2f4f6',
                }}>
                  <p style={{ fontWeight: 510, fontSize: 12, color: '#6b7684', textAlign: 'center', lineHeight: '22.5px', marginBottom: 12 }}>
                    {s.district}
                  </p>
                  <p style={{ fontWeight: 590, fontSize: 20, color: '#000000', textAlign: 'center', lineHeight: '22.5px', marginBottom: 12 }}>
                    {s.name}
                  </p>
                  {s.message && (
                    <p style={{
                      fontSize: 12,
                      fontWeight: 400,
                      color: '#6b7684',
                      textAlign: 'center',
                      lineHeight: '18px',
                      marginBottom: 12,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      paddingLeft: 8,
                      paddingRight: 8,
                    }}>
                      {s.message}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
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
                          backgroundColor: '#E7E8EB',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: 590,
                          fontSize: 13,
                          color: 'rgba(3,18,40,0.7)',
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
      <div style={{ flexShrink: 0, padding: '12px 20px calc(env(safe-area-inset-bottom, 0px) + 76px)', backgroundColor: '#f2f4f6' }}>
        <button
          onClick={() => onDetailOpen?.(store.id)}
          style={{
            width: '100%', height: 52,
            borderRadius: 16,
            backgroundColor: '#252525',
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
        padding: '20px 20px calc(env(safe-area-inset-bottom, 0px) + 76px)',
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
  onClose: _onClose,
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


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#F3F3F3', position: 'relative' }}>
      {import.meta.env.DEV && (
        <button onClick={handleBack} style={{
          position: 'absolute', top: 12, left: 8, zIndex: 999,
          background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: 8,
          cursor: 'pointer', fontSize: 14, color: '#4E5968', padding: '6px 10px',
          backdropFilter: 'blur(4px)',
        }}>← 뒤로</button>
      )}
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

      {snackbar && <Snackbar type="positive" message={snackbar} onDismiss={dismissSnackbar} />}
    </div>
  );
}
