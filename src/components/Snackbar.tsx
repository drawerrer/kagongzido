interface SnackbarProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  type?: 'positive' | 'negative';
  duration?: number;
}

export default function Snackbar({
  message, actionLabel, onAction, type = 'positive',
}: SnackbarProps) {
  const isPositive = type === 'positive';

  return (
    <div style={{
      position: 'fixed', bottom: 76, left: '50%',
      transform: 'translateX(-50%) translateY(0px)',
      opacity: 1,
      transition: 'opacity 0.25s, transform 0.25s',
      width: actionLabel ? 319 : 303,
      height: 59, borderRadius: 9999,
      background: '#8b95a1',
      display: 'flex', alignItems: 'center',
      paddingLeft: 16, paddingRight: 16, gap: 12,
      zIndex: 300, pointerEvents: 'auto',
      boxSizing: 'border-box',
    }}>
      {/* 아이콘 */}
      <div style={{
        width: 24, height: 24, borderRadius: 9999,
        background: isPositive ? '#00C471' : '#f04452',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isPositive ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20,6 9,17 4,12" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        )}
      </div>

      {/* 텍스트 */}
      <span style={{
        flex: 1, fontSize: 15, fontWeight: 590, color: '#ffffff',
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
            background: 'rgba(0,25,54,0.31)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{
            fontSize: 13, fontWeight: 590,
            color: 'rgba(253,253,254,0.89)', whiteSpace: 'nowrap',
          }}>
            {actionLabel}
          </span>
        </button>
      )}
    </div>
  );
}
