// SF Pro 시스템 폰트
const SFPro = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif';

interface SegmentedControlProps {
  tabs: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export default function SegmentedControl({ tabs, activeIndex, onChange }: SegmentedControlProps) {
  return (
    // 피그마: bg rgba(7,25,76,0.05), borderRadius 10, height 38, padding 3px
    <div style={{
      display: 'flex',
      backgroundColor: 'rgba(7, 25, 76, 0.05)',
      borderRadius: 10,
      padding: 3,
      height: 38,
      boxSizing: 'border-box',
    }}>
      {tabs.map((tab, i) => (
        <button
          key={tab}
          onClick={() => onChange(i)}
          style={{
            flex: 1,
            borderRadius: 8,                                       // 피그마: 8px
            fontFamily: SFPro,
            fontSize: 15,                                          // 피그마: 15px
            fontWeight: activeIndex === i ? 590 : 510,             // 피그마: Semibold/Medium
            color: activeIndex === i
              ? 'rgba(0, 12, 30, 0.8)'                            // 피그마: 선택
              : 'rgba(0, 19, 43, 0.58)',                           // 피그마: 비선택
            backgroundColor: activeIndex === i ? '#ffffff' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s',
            lineHeight: '18.78px',
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
