interface StoreCountBarProps {
  count: number;
  style?: React.CSSProperties;
}

export default function StoreCountBar({ count, style }: StoreCountBarProps) {
  return (
    <div style={{
      height: 32, display: 'flex', alignItems: 'center',
      paddingLeft: 20, paddingRight: 20,
      ...style,
    }}>
      <span style={{ fontWeight: 600, fontSize: 12, lineHeight: '16.2px' }}>
        <span style={{ color: '#6B7684' }}>총 </span>
        <span style={{ color: '#4E5968' }}>{count}</span>
        <span style={{ color: '#6B7684' }}>개</span>
      </span>
    </div>
  );
}
