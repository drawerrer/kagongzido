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
      // flex=true 면 부모 영역 가득 채워 세로 중앙 정렬
      //   - flex:1 (부모가 flex column 일 때) + minHeight:100% (그 외 케이스 대응)
      //   - justifyContent:center 로 세로 가운데
      // flex=false 면 inline 동작 (CollectionPage 같이 본문 중간 삽입용)
      ...(flex ? { flex: 1, minHeight: '100%', justifyContent: 'center' } : {}),
      display: 'flex', flexDirection: 'column',
      alignItems: 'center',
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
