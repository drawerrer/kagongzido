import { useState, useEffect, useRef } from 'react';
import { getCurrentLocation, Accuracy, graniteEvent } from '@apps-in-toss/web-framework';
import { Toast } from '@toss/tds-mobile';
import FilterModal, { FilterState, DEFAULT_FILTERS } from '../components/FilterModal';
import LocationPermissionSheet, { LocationSheetType } from '../components/LocationPermissionSheet';
import { useFavorites } from '../context/FavoritesContext';
import Snackbar from '../components/Snackbar';
import DetailPage from './DetailPage';
import { fetchAllStores, type StoreRow } from '../services/db';
import Chip from '../components/Chip';
import StoreCardHome, { type HomeCafe } from '../components/StoreCard/Home';
import StoreCountBar from '../components/StoreCountBar';

declare global {
  interface Window { kakao: any; }
}

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
  thumbnailUrl?: string;
  badges: string[];
}


const CATEGORY_CHIPS = ['콘센트 넉넉', '대형 공간', '편안한 좌석'];

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
  if (store.amenities?.includes('decafFree')) opts.push('디카페인 무료 변경');
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
  return `<div data-cafe-id="${cafeId}" style="display:inline-flex;align-items:center;gap:4px;background:${bg};color:${color};border-radius:999px;padding:5px 10px 5px 8px;box-shadow:${shadow};white-space:nowrap;font-size:12px;font-weight:600;font-family:Pretendard,sans-serif;border:${border};cursor:pointer;"><span style="font-size:13px;">☕</span>${label}</div>`;
}

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


function CafeRow({ cafe, onTap, onFavoriteChange }: { cafe: Cafe; onTap: () => void; onFavoriteChange?: (type: 'added' | 'removed', cafe: Cafe) => void }) {
  return (
    <StoreCardHome
      cafe={cafe}
      onTap={onTap}
      onFavoriteChange={onFavoriteChange as ((type: 'added' | 'removed', cafe: HomeCafe) => void) | undefined}
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

export interface MapPageState {
  activeChip: string | null;
  panelState: PanelState;
  appliedFilters: FilterState;
  filterApplied: boolean;
}

interface MapPageProps {
  onSearchOpen: () => void;
  onDetailOpen: (cafeId: string) => void;
  onGoToFavorites?: () => void;
  initialState?: MapPageState;
  onStateChange?: (state: MapPageState) => void;
}

export default function MapPage({ onSearchOpen, onDetailOpen, onGoToFavorites, initialState, onStateChange }: MapPageProps) {
  const touchStartYRef = useRef<number>(0);
  // 드래그 도중 scrollTop===0 에 도달한 적이 있는지 — expanded 시 사용자가 위에서 아래로
  // 끝까지 끌어내려 collapse 의도를 보일 때 잡기 위함
  const listReachedTopRef = useRef<boolean>(false);
  // 맨 위 도달 시점의 finger Y — 거기서부터의 추가 drag 거리로 collapse 판단 (안정성 ↑)
  const listReachedTopYRef = useRef<number>(0);

  // ── Kakao Maps refs ───────────────────────
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const overlaysRef = useRef<Map<string, any>>(new Map());   // cafeId → CustomOverlay
  const markersRef = useRef<Map<string, any>>(new Map());    // cafeId → (투명) Marker
  const userOverlayRef = useRef<any>(null);
  const cafesRef = useRef<Cafe[]>([]);
  const pendingCenterRef = useRef<[number, number] | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const { addFavorite } = useFavorites();

  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [activeChip, setActiveChip] = useState<string | null>(initialState?.activeChip ?? null);
const [filterOpen, setFilterOpen] = useState(false);
  const [filterOpenKey, setFilterOpenKey] = useState(0);
  const [panelState, setPanelState] = useState<PanelState>(initialState?.panelState ?? 'half');
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(initialState?.appliedFilters ?? DEFAULT_FILTERS);
  const [selectedMapCafe, setSelectedMapCafe] = useState<Cafe | null>(null);

  type GpsStatus = 'granted' | 'denied' | 'unknown';
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('unknown');
  const [locSheet, setLocSheet] = useState<LocationSheetType | null>(null);
  const [gpsToast, setGpsToast] = useState(false);
  const [favoriteSnackbar, setFavoriteSnackbar] = useState<'added' | 'removed' | null>(null);
  const [removedCafe, setRemovedCafe] = useState<Cafe | null>(null);

  // cafesRef 항상 최신 유지
  useEffect(() => { cafesRef.current = cafes; }, [cafes]);

  // 지도 패널 열린 상태에서 네이티브 뒤로가기 → 패널 닫기
  useEffect(() => {
    if (!selectedMapCafe) return;
    try {
      const unsubscribe = graniteEvent.addEventListener('backEvent', {
        onEvent: () => { setSelectedMapCafe(null); setPanelState('half'); },
        onError: (err) => console.error(err),
      });
      return unsubscribe;
    } catch { return undefined; }
  }, [selectedMapCafe]);

  const filterApplied =
    appliedFilters.openNow !== DEFAULT_FILTERS.openNow ||
    appliedFilters.moods.length > 0 ||
    appliedFilters.priceMax !== DEFAULT_FILTERS.priceMax ||
    appliedFilters.options.length > 0;

  useEffect(() => {
    onStateChange?.({ activeChip, panelState, appliedFilters, filterApplied });
  }, [activeChip, panelState, appliedFilters, filterApplied]); // eslint-disable-line react-hooks/exhaustive-deps

  const showFavoriteSnackbar = (type: 'added' | 'removed', cafe?: Cafe) => {
    if (type === 'removed' && cafe) setRemovedCafe(cafe);
    setFavoriteSnackbar(type);
  };

  const filteredCafes = (() => {
    let filtered = activeChip ? cafes.filter(c => c.tags.includes(activeChip)) : [...cafes];
    if (appliedFilters.moods.length > 0) filtered = filtered.filter(c => appliedFilters.moods.includes(c.mood));
    if (appliedFilters.priceMax < DEFAULT_FILTERS.priceMax) filtered = filtered.filter(c => c.priceRange <= appliedFilters.priceMax);
    if (appliedFilters.options.length > 0) filtered = filtered.filter(c => appliedFilters.options.every(opt => c.options.includes(opt)));
    return filtered;
  })();

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
      minLevel: 5,
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

    // 클러스터링 이벤트: 묶인 마커의 overlay 숨김 처리
    window.kakao.maps.event.addListener(clusterer, 'clustered', (clusters: any[]) => {
      const clusteredSet = new Set<any>();
      clusters.forEach(c => c.getMarkers().forEach((m: any) => clusteredSet.add(m)));
      overlaysRef.current.forEach((overlay, cafeId) => {
        const marker = markersRef.current.get(cafeId);
        overlay.setMap(clusteredSet.has(marker) ? null : map);
      });
    });

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
    const DOE = DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
    if (typeof DOE.requestPermission === 'function') {
      DOE.requestPermission().then(s => { if (s === 'granted') listen(); }).catch(listen);
    } else {
      listen();
    }
    return () => {
      window.removeEventListener('deviceorientationabsolute', handler as EventListener, true);
      window.removeEventListener('deviceorientation', handler as EventListener, true);
    };
  }, []);

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
        mood: (store.vibe_tags ?? [])[0] || '모던한',
        priceRange: store.base_price,
        options: storeToOptions(store),
        lat: store.latitude,
        lng: store.longitude,
        thumbnailUrl: store.thumbnail_url || undefined,
        badges: (store.badges ?? []).filter(b => b !== '해당없음' && b !== '해당 없음'),
      }));
      mapped.sort((a, b) => a.distance - b.distance);
      setCafes(mapped);
    };
    load();
  }, []);

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
          top: 'calc(env(safe-area-inset-top) + 72px)',
          bottom: panelState === 'expanded' ? 0 : panelState === 'minimized' ? MAP_MIN_BOTTOM : 'calc(50vh - 20px)',
          left: 0, right: 0,
          zIndex: 0,
          transition: 'bottom 0.3s ease',
        }}
      />

      {/* ── 상단 검색바 + 필터 ── */}
      <div style={{ position: 'absolute', top: 'env(safe-area-inset-top)', left: 0, right: 0, zIndex: 20, padding: '14px 16px', background: '#f3f3f3' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div onClick={onSearchOpen} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, background: '#ffffff', borderRadius: 12, height: 44, padding: '0 10px' }}>
            <SearchIcon />
            <span style={{ color: 'rgba(3,24,50,0.46)', fontSize: 17, fontWeight: 510 }}>검색어를 입력하세요.</span>
          </div>
          <button
            onClick={() => { setFilterOpenKey(k => k + 1); setFilterOpen(true); }}
            style={{ width: 52, height: 32, borderRadius: 999, flexShrink: 0, background: filterApplied ? '#191F28' : 'rgba(7,25,76,0.05)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
          >
            <FilterIcon active={filterApplied} />
          </button>
        </div>
      </div>

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
          borderRadius: (selectedMapCafe && panelState === 'expanded') ? 0 : '16px 16px 0 0',
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
              onBack={() => { setSelectedMapCafe(null); setPanelState('half'); }}
              onClose={() => { setSelectedMapCafe(null); setPanelState('half'); }}
              onSwipeDown={() => { setPanelState('half'); }}
              showHero={panelState === 'expanded'}
            />
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 16px', flexShrink: 0, scrollbarWidth: 'none' }}>
              {CATEGORY_CHIPS.map(chip => (
                <Chip key={chip} label={chip} isActive={activeChip === chip} onClick={() => setActiveChip(activeChip === chip ? null : chip)} />
              ))}
            </div>

            <div style={{ flexShrink: 0 }}>
              <StoreCountBar count={filteredCafes.length} />
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
              }}
              onTouchMove={(e) => {
                e.stopPropagation();
                // 드래그 도중 scrollTop===0 에 처음 도달한 순간 기록
                if (!listReachedTopRef.current && e.currentTarget.scrollTop === 0) {
                  listReachedTopRef.current = true;
                  listReachedTopYRef.current = e.touches[0].clientY;
                }
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                const el = e.currentTarget;
                const endY = e.changedTouches[0].clientY;
                const delta = endY - touchStartYRef.current;
                const COLLAPSE_THRESHOLD = 40;  // expanded → half
                const STATE_THRESHOLD = 60;     // half ↔ minimized/expanded

                if (panelState === 'expanded') {
                  // 드래그 도중 맨 위에 도달했고, 그 시점부터 아래로 40px+ 더 끌었으면 → half
                  // (중간에서 시작해도 위로 끝까지 스크롤 후 더 끌어내리면 OK)
                  if (listReachedTopRef.current && el.scrollTop === 0) {
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
              {filteredCafes.length > 0 ? (
                filteredCafes.map(cafe => (
                  <CafeRow
                    key={cafe.id}
                    cafe={cafe}
                    onTap={() => onDetailOpen(cafe.id)}
                    onFavoriteChange={(type, cafe) => showFavoriteSnackbar(type, cafe)}
                  />
                ))
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 32, color: '#B0B8C1' }}>
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
        onApply={(f) => { setAppliedFilters(f); setFilterOpen(false); }}
      />

      {/* ── 위치 권한 바텀시트 ── */}
      {locSheet && (
        <LocationPermissionSheet
          type={locSheet}
          onClose={() => { if (locSheet === 'ask') handleDenyLocation(); else setLocSheet(null); }}
          onAllow={handleAllowLocation}
          onOpenSettings={handleOpenSettings}
        />
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
            if (removedCafe) addFavorite({ id: removedCafe.id, name: removedCafe.name, address: removedCafe.address, rating: removedCafe.rating, reviewCount: removedCafe.reviewCount, photos: [], distance: removedCafe.distance });
            setFavoriteSnackbar(null);
          }}
          onDismiss={() => setFavoriteSnackbar(null)}
        />
      )}
    </div>
  );
}
