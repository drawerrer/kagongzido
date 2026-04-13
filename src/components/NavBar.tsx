// ── 공통 상단 네비게이션 바 ───────────────────────────────────

import { useState } from 'react';
import { Menu } from '@toss/tds-mobile';

interface NavBarProps {
  variant?: 'back' | 'logo';
  floating?: boolean;
  noBorder?: boolean;
  onBack?: () => void;
  onMore?: () => void;
  onClose?: () => void;
  /** TDS Menu.Dropdown 전달 시 더보기 버튼에 Menu.Trigger 적용 */
  moreMenuDropdown?: React.ReactNode;
}

export default function NavBar({
  variant = 'back',
  floating = false,
  noBorder = false,
  onBack,
  onMore,
  onClose,
  moreMenuDropdown,
}: NavBarProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const containerStyle: React.CSSProperties = floating
    ? {
        position: 'absolute', top: 0, left: 0, right: 0,
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

  const btnStyle: React.CSSProperties = {
    width: 44, height: 44,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
    flexShrink: 0,
  };

  const showMore = !!moreMenuDropdown || !!onMore;

  const moreButton = (
    <button style={btnStyle} onClick={moreMenuDropdown ? undefined : onMore} aria-label="더보기">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#191f28">
        <circle cx="5"  cy="12" r="1.8"/>
        <circle cx="12" cy="12" r="1.8"/>
        <circle cx="19" cy="12" r="1.8"/>
      </svg>
    </button>
  );

  return (
    <div style={containerStyle}>
      <div style={{
        display: 'flex', alignItems: 'center',
        height: 44, paddingLeft: 0, paddingRight: 6,
      }}>
        {/* ── 좌측 ── */}
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
          {variant === 'logo' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 29 }}>
              <div style={{
                width: 18, height: 18, borderRadius: 6, background: '#191F28',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 590, color: '#191F28', whiteSpace: 'nowrap' }}>
                카페인덱스
              </span>
            </div>
          ) : (
            /* ── 뒤로가기 ── */
            <button style={btnStyle} onClick={onBack} aria-label="뒤로가기">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                stroke="#191f28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          )}
        </div>

        {/* ── 우측 버튼 (pill 없이 독립 배치) ── */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {showMore && (
            moreMenuDropdown ? (
              <Menu.Trigger
                open={moreOpen}
                onOpen={() => setMoreOpen(true)}
                onClose={() => setMoreOpen(false)}
                placement="bottom-end"
                dropdown={moreMenuDropdown}
              >
                {moreButton}
              </Menu.Trigger>
            ) : moreButton
          )}
          <button style={btnStyle} onClick={onClose} aria-label="닫기">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
              stroke="#191f28" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18"/>
              <line x1="18" y1="6" x2="6" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
