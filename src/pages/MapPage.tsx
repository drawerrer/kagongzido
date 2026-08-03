import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getCurrentLocation, Accuracy, partner, tdsEvent } from '@apps-in-toss/web-framework';
import { useBackEvent } from '../hooks/useBackEvent';
import { Toast } from '@toss/tds-mobile';
import FilterModal, { FilterState, DEFAULT_FILTERS } from '../components/FilterModal';
import { expandHours, getHoursStatus } from '../utils/hours';
import { trackFilterOpen, trackFilterApply, trackChipTap, trackCafeDetailView, trackViewModeChange, trackNearbyLaptopSheetShow, trackNearbyLaptopSheetConfirm, trackMapMove } from '../services/analytics';
import LocationPermissionSheet, { LocationSheetType } from '../components/LocationPermissionSheet';
import { useFavorites } from '../context/FavoritesContext';
import Snackbar from '../components/Snackbar';
import DetailPage from './DetailPage';
import PlaceDetailPage from './PlaceDetailPage';
import { fetchAllStores, fetchLibraries, fetchSharedSpaces, type StoreRow } from '../services/db';
import Chip from '../components/Chip';
import StoreCardHome, { type HomeCafe } from '../components/StoreCard/Home';
import NearbyLaptopCafesDialog from '../components/NearbyLaptopCafesDialog';
import { pickTopLaptopFriendlyCafes } from '../utils/laptopFriendly';
import { splitVibeTags, sortVibeTagsByLightFirst } from '../utils/vibeTags';
import StoreCountBar from '../components/StoreCountBar';
import CafePlaceholder from '../components/CafePlaceholder';
import IcCafe from '../assets/icons/ic_cafe_mono.svg';
import IcLibrary from '../assets/icons/ic_library_mono.svg';
import IcShared from '../assets/icons/ic_shared_mono.svg';

// Kakao Maps SDK 전역 타입은 src/kakao.d.ts 에서 선언한다.

// ── 타입 ─────────────────────────────────
export interface PlaceItem {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  thumbnailUrl?: string;
  photos?: string[];
  phone?: string;
  businessHours?: string;
  ltSeatStatus?: string;   // 노트북 가능 여부
  entCondition?: string;   // 입장 조건
  entPrice?: string;       // 입장료
  facilities?: string[];   // 시설 태그
  amenities?: string[];
  websiteUrl?: string;
  placeType: 'library' | 'shared_space';
}

interface Cafe {
  id: string;
  name: string;
  address: string;
  distance: number;
  rating: number;
  reviewCount: number;
  tags: string[];
  moods: string[];
  priceRange: number;
  options: string[];
  lat?: number;
  lng?: number;
  thumbnailUrl?: string;
  badges: string[];
  ltSeatStatus?: string;
  entCondition?: string;
  /** 콘센트 상태 — '부족' | '적당' | '넉넉' ("노트북 펴기 좋은 카페" 추천 산정용) */
  outletStatus?: string;
  /** 좌석 규모 — '소형' | '중형' | '대형' ("노트북 펴기 좋은 카페" 추천 산정용) */
  seatStatus?: string;
}


const CATEGORY_CHIPS = ['전체', '카페', '도서관', '공유공간'];

// amenity key → cafe option 라벨 매핑 (storeToOptions와 동기화)
const AMENITY_TO_CAFE_OPTION: Record<string, string> = {
  'sound-moderate': '소음 적당',
  'quiet': '조용',
  'separateRestroom': '남/녀 화장실 구분',
  'indoorRestroom': '내부 화장실',
  'groupVisit': '단체 방문 가능',
  'pets': '반려동물 동반 가능',
  'noTimeLimit': '시간제한 없음',
  'parking': '주차 가능',
  'coffeeMachine': '커피머신',
  'decafFree': '디카페인 무료 변경',
  'wifi': '무선 인터넷',
  'takeout': '포장 가능',
  'wheelchair': '휠체어 이용',
};

// ── 유틸 ─────────────────────────────────
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function storeToOptions(store: StoreRow): string[] {
  const opts: string[] = [];
  if (store.outlet_status === '넉넉') opts.push('콘센트 충분');
  if (store.noise_status === '적당') opts.push('소음 적당');
  if (store.noise_status === '조용') opts.push('조용');
  if (store.amenities?.includes('separateRestroom')) opts.push('남/녀 화장실 구분');
  if (store.amenities?.includes('indoorRestroom')) opts.push('내부 화장실');
  if (store.amenities?.includes('groupVisit')) opts.push('단체 방문 가능');
  if (store.amenities?.includes('pets')) opts.push('반려동물 동반 가능');
  if (store.amenities?.includes('noTimeLimit')) opts.push('시간제한 없음');
  if (store.amenities?.includes('parking')) opts.push('주차 가능');
  if (store.amenities?.includes('coffeeMachine')) opts.push('커피머신');
  if (store.amenities?.includes('decafFree')) opts.push('디카페인 무료 변경');
  if (store.amenities?.includes('wifi')) opts.push('무선 인터넷');
  if (store.amenities?.includes('takeout')) opts.push('포장 가능');
  if (store.amenities?.includes('wheelchair')) opts.push('휠체어 이용');
  return opts;
}

function makeUserMarkerHtml(heading: number | null): string {
  if (heading != null) {
    return `<svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style="display:block;">
      <g transform="rotate(${heading}, 24, 24)">
        <polygon points="24,2 17,22 24,19 31,22" fill="rgba(49,130,246,0.3)"/>
      </g>
      <circle cx="24" cy="24" r="9" fill="#3182F6" stroke="white" stroke-width="3"/>
    </svg>`;
  }
  return `<div style="width:16px;height:16px;background:#3182F6;border:3px solid #ffffff;border-radius:50%;box-shadow:0 2px 8px rgba(49,130,246,0.5);"></div>`;
}

function makePillHtml(cafeId: string, name: string, selected: boolean): string {
  const label = name.length > 8 ? name.slice(0, 8) + '…' : name;
  const bg = selected ? '#252525' : '#ffffff';
  const color = selected ? '#ffffff' : '#191F28';
  const shadow = selected ? '0 2px 10px rgba(0,0,0,0.45)' : '0 2px 6px rgba(0,0,0,0.18)';
  const border = selected ? 'none' : '1px solid #e5e8eb';
  // ☕ 이모지 → 카공지도 로고 PNG (선택 시 흰 배경 위라 opacity 0.9, 비선택 시 0.7)
  const iconOpacity = selected ? 0.95 : 0.75;
  return `<div data-cafe-id="${cafeId}" style="display:inline-flex;align-items:center;gap:4px;background:${bg};color:${color};border-radius:999px;padding:5px 10px 5px 8px;box-shadow:${shadow};white-space:nowrap;font-size:12px;font-weight:600;font-family:Pretendard,sans-serif;border:${border};cursor:pointer;"><img src="${IcCafe}" alt="" style="width:14px;height:14px;object-fit:contain;opacity:${iconOpacity};display:block;" draggable="false"/>${label}</div>`;
}

// ── 아이콘 ────────────────────────────────
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


function makePlacePillHtml(placeId: string, name: string, placeType: 'library' | 'shared_space', selected: boolean): string {
  const label = name.length > 8 ? name.slice(0, 8) + '…' : name;
  const bg = selected ? '#252525' : '#ffffff';
  const color = selected ? '#ffffff' : '#191F28';
  const shadow = selected ? '0 2px 10px rgba(0,0,0,0.45)' : '0 2px 6px rgba(0,0,0,0.18)';
  const border = selected ? 'none' : '1px solid #e5e8eb';
  const iconSrc = placeType === 'library' ? IcLibrary : IcShared;
  const iconOpacity = selected ? 0.95 : 0.75;
  return `<div data-place-id="${placeId}" style="display:inline-flex;align-items:center;gap:4px;background:${bg};color:${color};border-radius:999px;padding:5px 10px 5px 8px;box-shadow:${shadow};white-space:nowrap;font-size:12px;font-weight:600;font-family:Pretendard,sans-serif;border:${border};cursor:pointer;"><img src="${iconSrc}" alt="" style="width:14px;height:14px;object-fit:contain;opacity:${iconOpacity};display:block;" draggable="false"/>${label}</div>`;
}

/** libraries/db.ts PlaceRow → MapPage PlaceItem 변환 — MapPage/App.tsx 양쪽에서 공유 */
export function placeRowToItem(r: import('../services/db').PlaceRow, type: PlaceItem['placeType']): PlaceItem {
  return {
    id: r.id, name: r.name, address: r.address_road,
    lat: r.latitude, lng: r.longitude,
    thumbnailUrl: r.thumbnail_url || undefined,
    photos: r.photo_urls || undefined,
    phone: r.phone_number || undefined,
    businessHours: r.business_hours || undefined,
    ltSeatStatus: r.lt_seat_status || undefined,
    entCondition: r.ent_condition || undefined,
    entPrice: r.ent_price || undefined,
    facilities: r.facilities || undefined,
    amenities: r.amenities || undefined,
    websiteUrl: r.website_url || undefined,
    placeType: type,
  };
}

function CafeRow({ cafe, onTap, onFavoriteChange }: { cafe: Cafe; onTap: () => void; onFavoriteChange?: (type: 'added' | 'removed', cafe: Cafe) => void }) {
  return (
    <StoreCardHome
      cafe={cafe}
      onTap={onTap}
      onFavoriteChange={onFavoriteChange as ((type: 'added' | 'removed', cafe: HomeCafe) => void) | undefined}
    />
  );
}

/** 도서관/공유공간 리스트 카드 — 카페 카드(StoreCardHome)와 동일한 하트(찜) UI를 그대로 재사용 */
function PlaceCard({ place, distance, reviewCount, onTap, onFavoriteChange }: { place: PlaceItem; distance: number; reviewCount: number; onTap?: () => void; onFavoriteChange?: (type: 'added' | 'removed', cafe: HomeCafe) => void }) {
  const homeCafe: HomeCafe = {
    id: place.id,
    name: place.name,
    address: place.address,
    distance,
    rating: 0,
    reviewCount,
    thumbnailUrl: place.thumbnailUrl,
    badges: [...(place.facilities ?? []), place.entPrice].filter(Boolean) as string[],
    placeType: place.placeType,
    ltSeatStatus: place.ltSeatStatus,
    entCondition: place.entCondition,
  };
  return (
    <StoreCardHome
      cafe={homeCafe}
      onTap={onTap ?? (() => {})}
      onFavoriteChange={onFavoriteChange}
    />
  );
}

// ── MapPage 상태 타입 ─────────────────────
type PanelState = 'minimized' | 'half' | 'expanded';

// ── 레이아웃 상수 ─────────────────────────────────────────
// 최소화 시트의 top 위치 = 시트 height (bottom: 0 기준).
// 탭바(env+8 + 56) 위로 핸들이 노출되도록 충분히 큰 값.
// 시트 높이 조정 시 이 한 줄만 수정하면 GPS·지도도 자동 보정됨.
const SHEET_MIN_TOP = 'calc(env(safe-area-inset-bottom, 0px) + 132px)';
// 시트 위쪽 12px 떨어진 위치 (GPS 버튼)
const GPS_MIN_BOTTOM = `calc(${SHEET_MIN_TOP} + 12px)`;
// 시트보다 20px 아래에서 끝나는 위치 (지도 컨테이너)
const MAP_MIN_BOTTOM = `calc(${SHEET_MIN_TOP} - 20px)`;
// 클러스터러 minLevel과 동일하게 유지 — 이 레벨 미만에서는 클러스터링이 비활성화됨
const CLUSTER_MIN_LEVEL = 5;

export interface MapPageState {
  activeChip: string | null;
  panelState: PanelState;
  appliedFilters: FilterState;
  filterApplied: boolean;
}

interface MapPageProps {
  onSearchOpen: () => void;
  onDetailOpen: (cafeId: string) => void;
  /** 도서관/공유공간 리스트 항목 탭 — 카페와 동일하게 풀스크린 상세로 전환 (App.tsx 오버레이) */
  onPlaceDetailOpen: (place: PlaceItem) => void;
  onGoToFavorites?: () => void;
  onFocusModeChange?: (active: boolean) => void;
  initialState?: MapPageState;
  onStateChange?: (state: MapPageState) => void;
  /** 상위 App 에서 DetailPage/Search 등 오버레이가 떠 있는지 — 닫혔을 때 search accessory button 복구 트리거 */
  hasOverlay?: boolean;
}

export default function MapPage({ onSearchOpen, onDetailOpen, onPlaceDetailOpen, onGoToFavorites, initialState, onStateChange, onFocusModeChange, hasOverlay = false }: MapPageProps) {
  const touchStartYRef = useRef<number>(0);
  // 드래그 도중 scrollTop===0 에 도달한 적이 있는지 — expanded 시 사용자가 위에서 아래로
  // 끝까지 끌어내려 collapse 의도를 보일 때 잡기 위함
  const listReachedTopRef = useRef<boolean>(false);
  // 맨 위 도달 시점의 finger Y — 거기서부터의 추가 drag 거리로 collapse 판단 (안정성 ↑)
  const listReachedTopYRef = useRef<number>(0);
  // 이번 터치 시퀀스에서 collapse(or 상태전환)가 이미 트리거됐는지
  // touchMove 에서 expanded→half 후, touchEnd 가 half→minimized 로 cascade 트리거하는 것 방지
  const collapseTriggeredRef = useRef<boolean>(false);

  // ── Kakao Maps refs ───────────────────────
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const overlaysRef = useRef<Map<string, any>>(new Map());   // cafeId → CustomOverlay
  const markersRef = useRef<Map<string, any>>(new Map());    // cafeId → (투명) Marker
  const placeOverlaysRef = useRef<Map<string, any>>(new Map()); // placeId → CustomOverlay
  const placeMarkersRef = useRef<Map<string, any>>(new Map()); // placeId → invisible marker (for clusterer)
  const userOverlayRef = useRef<any>(null);
  const cafesRef = useRef<Cafe[]>([]);
  const pendingCenterRef = useRef<[number, number] | null>(null);
  const clusterClickRef = useRef<boolean>(false);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [mapBounds, setMapBounds] = useState<{ swLat: number; swLng: number; neLat: number; neLng: number } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const { addFavorite, reviewCounts } = useFavorites();

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [libraries, setLibraries] = useState<PlaceItem[]>([]);
  const [sharedSpaces, setSharedSpaces] = useState<PlaceItem[]>([]);
  /** 도서관/공유공간 카드의 거리 계산용 — 카페 로드 useEffect에서 함께 세팅됨 */
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(null);
  const [activeChip, setActiveChip] = useState<string | null>(initialState?.activeChip ?? '전체');
const [filterOpen, setFilterOpen] = useState(false);
  const [filterOpenKey, setFilterOpenKey] = useState(0);
  const [panelState, setPanelState] = useState<PanelState>(initialState?.panelState ?? 'half');
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialState?.appliedFilters ?? DEFAULT_FILTERS);
  const [selectedMapCafe, setSelectedMapCafe] = useState<Cafe | null>(null);
  const [detailHasSubPage, setDetailHasSubPage] = useState(false);

  type GpsStatus = 'granted' | 'denied' | 'unknown';
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('unknown');
  const [locSheet, setLocSheet] = useState<LocationSheetType | null>(null);
  const [gpsToast, setGpsToast] = useState(false);
  const [favoriteSnackbar, setFavoriteSnackbar] = useState<'added' | 'removed' | null>(null);
  const [removedCafe, setRemovedCafe] = useState<HomeCafe | null>(null);
  const [nearbySheetOpen, setNearbySheetOpen] = useState(false);
  const [nearbySheetCafes, setNearbySheetCafes] = useState<Cafe[]>([]);

  // cafesRef 항상 최신 유지
  useEffect(() => { cafesRef.current = cafes; }, [cafes]);

  // ── 네비게이션 바 우측 검색 버튼 이벤트 리스너 등록 ────────────────────
  // unmount(탭 이동) 시 removeAccessoryButton 으로 다른 탭에 버튼이 남지 않도록 정리
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    try {
      cleanup = tdsEvent.addEventListener('navigationAccessoryEvent', {
        onEvent: ({ id }: { id: string }) => {
          if (id === 'search') onSearchOpen();
        },
      });
    } catch {}
    return () => {
      try { cleanup?.(); } catch {}
      try { partner.removeAccessoryButton(); } catch {}
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 검색 버튼 표시 — 카페/도서관/공유공간 상세 확장(expanded) 중에는
  // DetailPage / PlaceDetailPage 의 하트 버튼이 표시되므로 제외
  // panelState / selectedMapCafe / selectedPlace / hasOverlay 가 바뀔 때마다 재등록
  //   → DetailPage / PlaceDetailPage / SearchPage 가 닫혀 hasOverlay=false 가 되면 search 버튼 복구
  useEffect(() => {
    if (hasOverlay) return;            // 오버레이 떠 있을 땐 자식 페이지가 자체 버튼 관리
    if ((!selectedMapCafe && !selectedPlace) || panelState !== 'expanded') {
      try {
        partner.addAccessoryButton({ id: 'search', title: '검색', icon: { name: 'icon-search-mono' } });
      } catch {}
    }
  }, [selectedMapCafe, selectedPlace, panelState, hasOverlay]);

  // 지도 패널 열린 상태에서 백 → 패널 닫기 (그 외엔 SDK 기본 동작 = 앱 종료)
  useBackEvent(
    () => { setSelectedMapCafe(null); setPanelState('half'); },
    !!selectedMapCafe && !detailHasSubPage && !hasOverlay,
  );

  // panelState ref — updateBounds에서 클로저 문제 없이 최신값 참조
  const panelStateRef = useRef<PanelState>(panelState);
  useEffect(() => { panelStateRef.current = panelState; }, [panelState]);

  // 탐색 모드 트래킹: expanded → list, minimized → map
  const prevPanelStateRef = useRef<PanelState>(panelState);
  useEffect(() => {
    const prev = prevPanelStateRef.current;
    prevPanelStateRef.current = panelState;
    if (panelState === prev) return;
    if (panelState === 'expanded') trackViewModeChange('list');
    else if (panelState === 'minimized') trackViewModeChange('map');
  }, [panelState]);

  const isCafeChip  = activeChip === '카페';
  const isPlaceChip = activeChip === '도서관' || activeChip === '공유공간';

  // 카테고리가 바뀌면 해당 카테고리와 무관한 필터 값 초기화
  useEffect(() => {
    setAppliedFilters(prev => {
      if (activeChip === '카페') {
        return {
          ...prev,
          laptopStatus: [],
          entConditions: [],
          amenities: prev.amenities.filter(k => k !== 'coffeeMachine'),
        };
      }
      if (activeChip === '공유공간') {
        // 노트북 사용만 초기화, 입장 조건은 공유공간에서도 유효
        return { ...prev, laptopStatus: [] };
      }
      if (activeChip === '도서관' || activeChip === '공유공간') {
        return {
          ...prev,
          moods: [],
          priceMax: DEFAULT_FILTERS.priceMax,
          amenities: prev.amenities.filter(k => k !== 'decafFree'),
        };
      }
      return prev;
    });
  }, [activeChip]); // eslint-disable-line react-hooks/exhaustive-deps

  const filterApplied =
    appliedFilters.openNow !== DEFAULT_FILTERS.openNow ||
    (!isCafeChip && (appliedFilters.laptopStatus.length > 0 || appliedFilters.entConditions.length > 0)) ||
    (!isPlaceChip && (appliedFilters.moods.length > 0 || appliedFilters.priceMax !== DEFAULT_FILTERS.priceMax)) ||
    appliedFilters.amenities.length > 0;

  useEffect(() => {
    onStateChange?.({ activeChip, panelState, appliedFilters, filterApplied });
  }, [activeChip, panelState, appliedFilters, filterApplied]); // eslint-disable-line react-hooks/exhaustive-deps

  const showFavoriteSnackbar = (type: 'added' | 'removed', cafe?: HomeCafe) => {
    if (type === 'removed' && cafe) setRemovedCafe(cafe);
    setFavoriteSnackbar(type);
  };

  const showCafes = activeChip === '전체' || activeChip === '카페' || !activeChip;
  const showLibraries = activeChip === '전체' || activeChip === '도서관';
  const showSharedSpaces = activeChip === '전체' || activeChip === '공유공간';

  const filteredCafes = (() => {
    if (!showCafes) return [];
    let filtered = [...cafes];
    if (mapBounds) {
      filtered = filtered.filter(c =>
        c.lat != null && c.lng != null &&
        c.lat >= mapBounds.swLat && c.lat <= mapBounds.neLat &&
        c.lng >= mapBounds.swLng && c.lng <= mapBounds.neLng
      );
    }
    if (appliedFilters.moods.length > 0) filtered = filtered.filter(c => appliedFilters.moods.some(m => c.moods.includes(m)));
    if (appliedFilters.priceMax < DEFAULT_FILTERS.priceMax) filtered = filtered.filter(c => c.priceRange <= appliedFilters.priceMax);
    if (appliedFilters.amenities.length > 0) {
      filtered = filtered.filter(c =>
        appliedFilters.amenities.some(key => {
          const label = AMENITY_TO_CAFE_OPTION[key];
          return label ? c.options.includes(label) : false;
        })
      );
    }
    if (appliedFilters.laptopStatus.length > 0) {
      filtered = filtered.filter(c =>
        appliedFilters.laptopStatus.some(chip => {
          if (chip === '가능') return !!c.ltSeatStatus && /가능/.test(c.ltSeatStatus);
          if (chip === '불가') return !c.ltSeatStatus || /불가/.test(c.ltSeatStatus);
          return false;
        })
      );
    }
    if (appliedFilters.entConditions.length > 0) {
      filtered = filtered.filter(c =>
        appliedFilters.entConditions.some(cond => {
          if (cond === '조건 없음') return !c.entCondition || /조건\s*없|무료/.test(c.entCondition);
          if (cond === '유료') return /유료/.test(c.entCondition ?? '');
          if (cond === '이용권') return /이용권/.test(c.entCondition ?? '');
          if (cond === '회원제') return /회원/.test(c.entCondition ?? '');
          return false;
        })
      );
    }
    return filtered;
  })();

  const boundsFilter = (p: PlaceItem) => !mapBounds || (
    p.lat >= mapBounds.swLat && p.lat <= mapBounds.neLat &&
    p.lng >= mapBounds.swLng && p.lng <= mapBounds.neLng
  );

  const applyPlaceFilters = (items: PlaceItem[]): PlaceItem[] => {
    let result = items;
    const af = appliedFilters;
    if (af.openNow) {
      result = result.filter(p => {
        const { hours, regularHoliday } = expandHours(p.businessHours ?? null);
        return getHoursStatus(hours, regularHoliday).label === '영업 중';
      });
    }
    if (af.laptopStatus.length > 0) {
      result = result.filter(p =>
        af.laptopStatus.some(chip => {
          if (chip === '가능') return p.ltSeatStatus === '가능' || (!!p.ltSeatStatus && /가능/.test(p.ltSeatStatus) && !/지정|일부/.test(p.ltSeatStatus));
          if (chip === '불가') return !p.ltSeatStatus || /불가/.test(p.ltSeatStatus);
          if (chip === '지정 좌석에서만 가능') return !!p.ltSeatStatus && /지정|일부/.test(p.ltSeatStatus);
          return false;
        })
      );
    }
    if (af.entConditions.length > 0) {
      result = result.filter(p =>
        af.entConditions.some(cond => {
          if (cond === '조건 없음')  return !p.entCondition || /조건\s*없|무료/.test(p.entCondition);
          if (cond === '예약 필요')  return /예약/.test(p.entCondition ?? '');
          if (cond === '입장료')     return /입장료|유료/.test(p.entCondition ?? '') || /유료/.test(p.entPrice ?? '');
          if (cond === '회원 가입')  return /회원/.test(p.entCondition ?? '');
          if (cond === '열람증 발급') return /열람증/.test(p.entCondition ?? '');
          if (cond === '연령 제한')  return /연령|나이|제한/.test(p.entCondition ?? '');
          return false;
        })
      );
    }
    if (af.amenities.length > 0) {
      result = result.filter(p =>
        af.amenities.some(key => p.amenities?.includes(key))
      );
    }
    return result;
  };

  const filteredLibraries = showLibraries ? applyPlaceFilters(libraries.filter(boundsFilter)) : [];
  const filteredSharedSpaces = showSharedSpaces ? applyPlaceFilters(sharedSpaces.filter(boundsFilter)) : [];

  // ── Kakao Maps SDK 초기화 (index.html에서 정적 로드 완료) ──
  useEffect(() => {
    const init = () => window.kakao.maps.load(() => setMapLoaded(true));
    if (window.kakao?.maps) {
      init();
    } else {
      // SDK 스크립트가 아직 파싱 중인 경우 대기
      const interval = setInterval(() => {
        if (window.kakao?.maps) { clearInterval(interval); init(); }
      }, 50);
      return () => clearInterval(interval);
    }
  }, []);

  // ── 지도 초기화 ───────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || mapRef.current) return;

    const map = new window.kakao.maps.Map(mapContainerRef.current, {
      center: new window.kakao.maps.LatLng(37.4979, 127.0276),
      level: 5,
    });
    mapRef.current = map;

    // pending 위치 처리 (SDK 로드 전 위치 취득 시)
    if (pendingCenterRef.current) {
      const [lat, lng] = pendingCenterRef.current;
      map.setCenter(new window.kakao.maps.LatLng(lat, lng));
      pendingCenterRef.current = null;
    }

    // 클러스터러 초기화
    const clusterer = new window.kakao.maps.MarkerClusterer({
      map,
      averageCenter: true,
      minLevel: CLUSTER_MIN_LEVEL,
      gridSize: 60,
      styles: [{
        width: '40px', height: '40px',
        background: '#ffffff',
        border: '2.5px solid #252525',
        borderRadius: '50%',
        color: '#252525',
        textAlign: 'center',
        fontWeight: '700',
        lineHeight: '36px',
        fontSize: '14px',
        fontFamily: 'Pretendard, sans-serif',
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
      }],
    });
    clustererRef.current = clusterer;

    // 클러스터 클릭: Kakao 기본 줌(한 레벨 줌인)을 사용하고
    // dragstart 오발화 방지를 위한 ref 관리만 수행
    window.kakao.maps.event.addListener(clusterer, 'clusterclick', () => {
      clusterClickRef.current = true;
      setTimeout(() => { clusterClickRef.current = false; }, 700);
    });

    // 클러스터링 이벤트: 묶인 마커의 overlay 숨김 처리 (카페 + 도서관 + 공유공간 통합)
    window.kakao.maps.event.addListener(clusterer, 'clustered', (clusters: KakaoCluster[]) => {
      const clusteredSet = new Set<KakaoMarker>();
      clusters.forEach(c => c.getMarkers().forEach(m => clusteredSet.add(m)));
      overlaysRef.current.forEach((overlay, cafeId) => {
        const marker = markersRef.current.get(cafeId);
        overlay.setMap(clusteredSet.has(marker) ? null : map);
      });
      placeOverlaysRef.current.forEach((overlay, placeId) => {
        const marker = placeMarkersRef.current.get(placeId);
        overlay.setMap(clusteredSet.has(marker) ? null : map);
      });
    });

    // 클러스터 탭 시 기본 줌으로 CLUSTER_MIN_LEVEL 미만으로 넘어가면 클러스터러가
    // 비활성화되어 'clustered' 이벤트가 다시 발화되지 않음 — 이때 숨겨진 채로 남은
    // overlay(카페/장소 핀)를 직접 복구해줌
    window.kakao.maps.event.addListener(map, 'zoom_changed', () => {
      if (map.getLevel() < CLUSTER_MIN_LEVEL) {
        overlaysRef.current.forEach(overlay => overlay.setMap(map));
        placeOverlaysRef.current.forEach(overlay => overlay.setMap(map));
      }
    });

    // 사용자가 지도를 직접 드래그할 때 시트를 minimized 로 자동 축소 (지도 시야 확보)
    // zoom_changed 대신 dragstart 사용: setBounds 등 프로그래밍 줌은 제외
    // clusterclick 처리 중에는 dragstart를 무시 (클러스터 탭 시 오발화 방지)
    window.kakao.maps.event.addListener(map, 'dragstart', () => {
      if (clusterClickRef.current) return;
      setPanelState('minimized');
    });

    window.kakao.maps.event.addListener(map, 'dragend', () => {
      const center = map.getCenter();
      trackMapMove(center.getLat(), center.getLng(), map.getLevel());
    });

    // ── 현재 지도 뷰 bounds → 바텀시트 카페 필터링 ──
    const updateBounds = () => {
      const b = map.getBounds();
      const mapEl = mapContainerRef.current;
      let swLat = b.getSouthWest().getLat();

      if (mapEl) {
        // 바텀시트 상단 위치 (화면 최상단 기준 px)
        const ps = panelStateRef.current;
        let sheetHeightPx = 0;
        if (ps === 'half') sheetHeightPx = window.innerHeight * 0.5;
        else if (ps === 'minimized') sheetHeightPx = 132; // SHEET_MIN_TOP 기준
        // expanded → 지도가 가려지지 않음 (sheetHeightPx = 0)

        const mapRect = mapEl.getBoundingClientRect();
        const mapHeightPx = mapRect.height;
        const sheetTopFromTop = window.innerHeight - sheetHeightPx;
        // 지도 컨테이너 중 바텀시트에 가려진 픽셀 수
        const coveredPx = Math.max(0, mapRect.bottom - sheetTopFromTop);

        if (coveredPx > 0 && mapHeightPx > 0) {
          const latRange = b.getNorthEast().getLat() - b.getSouthWest().getLat();
          // 남쪽(하단) 경계를 가려진 만큼 위로 올림
          swLat = b.getSouthWest().getLat() + latRange * (coveredPx / mapHeightPx);
        }
      }

      setMapBounds({
        swLat,
        swLng: b.getSouthWest().getLng(),
        neLat: b.getNorthEast().getLat(),
        neLng: b.getNorthEast().getLng(),
      });
    };
    window.kakao.maps.event.addListener(map, 'bounds_changed', updateBounds);
    // 초기 bounds 설정 (지도 렌더 완료 후)
    setTimeout(updateBounds, 100);

  }, [mapLoaded]);

  // ── 마커/오버레이 추가 ─────────────────────
  useEffect(() => {
    if (!mapRef.current || !clustererRef.current || cafes.length === 0) return;
    const map = mapRef.current;

    // 기존 제거
    overlaysRef.current.forEach(ov => ov.setMap(null));
    overlaysRef.current.clear();
    clustererRef.current.clear();
    markersRef.current.clear();

    const newMarkers: any[] = [];

    cafes.forEach(cafe => {
      if (!cafe.lat || !cafe.lng) return;
      const pos = new window.kakao.maps.LatLng(cafe.lat, cafe.lng);

      // 클러스터용 투명 마커 (1×1 투명 GIF)
      const marker = new window.kakao.maps.Marker({
        position: pos,
        image: new window.kakao.maps.MarkerImage(
          'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
          new window.kakao.maps.Size(1, 1)
        ),
      });
      markersRef.current.set(cafe.id, marker);
      newMarkers.push(marker);

      // 이름 표시 CustomOverlay
      const div = document.createElement('div');
      div.innerHTML = makePillHtml(cafe.id, cafe.name, false);

      const overlay = new window.kakao.maps.CustomOverlay({
        position: pos,
        content: div,
        map,
        yAnchor: 1.3,
        zIndex: 3,
      });
      overlaysRef.current.set(cafe.id, overlay);
    });

    clustererRef.current.addMarkers(newMarkers);
  }, [cafes, mapLoaded]);

  // ── 마커 클릭 (이벤트 위임) ────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const container = mapContainerRef.current;
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-cafe-id]');
      if (!target) return;
      const cafeId = target.getAttribute('data-cafe-id');
      if (!cafeId) return;
      const cafe = cafesRef.current.find(c => c.id === cafeId);
      if (cafe) {
        trackCafeDetailView(cafe.id, 'map_marker');
        setSelectedPlace(null);
        setSelectedMapCafe(cafe);
        setPanelState('half');
      }
    };
    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [mapLoaded]);

// ── 선택된 마커 스타일 업데이트 ───────────
  useEffect(() => {
    const selectedId = selectedMapCafe?.id ?? null;
    overlaysRef.current.forEach((overlay, cafeId) => {
      const cafe = cafesRef.current.find(c => c.id === cafeId);
      if (!cafe) return;
      const content = overlay.getContent() as HTMLElement;
      content.innerHTML = makePillHtml(cafeId, cafe.name, cafeId === selectedId);
    });
  }, [selectedMapCafe]);

  useEffect(() => {
    const selectedId = selectedPlace?.id ?? null;
    placeOverlaysRef.current.forEach((overlay, placeId) => {
      const place = [...libraries, ...sharedSpaces].find(p => p.id === placeId);
      if (!place) return;
      const content = overlay.getContent() as HTMLElement;
      content.innerHTML = makePlacePillHtml(placeId, place.name, place.placeType, placeId === selectedId);
    });
  }, [selectedPlace, libraries, sharedSpaces]);

  // ── 현재 위치 오버레이 업데이트 ──────────
  useEffect(() => {
    if (!mapRef.current || !userPosition) return;
    const map = mapRef.current;
    if (userOverlayRef.current) userOverlayRef.current.setMap(null);

    const div = document.createElement('div');
    div.innerHTML = makeUserMarkerHtml(heading);

    userOverlayRef.current = new window.kakao.maps.CustomOverlay({
      position: new window.kakao.maps.LatLng(userPosition[0], userPosition[1]),
      content: div,
      map,
      xAnchor: 0.5,
      yAnchor: 0.5,
      zIndex: 10,
    });
  }, [userPosition, heading]);

  // ── 나침반 방향 감지 ──────────────────────
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const h = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading
        ?? (e.alpha != null ? (360 - e.alpha + 360) % 360 : null);
      if (h != null) setHeading(Math.round(h));
    };
    const listen = () => {
      window.addEventListener('deviceorientationabsolute', handler as EventListener, true);
      window.addEventListener('deviceorientation', handler as EventListener, true);
    };
    // 일부 웹뷰(앱인토스 등)에는 DeviceOrientationEvent 전역 자체가 없어서
    // 바로 참조하면 ReferenceError가 발생한다 → typeof로 존재 여부부터 확인
    const DOE = (typeof DeviceOrientationEvent !== 'undefined' ? DeviceOrientationEvent : undefined) as
      | (typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> })
      | undefined;
    if (DOE && typeof DOE.requestPermission === 'function') {
      DOE.requestPermission().then(s => { if (s === 'granted') listen(); }).catch(listen);
    } else {
      listen();
    }
    return () => {
      window.removeEventListener('deviceorientationabsolute', handler as EventListener, true);
      window.removeEventListener('deviceorientation', handler as EventListener, true);
    };
  }, []);

  // ── panelState 변경 시 지도 relayout + bounds 재계산 ────
  useEffect(() => {
    if (!mapRef.current) return;
    const timer = setTimeout(() => {
      mapRef.current?.relayout();
      // 패널 높이 변경 → 가려진 영역 달라지므로 bounds 재계산
      const b = mapRef.current?.getBounds?.();
      if (!b || !mapContainerRef.current) return;
      const mapEl = mapContainerRef.current;
      const ps = panelStateRef.current;
      let sheetHeightPx = 0;
      if (ps === 'half') sheetHeightPx = window.innerHeight * 0.5;
      else if (ps === 'minimized') sheetHeightPx = 132;
      const mapRect = mapEl.getBoundingClientRect();
      const coveredPx = Math.max(0, mapRect.bottom - (window.innerHeight - sheetHeightPx));
      const latRange = b.getNorthEast().getLat() - b.getSouthWest().getLat();
      const swLat = coveredPx > 0 && mapRect.height > 0
        ? b.getSouthWest().getLat() + latRange * (coveredPx / mapRect.height)
        : b.getSouthWest().getLat();
      setMapBounds({
        swLat,
        swLng: b.getSouthWest().getLng(),
        neLat: b.getNorthEast().getLat(),
        neLng: b.getNorthEast().getLng(),
      });
    }, 320); // CSS transition 300ms 완료 후
    return () => clearTimeout(timer);
  }, [panelState]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 지도 이동 헬퍼 ────────────────────────
  const moveMapTo = (lat: number, lng: number) => {
    if (mapRef.current) {
      mapRef.current.setCenter(new window.kakao.maps.LatLng(lat, lng));
    } else {
      pendingCenterRef.current = [lat, lng];
    }
  };

  // ── 매장 데이터 로드 ──────────────────────
  useEffect(() => {
    const load = async () => {
      let stores: Awaited<ReturnType<typeof fetchAllStores>> = [];
      try { stores = await fetchAllStores(); } catch (e) { console.error('fetchAllStores error:', e); }

      let userLat: number | null = null;
      let userLng: number | null = null;
      try {
        const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
        const loc = await Promise.race([getCurrentLocation({ accuracy: Accuracy.Balanced }), timeout]);
        userLat = loc.coords.latitude;
        userLng = loc.coords.longitude;
        setUserLoc({ lat: userLat, lng: userLng });
      } catch { /* 위치 미허용 시 거리 0 */ }

      const mapped: Cafe[] = stores.map(store => ({
        id: store.api_place_id,
        name: store.name,
        address: store.address_road,
        distance: (userLat !== null && userLng !== null)
          ? haversineDistance(userLat, userLng, store.latitude, store.longitude) : 0,
        rating: 0,
        reviewCount: 0,
        tags: store.badges ?? [],
        moods: splitVibeTags(store.vibe_tags),
        priceRange: store.base_price,
        options: storeToOptions(store),
        lat: store.latitude,
        lng: store.longitude,
        thumbnailUrl: store.thumbnail_url || undefined,
        badges: sortVibeTagsByLightFirst(splitVibeTags(store.vibe_tags)),
        outletStatus: store.outlet_status || undefined,
        seatStatus: store.seat_status || undefined,
      }));
      mapped.sort((a, b) => a.distance - b.distance);
      setCafes(mapped);

      // ── "지금 내 주변 노트북 펴기 좋은 카페 3곳" — 위치 허용 유저 첫 진입 1회 노출 ──
      // 세션당 1회만 (탭 이동으로 재마운트돼도 다시 뜨지 않도록 sessionStorage 사용)
      if (userLat !== null && userLng !== null && !sessionStorage.getItem('nearbyLaptopSheetShown')) {
        const top3 = pickTopLaptopFriendlyCafes(mapped, 3);
        if (top3.length > 0) {
          sessionStorage.setItem('nearbyLaptopSheetShown', '1');
          setNearbySheetCafes(top3);
          setNearbySheetOpen(true);
          trackNearbyLaptopSheetShow(top3.length);
        }
      }
    };
    load();
  }, []);

  // ── 도서관 / 공유공간 데이터 마운트 시 로드 ─────────────────
  useEffect(() => {
    const load = async () => {
      const [libRows, spRows] = await Promise.all([fetchLibraries(), fetchSharedSpaces()]);
      setLibraries(libRows.map(r => placeRowToItem(r, 'library')));
      setSharedSpaces(spRows.map(r => placeRowToItem(r, 'shared_space')));
    };
    load();
  }, []);

  // ── 카페 마커 표시/숨김 ───────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const shouldShow = activeChip === '전체' || activeChip === '카페' || !activeChip;
    if (shouldShow) {
      try { clustererRef.current?.setMap(mapRef.current); } catch {}
      overlaysRef.current.forEach(ov => { try { ov.setMap(mapRef.current); } catch {} });
    } else {
      try { clustererRef.current?.setMap(null); } catch {}
      overlaysRef.current.forEach(ov => { try { ov.setMap(null); } catch {} });
    }
  }, [activeChip, mapLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 장소 마커 관리 (칩 / 데이터 변경 시 재구성) ──────────────
  // 도서관/공유공간도 카페와 같은 clusterer에 투명 마커로 등록하여
  // 줌 레벨에 따라 숫자 마커로 통합 클러스터링됨
  useEffect(() => {
    if (!mapRef.current || !clustererRef.current || !mapLoaded) return;
    const map = mapRef.current;

    // 기존 장소 오버레이 제거
    placeOverlaysRef.current.forEach(ov => { try { ov.setMap(null); } catch {} });
    placeOverlaysRef.current.clear();

    // 기존 장소 투명 마커를 클러스터러에서 제거
    const oldMarkers = Array.from(placeMarkersRef.current.values());
    if (oldMarkers.length > 0) {
      try { clustererRef.current.removeMarkers(oldMarkers); } catch {}
    }
    placeMarkersRef.current.clear();

    const toRender = [
      ...(activeChip === '전체' || activeChip === '도서관' ? libraries : []),
      ...(activeChip === '전체' || activeChip === '공유공간' ? sharedSpaces : []),
    ];

    const newPlaceMarkers: any[] = [];

    toRender.forEach(place => {
      const pos = new window.kakao.maps.LatLng(place.lat, place.lng);

      // 클러스터용 투명 마커 (카페와 동일 방식)
      const marker = new window.kakao.maps.Marker({
        position: pos,
        image: new window.kakao.maps.MarkerImage(
          'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
          new window.kakao.maps.Size(1, 1)
        ),
      });
      placeMarkersRef.current.set(place.id, marker);
      newPlaceMarkers.push(marker);

      // 이름 표시 CustomOverlay
      const div = document.createElement('div');
      div.innerHTML = makePlacePillHtml(place.id, place.name, place.placeType, false);
      // 이벤트 위임 대신 직접 리스너 — CustomOverlay는 Kakao Marker와 달리
      // 버블링이 불안정하므로 content div에 직접 click 핸들러 등록
      div.addEventListener('click', () => {
        setSelectedMapCafe(null);
        setSelectedPlace(place);
        setPanelState('half');
      });
      const overlay = new window.kakao.maps.CustomOverlay({
        position: pos,
        content: div, map, yAnchor: 1.3, zIndex: 3,
      });
      placeOverlaysRef.current.set(place.id, overlay);
    });

    // 클러스터러에 장소 마커 일괄 등록
    if (newPlaceMarkers.length > 0) {
      clustererRef.current.addMarkers(newPlaceMarkers);
    }
  }, [activeChip, libraries, sharedSpaces, mapLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── GPS 권한 초기 확인 ────────────────────
  useEffect(() => {
    getCurrentLocation.getPermission()
      .then(status => {
        if (status === 'allowed') setGpsStatus('granted');
        else if (status === 'denied') setGpsStatus('denied');
      })
      .catch(() => {});
  }, []);

  // ── 앱 로드 시 현재 위치로 초기화 ─────────
  useEffect(() => {
    getCurrentLocation({ accuracy: Accuracy.Balanced })
      .then(loc => {
        const pos: [number, number] = [loc.coords.latitude, loc.coords.longitude];
        moveMapTo(pos[0], pos[1]);
        setUserPosition(pos);
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 현재 위치 버튼 핸들러 ─────────────────
  const goToCurrentLocation = async () => {
    if (gpsStatus === 'unknown') { setLocSheet('ask'); return; }
    if (gpsStatus === 'denied') { setLocSheet('reask'); return; }
    try {
      const loc = await getCurrentLocation({ accuracy: Accuracy.Balanced });
      const pos: [number, number] = [loc.coords.latitude, loc.coords.longitude];
      moveMapTo(pos[0], pos[1]);
      setUserPosition(pos);
    } catch {
      // gpsStatus가 이미 'granted'인 상태에서도, 세션 도중 OS 설정에서 토스 앱
      // 자체의 위치 권한이 바뀌었다면(완전 거부는 물론, iOS "다음에 묻기 또는
      // 내가 공유할 때"처럼 notDetermined로 되돌아간 경우도 포함) 재시도해도
      // 계속 실패함 — 실제 권한이 'allowed'로 확인될 때만(순수 GPS 오류 등
      // 일시적 실패) 재시도 토스트를 보여주고, 그 외에는 전부 설정 안내로 전환
      const permission = await getCurrentLocation.getPermission().catch(() => null);
      if (permission !== 'allowed') {
        setGpsStatus('denied');
        setLocSheet('reask');
        return;
      }
      setGpsToast(true);
      setTimeout(() => setGpsToast(false), 2500);
    }
  };

  const handleAllowLocation = async () => {
    try {
      const loc = await getCurrentLocation({ accuracy: Accuracy.Balanced });
      const pos: [number, number] = [loc.coords.latitude, loc.coords.longitude];
      setGpsStatus('granted');
      setLocSheet(null);
      moveMapTo(pos[0], pos[1]);
      setUserPosition(pos);
    } catch {
      setGpsStatus('denied');
      setLocSheet('denied');
    }
  };

  const handleDenyLocation = () => { setGpsStatus('denied'); setLocSheet('denied'); };

  const handleOpenSettings = async () => {
    setLocSheet(null);
    const newStatus = await getCurrentLocation.openPermissionDialog();
    if (newStatus === 'allowed') setGpsStatus('granted');
    else setGpsStatus('denied');
  };

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>

      {/* ── Kakao 지도 컨테이너 ── */}
      <div
        ref={mapContainerRef}
        style={{
          position: 'absolute',
          top: 'env(safe-area-inset-top)',
          bottom: panelState === 'expanded' ? 0 : panelState === 'minimized' ? MAP_MIN_BOTTOM : 'calc(50vh - 20px)',
          left: 0, right: 0,
          zIndex: 0,
          transition: 'bottom 0.3s ease',
        }}
      />

      {/* ── GPS 버튼 ── */}
      <button
        onClick={goToCurrentLocation}
        style={{ position: 'absolute', right: 16, bottom: panelState === 'minimized' ? GPS_MIN_BOTTOM : 'calc(50vh + 12px)', zIndex: 8, width: 44, height: 44, borderRadius: 22, background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <GpsIcon />
      </button>

      {/* ── 외부 탭 오버레이 ── */}
      {(panelState === 'expanded' || selectedMapCafe) && (
        <div
          onClick={() => { setPanelState('half'); setSelectedMapCafe(null); }}
          style={{
            position: 'absolute',
            top: panelState === 'expanded' ? 0 : 'calc(50vh - 20px)',
            bottom: 0, left: 0, right: 0,
            zIndex: 9,
          }}
        />
      )}

      {/* ── 바텀 패널 ── */}
      <div
        onTouchStart={(e) => { touchStartYRef.current = e.touches[0].clientY; }}
        onTouchEnd={(e) => {
          const delta = e.changedTouches[0].clientY - touchStartYRef.current;
          if (selectedMapCafe) {
            if (panelState === 'expanded') {
              if (delta > 60) setPanelState('half');
            } else {
              if (delta < -60) setPanelState('expanded');
              else if (delta > 60) setSelectedMapCafe(null);
            }
          } else {
            if (delta > 60 && panelState === 'expanded') setPanelState('half');
            if (delta > 60 && panelState === 'half') setPanelState('minimized');
            if (delta < -60 && panelState === 'half') setPanelState('expanded');
            if (delta < -60 && panelState === 'minimized') setPanelState('half');
          }
        }}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          zIndex: panelState === 'expanded' ? 25 : 10,
          background: '#f3f3f3',
          borderRadius: ((selectedMapCafe || selectedPlace) && panelState === 'expanded') ? 0 : '16px 16px 0 0',
          height: panelState === 'expanded' ? '100%' : panelState === 'minimized' ? SHEET_MIN_TOP : '50vh',
          transition: 'height 0.3s ease',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
          ...(selectedMapCafe ? { transform: 'translateZ(0)', willChange: 'transform' } : {}),
        }}
      >
        {/* 완전 확장 시 핸들 숨김 — 리스트 스크롤 다운으로 half 전환 */}
        {panelState !== 'expanded' && (
          <div onClick={() => setPanelState(s => s === 'minimized' ? 'half' : s === 'half' ? 'expanded' : 'half')} style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px', flexShrink: 0, cursor: 'pointer' }}>
            <div style={{ width: 48, height: 4, borderRadius: 2, background: '#E5E8EB' }} />
          </div>
        )}

        {selectedMapCafe ? (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <DetailPage
              embedded
              cafeId={selectedMapCafe.id}
              onBack={() => { setSelectedMapCafe(null); setPanelState('half'); setDetailHasSubPage(false); }}
              onClose={() => { setSelectedMapCafe(null); setPanelState('half'); setDetailHasSubPage(false); }}
              onSwipeDown={() => { setPanelState('half'); }}
              showHero={panelState === 'expanded'}
              onFocusModeChange={(active) => { setDetailHasSubPage(active); onFocusModeChange?.(active); }}
            />
          </div>
        ) : selectedPlace ? (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <PlaceDetailPage
              place={selectedPlace}
              showHero={panelState === 'expanded'}
              onBack={() => { setSelectedPlace(null); setPanelState('half'); }}
              onFocusModeChange={(active) => onFocusModeChange?.(active)}
            />
          </div>
        ) : (
          <>
            {/* 카테고리 칩 — 확장 상태에선 상단 패딩 20px (가이드북/모음집/컬렉션 페이지와 통일).
                half/minimized 상태에선 핸들 바 바로 아래라 8px 유지. */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: panelState === 'expanded' ? '20px 16px 8px' : '8px 16px',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {CATEGORY_CHIPS.map(chip => (
                  <Chip key={chip} label={chip} isActive={activeChip === chip} onClick={() => {
                    if (activeChip === chip) return;
                    trackChipTap(chip, true);
                    setActiveChip(chip);
                  }} />
                ))}
              </div>
              <button
                onClick={() => { setFilterOpenKey(k => k + 1); setFilterOpen(true); trackFilterOpen(); }}
                style={{
                  flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: 32, padding: '0 12px',
                  borderRadius: 999,
                  background: filterApplied ? '#191F28' : 'rgba(7,25,76,0.05)',
                  border: 'none', cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                <FilterIcon active={filterApplied} />
              </button>
            </div>

            <div style={{ flexShrink: 0 }}>
              <StoreCountBar count={filteredCafes.length + filteredLibraries.length + filteredSharedSpaces.length} />
            </div>

            <div
              style={{
                flex: 1,
                overflowY: panelState === 'expanded' ? 'auto' : 'hidden',
                overscrollBehavior: 'contain', // 리스트 외부로 스크롤 전파 차단 (pull-to-refresh 등 간섭 방지)
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)',
                WebkitOverflowScrolling: 'touch',
              }}
              onScroll={(e) => { if (panelState !== 'expanded' && e.currentTarget.scrollTop > 0) setPanelState('expanded'); }}
              onTouchStart={(e) => {
                // 시트 외곽 onTouchStart 가 리스트 스크롤 제스처를 가로채지 못하도록 차단 (끊김 방지)
                e.stopPropagation();
                const y = e.touches[0].clientY;
                touchStartYRef.current = y;
                const atTop = e.currentTarget.scrollTop === 0;
                listReachedTopRef.current = atTop;
                listReachedTopYRef.current = atTop ? y : 0;
                collapseTriggeredRef.current = false;
              }}
              onTouchMove={(e) => {
                e.stopPropagation();
                const currentY = e.touches[0].clientY;
                const atTop = e.currentTarget.scrollTop <= 0;

                // 드래그 도중 맨 위에 도달한 순간 기록
                if (!listReachedTopRef.current && atTop) {
                  listReachedTopRef.current = true;
                  listReachedTopYRef.current = currentY;
                }

                // expanded + 맨 위 도달 후 30px+ 추가 드래그 → 즉시 half (touchEnd 기다리지 않음)
                if (
                  panelState === 'expanded' &&
                  listReachedTopRef.current &&
                  atTop &&
                  currentY - listReachedTopYRef.current > 30
                ) {
                  setPanelState('half');
                  // 한 번만 트리거 + touchEnd 의 cascade(half→minimized) 차단
                  listReachedTopRef.current = false;
                  collapseTriggeredRef.current = true;
                }
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                // touchMove 에서 이미 collapse 트리거된 경우 스킵 (cascade 차단)
                if (collapseTriggeredRef.current) {
                  collapseTriggeredRef.current = false;
                  return;
                }
                const endY = e.changedTouches[0].clientY;
                const delta = endY - touchStartYRef.current;
                const COLLAPSE_THRESHOLD = 30;  // expanded → half (touchEnd fallback)
                const STATE_THRESHOLD = 60;     // half ↔ minimized/expanded

                if (panelState === 'expanded') {
                  // touchMove 에서 못 잡힌 케이스를 위한 fallback (scrollTop 체크 완화)
                  if (listReachedTopRef.current) {
                    const deltaFromTop = endY - listReachedTopYRef.current;
                    if (deltaFromTop > COLLAPSE_THRESHOLD) setPanelState('half');
                  }
                } else {
                  // half/minimized 상태: 리스트 자체가 시트 드래그 역할 (overflowY: hidden)
                  if (delta < -STATE_THRESHOLD) {
                    if (panelState === 'half') setPanelState('expanded');
                    else if (panelState === 'minimized') setPanelState('half');
                  } else if (delta > STATE_THRESHOLD) {
                    if (panelState === 'half') setPanelState('minimized');
                  }
                }
              }}
            >
              {filteredCafes.length + filteredLibraries.length + filteredSharedSpaces.length > 0 ? (
                <>
                  {filteredCafes.map(cafe => (
                    <CafeRow
                      key={cafe.id}
                      cafe={{ ...cafe, reviewCount: reviewCounts[cafe.id] ?? cafe.reviewCount }}
                      onTap={() => { trackCafeDetailView(cafe.id, 'list'); onDetailOpen(cafe.id); }}
                      onFavoriteChange={(type, cafe) => showFavoriteSnackbar(type, cafe)}
                    />
                  ))}
                  {filteredLibraries.map(place => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      distance={userLoc ? haversineDistance(userLoc.lat, userLoc.lng, place.lat, place.lng) : 0}
                      reviewCount={reviewCounts[place.id] ?? 0}
                      onTap={() => onPlaceDetailOpen(place)}
                      onFavoriteChange={(type, cafe) => showFavoriteSnackbar(type, cafe)}
                    />
                  ))}
                  {filteredSharedSpaces.map(place => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      distance={userLoc ? haversineDistance(userLoc.lat, userLoc.lng, place.lat, place.lng) : 0}
                      reviewCount={reviewCounts[place.id] ?? 0}
                      onTap={() => onPlaceDetailOpen(place)}
                      onFavoriteChange={(type, cafe) => showFavoriteSnackbar(type, cafe)}
                    />
                  ))}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 32, color: '#B0B8C1' }}>
                  <CafePlaceholder size={42} />
                  <p style={{ fontSize: 14 }}>주변에 장소가 없어요</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── 필터 모달 (전체/카페/도서관/공유공간 통합) ── */}
      <FilterModal
        key={filterOpenKey}
        isOpen={filterOpen}
        initialFilters={appliedFilters}
        category={activeChip ?? '전체'}
        onClose={() => setFilterOpen(false)}
        onApply={(f) => {
          let preview = [...cafes];
          if (mapBounds) {
            preview = preview.filter(c =>
              c.lat != null && c.lng != null &&
              c.lat >= mapBounds.swLat && c.lat <= mapBounds.neLat &&
              c.lng >= mapBounds.swLng && c.lng <= mapBounds.neLng
            );
          }
          if (f.moods.length > 0) preview = preview.filter(c => f.moods.some(m => c.moods.includes(m)));
          if (f.priceMax < DEFAULT_FILTERS.priceMax) preview = preview.filter(c => c.priceRange <= f.priceMax);
          if (f.amenities.length > 0) preview = preview.filter(c =>
            f.amenities.some(key => {
              const label = AMENITY_TO_CAFE_OPTION[key];
              return label ? c.options.includes(label) : false;
            })
          );
          if (f.laptopStatus.length > 0) preview = preview.filter(c => f.laptopStatus.some(chip => {
            if (chip === '가능') return !!c.ltSeatStatus && /가능/.test(c.ltSeatStatus);
            if (chip === '불가') return !c.ltSeatStatus || /불가/.test(c.ltSeatStatus);
            return false;
          }));
          if (f.entConditions.length > 0) preview = preview.filter(c => f.entConditions.some(cond => {
            if (cond === '조건 없음') return !c.entCondition || /조건\s*없|무료/.test(c.entCondition);
            if (cond === '유료') return /유료/.test(c.entCondition ?? '');
            if (cond === '이용권') return /이용권/.test(c.entCondition ?? '');
            if (cond === '회원제') return /회원/.test(c.entCondition ?? '');
            return false;
          }));
          trackFilterApply(f, preview.length);
          setAppliedFilters(f);
          setFilterOpen(false);
        }}
      />

      {/* ── 위치 권한 바텀시트 ── */}
      {/* App.tsx 베이스 탭 wrapper의 isolation:isolate 안에 있으면 zIndex를 아무리
          올려도 App 레벨 탭바(zIndex:100)를 못 이겨서 body에 포탈로 렌더링 */}
      {locSheet && createPortal(
        <LocationPermissionSheet
          type={locSheet}
          onClose={() => { if (locSheet === 'ask') handleDenyLocation(); else setLocSheet(null); }}
          onAllow={handleAllowLocation}
          onOpenSettings={handleOpenSettings}
        />,
        document.body
      )}

      {/* ── 지금 내 주변 노트북 펴기 좋은 카페 3곳 (위치 허용 유저 첫 진입 1회) ── */}
      {createPortal(
        <NearbyLaptopCafesDialog
          isOpen={nearbySheetOpen}
          cafes={nearbySheetCafes}
          onClose={() => { trackNearbyLaptopSheetConfirm(); setNearbySheetOpen(false); }}
          onSelectCafe={(cafe) => {
            trackCafeDetailView(cafe.id, 'nearby_sheet');
            setNearbySheetOpen(false);
            onDetailOpen(cafe.id);
          }}
        />,
        document.body
      )}

      {/* ── GPS 실패 토스트 ── */}
      <Toast open={gpsToast} position="top" text="현재 위치를 가져오지 못했어요. 다시 시도해주세요" onClose={() => setGpsToast(false)} />

      {/* ── 찜 스낵바 ── */}
      {favoriteSnackbar === 'added' && (
        <Snackbar type="positive" message="카페를 모음집에 담았어요" actionLabel="보러가기"
          onAction={() => { onGoToFavorites?.(); setFavoriteSnackbar(null); }}
          onDismiss={() => setFavoriteSnackbar(null)}
        />
      )}
      {favoriteSnackbar === 'removed' && (
        <Snackbar type="negative" message="카페를 모음집에서 꺼냈어요" actionLabel="되돌리기"
          onAction={() => {
            if (removedCafe) addFavorite({ id: removedCafe.id, name: removedCafe.name, address: removedCafe.address, rating: removedCafe.rating, reviewCount: removedCafe.reviewCount, photos: removedCafe.thumbnailUrl ? [removedCafe.thumbnailUrl] : [], distance: removedCafe.distance, placeType: removedCafe.placeType });
            setFavoriteSnackbar(null);
          }}
          onDismiss={() => setFavoriteSnackbar(null)}
        />
      )}
    </div>
  );
}
