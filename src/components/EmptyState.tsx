import type { ReactNode } from 'react';
import GhostButton from './GhostButton';

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
        <div style={{ marginTop: 52 }}>
          <GhostButton label={buttonLabel} icon={buttonIcon} onClick={onButtonClick} />
        </div>
      )}
    </div>
  );
}
