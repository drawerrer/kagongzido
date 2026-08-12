interface RoundBadgeProps {
  label: string;
}

export default function RoundBadge({ label }: RoundBadgeProps) {
  return (
    <span style={{
      background: '#252525', color: '#ffffff',
      borderRadius: 99, padding: '2px 12px',
      fontSize: 12, fontWeight: 400, lineHeight: '18px',
    }}>
      {label}
    </span>
  );
}
