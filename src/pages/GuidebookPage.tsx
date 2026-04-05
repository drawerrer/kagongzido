import { useState, useRef, useCallback } from 'react';
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

// ─── GuideBook/Main/Detail — 캐러셀 상세 화면 ────────────────
function GuideBookDetailView({
  guidebook,
  onDetailOpen,
  onSave,
}: {
  guidebook: MockGuidebook;
  onDetailOpen?: (id: string) => void;
  onSave: (store: MockStore) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const CARD_W = 261;
  const CARD_GAP = 20;

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const idx = Math.round(scrollRef.current.scrollLeft / (CARD_W + CARD_GAP));
    setCurrentIndex(Math.max(0, Math.min(idx, guidebook.stores.length - 1)));
  }, [guidebook.stores.length]);

  const store = guidebook.stores[currentIndex];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#fff', overflow: 'hidden' }}>

      {/* 헤더 — 부제 + n places (고정) */}
      <div style={{ paddingTop: 16, paddingBottom: 12, textAlign: 'center', flexShrink: 0 }}>
        <p style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 15, color: '#191F28', lineHeight: '23px', padding: '0 16px' }}>
          {guidebook.subtitle || guidebook.title.replace('\n', ' ')}
        </p>
        <p style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.45)', marginTop: 4 }}>
          {guidebook.count} places
        </p>
      </div>

      {/* 캐러셀 — 피킹 슬라이드 카드 */}
      <div style={{ flexShrink: 0, position: 'relative' }}>
        <style>{`.guide-carousel::-webkit-scrollbar { display: none; }`}</style>
        <div
          ref={scrollRef}
          className="guide-carousel"
          onScroll={handleScroll}
          style={{
            display: 'flex',
            gap: CARD_GAP,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            paddingLeft: 57,
            paddingRight: 57,
            scrollbarWidth: 'none',
          }}
        >
          {guidebook.stores.map((s, i) => (
            <div
              key={s.id}
              style={{
                width: CARD_W,
                height: 373,
                flexShrink: 0,
                scrollSnapAlign: 'center',
                borderRadius: 16,
                overflow: 'hidden',
                position: 'relative',
                background: `linear-gradient(160deg, ${s.gradient[0]}, ${s.gradient[1]})`,
                transform: i === currentIndex ? 'scaleY(1) translateY(0)' : 'scaleY(0.978) translateY(4px)',
                transformOrigin: 'bottom center',
                transition: 'transform 0.3s ease',
              }}
            >
              {/* 카드 그라디언트 오버레이 */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(23,20,20,0.6) 100%)' }} />
              {/* 페이지네이션 인디케이터 점 */}
              <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 5 }}>
                {guidebook.stores.map((_, di) => (
                  <div key={di} style={{
                    width: di === currentIndex ? 18 : 6,
                    height: 6,
                    borderRadius: 99,
                    backgroundColor: di === currentIndex ? '#fff' : 'rgba(255,255,255,0.45)',
                    transition: 'all 0.25s ease',
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 매장 메타 데이터 — 스와이프에 따라 즉시 업데이트 */}
      <div style={{ flex: 1, padding: '20px 50px 0', overflow: 'hidden' }}>
        <p style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.45)', marginBottom: 4 }}>
          {store.district}
        </p>
        <p style={{ fontFamily: SFPro, fontWeight: 700, fontSize: 22, color: '#191F28', lineHeight: '29px', marginBottom: 14 }}>
          {store.name}
        </p>
        {/* 주요 편의시설 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C6.34 2 5 3.34 5 5v1H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1h-1V5c0-1.66-1.34-3-3-3z" fill="rgba(0,19,43,0.45)"/>
            </svg>
            <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)' }}>좌석</span>
            <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 13, color: '#191F28' }}>{store.seats}석</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2v3H4l2 3H5l2 4 1-3h1l-2-3h2L6 2z" fill="rgba(0,19,43,0.45)" strokeLinecap="round"/>
            </svg>
            <span style={{ fontFamily: SFPro, fontWeight: 510, fontSize: 13, color: 'rgba(0,19,43,0.58)' }}>콘센트</span>
            <span style={{ fontFamily: SFPro, fontWeight: 590, fontSize: 13, color: '#191F28' }}>{store.outlet}</span>
          </div>
        </div>
        {/* 퀵 액션 칩 버튼 3개 */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['길찾기', '리뷰보기', '저장하기'] as const).map((label) => (
            <button
              key={label}
              onClick={label === '저장하기' ? () => onSave(store) : undefined}
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

      {/* 자세히보기 CTA — 고정 하단 */}
      <div style={{ padding: '12px 16px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))', flexShrink: 0 }}>
        <button
          onClick={() => store && onDetailOpen?.(store.id)}
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
