import { useEffect } from 'react';

interface SnackbarProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  duration?: number;
}

export default function Snackbar({ message, actionLabel, onAction, onDismiss, duration = 3000 }: SnackbarProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div style={{
      position: 'fixed', bottom: 80, left: 16, right: 16,
      zIndex: 200,
      backgroundColor: '#191F28',
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      animation: 'slideUp 0.25s ease',
      boxShadow: 'var(--shadow-md)',
    }}>
      <span style={{ fontSize: 'var(--font-size-md)', color: '#fff', fontWeight: 500 }}>
        {message}
      </span>
      {actionLabel && (
        <button
          onClick={onAction}
          style={{
            fontSize: 'var(--font-size-sm)',
            color: '#5AC8FA',
            fontWeight: 600,
            marginLeft: 16,
            whiteSpace: 'nowrap',
          }}
        >
          {actionLabel}
        </button>
      )}
      <style>{`@keyframes slideUp { from { transform: translateY(20px); opacity:0 } to { transform:translateY(0); opacity:1 } }`}</style>
    </div>
  );
}
