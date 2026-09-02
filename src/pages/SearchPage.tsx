// ── SearchPage — Figma '검색 화면' 완전 구현 ─────────────────
// search_before_typing | search_favorite | search_typing

import { useState, useEffect, useRef } from 'react';
import { getCurrentLocation, Accuracy } from '@apps-in-toss/web-framework';
import { useFavorites, haversineDistance } from '../context/FavoritesContext';
import { useBackEvent } from '../hooks/useBackEvent';
import { trackSearchUse, trackCafeDetailView } from '../services/analytics';
import { fetchAllStores, fetchLibraries, fetchSharedSpaces, type StoreRow, type PlaceRow } from '../services/db';
import { placeRowToItem, type PlaceItem } from './MapPage';
import StoreCardHome, { type HomeCafe } from '../components/StoreCard/Home';
import { splitVibeTags, sortVibeTagsByLightFirst } from '../utils/vibeTags';
import StoreCountBar from '../components/StoreCountBar';
import EmptyState from '../components/EmptyState';
import IcSearch from '../assets/icons/icon_search.svg?react';
import IcHeart from '../assets/icons/icon_heart.svg?react';
import IcMap from '../assets/icons/icon_map.svg?react';
import BearImage from '../assets/images/bear_mug.png';

const SearchEmptyPlusIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M12 5v14M5 12h14" stroke="#252525" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

interface SearchPageProps {
  onClose: () => void;
  onDetailOpen?: (cafeId: string) => void;
  /** 도서관/공유공간 검색 결과 탭 — 카페와 구분해 PlaceItem으로 전달 */
  onPlaceDetailOpen?: (place: PlaceItem) => void;
  onReportCafe?: () => void;
  hasDetailOverlay?: boolean;
}

// ── 아이콘 ────────────────────────────────────────────────────

/** 리스트 행 왼쪽 돋보기 — 19×19, stroke rgba(3,18,40,0.70) */
function SearchIconSm() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
      stroke="rgba(3,18,40,0.70)" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

/** 즐겨찾기/컬렉션 행 왼쪽 하트 — 20×20, fill rgba(3,18,40,0.70) */
function HeartIconMd() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(3,18,40,0.70)">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

/** 배너 우측 화살표 — 14×14 */
function BannerChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M9 6l6 6-6 6" stroke="#252525" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** 카페 제보 유도 배너 — "찾는 카페가 없을 땐, 곰한테 카페 제보하기" */
function ReportCafeBanner({ onTap }: { onTap?: () => void }) {
  return (
    <div
      onClick={onTap}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        borderRadius: 8,
        background: '#E0D8C3',
        cursor: onTap ? 'pointer' : 'default',
      }}
    >
      <img src={BearImage} alt="" style={{ width: 53, height: 44, flexShrink: 0, objectFit: 'contain' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: 'rgba(3,18,40,0.58)' }}>
          찾는 카페가 없을 땐,
        </p>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#191F28' }}>
          곰한테 카페 제보하기
        </p>
      </div>
      <BannerChevron />
    </div>
  );
}

/** 입력 지우기 — 20×20 */
function ClearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" fill="#E5E8EB" />
      <line x1="15" y1="9" x2="9" y2="15" stroke="#6B7684" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="9" y1="9" x2="15" y2="15" stroke="#6B7684" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** 행 우측 닫기 — 20×20 */
function CloseIconSm() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="rgba(3,18,40,0.46)" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}


// ── 공통 서브컴포넌트 ─────────────────────────────────────────

/** 왼쪽 아이콘 컨테이너 — 30×30, r=9999, bg rgba(2,32,71,0.05) */
function LeftIconBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 30, height: 30,
      borderRadius: 9999,
      background: 'rgba(2,32,71,0.05)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      {children}
    </div>
  );
}

/** 최근 검색어 행 — h=46 */
function RecentRow({
  keyword, date, onSelect, onRemove,
}: {
  keyword: string; date: string;
  onSelect: () => void; onRemove: () => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      height: 46,
      paddingLeft: 20, paddingRight: 20,
    }}>
      {/* 왼쪽: 30×30 원형 돋보기 */}
      <LeftIconBox><SearchIconSm /></LeftIconBox>

      {/* 중앙: 검색어 텍스트 */}
      <span
        onClick={onSelect}
        style={{
          flex: 1,
          marginLeft: 12,
          fontSize: 17, fontWeight: 510,
          color: 'rgba(3,18,40,0.70)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          cursor: 'default',
        }}
      >
        {keyword}
      </span>

      {/* 우측: 날짜 + 닫기 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 15, fontWeight: 400, color: 'rgba(3,18,40,0.70)' }}>
          {date}
        </span>
        <button onClick={onRemove} style={{ padding: 0, lineHeight: 0 }}>
          <CloseIconSm />
        </button>
      </div>
    </div>
  );
}

/** 즐겨찾기 / 컬렉션 행 — h=57 */
function FavoriteRow({
  name, address, distance, onTap,
}: {
  name: string; address: string; distance: string; onTap?: () => void;
}) {
  return (
    <div
      onClick={onTap}
      style={{
        display: 'flex', alignItems: 'center',
        height: 57,
        paddingLeft: 20, paddingRight: 20,
        cursor: onTap ? 'pointer' : 'default',
      }}
    >
      {/* 왼쪽: 30×30 하트 */}
      <LeftIconBox><HeartIconMd /></LeftIconBox>

      {/* 중앙: 카페명 + 주소 */}
      <div style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
        <p style={{
          fontSize: 17, fontWeight: 510,
          color: '#4f5969',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </p>
        <p style={{
          fontSize: 13, fontWeight: 400,
          color: 'rgba(0,19,43,0.58)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {address}
        </p>
      </div>

      {/* 우측: 거리 */}
      <span style={{ fontSize: 15, fontWeight: 400, color: 'rgba(3,18,40,0.70)', marginLeft: 8, flexShrink: 0 }}>
        {distance}
      </span>
    </div>
  );
}

/** 검색 제안 행 (타이핑 상태 Frame 5766) — h=46, 아이콘 없이 날짜/닫기 없음 */
function SuggestionRow({ keyword, onTap }: { keyword: string; onTap?: () => void }) {
  return (
    <div
      onClick={onTap}
      style={{
        display: 'flex', alignItems: 'center',
        height: 46,
        paddingLeft: 20, paddingRight: 20,
        cursor: onTap ? 'pointer' : 'default',
      }}
    >
      <LeftIconBox><SearchIconSm /></LeftIconBox>
      <span style={{
        flex: 1, marginLeft: 12,
        fontSize: 17, fontWeight: 510,
        color: 'rgba(3,18,40,0.70)',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {keyword}
      </span>
    </div>
  );
}

// ── 칩 ───────────────────────────────────────────────────────

function Chip({
  label, selected, onPress,
}: {
  label: string; selected: boolean; onPress: () => void;
}) {
  // Figma: h=32, r=999, padding 8 11
  // unselected: bg rgba(7,25,76,0.05), text #4f5969
  // selected:   bg #192435,            text #ffffff
  return (
    <button
      onClick={onPress}
      style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 4,
        height: 32,
        padding: '0 11px',
        borderRadius: 999,
        border: selected ? 'none' : '1px solid rgba(0,23,51,0.02)',
        background: selected ? '#192435' : 'rgba(7,25,76,0.05)',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      <span style={{
        fontSize: 13, fontWeight: 590,
        color: selected ? '#ffffff' : '#4f5969',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
    </button>
  );
}

// ── SearchPage ────────────────────────────────────────────────
export default function SearchPage({ onClose: _onClose, onDetailOpen, onPlaceDetailOpen, onReportCafe, hasDetailOverlay = false }: SearchPageProps) {
  const [query, setQuery]           = useState('');
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<{ keyword: string; date: string }[]>([]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [allStores, setAllStores]   = useState<StoreRow[]>([]);
  const [libraries, setLibraries]     = useState<PlaceRow[]>([]);
  const [sharedSpaces, setSharedSpaces] = useState<PlaceRow[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAllStores().then(setAllStores);
    fetchLibraries().then(setLibraries);
    fetchSharedSpaces().then(setSharedSpaces);
  }, []);

  // 위치 조회 — StoreCardHome의 "도보 N분" 표시에 필요 (MapPage와 동일 패턴)
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const timeout = new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000));
        const loc = await Promise.race([getCurrentLocation({ accuracy: Accuracy.Balanced }), timeout]);
        setUserLoc({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } catch { /* 위치 미허용 시 거리 0 */ }
    })();
  }, []);

  const { favorites, collections, reviewCounts } = useFavorites();

  // 도서관/공유공간 원본 — 상세페이지 진입 시 카드에 없는 필드(전화번호·영업시간 등)까지 필요해서 별도 보관
  const placeItems: PlaceItem[] = [
    ...libraries.map(r => placeRowToItem(r, 'library')),
    ...sharedSpaces.map(r => placeRowToItem(r, 'shared_space')),
  ];

  // 카페(stores) + 도서관/공유공간 검색 대상 통합 — 매장카드(StoreCardHome)와 동일한 형태로 매핑
  const searchCafes: HomeCafe[] = [
    ...allStores.map((s): HomeCafe => ({
      id: s.api_place_id, name: s.name, address: s.address_road ?? '',
      distance: userLoc ? haversineDistance(userLoc.lat, userLoc.lng, s.latitude, s.longitude) : 0,
      rating: 0, reviewCount: reviewCounts[s.api_place_id] ?? 0,
      thumbnailUrl: s.thumbnail_url,
      badges: sortVibeTagsByLightFirst(splitVibeTags(s.vibe_tags)),
      outletStatus: s.outlet_status || undefined,
      seatStatus: s.seat_status || undefined,
      placeType: 'cafe',
    })),
    ...placeItems.map((place): HomeCafe => ({
      id: place.id, name: place.name, address: place.address,
      distance: userLoc ? haversineDistance(userLoc.lat, userLoc.lng, place.lat, place.lng) : 0,
      rating: 0, reviewCount: reviewCounts[place.id] ?? 0,
      thumbnailUrl: place.thumbnailUrl,
      badges: [...(place.facilities ?? []), place.entPrice].filter(Boolean) as string[],
      ltSeatStatus: place.ltSeatStatus, entCondition: place.entCondition,
      placeType: place.placeType,
    })),
  ];

  // 'recent' 기본 컬렉션 제외, 사용자 생성 컬렉션만
  const userCollections = collections.filter(c => c.id !== 'recent');
  const isTyping        = query.trim() !== '';

  // 검색어가 바뀌면 노출 개수를 5개로 리셋
  useEffect(() => {
    setVisibleCount(5);
  }, [query]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  // 뒤로가기 → 홈으로 이동 (DetailPage가 열려있으면 비활성화)
  useBackEvent(_onClose, !hasDetailOverlay);

  const handleChipPress = (chipId: string) => {
    setActiveChip(prev => prev === chipId ? null : chipId);
    setQuery('');
  };

  const handleQueryChange = (v: string) => {
    setQuery(v);
    if (v.trim()) setActiveChip(null);
  };

  // 1초 디바운스 후 실제 검색어 트래킹 (result_count 포함)
  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(() => {
      const q = query.trim();
      const count = searchCafes.filter(i =>
        i.name.includes(q) || i.address.includes(q)
      ).length;
      trackSearchUse(q, count);
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, allStores, libraries, sharedSpaces]);

  const removeRecent  = (kw: string) => setRecentSearches(p => p.filter(r => r.keyword !== kw));
  const clearAllRecent = () => setRecentSearches([]);
  const selectRecent  = (kw: string) => { setQuery(kw); inputRef.current?.focus(); };

  // 즐겨찾기 행 데이터 (FavoritesContext → FavoriteRow)
  const favRows = favorites.map((s, i) => ({
    ...s,
    distance: ['1.7km', '2km', '2.3km', '9.7km'][i % 4],
  }));

  return (
    <div style={{ height: '100%', position: 'relative', animation: 'slideInRight 0.2s ease' }}>

      {/* ── 지도 배경 ── */}
      <div style={{ position: 'absolute', inset: 0, background: '#E8EAED', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <IcMap width={44} height={44} style={{ color: '#AAB4BE', display: 'block' }} />
        <p style={{ fontSize: 14, color: '#6B7684', fontWeight: 500 }}>카카오맵이 표시됩니다</p>
      </div>

      {/* ── 바텀시트 패널 ── */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 'calc(100% - env(safe-area-inset-top, 0px))',
        background: '#f3f3f3',
        display: 'flex', flexDirection: 'column',
        zIndex: 20,
      }}>

        {/* 검색 필드 */}
        <div style={{ padding: '10px 16px 0', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#ffffff', borderRadius: 12, height: 44,
            paddingLeft: 10, paddingRight: 10,
          }}>
            <input
              ref={inputRef}
              value={query}
              onChange={e => handleQueryChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
              placeholder="장소, 주소 검색"
              style={{
                flex: 1, minWidth: 0,
                background: 'transparent', border: 'none', outline: 'none',
                fontSize: 17, fontWeight: 510,
                color: '#191F28', fontFamily: 'inherit',
              }}
            />
            {query && (
              <button onClick={() => setQuery('')} style={{ padding: 0, lineHeight: 0 }}>
                <ClearIcon />
              </button>
            )}
          </div>
        </div>

        {/* 칩 행 (타이핑 중 숨김) */}
        {!isTyping && (
          <div style={{
            display: 'flex', alignItems: 'center',
            gap: 8, overflowX: 'auto',
            padding: '16px 0 16px 16px',
            flexShrink: 0, scrollbarWidth: 'none' as React.CSSProperties['scrollbarWidth'],
          }}>
            <Chip label="모음집" selected={activeChip === '즐겨찾기'} onPress={() => handleChipPress('즐겨찾기')} />
            {userCollections.map(col => (
              <Chip key={col.id} label={col.name} selected={activeChip === col.id} onPress={() => handleChipPress(col.id)} />
            ))}
          </div>
        )}

        {/* 콘텐츠 */}
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}>

        {/* ① 타이핑 중 — Figma: search_typing */}
        {isTyping && (() => {
          const filteredResults = searchCafes.filter(i =>
            i.name.includes(query.trim()) || i.address.includes(query.trim())
          );
          const suggestions: string[] = [];

          if (filteredResults.length === 0 && suggestions.length === 0) {
            /* ── 검색 결과 없음 ── */
            return (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 16, paddingTop: 80, paddingLeft: 24, paddingRight: 24,
              }}>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#191F28', textAlign: 'center' }}>
                  찾으시는 카페가 아직 없어요!
                </p>
                <button
                  onClick={onReportCafe}
                  style={{
                    marginTop: 4,
                    height: 38, borderRadius: 10,
                    backgroundColor: '#252525',
                    border: 'none', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center',
                    padding: '0 18px', gap: 6, flexShrink: 0,
                  }}
                >
                  <span style={{ fontWeight: 590, fontSize: 15, color: '#ffffff', whiteSpace: 'nowrap' }}>
                    카페 제보하기
                  </span>
                </button>
              </div>
            );
          }

          return (
            <div style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* 자동완성 제안 */}
              {suggestions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {suggestions.map(s => (
                    <SuggestionRow key={s} keyword={s} onTap={() => setQuery(s)} />
                  ))}
                </div>
              )}
              {/* 카페/장소 결과 — 기본 5개, '더보기' 탭마다 5개씩 추가 노출 */}
              {filteredResults.length > 0 && (() => {
                const visibleResults = filteredResults.slice(0, visibleCount);
                const hasMore = filteredResults.length > visibleCount;
                return (
                  <div>
                    <StoreCountBar count={filteredResults.length} />
                    {visibleResults.map(cafe => (
                      <StoreCardHome
                        key={cafe.id}
                        cafe={cafe}
                        onTap={() => {
                          if (cafe.placeType === 'cafe' || !cafe.placeType) {
                            trackCafeDetailView(cafe.id, 'search');
                            onDetailOpen?.(cafe.id);
                          } else {
                            const place = placeItems.find(p => p.id === cafe.id);
                            if (place) onPlaceDetailOpen?.(place);
                          }
                        }}
                      />
                    ))}

                    {/* 카페 제보 유도 배너 — 보이는 마지막 리스트와 '더보기' 사이 */}
                    <div style={{ marginTop: 10 }}>
                      <ReportCafeBanner onTap={onReportCafe} />
                    </div>

                    {hasMore && (
                      <button
                        onClick={() => setVisibleCount(v => v + 5)}
                        style={{
                          marginTop: 10,
                          width: '100%',
                          height: 44,
                          borderRadius: 10,
                          backgroundColor: 'rgba(211,211,223,0.19)',
                          border: 'none', cursor: 'pointer',
                          fontSize: 15, fontWeight: 590, color: '#252525',
                        }}
                      >
                        더보기
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })()}

        {/* ② 즐겨찾기 칩 선택 — Figma: search_favorite
            Frame 5766: 즐겨찾기 행 (h=57 rows, gap=10) */}
        {!isTyping && activeChip === '즐겨찾기' && (
          <div style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10 }}>
            {favRows.length === 0 ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, marginTop:80 }}>
                <IcHeart width={32} height={32} style={{ color: '#AAB4BE' }} />
                <p style={{ fontSize: 14, color: 'rgba(3,18,40,0.30)' }}>즐겨찾기한 카페가 없어요</p>
                <button
                  onClick={_onClose}
                  style={{
                    marginTop: 52, height: 38, borderRadius: 10,
                    backgroundColor: 'rgba(211,211,223,0.19)', border: 'none', cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', padding: '0 16px', gap: 6, flexShrink: 0,
                  }}
                >
                  <span style={{ fontWeight: 590, fontSize: 15, color: '#252525', whiteSpace: 'nowrap' }}>매장 추가하기</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M12 5v14M5 12h14" stroke="#252525" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {favRows.map(s => (
                  <FavoriteRow
                    key={s.id}
                    name={s.name}
                    address={s.address}
                    distance={s.distance}
                    onTap={() => onDetailOpen?.(s.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ③ 컬렉션 칩 선택 */}
        {!isTyping && activeChip !== null && activeChip !== '즐겨찾기' && (() => {
          const col = collections.find(c => c.id === activeChip);
          const items = col ? favorites.filter(f => col.storeIds.includes(f.id)) : [];
          return (
            <div style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10 }}>
              {items.length === 0 ? (
                <EmptyState
                  title={`${col?.name ?? '컬렉션'}에 저장된 카페가 없어요`}
                  subtitle="방문하고 싶은 카페를 추가해보세요"
                  buttonLabel="매장 추가하기"
                  buttonIcon={SearchEmptyPlusIcon}
                  onButtonClick={_onClose}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {items.map((s, i) => (
                    <FavoriteRow
                      key={s.id}
                      name={s.name}
                      address={s.address}
                      distance={['1.7km','2km','2.3km','9.7km'][i%4]}
                      onTap={() => onDetailOpen?.(s.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* ④ 기본 상태 (칩 미선택, 입력 전) — Figma: search_before_typing
            Frame 5766: 최근 검색어 행 (h=46 rows, gap=10) + "검색어 전체 삭제" 행 (h=44) */}
        {!isTyping && activeChip === null && (
          <div style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 카페 제보 유도 배너 — 컬렉션 칩 바로 아래 */}
            <ReportCafeBanner onTap={onReportCafe} />

            {recentSearches.length === 0 ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, marginTop:80, marginBottom: 24 }}>
                <IcSearch width={32} height={32} style={{ color: '#AAB4BE' }} />
                <p style={{ fontSize: 14, color: 'rgba(3,18,40,0.30)' }}>최근 검색어가 없어요</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* 최근 검색어 행들 */}
                {recentSearches.map(item => (
                  <RecentRow
                    key={item.keyword}
                    keyword={item.keyword}
                    date={item.date}
                    onSelect={() => selectRecent(item.keyword)}
                    onRemove={() => removeRecent(item.keyword)}
                  />
                ))}

                {/* "검색어 전체 삭제" — Figma: h=44, 15px fw400 #2272eb, RIGHT */}
                <div style={{
                  height: 44,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <button
                    onClick={clearAllRecent}
                    style={{
                      fontSize: 15, fontWeight: 400,
                      color: '#2272eb',
                      background: 'none', border: 'none', cursor: 'pointer',
                    }}
                  >
                    검색어 전체 삭제
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>{/* end 바텀시트 패널 */}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        input::placeholder { color: rgba(3,24,50,0.46); }
        *::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
