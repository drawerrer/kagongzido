interface SubButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'light' | 'dark';
  style?: React.CSSProperties;
}

export default function SubButton({ label, onClick, variant = 'light', style }: SubButtonProps) {
  const isDark = variant === 'dark';
  return (
    <button
      onClick={onClick}
      style={{
        height: 32,
        padding: '0 12px',
        borderRadius: 8,
        backgroundColor: isDark ? '#252525' : '#E7E8EB',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 590,
        fontSize: 13,
        color: isDark ? '#FFFFFF' : 'rgba(3,18,40,0.7)',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...style,
      }}
    >
      {label}
    </button>
  );
}
