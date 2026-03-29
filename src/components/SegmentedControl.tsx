interface SegmentedControlProps {
  tabs: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export default function SegmentedControl({ tabs, activeIndex, onChange }: SegmentedControlProps) {
  return (
    <div style={{
      display: 'flex',
      backgroundColor: '#F2F4F6',
      borderRadius: 'var(--radius-sm)',
      padding: 3,
      gap: 2,
    }}>
      {tabs.map((tab, i) => (
        <button
          key={tab}
          onClick={() => onChange(i)}
          style={{
            flex: 1,
            padding: '6px 0',
            borderRadius: 6,
            fontSize: 'var(--font-size-md)',
            fontWeight: activeIndex === i ? 600 : 500,
            color: activeIndex === i ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            backgroundColor: activeIndex === i ? 'var(--color-surface)' : 'transparent',
            boxShadow: activeIndex === i ? '0 1px 3px rgba(0,0,0,0.12)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
