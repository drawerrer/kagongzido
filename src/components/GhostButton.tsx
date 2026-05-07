import type { ReactNode } from 'react';

interface GhostButtonProps {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export default function GhostButton({ label, icon, onClick }: GhostButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 38, borderRadius: 10,
        backgroundColor: 'rgba(211,211,223,0.19)',
        border: 'none', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center',
        padding: '0 16px', gap: 6, flexShrink: 0,
      }}
    >
      <span style={{ fontWeight: 590, fontSize: 15, color: '#252525', whiteSpace: 'nowrap' }}>
        {label}
      </span>
      {icon}
    </button>
  );
}
