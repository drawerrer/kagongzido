import { useState, useEffect, useRef } from 'react';
import { getCurrentLocation, Accuracy } from '@apps-in-toss/web-framework';
import FilterModal, { FilterState, DEFAULT_FILTERS } from '../components/FilterModal';
import LocationPermissionSheet, { LocationSheetType } from '../components/LocationPermissionSheet';
import { useFavorites } from '../context/FavoritesContext';
import NavBar from '../components/NavBar';

// ── 타입 ─────────────────────────────────
interface Cafe {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  tags: string[];
}

type SortType = '조회순' | '거리순' | '평점순';

// ── 상수 ─────────────────────────────────
const CATEGORY_CHIPS = ['카공', '두쫀쿠', '버터떡', '조용한', '넓은', '가성비'];

const MOCK_CAFES: Cafe[] = [
  { id: '1', name: '블루보틀 강남', address: '서울 강남구 논현로 508', distance: 150, rating: 4.8, reviewCount: 523, tags: ['카공', '넓은'] },
  { id: '2', name: '스타벅스 역삼역점', address: '서울 강남구 역삼로 123', distance: 280, rating: 4.5, reviewCount: 1200, tags: ['넓은'] },
  { id: '3', name: '모노 커피', address: '서울 강남구 언주로 234', distance: 410, rating: 4.9, reviewCount: 87, tags: ['조용한', '카공'] },
  { id: '4', name: '카페 베이커리', address: '서울 강남구 역삼동 567', distance: 590, rating: 4.3, reviewCount: 342, tags: ['가성비'] },
  { id: '5', name: '브런치 팩토리', address: '서울 강남구 선릉로 890', distance: 720, rating: 4.6, reviewCount: 156, tags: ['두쫀쿠'] },
  { id: '6', name: '더 로스터리', address: '서울 강남구 도곡로 321', distance: 950, rating: 4.7, reviewCount: 98, tags: ['카공', '버터떡'] },
];

const PANEL_COLLAPSED = 264;
// GPS 권한 상태는 SDK getCurrentLocation.getPermission() 으로 관리

// ── 아이콘 ────────────────────────────────
function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(3,24,50,0.46)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function FilterIcon({ active }: { active: boolean }) {
  const color = active ? '#fff' : '#191F28';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
      <path d="M14 12v7.88c.04.3-.06.62-.29.83a.996.996 0 0 1-1.41 0l-2.01-2.01a.99.99 0 0 1-.29-.83V12h-.03L4.21 4.62a1 1 0 0 1 .17-1.4c.19-.14.4-.22.62-.22h14c.22 0 .43.08.62.22a1 1 0 0 1 .17 1.4L14.03 12z"/>
    </svg>
  );
}

function GpsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#252525" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
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
function CafeRow({ cafe, onTap }: { cafe: Cafe; onTap: () => void }) {
  const fmtDist = (m: number) => (m < 1000 ? `${m}m` : `${(m / 1000).toFixed(1)}km`);
  const { isFavorited, addFavorite, removeFavorite } = useFavorites();
  const favorited = isFavorited(cafe.id);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favorited) {
      removeFavorite(cafe.id);
    } else {
      addFavorite({
        id: cafe.id,
        name: cafe.name,
        address: cafe.address,
        rating: cafe.rating,
        reviewCount: cafe.reviewCount,
        photos: [],
      });
    }
  };

  return (
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
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 4,
          minWidth: 0,
        }}
      >
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
            ⭐ {cafe.rating} · {fmtDist(cafe.distance)} · 리뷰 {cafe.reviewCount}
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

      {/* 하트 버튼 */}
      <button
        onClick={handleHeartClick}
        style={{
          alignSelf: 'center',
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'none', border: 'none', cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={favorited ? '#252525' : 'rgba(0,19,43,0.1)'}
            stroke={favorited ? '#252525' : 'rgba(0,19,43,0.2)'}
            strokeWidth="1"
          />
        </svg>
      </button>
    </div>
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
  initialState?: MapPageState;
  onStateChange?: (state: MapPageState) => void;
}

export default function MapPage({ onSearchOpen, onDetailOpen, initialState, onStateChange }: MapPageProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMap | null>(null);

  const [activeChip, setActiveChip] = useState<string | null>(initialState?.activeChip ?? null);
  const [sortType, setSortType] = useState<SortType>(initialState?.sortType ?? '조회순');
  const [sortPopupOpen, setSortPopupOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterOpenKey, setFilterOpenKey] = useState(0); // remount key
  const [panelExpanded, setPanelExpanded] = useState(initialState?.panelExpanded ?? false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialState?.appliedFilters ?? DEFAULT_FILTERS);
  const [filterApplied, setFilterApplied] = useState(initialState?.filterApplied ?? false); // 한 번이라도 적용했는지

  // 상태 변경 시 부모에 알림
  useEffect(() => {
    onStateChange?.({ activeChip, sortType, panelExpanded, appliedFilters, filterApplied });
  }, [activeChip, sortType, panelExpanded, appliedFilters, filterApplied]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 위치 권한 상태 ──────────────────────
  type GpsStatus = 'granted' | 'denied' | 'unknown';
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('unknown');
  const [locSheet, setLocSheet] = useState<LocationSheetType | null>(null);
  const [gpsToast, setGpsToast] = useState(false); // GPS 신호 실패 토스트

  // 카테고리 필터 + 정렬 적용
  const cafes = (() => {
    const filtered = activeChip
      ? MOCK_CAFES.filter(c => c.tags.includes(activeChip))
      : [...MOCK_CAFES];
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

    script.onload = () => {
      window.kakao.maps.load(() => {
        if (!mapRef.current) return;

        const defaultCenter = new window.kakao.maps.LatLng(37.4979, 127.0276);
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: defaultCenter,
          level: 4,
        });
        mapInstanceRef.current = map;

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

  const panelBottomValue = panelExpanded ? 'calc(72vh + 12px)' : `${PANEL_COLLAPSED + 12}px`;

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>

      {/* ── Navigation with Status Bar ── */}
      <NavBar variant="logo" floating />

      {/* ── 카카오 지도 배경 ── */}
      <div ref={mapRef} style={{ position: 'absolute', top: 'calc(env(safe-area-inset-top) + 44px + 72px)', bottom: 0, left: 0, right: 0, background: '#E8EAED' }}>
        {!import.meta.env.VITE_KAKAO_MAP_KEY && (
          /* API 키 미설정 시 안내 */
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: '#F2F4F6',
            }}
          >
            <span style={{ fontSize: 44 }}>🗺️</span>
            <p style={{ fontSize: 14, color: '#6B7684', fontWeight: 500 }}>카카오맵이 표시됩니다</p>
            <p style={{ fontSize: 12, color: '#B0B8C1', textAlign: 'center', lineHeight: 1.5 }}>
              .env에 VITE_KAKAO_MAP_KEY를<br />설정하면 실제 지도가 나타나요
            </p>
          </div>
        )}
      </div>

      {/* ── 상단 검색바 + 필터 버튼 ── */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(env(safe-area-inset-top) + 44px)',
          left: 0,
          right: 0,
          zIndex: 20,
          padding: '14px 16px',
          background: 'white',
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
              background: '#f3f3f3',
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
          bottom: panelBottomValue,
          zIndex: 20,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'bottom 0.3s ease',
        }}
      >
        <GpsIcon />
      </button>

      {/* ── 바텀 패널 ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          background: '#f3f3f3',
          borderRadius: '16px 16px 0 0',
          height: panelExpanded ? '72vh' : `${PANEL_COLLAPSED}px`,
          transition: 'height 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
        }}
      >
        {/* 핸들 */}
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
                borderRadius: 9999,
                border: 'none',
                background: activeChip === chip ? '#191F28' : '#F2F4F6',
                color: activeChip === chip ? 'white' : '#191F28',
                fontSize: 13,
                fontWeight: 600,
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

          {/* 정렬 팝업 */}
          {sortPopupOpen && (
            <SortPopup
              current={sortType}
              onSelect={t => { setSortType(t); setSortPopupOpen(false); }}
              onClose={() => setSortPopupOpen(false)}
            />
          )}
        </div>

        {/* 카페 목록 */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {cafes.length > 0 ? (
            cafes.map(cafe => <CafeRow key={cafe.id} cafe={cafe} onTap={() => onDetailOpen(cafe.id)} />)
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
      </div>

      {/* ── 필터 모달 ── */}
      <FilterModal
        key={filterOpenKey}
        isOpen={filterOpen}
        initialFilters={appliedFilters}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          setAppliedFilters(f);
          setFilterApplied(true);
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
      <div style={{
        position: 'absolute',
        bottom: `${PANEL_COLLAPSED + 20}px`,
        left: '50%',
        transform: `translateX(-50%) translateY(${gpsToast ? 0 : 12}px)`,
        opacity: gpsToast ? 1 : 0,
        transition: 'opacity 0.2s, transform 0.2s',
        background: '#191F28',
        color: 'white',
        borderRadius: 8,
        padding: '9px 16px',
        fontSize: 13,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        zIndex: 350,
        pointerEvents: 'none',
      }}>
        현재 위치를 가져오지 못했어요. 다시 시도해주세요
      </div>

    </div>
  );
}
