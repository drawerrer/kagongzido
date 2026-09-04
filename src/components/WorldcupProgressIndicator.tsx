interface WorldcupProgressIndicatorProps {
  step: number;
  total: number;
}

export default function WorldcupProgressIndicator({ step, total }: WorldcupProgressIndicatorProps) {
  const pct = (step / total) * 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 62, height: 5, borderRadius: 3, background: '#dcdcdc', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: '#252525', borderRadius: 3, transition: 'width 0.2s' }} />
      </div>
      <span style={{ fontSize: 12, color: '#888888' }}>{step}/{total}</span>
    </div>
  );
}
