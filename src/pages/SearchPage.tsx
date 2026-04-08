import { useState, useEffect, useRef } from 'react';

// ── 타입 ─────────────────────────────────
interface SearchPageProps {
  onClose: () => void;
}

// ── 아이콘 ────────────────────────────────
function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#191F28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" fill="#E5E8EB" stroke="none" />
      <line x1="15" y1="9" x2="9" y2="15" stroke="#6B7684" strokeWidth="1.5" />
      <line x1="9" y1="9" x2="15" y2="15" stroke="#6B7684" strokeWidth="1.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

// ── 목업 최근 검색어 ──────────────────────
const INITIAL_RECENT: string[] = ['강남 카공카페', '노트북 되는 카페', '조용한 카페'];

// ── SearchPage ────────────────────────────
export default function SearchPage({ onClose }: SearchPageProps) {
  const [query, setQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>(INITIAL_RECENT);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 화면 진입 시 키보드 자동 포커스
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const removeRecent = (keyword: string) => {
    setRecentSearches(prev => prev.filter(s => s !== keyword));
  };

  const clearAll = () => setRecentSearches([]);

  const selectRecent = (keyword: string) => {
    setQuery(keyword);
    inputRef.current?.focus();
  };

  return (
    <div
      style={{
        height: '100%',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.2s ease',
      }}
    >
      {/* 검색 헤더 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          borderBottom: '1px solid #F2F4F6',
          flexShrink: 0,
        }}
      >
        <button onClick={onClose} style={{ padding: 4, marginLeft: -4 }}>
          <BackIcon />
        </button>

        {/* 검색 입력창 */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#F2F4F6',
            borderRadius: 12,
            height: 44,
            padding: '0 14px',
          }}
        >
          <SearchIcon />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && e.currentTarget.blur()}
            placeholder="검색어를 입력하세요."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 17,
              fontWeight: 510,
              color: 'rgba(3,24,50,0.46)',
              fontFamily: 'inherit',
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ padding: 0, lineHeight: 0 }}>
              <ClearIcon />
            </button>
          )}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {query.trim() === '' ? (
          /* 입력 전: 최근 검색어 */
          <div style={{ padding: '16px 0' }}>
            {recentSearches.length > 0 ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 16px 8px',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7684' }}>최근 검색어</span>
                  <button
                    onClick={clearAll}
                    style={{ fontSize: 12, color: '#B0B8C1', fontWeight: 400 }}
                  >
                    전체 삭제
                  </button>
                </div>
                {recentSearches.map(keyword => (
                  <div
                    key={keyword}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '13px 16px',
                      borderBottom: '1px solid #F9FAFB',
                    }}
                  >
                    <ClockIcon />
                    <span
                      onClick={() => selectRecent(keyword)}
                      style={{ flex: 1, fontSize: 15, color: '#191F28', cursor: 'default' }}
                    >
                      {keyword}
                    </span>
                    <button
                      onClick={() => removeRecent(keyword)}
                      style={{ padding: 4, lineHeight: 0 }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </>
            ) : (
              /* 최근 검색어 없음 */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  marginTop: 80,
                  color: '#B0B8C1',
                }}
              >
                <span style={{ fontSize: 36 }}>🔍</span>
                <p style={{ fontSize: 14 }}>최근 검색어가 없어요</p>
              </div>
            )}
          </div>
        ) : (
          /* 검색 중: 결과 영역 (Kakao API 연동 전 플레이스홀더) */
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              marginTop: 80,
              color: '#B0B8C1',
            }}
          >
            <span style={{ fontSize: 36 }}>🗺️</span>
            <p style={{ fontSize: 15, color: '#191F28', fontWeight: 500 }}>
              "{query}" 검색 중…
            </p>
            <p style={{ fontSize: 13, textAlign: 'center', lineHeight: 1.5 }}>
              Kakao 로컬 API 연동 후<br />실제 카페 결과가 표시돼요
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
