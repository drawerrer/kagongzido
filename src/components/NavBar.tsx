// ── 공통 상단 네비게이션 바 ───────────────────────────────────
// Figma 스펙: node 245-3626 (default_bottom_closed)
//
// variant='back'  (default): 좌측 < 뒤로가기 버튼
// variant='logo'           : 좌측 로고 pill + 앱 이름 (MapPage 전용)
// floating=true            : position:absolute (MapPage처럼 지도 위에 뜨는 경우)

interface NavBarProps {
  variant?: 'back' | 'logo';
  floating?: boolean;
  noBorder?: boolean;
  onBack?: () => void;
  onMore?: () => void;
  onClose?: () => void;
}

export default function NavBar({
  variant = 'back',
  floating = false,
  noBorder = false,
  onBack,
  onMore,
  onClose,
}: NavBarProps) {
  const containerStyle: React.CSSProperties = floating
    ? {
        // floating: MapPage 전용 — 지도 위에 absolute로 올라감
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        backgroundColor: '#fff',
        // Figma: borderBottom 없음 (흰 배경이 search bar 영역까지 이어짐)
        paddingTop: 'env(safe-area-inset-top)',
      }
    : {
        backgroundColor: '#fff',
        borderBottom: noBorder ? 'none' : '1px solid rgba(0,0,0,0.06)',
        flexShrink: 0,
        paddingTop: 'env(safe-area-inset-top)',
      };

  return (
    <div style={containerStyle}>
      {/* ── 내부 44px 행 ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 44,
          paddingLeft: 0,
          paddingRight: 10, // Figma: Fixed Icon Area 우측 10px 여백
        }}
      >
        {/* ── 좌측 ── */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          {variant === 'logo' ? (
            // ── 로고 pill (MapPage) ──────────────────────────────
            // Figma: Title Area 161×34, fill rgba(0,23,51,0.02), r=99
            //        Logo 18×18 r=6, Name 15px w590 #191f28, gap=6
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginLeft: 29,
              }}
            >
              {/* 로고 아이콘 — Figma: 18×18, r=6, bg #191F28 */}
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 6,
                  background: '#191F28',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              {/* 앱 이름 — Figma: SF Pro 15px w590 #191f28 */}
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 590,
                  color: '#191F28',
                  letterSpacing: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                취향맞춤 카페지도
              </span>
            </div>
          ) : (
            // ── 뒤로가기 버튼 ───────────────────────────────────
            // Figma: Back Button 44×44
            <button
              onClick={onBack}
              style={{
                width: 44,
                height: 44,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="#191f28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}
        </div>

        {/* ── 우측 pill: ··· | X ─────────────────────────────────
            Figma: Fixed Icon Area 93×34, fill rgba(0,23,51,0.02), r=99
                   Icon Button More 44×44 | Divider 1×16 rgba(0,27,55,0.1) | Icon Button Close 44×44 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            height: 34,
            borderRadius: 99,
            backgroundColor: 'rgba(0,23,51,0.02)',
            overflow: 'hidden',
          }}
        >
          {/* ··· 더보기 */}
          <button
            onClick={onMore}
            style={{
              width: 46,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="#191f28">
              <circle cx="4" cy="10" r="1.5"/>
              <circle cx="10" cy="10" r="1.5"/>
              <circle cx="16" cy="10" r="1.5"/>
            </svg>
          </button>
          {/* 구분선 — Figma: 1×16, rgba(0,27,55,0.1) */}
          <div style={{ width: 1, height: 16, backgroundColor: 'rgba(0,27,55,0.1)', flexShrink: 0 }} />
          {/* X 닫기 */}
          <button
            onClick={onClose}
            style={{
              width: 46,
              height: 34,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
              stroke="#191f28" strokeWidth="2" strokeLinecap="round">
              <line x1="5" y1="5" x2="15" y2="15"/>
              <line x1="15" y1="5" x2="5" y2="15"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
