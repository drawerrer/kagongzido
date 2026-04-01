import { useState } from 'react';

// ── 타입 ─────────────────────────────────
export interface FilterState {
  openNow: boolean;
  moods: string[];
  priceMax: number;
  options: string[];
}

interface FilterModalProps {
  isOpen: boolean;
  initialFilters: FilterState;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

// ── 상수 ─────────────────────────────────
export const DEFAULT_FILTERS: FilterState = {
  openNow: true,
  moods: [],
  priceMax: 15000,
  options: [],
};

const MOOD_CHIPS = ['조용한', '모던한', '개방적인', '활기찬', '아늑한', '따뜻한', '자연', '빈티지'];

const OPTION_CHIPS: { icon: string; label: string }[] = [
  { icon: '🔌', label: '콘센트 충분' },
  { icon: '🔊', label: '소음 적당' },
  { icon: '🤫', label: '조용' },
  { icon: '🚻', label: '남/녀 화장실 구분' },
  { icon: '🚿', label: '내부 화장실' },
  { icon: '👥', label: '단체 방문 가능' },
  { icon: '🐾', label: '반려동물 동반 가능' },
  { icon: '⏰', label: '시간제한 없음' },
  { icon: '🅿️', label: '주차 가능' },
  { icon: '☕', label: '디카페인 무료 변경' },
];

const PRICE_MIN = 5000;
const PRICE_MAX = 15000;
const PRICE_STEP = 1000;

// ── 칩 버튼 ──────────────────────────────
function Chip({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string;
  icon?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: icon ? 5 : 0,
        height: 34,
        padding: '0 13px',
        borderRadius: 9999,
        border: selected ? 'none' : '1px solid #D1D6DB',
        background: selected ? '#191F28' : 'white',
        color: selected ? '#ffffff' : '#6B7684',
        fontSize: 13,
        fontWeight: selected ? 600 : 400,
        flexShrink: 0,
        transition: 'all 0.15s',
        cursor: 'pointer',
      }}
    >
      {icon && <span style={{ fontSize: 14 }}>{icon}</span>}
      {label}
    </button>
  );
}

// ── 체크박스 ──────────────────────────────
function Checkbox({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 20,
        height: 20,
        borderRadius: 5,
        border: checked ? 'none' : '1.5px solid #D1D6DB',
        background: checked ? '#3182F6' : 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.15s',
        cursor: 'pointer',
      }}
    >
      {checked && (
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
          <path d="M1.5 5L4.5 8L10.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

// ── 구분선 ──────────────────────────────
function Divider() {
  return <div style={{ height: 1, background: '#F2F4F6', margin: '0 -20px' }} />;
}

// ── FilterModal (메인) ────────────────────
export default function FilterModal({ isOpen, initialFilters, onClose, onApply }: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // isOpen이 바뀔 때마다 initialFilters로 초기화 (열릴 때 적용된 값 기준으로 시작)
  // → 부모에서 key를 사용해 remount하거나, useEffect로 처리
  // 여기서는 부모가 filterOpen 변화 시 key로 remount함

  if (!isOpen) return null;

  const toggleMood = (m: string) => {
    setFilters(f => ({
      ...f,
      moods: f.moods.includes(m) ? f.moods.filter(x => x !== m) : [...f.moods, m],
    }));
  };

  const toggleOption = (o: string) => {
    setFilters(f => ({
      ...f,
      options: f.options.includes(o) ? f.options.filter(x => x !== o) : [...f.options, o],
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  // 슬라이더 트랙 퍼센트 계산
  const sliderPct = ((filters.priceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
      {/* 딤 배경 — 외부 탭 시 적용 없이 닫힘 */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }}
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
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'filterSlideUp 0.25s ease',
        }}
      >
        {/* 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E8EB' }} />
        </div>

        {/* 타이틀 */}
        <div style={{ padding: '10px 20px 14px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#191F28' }}>필터</h2>
        </div>

        {/* ── 스크롤 가능 콘텐츠 ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>

          {/* 지금 영업중인 카페만 보기 */}
          <div
            onClick={() => setFilters(f => ({ ...f, openNow: !f.openNow }))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 0',
              cursor: 'pointer',
            }}
          >
            <Checkbox checked={filters.openNow} onToggle={() => setFilters(f => ({ ...f, openNow: !f.openNow }))} />
            <span style={{ fontSize: 15, color: '#191F28', userSelect: 'none' }}>
              지금 영업중인 카페만 보기
            </span>
          </div>

          <Divider />

          {/* 분위기 */}
          <div style={{ padding: '18px 0' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 14 }}>
              분위기
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {MOOD_CHIPS.map(m => (
                <Chip
                  key={m}
                  label={m}
                  selected={filters.moods.includes(m)}
                  onClick={() => toggleMood(m)}
                />
              ))}
            </div>
          </div>

          <Divider />

          {/* 가격대 */}
          <div style={{ padding: '18px 0' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#191F28' }}>가격대</h3>
              <span style={{ fontSize: 12, color: '#8B95A1' }}>(핫아메리카노 1잔 기준)</span>
            </div>

            {/* 현재 선택 가격 */}
            <p style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#191F28',
              margin: '16px 0 12px',
              letterSpacing: '-0.5px',
            }}>
              {filters.priceMax.toLocaleString()}
            </p>

            {/* 슬라이더 래퍼 */}
            <div style={{ position: 'relative', margin: '0 0 10px' }}>
              {/* 트랙 배경 */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: 4,
                borderRadius: 2,
                background: '#E5E8EB',
                transform: 'translateY(-50%)',
              }} />
              {/* 활성 트랙 */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                width: `${sliderPct}%`,
                height: 4,
                borderRadius: 2,
                background: '#3182F6',
                transform: 'translateY(-50%)',
              }} />
              <input
                type="range"
                min={PRICE_MIN}
                max={PRICE_MAX}
                step={PRICE_STEP}
                value={filters.priceMax}
                onChange={e => setFilters(f => ({ ...f, priceMax: Number(e.target.value) }))}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: 20,
                  appearance: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  zIndex: 1,
                }}
              />
            </div>

            {/* 최솟값 ~ 최댓값 레이블 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              color: '#B0B8C1',
              marginTop: 2,
            }}>
              <span>5,000</span>
              <span>15,000</span>
            </div>
          </div>

          <Divider />

          {/* 옵션 */}
          <div style={{ padding: '18px 0 12px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 14 }}>
              옵션
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {OPTION_CHIPS.map(({ icon, label }) => (
                <Chip
                  key={label}
                  icon={icon}
                  label={label}
                  selected={filters.options.includes(label)}
                  onClick={() => toggleOption(label)}
                />
              ))}
            </div>
          </div>

          {/* 하단 여백 */}
          <div style={{ height: 16 }} />
        </div>

        {/* ── 하단 고정: 적용하기 버튼 ── */}
        <div
          style={{
            padding: '12px 20px',
            paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
            borderTop: '1px solid #F2F4F6',
            background: 'white',
          }}
        >
          <button
            onClick={handleApply}
            style={{
              width: '100%',
              height: 54,
              borderRadius: 12,
              background: '#3182F6',
              color: 'white',
              fontSize: 17,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            적용하기
          </button>
        </div>
      </div>

      <style>{`
        @keyframes filterSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 11px;
          background: white;
          border: 2px solid #3182F6;
          box-shadow: 0 2px 6px rgba(0,0,0,0.18);
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 11px;
          background: white;
          border: 2px solid #3182F6;
          box-shadow: 0 2px 6px rgba(0,0,0,0.18);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
