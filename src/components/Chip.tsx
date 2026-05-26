interface ChipProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function Chip({ label, isActive = false, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        height: 32,
        padding: '0 14px',
        borderRadius: 999,
        border: 'none',
        background: isActive ? '#252525' : 'rgba(46,46,46,0.08)',
        color: isActive ? '#ffffff' : 'rgba(0,0,0,0.7)',
        fontSize: 13,
        fontWeight: 590,
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
    >
      {label}
    </button>
  );
}
