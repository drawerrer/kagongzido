import { useEffect } from 'react';
import type { ReactNode } from 'react';
import CheckConfirmIcon from '../assets/icons/icon_check_confirm.svg?react';
import CloseIcon from '../assets/icons/icon_close.svg?react';

interface SnackbarProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  type?: 'positive' | 'negative';
  duration?: number;
  position?: 'top' | 'bottom';
  icon?: ReactNode;
}

export default function Snackbar({
  message, actionLabel, onAction, onDismiss, type = 'positive', duration = 3000,
  position = 'bottom', icon,
}: SnackbarProps) {
  const isPositive = type === 'positive';

  // 일정 시간 후 자동 소멸
  useEffect(() => {
    const t = setTimeout(onDismiss, duration);
    return () => clearTimeout(t);
  }, [onDismiss, duration]);

  const positionStyle = position === 'top'
    ? { top: 'calc(env(safe-area-inset-top, 0px) + 16px)', bottom: undefined }
    : { bottom: 76, top: undefined };

  return (
    <div style={{
      position: 'fixed', left: '50%',
      ...positionStyle,
      transform: 'translateX(-50%) translateY(0px)',
      opacity: 1,
      transition: 'opacity 0.25s, transform 0.25s',
      width: 'fit-content',
      height: 59, borderRadius: 9999,
      background: '#FDFDFD',
      display: 'flex', alignItems: 'center',
      paddingLeft: 16, paddingRight: 16, gap: 12,
      zIndex: 300, pointerEvents: 'auto',
      boxSizing: 'border-box',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    }}>
      {/* 아이콘 */}
      <div style={{ width: 24, height: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon ?? (isPositive ? <CheckConfirmIcon width={24} height={24} /> : <CloseIcon width={24} height={24} />)}
      </div>

      {/* 텍스트 */}
      <span style={{
        flex: 1, fontSize: 15, fontWeight: 590, color: '#001936',
        whiteSpace: 'nowrap',
      }}>
        {message}
      </span>

      {/* 액션 버튼 */}
      {actionLabel && (
        <button
          onClick={onAction}
          style={{
            width: 72, height: 31, borderRadius: 100, flexShrink: 0,
            background: 'rgba(0,25,54,0.15)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{
            fontSize: 13, fontWeight: 590,
            color: '#001936', whiteSpace: 'nowrap',
          }}>
            {actionLabel}
          </span>
        </button>
      )}
    </div>
  );
}
