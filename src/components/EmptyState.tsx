import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonIcon?: ReactNode;
  onButtonClick?: () => void;
  flex?: boolean;
  paddingBottom?: number;
}

export default function EmptyState({
  title,
  subtitle,
  buttonLabel,
  buttonIcon,
  onButtonClick,
  flex = true,
  paddingBottom,
}: EmptyStateProps) {
  return (
    <div style={{
      ...(flex ? { flex: 1 } : {}),
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', paddingTop: 52,
      ...(paddingBottom != null ? { paddingBottom } : {}),
    }}>
      <p style={{
        fontWeight: 590, fontSize: 13, color: '#4e5968',
        textAlign: 'center', lineHeight: '22.5px', margin: 0,
      }}>
        {title}
      </p>
      {subtitle && (
        <p style={{
          fontWeight: 590, fontSize: 13, color: '#4e5968',
          textAlign: 'center', lineHeight: '22.5px', margin: 0,
        }}>
          {subtitle}
        </p>
      )}
      {buttonLabel && (
        <button
          onClick={onButtonClick}
          style={{
            marginTop: 52, height: 38, borderRadius: 10,
            backgroundColor: 'rgba(211,211,223,0.19)',
            border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center',
            padding: '0 16px', gap: 6, flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 590, fontSize: 15, color: '#252525', whiteSpace: 'nowrap' }}>
            {buttonLabel}
          </span>
          {buttonIcon}
        </button>
      )}
    </div>
  );
}
