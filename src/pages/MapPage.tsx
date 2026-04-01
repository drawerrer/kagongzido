import { useState, useEffect, useRef } from 'react';
import FilterModal, { FilterState, DEFAULT_FILTERS } from '../components/FilterModal';

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

// ── 아이콘 ────────────────────────────────
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function FilterIcon({ active }: { active: boolean }) {
  const color = active ? '#020913' : 'white';
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="18" x2="14" y2="18" />
    </svg>
  );
}

function GpsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3182F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              color: opt === current ? '#3182F6' : '#191F28',
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
    </div>
  );
}

// ── MapPage (메인 화면) ───────────────────
interface MapPageProps {
  onSearchOpen: () => void;
  onDetailOpen: (cafeId: string) => void;
}

export default function MapPage({ onSearchOpen, onDetailOpen }: MapPageProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMap | null>(null);

  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [sortType, setSortType] = useState<SortType>('조회순');
  const [sortPopupOpen, setSortPopupOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterOpenKey, setFilterOpenKey] = useState(0); // remount key
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filterApplied, setFilterApplied] = useState(false); // 한 번이라도 적용했는지

  // 카테고리 필터 적용
  const cafes = activeChip
    ? MOCK_CAFES.filter(c => c.tags.includes(activeChip))
    : MOCK_CAFES;

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

        // 현재 위치로 이동
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            pos => {
              const userPos = new window.kakao.maps.LatLng(
                pos.coords.latitude,
                pos.coords.longitude,
              );
              map.setCenter(userPos);
            },
            () => {}, // 거부 시 무시
          );
        }
      });
    };

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  // ── 현재 위치로 돌아가기 ───────────────
  const goToCurrentLocation = () => {
    if (!navigator.geolocation || !mapInstanceRef.current) return;
    navigator.geolocation.getCurrentPosition(pos => {
      const userPos = new window.kakao.maps.LatLng(
        pos.coords.latitude,
        pos.coords.longitude,
      );
      mapInstanceRef.current?.setCenter(userPos);
    });
  };

  const panelBottomValue = panelExpanded ? 'calc(72vh + 12px)' : `${PANEL_COLLAPSED + 12}px`;

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>

      {/* ── 카카오 지도 배경 ── */}
      <div ref={mapRef} style={{ position: 'absolute', inset: 0, background: '#E8EAED' }}>
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
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          padding: '12px 16px',
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
              gap: 8,
              background: 'white',
              borderRadius: 10,
              height: 44,
              padding: '0 14px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
            }}
          >
            <SearchIcon />
            <span style={{ color: '#B0B8C1', fontSize: 14 }}>카페를 검색해보세요</span>
          </div>

          {/* 필터 버튼 */}
          <button
            onClick={() => { setFilterOpenKey(k => k + 1); setFilterOpen(true); }}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              flexShrink: 0,
              background: filterApplied ? '#ffffff' : '#4E5968',
              border: filterApplied ? '1px solid #E5E8EB' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
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
          background: 'white',
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
                background: activeChip === chip ? '#191F28' : '#4E5968',
                color: 'white',
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
    </div>
  );
}
