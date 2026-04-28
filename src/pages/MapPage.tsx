import { useState, useEffect, useRef } from 'react';
import { getCurrentLocation, Accuracy, graniteEvent } from '@apps-in-toss/web-framework';
import { Toast } from '@toss/tds-mobile';
import FilterModal, { FilterState, DEFAULT_FILTERS } from '../components/FilterModal';
import LocationPermissionSheet, { LocationSheetType } from '../components/LocationPermissionSheet';
import { useFavorites } from '../context/FavoritesContext';
import Snackbar from '../components/Snackbar';
import DetailPage from './DetailPage';

// ── 타입 ─────────────────────────────────
interface Cafe {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  mood: string;
  priceRange: number;
  options: string[];
  lat?: number;
  lng?: number;
}

type SortType = '조회순' | '거리순' | '평점순';

// ── 상수 ─────────────────────────────────
const CATEGORY_CHIPS = ['카공', '두쫀쿠', '버터떡', '조용한', '넓은', '가성비'];

const MOCK_CAFES: Cafe[] = [
  { id: '1', name: '블루보틀 강남', address: '서울 강남구 논현로 508', distance: 150, rating: 4.8, reviewCount: 523, tags: ['카공', '넓은'], mood: '모던한', priceRange: 7000, options: ['콘센트 충분', '소음 적당'], lat: 37.5242, lng: 127.0397 },
  { id: '2', name: '스타벅스 역삼역점', address: '서울 강남구 역삼로 123', distance: 280, rating: 4.5, reviewCount: 1200, tags: ['넓은'], mood: '개방적인', priceRange: 6000, options: ['콘센트 충분', '단체 방문 가능', '주차 가능'], lat: 37.5006, lng: 127.0363 },
  { id: '3', name: '모노 커피', address: '서울 강남구 언주로 234', distance: 410, rating: 4.9, reviewCount: 87, tags: ['조용한', '카공'], mood: '조용한', priceRange: 8000, options: ['콘센트 충분', '조용', '시간제한 없음'], lat: 37.5057, lng: 127.0493 },
  { id: '4', name: '카페 베이커리', address: '서울 강남구 역삼동 567', distance: 590, rating: 4.3, reviewCount: 342, tags: ['가성비'], mood: '아늑한', priceRange: 5500, options: ['조용', '내부 화장실'], lat: 37.4932, lng: 127.0341 },
  { id: '5', name: '브런치 팩토리', address: '서울 강남구 선릉로 890', distance: 720, rating: 4.6, reviewCount: 156, tags: ['두쫀쿠'], mood: '따뜻한', priceRange: 9000, options: ['단체 방문 가능', '반려동물 동반 가능'], lat: 37.5023, lng: 127.0433 },
  { id: '6', name: '더 로스터리', address: '서울 강남구 도곡로 321', distance: 950, rating: 4.7, reviewCount: 98, tags: ['카공', '버터떡'], mood: '빈티지', priceRange: 10000, options: ['시간제한 없음', '주차 가능', '콘센트 충분'], lat: 37.4888, lng: 127.0413 },
];

// ── 유틸 ──────────────────────────────────
const fmtDist = (m: number) => (m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`);

// GPS 권한 상태는 SDK getCurrentLocation.getPermission() 으로 관리

// ── 아이콘 ────────────────────────────────
function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M10.3891 17.7822C14.4733 17.7822 17.7841 14.4713 17.7841 10.3872C17.7841 6.30304 14.4733 2.99219 10.3891 2.99219C6.305 2.99219 2.99414 6.30304 2.99414 10.3872C2.99414 14.4713 6.305 17.7822 10.3891 17.7822Z" stroke="rgba(3,24,50,0.46)" strokeWidth="2.032" strokeMiterlimit="10"/>
      <path d="M15.6401 15.6367L21.1571 21.1537" stroke="rgba(3,24,50,0.46)" strokeWidth="2.001" strokeMiterlimit="10" strokeLinecap="round"/>
    </svg>
  );
}

function FilterIcon({ active }: { active: boolean }) {
  const color = active ? '#fff' : '#333D4B';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M19.6431 3.25195C20.3811 3.25195 20.9801 3.85095 20.9801 4.58995C20.9801 4.92595 20.8531 5.24895 20.6261 5.49595L14.1401 12.521V18.793C14.1401 19.065 14.0161 19.322 13.8031 19.491L13.7071 19.557L11.0331 21.161C10.6111 21.414 10.0631 21.277 9.81009 20.855C9.72709 20.717 9.68309 20.559 9.68309 20.398V12.33L3.37509 5.49495C2.87409 4.95195 2.90809 4.10595 3.45109 3.60595C3.69809 3.37795 4.02109 3.25195 4.35709 3.25195H19.6431Z" fill={color}/>
    </svg>
  );
}

function GpsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M12.0002 12.7426C11.6394 12.7495 11.281 12.6844 10.9457 12.5512C10.6104 12.4179 10.305 12.2191 10.0475 11.9665C9.78994 11.7138 9.58534 11.4123 9.44568 11.0797C9.30601 10.747 9.23407 10.3899 9.23407 10.0291C9.23407 9.66827 9.30601 9.3111 9.44568 8.97844C9.58534 8.64577 9.78994 8.3443 10.0475 8.09164C10.305 7.83898 10.6104 7.64021 10.9457 7.50696C11.281 7.3737 11.6394 7.30864 12.0002 7.31556C12.7108 7.3292 13.3877 7.62108 13.8855 8.12848C14.3832 8.63587 14.6621 9.31828 14.6621 10.0291C14.6621 10.7398 14.3832 11.4222 13.8855 11.9296C13.3877 12.437 12.7108 12.7289 12.0002 12.7426ZM9.87617 1.03756C5.60617 1.99056 2.61217 6.00956 2.78017 10.3816C2.91217 13.8156 5.01917 16.8876 11.2882 22.9146C11.6842 23.2946 12.3182 23.2966 12.7152 22.9156C19.1992 16.6826 21.2312 13.6106 21.2312 10.0286C21.2312 4.23856 15.8982 -0.30644 9.87617 1.03856" fill="#333D4B"/>
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

// ── 정렬 팝업 ─────────────────────────────
function SortPopup({
  current,
  onSelect,
  onClose,
}: {
  current: SortType;
  onSelect: (t: SortType) => void;
  onClose: () => void;
}) {
  const OPTIONS: SortType[] = ['조회순', '거리순', '평점순'];
  return (
    <>
      {/* 팝업 외부 클릭 시 닫기 */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 200 }}
      />
      <div
        style={{
          position: 'absolute',
          right: 16,
          top: 56,
          zIndex: 201,
          background: '#FDFDFE',
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          width: 180,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '10px 16px 6px',
            fontSize: 13,
            fontWeight: 600,
            color: '#6B7684',
          }}
        >
          정렬
        </div>
        {OPTIONS.map(opt => (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '12px 16px',
              fontSize: 17,
              fontWeight: opt === current ? 600 : 400,
              color: opt === current ? '#252525' : '#191F28',
              background: 'transparent',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </>
  );
}

// ── 카페 목록 행 ──────────────────────────
function CafeRow({ cafe, onTap, onFavoriteChange }: { cafe: Cafe; onTap: () => void; onFavoriteChange?: (type: 'added' | 'removed', cafe: Cafe) => void }) {
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();
  const favorited = isFavorited(cafe.id);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorited) {
      removeFavorite(cafe.id);
      onFavoriteChange?.('removed', cafe);
    } else {
      addFavorite({
        id: cafe.id,
        name: cafe.name,
        address: cafe.address,
        rating: cafe.rating,
        reviewCount: cafe.reviewCount,
        photos: [],
        distance: cafe.distance,
      });
      onFavoriteChange?.('added', cafe);
    }
  };

  return (
    <>
    <div
      onClick={onTap}
      style={{
        display: 'flex',
        gap: 12,
        padding: '12px 16px',
        borderBottom: '1px solid #F2F4F6',
        cursor: 'pointer',
      }}
    >
      {/* 이미지 썸네일 */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 10,
          flexShrink: 0,
          background: '#F2F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <span style={{ fontSize: 28 }}>☕</span>
      </div>

      {/* 카페 정보 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          minWidth: 0,
        }}
      >
        {/* 텍스트 블록 (이름·주소·거리·배지) */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <p
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#191F28',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {cafe.name}
          </p>
          <p
            style={{
              fontSize: 12,
              color: '#6B7684',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {cafe.address}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#6B7684' }}>
              {fmtDist(cafe.distance)} · 리뷰 {cafe.reviewCount}
            </span>
          </div>
          {/* 배지 */}
          {cafe.tags[0] && (
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                background: '#F2F4F6',
                borderRadius: 4,
                fontSize: 11,
                color: '#4E5968',
                alignSelf: 'flex-start',
              }}
            >
              {cafe.tags[0]}
            </span>
          )}
        </div>

        {/* 하트 — 전체 블록 옆 고정 */}
        <button
          onClick={handleHeartClick}
          style={{
            width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none', cursor: 'pointer',
            flexShrink: 0, marginLeft: 4, marginTop: -11,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              fillRule="evenodd" clipRule="evenodd"
              d="M10.9038 21.2884C11.5698 21.7284 12.4288 21.7284 13.0938 21.2884C15.2088 19.8924 19.8138 16.5554 21.7978 12.8214C24.4128 7.89542 21.3418 2.98242 17.2818 2.98242C14.9678 2.98242 13.5758 4.19142 12.8058 5.23042C12.4818 5.67542 11.8588 5.77442 11.4128 5.45042C11.3278 5.38942 11.2538 5.31442 11.1928 5.23042C10.4228 4.19142 9.03076 2.98242 6.71676 2.98242C2.65676 2.98242 -0.414244 7.89542 2.20176 12.8214C4.18376 16.5554 8.79076 19.8924 10.9038 21.2884Z"
              fill={favorited ? '#252525' : '#D1D6DB'}
            />
          </svg>
        </button>
      </div>
    </div>
    </>
  );
}

// ── MapPage 상태 스냅샷 타입 ──────────────
export interface MapPageState {
  activeChip: string | null;
  sortType: SortType;
  panelExpanded: boolean;
  appliedFilters: FilterState;
  filterApplied: boolean;
}

// ── MapPage (메인 화면) ───────────────────
interface MapPageProps {
  onSearchOpen: () => void;
  onDetailOpen: (cafeId: string) => void;
  onGoToFavorites?: () => void;
  initialState?: MapPageState;
  onStateChange?: (state: MapPageState) => void;
}

export default function MapPage({ onSearchOpen, onDetailOpen, onGoToFavorites, initialState, onStateChange }: MapPageProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMap | null>(null);
  const touchStartYRef = useRef<number>(0);
  const [mapDebug, setMapDebug] = useState<string>('초기화 중...');
  const { addFavorite } = useFavorites();

  const [activeChip, setActiveChip] = useState<string | null>(initialState?.activeChip ?? null);
  const [sortType, setSortType] = useState<SortType>(initialState?.sortType ?? '조회순');
  const [sortPopupOpen, setSortPopupOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterOpenKey, setFilterOpenKey] = useState(0); // remount key
  const [panelExpanded, setPanelExpanded] = useState(initialState?.panelExpanded ?? false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialState?.appliedFilters ?? DEFAULT_FILTERS);
  const [selectedMapCafe, setSelectedMapCafe] = useState<Cafe | null>(null);

  // 지도 패널 열린 상태에서 네이티브 뒤로가기 → 패널 닫기
  useEffect(() => {
    if (!selectedMapCafe) return;
    try {
      const unsubscribe = graniteEvent.addEventListener('backEvent', {
        onEvent: () => { setSelectedMapCafe(null); setPanelExpanded(false); },
        onError: (err) => console.error(err),
      });
      return unsubscribe;
    } catch {
      return undefined;
    }
  }, [selectedMapCafe]);

  // 설정값이 DEFAULT와 다르면 true (아이콘 검정), 동일하면 false (아이콘 회색)
  const filterApplied =
    appliedFilters.openNow !== DEFAULT_FILTERS.openNow ||
    appliedFilters.moods.length > 0 ||
    appliedFilters.priceMax !== DEFAULT_FILTERS.priceMax ||
    appliedFilters.options.length > 0;

  // 상태 변경 시 부모에 알림
  useEffect(() => {
    onStateChange?.({ activeChip, sortType, panelExpanded, appliedFilters, filterApplied });
  }, [activeChip, sortType, panelExpanded, appliedFilters, filterApplied]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 위치 권한 상태 ──────────────────────
  type GpsStatus = 'granted' | 'denied' | 'unknown';
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('unknown');
  const [locSheet, setLocSheet] = useState<LocationSheetType | null>(null);
  const [gpsToast, setGpsToast] = useState(false); // GPS 신호 실패 토스트
  const [favoriteSnackbar, setFavoriteSnackbar] = useState<'added' | 'removed' | null>(null);
  const [removedCafe, setRemovedCafe] = useState<Cafe | null>(null);

  const showFavoriteSnackbar = (type: 'added' | 'removed', cafe?: Cafe) => {
    if (type === 'removed' && cafe) setRemovedCafe(cafe);
    setFavoriteSnackbar(type);
  };

  // 카테고리 필터 + appliedFilters + 정렬 적용
  const cafes = (() => {
    let filtered = activeChip
      ? MOCK_CAFES.filter(c => c.tags.includes(activeChip))
      : [...MOCK_CAFES];

    // 분위기 필터
    if (appliedFilters.moods.length > 0) {
      filtered = filtered.filter(c => appliedFilters.moods.includes(c.mood));
    }
    // 가격대 필터
    if (appliedFilters.priceMax < DEFAULT_FILTERS.priceMax) {
      filtered = filtered.filter(c => c.priceRange <= appliedFilters.priceMax);
    }
    // 옵션 필터 (선택된 모든 옵션을 카페가 보유해야 함)
    if (appliedFilters.options.length > 0) {
      filtered = filtered.filter(c =>
        appliedFilters.options.every(opt => c.options.includes(opt))
      );
    }

    if (sortType === '평점순') return filtered.slice().sort((a, b) => b.rating - a.rating);
    if (sortType === '거리순') return filtered.slice().sort((a, b) => a.distance - b.distance);
    return filtered; // 조회순: 기본 순서
  })();

  // ── 앱 실행 시 SDK 위치 권한 상태만 조회 (시트 자동 노출 없음) ──
  useEffect(() => {
    getCurrentLocation.getPermission()
      .then(status => {
        if (status === 'allowed') {
          setGpsStatus('granted');
        } else if (status === 'denied') {
          setGpsStatus('denied');
        }
        // notDetermined: 상태만 unknown 유지, 시트는 GPS 버튼 탭 시 노출
      })
      .catch(() => {}); // 조회 실패 시 unknown 유지
  }, []);

  // ── 위치 권한 핸들러 ──────────────────────
  const handleAllowLocation = async () => {
    try {
      const loc = await getCurrentLocation({ accuracy: Accuracy.Balanced });
      setGpsStatus('granted');
      setLocSheet('granted');
      if (mapInstanceRef.current && window.kakao?.maps) {
        const userPos = new window.kakao.maps.LatLng(
          loc.coords.latitude,
          loc.coords.longitude,
        );
        mapInstanceRef.current.setCenter(userPos);
      }
    } catch {
      setGpsStatus('denied');
      setLocSheet('denied');
    }
  };

  const handleDenyLocation = () => {
    setGpsStatus('denied');
    setLocSheet('denied');
  };

  const handleOpenSettings = async () => {
    setLocSheet(null);
    // SDK openPermissionDialog: 기기 설정 앱으로 이동 후 결과 반환
    const newStatus = await getCurrentLocation.openPermissionDialog();
    if (newStatus === 'allowed') {
      setGpsStatus('granted');
    } else {
      setGpsStatus('denied');
    }
  };

  // ── Kakao 지도 초기화 ──────────────────
  useEffect(() => {
    const key = import.meta.env.VITE_KAKAO_MAP_KEY;
    if (!key) return;

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false`;
    document.head.appendChild(script);

    script.onerror = () => {
      setMapDebug('❌ SDK 로드 실패 (도메인 인증 오류)');
    };

    script.onload = () => {
      setMapDebug('✅ SDK 로드됨, maps.load 호출 중...');
      window.kakao.maps.load(() => {
        setMapDebug('✅ maps.load 콜백 실행됨');
        if (!mapRef.current) return;

        const defaultCenter = new window.kakao.maps.LatLng(37.4979, 127.0276);
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: defaultCenter,
          level: 4,
        });
        mapInstanceRef.current = map;

        // 카페 마커 추가
        MOCK_CAFES.forEach(cafe => {
          if (!cafe.lat || !cafe.lng) return;
          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(cafe.lat, cafe.lng),
            map,
          });
          window.kakao.maps.event.addListener(marker, 'click', () => {
            setSelectedMapCafe(cafe);
            setPanelExpanded(false);
          });
        });

        // 현재 위치로 이동 (SDK)
        getCurrentLocation({ accuracy: Accuracy.Balanced })
          .then(loc => {
            const userPos = new window.kakao.maps.LatLng(
              loc.coords.latitude,
              loc.coords.longitude,
            );
            map.setCenter(userPos);
          })
          .catch(() => {}); // 권한 미허용 시 기본 위치 유지
      });
    };

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  // ── 현재 위치로 돌아가기 (SDK) ─────────
  const goToCurrentLocation = async () => {
    // 최초(unknown) → ask 시트로 최초 1회 권한 요청
    if (gpsStatus === 'unknown') {
      setLocSheet('ask');
      return;
    }
    // 권한 거부 상태 → 재요청 시트 노출
    if (gpsStatus === 'denied') {
      setLocSheet('reask');
      return;
    }
    if (!mapInstanceRef.current) return;
    try {
      const loc = await getCurrentLocation({ accuracy: Accuracy.Balanced });
      const userPos = new window.kakao.maps.LatLng(
        loc.coords.latitude,
        loc.coords.longitude,
      );
      mapInstanceRef.current.setCenter(userPos);
    } catch {
      // GPS 신호 수신 실패 토스트
      setGpsToast(true);
      setTimeout(() => setGpsToast(false), 2500);
    }
  };


  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>

      {/* ── 카카오 지도 배경 ── */}
      <div ref={mapRef} style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top) + 72px)', bottom: 0, left: 0, right: 0, background: '#E8EAED' }}>
        {import.meta.env.VITE_KAKAO_MAP_KEY && (
          <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 99, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 11, padding: '4px 8px', borderRadius: 6, maxWidth: '90%', wordBreak: 'break-all' }}>
            {mapDebug}
          </div>
        )}
        {!import.meta.env.VITE_KAKAO_MAP_KEY && (
          /* API 키 미설정 시 목업 지도 */
          <div style={{ position: 'relative', height: '100%', background: '#E8EAED', overflow: 'hidden' }}>
            {/* 목업 도로 */}
            <div style={{ position: 'absolute', top: '30%', left: 0, right: 0, height: 8, background: '#D0D4D8' }} />
            <div style={{ position: 'absolute', top: '55%', left: 0, right: 0, height: 5, background: '#D0D4D8' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '40%', width: 8, background: '#D0D4D8' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '70%', width: 5, background: '#D0D4D8' }} />
            {/* 목업 블록 */}
            <div style={{ position: 'absolute', top: '8%', left: '10%', width: 60, height: 44, background: '#D8DBE0', borderRadius: 4 }} />
            <div style={{ position: 'absolute', top: '8%', left: '50%', width: 80, height: 36, background: '#D8DBE0', borderRadius: 4 }} />
            <div style={{ position: 'absolute', top: '38%', left: '10%', width: 50, height: 40, background: '#D8DBE0', borderRadius: 4 }} />
            <div style={{ position: 'absolute', top: '38%', left: '50%', width: 70, height: 30, background: '#D8DBE0', borderRadius: 4 }} />
            <div style={{ position: 'absolute', top: '62%', left: '15%', width: 55, height: 34, background: '#D8DBE0', borderRadius: 4 }} />
            <div style={{ position: 'absolute', top: '62%', left: '75%', width: 40, height: 44, background: '#D8DBE0', borderRadius: 4 }} />
            {/* 목업 카페 핀 — MOCK_CAFES 일부를 상대 위치로 배치 */}
            {[
              { cafe: MOCK_CAFES[0], top: '18%', left: '20%' },
              { cafe: MOCK_CAFES[1], top: '22%', left: '58%' },
              { cafe: MOCK_CAFES[2], top: '44%', left: '25%' },
              { cafe: MOCK_CAFES[3], top: '42%', left: '62%' },
              { cafe: MOCK_CAFES[4], top: '68%', left: '32%' },
              { cafe: MOCK_CAFES[5], top: '66%', left: '78%' },
            ].map(({ cafe, top, left }) => (
              <button
                key={cafe.id}
                onClick={() => { setSelectedMapCafe(cafe); setPanelExpanded(false); }}
                style={{
                  position: 'absolute',
                  top,
                  left,
                  transform: 'translate(-50%, -100%)',
                  background: selectedMapCafe?.id === cafe.id ? '#252525' : '#ffffff',
                  border: 'none',
                  borderRadius: 999,
                  padding: '4px 10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: selectedMapCafe?.id === cafe.id ? '#fff' : '#191F28',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  zIndex: 5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                ☕ {cafe.name.split(' ').slice(-1)[0]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 상단 검색바 + 필터 버튼 ── */}
      <div
        style={{
          position: 'absolute',
          top: 'env(safe-area-inset-top)',
          left: 0,
          right: 0,
          zIndex: 20,
          padding: '14px 16px',
          background: '#f3f3f3',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* 검색 입력창 (탭 시 SearchPage로 이동) */}
          <div
            onClick={onSearchOpen}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#ffffff',
              borderRadius: 12,
              height: 44,
              padding: '0 10px',
            }}
          >
            <SearchIcon />
            <span style={{ color: 'rgba(3,24,50,0.46)', fontSize: 17, fontWeight: 510 }}>검색어를 입력하세요.</span>
          </div>

          {/* 필터 버튼 */}
          <button
            onClick={() => { setFilterOpenKey(k => k + 1); setFilterOpen(true); }}
            style={{
              width: 52,
              height: 32,
              borderRadius: 999,
              flexShrink: 0,
              background: filterApplied ? '#191F28' : 'rgba(7,25,76,0.05)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            <FilterIcon active={filterApplied} />
          </button>
        </div>
      </div>

      {/* ── GPS (현재 위치) 버튼 ── */}
      <button
        onClick={goToCurrentLocation}
        style={{
          position: 'absolute',
          right: 16,
          bottom: 'calc(50vh + 12px)',
          zIndex: 8,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <GpsIcon />
      </button>

      {/* ── 외부 탭 시 패널 축소 / 프리뷰 닫기 오버레이 ── */}
      {(panelExpanded || selectedMapCafe) && (
        <div
          onClick={() => { setPanelExpanded(false); setSelectedMapCafe(null); }}
          style={{ position: 'absolute', inset: 0, zIndex: 9 }}
        />
      )}

      {/* ── 바텀 패널 ── */}
      <div
        onTouchStart={(e) => { touchStartYRef.current = e.touches[0].clientY; }}
        onTouchEnd={(e) => {
          const delta = e.changedTouches[0].clientY - touchStartYRef.current;
          if (selectedMapCafe) {
            if (panelExpanded) {
              // 확장(풀스크린) 상태: 아래로 세게 → 지도로 복귀
              if (delta > 60) { setPanelExpanded(false); setSelectedMapCafe(null); }
            } else {
              // 기본형 상태: 위로 → 확장, 아래로 → 닫기
              if (delta < -60) setPanelExpanded(true);
              else if (delta > 60) setSelectedMapCafe(null);
            }
          } else {
            if (delta > 60 && panelExpanded) setPanelExpanded(false);
            if (delta < -60 && !panelExpanded) setPanelExpanded(true);
          }
        }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: panelExpanded ? 25 : 10,
          background: '#f3f3f3',
          borderRadius: (selectedMapCafe && panelExpanded) ? 0 : '16px 16px 0 0',
          height: panelExpanded ? '100%' : '50vh',
          transition: 'height 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
          ...(selectedMapCafe ? { transform: 'translateZ(0)', willChange: 'transform' } : {}),
        }}
      >
        {/* 핸들 — 풀스크린 상세 모드에서는 숨김 */}
        {!(selectedMapCafe && panelExpanded) && (
          <div
            onClick={() => setPanelExpanded(e => !e)}
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '12px 0 4px',
              flexShrink: 0,
              cursor: 'pointer',
            }}
          >
            <div style={{ width: 48, height: 4, borderRadius: 2, background: '#E5E8EB' }} />
          </div>
        )}

        {selectedMapCafe ? (
          /* ── 지도 마커 클릭 시 임베드 상세 ── */
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <DetailPage
              embedded
              cafeId={selectedMapCafe.id}
              onBack={() => { setSelectedMapCafe(null); setPanelExpanded(false); }}
              onClose={() => { setSelectedMapCafe(null); setPanelExpanded(false); }}
              onSwipeDown={() => { setSelectedMapCafe(null); setPanelExpanded(false); }}
            />
          </div>
        ) : (
          <>
            {/* 카테고리 칩 */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                padding: '8px 16px',
                flexShrink: 0,
                scrollbarWidth: 'none',
              }}
            >
              {CATEGORY_CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => setActiveChip(activeChip === chip ? null : chip)}
                  style={{
                    flexShrink: 0,
                    height: 32,
                    padding: '0 14px',
                    borderRadius: 8,
                    border: 'none',
                    background: activeChip === chip ? '#252525' : 'rgba(46,46,46,0.08)',
                    color: activeChip === chip ? '#ffffff' : 'rgba(0,0,0,0.7)',
                    fontSize: 13,
                    fontWeight: 590,
                    transition: 'background 0.15s',
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* 총 N개 + 정렬 헤더 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 16px 8px',
                flexShrink: 0,
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 14, color: '#6B7684' }}>
                총 <strong style={{ color: '#191F28' }}>{cafes.length}</strong>개
              </span>
              <button
                onClick={() => setSortPopupOpen(o => !o)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 14,
                  color: '#6B7684',
                  fontWeight: 400,
                }}
              >
                {sortType}
                <ArrowDownIcon />
              </button>

              {sortPopupOpen && (
                <SortPopup
                  current={sortType}
                  onSelect={t => { setSortType(t); setSortPopupOpen(false); }}
                  onClose={() => setSortPopupOpen(false)}
                />
              )}
            </div>

            {/* 카페 목록 */}
            <div
              style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}
              onScroll={(e) => {
                if (!panelExpanded && e.currentTarget.scrollTop > 0) {
                  setPanelExpanded(true);
                }
              }}
              onTouchStart={(e) => { touchStartYRef.current = e.touches[0].clientY; }}
              onTouchEnd={(e) => {
                const el = e.currentTarget;
                const delta = e.changedTouches[0].clientY - touchStartYRef.current;
                if (panelExpanded && el.scrollTop === 0 && delta > 60) {
                  setPanelExpanded(false);
                }
              }}
            >
              {cafes.length > 0 ? (
                cafes.map(cafe => (
                  <CafeRow
                    key={cafe.id}
                    cafe={cafe}
                    onTap={() => onDetailOpen(cafe.id)}
                    onFavoriteChange={(type, cafe) => {
                      showFavoriteSnackbar(type, cafe);
                    }}
                  />
                ))
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    marginTop: 32,
                    color: '#B0B8C1',
                  }}
                >
                  <span style={{ fontSize: 32 }}>☕</span>
                  <p style={{ fontSize: 14 }}>해당 카테고리의 카페가 없어요</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── 필터 모달 ── */}
      <FilterModal
        key={filterOpenKey}
        isOpen={filterOpen}
        initialFilters={appliedFilters}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setAppliedFilters(f);
          setFilterOpen(false);
        }}
      />

      {/* ── 위치 권한 바텀시트 ── */}
      {locSheet && (
        <LocationPermissionSheet
          type={locSheet}
          onClose={() => {
            // ask에서 아니요/외부 탭 → denied 처리
            // denied/granted/reask에서 확인/나중에 → 시트 닫기
            if (locSheet === 'ask') handleDenyLocation();
            else setLocSheet(null);
          }}
          onAllow={handleAllowLocation}       // ask 상태에서만 호출
          onOpenSettings={handleOpenSettings} // denied / reask 상태에서 호출 → SDK openPermissionDialog
        />
      )}

      {/* ── GPS 실패 토스트 ── */}
      <Toast
        open={gpsToast}
        position="top"
        text="현재 위치를 가져오지 못했어요. 다시 시도해주세요"
        onClose={() => setGpsToast(false)}
      />

      {/* ── 모음집 저장/제거 스낵바 ── */}
      {favoriteSnackbar === 'added' && (
        <Snackbar
          type="positive"
          message="카페를 모음집에 담았어요"
          actionLabel="보러가기"
          onAction={() => { onGoToFavorites?.(); setFavoriteSnackbar(null); }}
          onDismiss={() => setFavoriteSnackbar(null)}
        />
      )}
      {favoriteSnackbar === 'removed' && (
        <Snackbar
          type="negative"
          message="카페를 모음집에서 꺼냈어요"
          actionLabel="되돌리기"
          onAction={() => {
            if (removedCafe) addFavorite({ id: removedCafe.id, name: removedCafe.name, address: removedCafe.address, rating: removedCafe.rating, reviewCount: removedCafe.reviewCount, photos: [], distance: removedCafe.distance });
            setFavoriteSnackbar(null);
          }}
          onDismiss={() => setFavoriteSnackbar(null)}
        />
      )}

    </div>
  );
}
