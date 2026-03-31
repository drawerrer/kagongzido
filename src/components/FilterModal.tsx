import { useState } from 'react';

// ── 타입 ─────────────────────────────────
interface FilterState {
  openNow: boolean;
  moods: string[];
  priceMax: number;
  options: string[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (filters: FilterState) => void;
}

// ── 상수 ─────────────────────────────────
const MOOD_CHIPS = ['조용한', '모던한', '개방적인', '활기찬', '아늑한', '따뜻한', '자연', '빈티지'];

const OPTION_ROWS = [
  ['콘센트 충분', '소음 적당', '조용'],
  ['남/녀 화장실 구분', '내부 화장실'],
  ['단체 방문 가능', '반려동물 동반 가능'],
  ['시간제한 없음', '주차 가능'],
  ['디카페인 무료 변경'],
];

const DEFAULT_FILTERS: FilterState = {
  openNow: false,
  moods: [],
  priceMax: 15000,
  options: [],
};

// ── 칩 버튼 ──────────────────────────────
function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 32,
        padding: '0 12px',
        borderRadius: 9999,
        border: selected ? 'none' : '1px solid #D1D6DB',
        background: selected ? '#191F28' : 'transparent',
        color: selected ? '#ffffff' : '#6B7684',
        fontSize: 13,
        fontWeight: selected ? 600 : 400,
        flexShrink: 0,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
}

// ── 토글 스위치 ───────────────────────────
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 51,
        height: 31,
        borderRadius: 15.5,
        border: 'none',
        background: on ? '#3182F6' : '#E5E8EB',
        position: 'relative',
        flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 22 : 2,
          width: 27,
          height: 27,
          borderRadius: 13.5,
          background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          transition: 'left 0.2s',
        }}
      />
    </button>
  );
}

// ── FilterModal (메인) ────────────────────
export default function FilterModal({ isOpen, onClose, onApply }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  if (!isOpen) return null;

  const toggle = <K extends keyof FilterState>(key: K, value?: string) => {
    if (key === 'openNow') {
      setFilters(f => ({ ...f, openNow: !f.openNow }));
    } else if ((key === 'moods' || key === 'options') && value) {
      setFilters(f => {
        const arr = f[key] as string[];
        return {
          ...f,
          [key]: arr.includes(value) ? arr.filter(x => x !== value) : [...arr, value],
        };
      });
    }
  };

  const reset = () => setFilters(DEFAULT_FILTERS);

  const apply = () => {
    onApply?.(filters);
    onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
      {/* 딤 배경 */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }}
      />

      {/* 시트 */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'white',
          borderRadius: '16px 16px 0 0',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 48, height: 4, borderRadius: 2, background: '#E5E8EB' }} />
        </div>

        {/* 타이틀 */}
        <div style={{ padding: '12px 20px 4px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#191F28' }}>필터</h2>
        </div>

        {/* 스크롤 가능 콘텐츠 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>

          {/* 영업중 토글 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 0',
            }}
          >
            <span style={{ fontSize: 15, color: '#191F28' }}>지금 영업중인 카페만 보기</span>
            <Toggle on={filters.openNow} onToggle={() => toggle('openNow')} />
          </div>

          <div style={{ height: 1, background: '#F2F4F6' }} />

          {/* 분위기 */}
          <div style={{ padding: '16px 0' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#191F28', marginBottom: 12 }}>
              분위기
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {MOOD_CHIPS.map(m => (
                <Chip
                  key={m}
                  label={m}
                  selected={filters.moods.includes(m)}
                  onClick={() => toggle('moods', m)}
                />
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: '#F2F4F6' }} />

          {/* 가격대 */}
          <div style={{ padding: '16px 0' }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#191F28', marginBottom: 12 }}>
              가격대 (핫아메리카노 1잔 기준)
            </h3>
            <input
              type="range"
              min={5000}
              max={15000}
              step={500}
              value={filters.priceMax}
              onChange={e => setFilters(f => ({ ...f, priceMax: Number(e.target.value) }))}
              style={{ width: '100%', accentColor: '#3182F6', height: 4 }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                color: '#6B7684',
                marginTop: 8,
              }}
            >
              <span>5,000원</span>
              <span style={{ color: '#3182F6', fontWeight: 600 }}>
                {filters.priceMax.toLocaleString()}원 이하
              </span>
              <span>15,000원</span>
            </div>
          </div>

          <div style={{ height: 1, background: '#F2F4F6' }} />

          {/* 옵션 */}
          <div style={{ padding: '16px 0', paddingBottom: 8 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#191F28', marginBottom: 12 }}>
              옵션
            </h3>
            {OPTION_ROWS.map((row, i) => (
              <div key={i} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {row.map(opt => (
                  <Chip
                    key={opt}
                    label={opt}
                    selected={filters.options.includes(opt)}
                    onClick={() => toggle('options', opt)}
                  />
                ))}
              </div>
            ))}
          </div>

          <div style={{ height: 24 }} />
        </div>

        {/* 하단 버튼 */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            padding: '16px 20px',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            borderTop: '1px solid #F2F4F6',
          }}
        >
          <button
            onClick={reset}
            style={{
              flex: 1,
              height: 56,
              borderRadius: 12,
              border: '1px solid #E5E8EB',
              background: 'white',
              fontSize: 17,
              fontWeight: 600,
              color: '#191F28',
            }}
          >
            초기화
          </button>
          <button
            onClick={apply}
            style={{
              flex: 2,
              height: 56,
              borderRadius: 12,
              border: 'none',
              background: '#3182F6',
              fontSize: 17,
              fontWeight: 600,
              color: 'white',
            }}
          >
            적용하기
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
