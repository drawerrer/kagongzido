interface SubButtonProps {
  label: string;
  onClick?: () => void;
}

export default function SubButton({ label, onClick }: SubButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 32,
        padding: '0 12px',
        borderRadius: 8,
        backgroundColor: '#E7E8EB',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 590,
        fontSize: 13,
        color: 'rgba(3,18,40,0.7)',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {label}
    </button>
  );
}
