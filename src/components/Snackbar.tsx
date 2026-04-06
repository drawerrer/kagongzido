import { useEffect } from 'react';

const SFPro = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif';

interface SnackbarProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  duration?: number;
}

// Figma: Toast 274×59px, cornerRadius 9999 (pill), 화면 하단 중앙
export default function Snackbar({ message, actionLabel, onAction, onDismiss, duration = 3000 }: SnackbarProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <>
      <style>{`
        @keyframes snackbarUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        bottom: 90,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 274,
        height: 59,
        borderRadius: 9999,
        backgroundColor: 'rgba(25,31,40,0.92)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 8,
        gap: 8,
        zIndex: 300,
        animation: 'snackbarUp 0.25s ease',
        boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      }}>
        {/* 아이콘 영역 (Figma: 24×24 Rectangle) */}
        <div style={{ width: 24, height: 24, flexShrink: 0 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.15)"/>
            <path d="M8 12l3 3 5-5" stroke="#ffffff" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* 텍스트 (Figma: 15px/590, white) */}
        <span style={{
          flex: 1,
          fontFamily: SFPro, fontWeight: 590, fontSize: 15,
          color: '#ffffff',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {message}
        </span>

        {/* 액션 버튼 (Figma: 72×31, rgba(255,255,255,0.31) bg, r100, 텍스트 13px/590 rgba(255,255,255,0.89)) */}
        {actionLabel && (
          <button
            onClick={onAction}
            style={{
              width: 72, height: 31,
              borderRadius: 100,
              backgroundColor: 'rgba(255,255,255,0.31)',
              border: 'none', cursor: 'pointer',
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{
              fontFamily: SFPro, fontWeight: 590, fontSize: 13,
              color: 'rgba(255,255,255,0.89)',
            }}>
              {actionLabel}
            </span>
          </button>
        )}
      </div>
    </>
  );
}
