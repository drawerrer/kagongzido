interface RoundBadgeProps {
  label: string;
}

export default function RoundBadge({ label }: RoundBadgeProps) {
  return (
    <span style={{
      background: '#252525', color: '#ffffff',
      borderRadius: 99, width: 48, height: 22,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 400, lineHeight: '18px',
      flexShrink: 0, boxSizing: 'border-box',
    }}>
      {label}
    </span>
  );
}
