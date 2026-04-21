// ── SearchPage — Figma '검색 화면' 완전 구현 ─────────────────
// search_before_typing | search_favorite | search_typing

import { useState, useEffect, useRef } from 'react';
import NavBar from '../components/NavBar';
import { useFavorites } from '../context/FavoritesContext';

interface SearchPageProps {
  onClose: () => void;
  onDetailOpen?: (cafeId: string) => void;
}

// ── 아이콘 ────────────────────────────────────────────────────

/** SearchField 내 돋보기 — 24×24, stroke rgba(3,24,50,0.46) */
function SearchIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="rgba(3,24,50,0.46)" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

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

/** 칩 내부 하트 — 12×12 */
function HeartIconXs({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill={color}>
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
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

// ── 목업 데이터 ───────────────────────────────────────────────
const MOCK_RECENT = [
  { keyword: '대형카페',       date: '03.19' },
  { keyword: '브런치카페',     date: '03.18' },
  { keyword: '조용한 카페',    date: '03.15' },
  { keyword: '노트북 되는 카페', date: '03.10' },
];

const MOCK_SUGGESTIONS = ['대형카페', '브런치카페'];

const MOCK_RESULTS = [
  { id: '1', name: '블루보틀 강남',  address: '서울 강남구 논현로 508',  distance: '150m',  rating: 4.8, reviewCount: 523, tags: ['카공'] },
  { id: '3', name: '모노 커피',      address: '서울 강남구 언주로 234',  distance: '410m',  rating: 4.9, reviewCount: 87,  tags: ['조용한'] },
  { id: '5', name: '브런치 팩토리', address: '서울 강남구 선릉로 890',  distance: '800m',  rating: 4.6, reviewCount: 142, tags: ['브런치'] },
  { id: '6', name: '더 로스터리',   address: '서울 강남구 도곡로 321',  distance: '9.7km', rating: 4.7, reviewCount: 201, tags: ['가성비'] },
];

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

/** 검색 결과 카페 행 — MapPage CafeRow 동일 스펙 */
function SearchCafeRow({ r, onTap }: { r: typeof MOCK_RESULTS[0]; onTap?: () => void }) {
  return (
    <div onClick={onTap} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid #F2F4F6', cursor: 'pointer' }}>
      <div style={{ width: 80, height: 80, borderRadius: 10, flexShrink: 0, background: '#F2F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 28 }}>☕</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#191F28', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</p>
        <p style={{ fontSize: 12, color: '#6B7684', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.address}</p>
        <span style={{ fontSize: 12, color: '#6B7684' }}>⭐ {r.rating} · {r.distance} · 리뷰 {r.reviewCount}</span>
        {r.tags[0] && (
          <span style={{ display: 'inline-block', padding: '2px 8px', background: '#F2F4F6', borderRadius: 4, fontSize: 11, color: '#4E5968', alignSelf: 'flex-start' }}>
            {r.tags[0]}
          </span>
        )}
      </div>
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
  const iconColor = selected ? '#ffffff' : '#4f5969';
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
      {/* Figma: icon-heart-mono 12×12 */}
      <HeartIconXs color={iconColor} />
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
export default function SearchPage({ onClose, onDetailOpen }: SearchPageProps) {
  const [query, setQuery]           = useState('');
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState(MOCK_RECENT);
  const inputRef = useRef<HTMLInputElement>(null);
  const { favorites, collections }  = useFavorites();

  // 'recent' 기본 컬렉션 제외, 사용자 생성 컬렉션만
  const userCollections = collections.filter(c => c.id !== 'recent');
  const isTyping        = query.trim() !== '';

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const handleChipPress = (chipId: string) => {
    setActiveChip(prev => prev === chipId ? null : chipId);
    setQuery('');
  };

  const handleQueryChange = (v: string) => {
    setQuery(v);
    if (v.trim()) setActiveChip(null);
  };

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
        <span style={{ fontSize: 44 }}>🗺️</span>
        <p style={{ fontSize: 14, color: '#6B7684', fontWeight: 500 }}>카카오맵이 표시됩니다</p>
      </div>

      {/* ── NavBar (floating) ── */}
      <NavBar noBorder floating onBack={onClose} onClose={onClose} />

      {/* ── 바텀시트 패널 ── */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 'calc(100% - env(safe-area-inset-top) - 44px)',
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
            <SearchIcon />
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
            height: 44, display: 'flex', alignItems: 'center',
            gap: 8, overflowX: 'auto', paddingLeft: 16,
            flexShrink: 0, scrollbarWidth: 'none' as React.CSSProperties['scrollbarWidth'],
          }}>
            <Chip label="즐겨찾기" selected={activeChip === '즐겨찾기'} onPress={() => handleChipPress('즐겨찾기')} />
            {userCollections.map(col => (
              <Chip key={col.id} label={col.name} selected={activeChip === col.id} onPress={() => handleChipPress(col.id)} />
            ))}
          </div>
        )}

        {/* 콘텐츠 */}
        <div style={{ flex: 1, overflowY: 'auto' }}>

        {/* ① 타이핑 중 — Figma: search_typing
            Frame 5766: 검색 제안 (h=46 rows)
            Frame 5767: 검색 결과 (h=57 rows)
            두 프레임 사이 gap=10 */}
        {isTyping && (
          <div style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Frame 5766 — 자동완성 제안 */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {MOCK_SUGGESTIONS
                .filter(s => s.includes(query) && s !== query.trim())
                .map(s => (
                  <SuggestionRow key={s} keyword={s} onTap={() => setQuery(s)} />
                ))}
            </div>

            {/* Frame 5767 — 카페/장소 결과 (CafeRow 스타일) */}
            <div>
              <div style={{ padding: '8px 16px 4px', fontSize: 13, color: '#6B7684' }}>
                총 <strong style={{ color: '#191F28' }}>{MOCK_RESULTS.length}</strong>개
              </div>
              {MOCK_RESULTS.map(r => (
                <SearchCafeRow key={r.id} r={r} onTap={() => onDetailOpen?.(r.id)} />
              ))}
            </div>
          </div>
        )}

        {/* ② 즐겨찾기 칩 선택 — Figma: search_favorite
            Frame 5766: 즐겨찾기 행 (h=57 rows, gap=10) */}
        {!isTyping && activeChip === '즐겨찾기' && (
          <div style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10 }}>
            {favRows.length === 0 ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, marginTop:80, color:'rgba(3,18,40,0.30)' }}>
                <span style={{ fontSize: 32 }}>🤍</span>
                <p style={{ fontSize: 14 }}>즐겨찾기한 카페가 없어요</p>
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
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, marginTop:80, color:'rgba(3,18,40,0.30)' }}>
                  <span style={{ fontSize: 32 }}>📂</span>
                  <p style={{ fontSize: 14 }}>{col?.name ?? '컬렉션'}에 저장된 카페가 없어요</p>
                </div>
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
          <div style={{ paddingTop: 10, paddingLeft: 10, paddingRight: 10 }}>
            {recentSearches.length === 0 ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, marginTop:80, color:'rgba(3,18,40,0.30)' }}>
                <span style={{ fontSize: 32 }}>🔍</span>
                <p style={{ fontSize: 14 }}>최근 검색어가 없어요</p>
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
