// ── 공통 상단 네비게이션 바 ───────────────────────────────────
// Figma 스펙: node 245-3626 (default_bottom_closed)
//
// variant='back'  (default): 좌측 < 뒤로가기 버튼
// variant='logo'           : 좌측 로고 pill + 앱 이름 (MapPage 전용)

import { IconButton } from '@toss/tds-mobile';

const ICONS = {
  back:  'https://static.toss.im/icons/svg/icon-chevron-left-bold-mono.svg',
  more:  'https://static.toss.im/icons/svg/icon-ellipsis-horizontal-bold-mono.svg',
  close: 'https://static.toss.im/icons/svg/icon-close-bold-mono.svg',
};

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
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        backgroundColor: '#F3F3F3',
        paddingTop: 'env(safe-area-inset-top)',
      }
    : {
        backgroundColor: '#F3F3F3',
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
          paddingRight: 10,
        }}
      >
        {/* ── 좌측 ── */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          {variant === 'logo' ? (
            // ── 로고 pill (MapPage) ──────────────────────────────
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginLeft: 29,
              }}
            >
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
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 590,
                  color: '#191F28',
                  letterSpacing: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                카페인덱스
              </span>
            </div>
          ) : (
            // ── 뒤로가기 버튼 (TDS IconButton) ──────────────────
            <IconButton
              variant="clear"
              src={ICONS.back}
              aria-label="뒤로가기"
              onClick={onBack}
              iconSize={24}
              color="#191f28"
              style={{ width: 44, height: 44 } as React.CSSProperties}
            />
          )}
        </div>

        {/* ── 우측 pill: ··· | X ───────────────────────────────── */}
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
          {/* ··· 더보기 (TDS IconButton) */}
          <IconButton
            variant="clear"
            src={ICONS.more}
            aria-label="더보기"
            onClick={onMore}
            iconSize={20}
            color="#191f28"
            style={{ width: 46, height: 34, borderRadius: 0 } as React.CSSProperties}
          />
          {/* 구분선 */}
          <div style={{ width: 1, height: 16, backgroundColor: 'rgba(0,27,55,0.1)', flexShrink: 0 }} />
          {/* X 닫기 (TDS IconButton) */}
          <IconButton
            variant="clear"
            src={ICONS.close}
            aria-label="닫기"
            onClick={onClose}
            iconSize={20}
            color="#191f28"
            style={{ width: 46, height: 34, borderRadius: 0 } as React.CSSProperties}
          />
        </div>
      </div>
    </div>
  );
}
