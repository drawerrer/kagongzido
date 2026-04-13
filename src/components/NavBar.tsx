// ── 공통 상단 네비게이션 바 ───────────────────────────────────
// Figma 스펙: node 245-3626

import { useState } from 'react';
import { IconButton, Menu } from '@toss/tds-mobile';

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
        position: 'absolute',
        top: 0, left: 0, right: 0,
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

  const showMore = !!moreMenuDropdown || !!onMore;

  return (
    <div style={containerStyle}>
      <div style={{
        display: 'flex', alignItems: 'center',
        height: 44,
        paddingLeft: 0,
        paddingRight: 6,
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
            /* ── 뒤로가기 (TDS IconButton) ── */
            <IconButton
              variant="clear"
              src={ICONS.back}
              aria-label="뒤로가기"
              onClick={onBack}
              iconSize={24}
              color="#191f28"
            />
          )}
        </div>

        {/* ── 우측 버튼 영역 (pill 제거, 버튼 나열) ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {showMore && (
            moreMenuDropdown ? (
              <Menu.Trigger
                open={moreOpen}
                onOpen={() => setMoreOpen(true)}
                onClose={() => setMoreOpen(false)}
                placement="bottom-end"
                dropdown={moreMenuDropdown}
              >
                <IconButton
                  variant="clear"
                  src={ICONS.more}
                  aria-label="더보기"
                  iconSize={24}
                  color="#191f28"
                />
              </Menu.Trigger>
            ) : (
              <IconButton
                variant="clear"
                src={ICONS.more}
                aria-label="더보기"
                onClick={onMore}
                iconSize={24}
                color="#191f28"
              />
            )
          )}
          <IconButton
            variant="clear"
            src={ICONS.close}
            aria-label="닫기"
            onClick={onClose}
            iconSize={24}
            color="#191f28"
          />
        </div>
      </div>
    </div>
  );
}
