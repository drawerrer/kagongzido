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

// 피그마 분위기 칩 목록 (조용한 → 모던한 → 개방적인 → 활기찬 → 아늑한 → 따뜻한 → 자연 → 빈티지)
const MOOD_CHIPS = ['조용한', '모던한', '개방적인', '활기찬', '아늑한', '따뜻한', '자연', '빈티지'];

// 피그마 옵션 칩 목록 (아이콘 + 텍스트, fs=12)
const OPTION_CHIPS: { icon: string; label: string }[] = [
  { icon: '⚡', label: '콘센트 충분' },
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
// 피그마 수치:
//   active  : fill=#000c1e a=0.80 → rgba(0,12,30,0.80), text=#ffffff, r=999, h=32
//   inactive: fill=#07194c a=0.05 → rgba(7,25,76,0.05), stroke=#001733 a=0.02, text=rgba(3,18,40,0.70)
//   mood fs=13 fw=590 / option fs=12 fw=590
function Chip({
  label,
  icon,
  selected,
  onClick,
  fontSize = 13,
}: {
  label: string;
  icon?: string;
  selected: boolean;
  onClick: () => void;
  fontSize?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: icon ? 4 : 0,
        height: 32,
        padding: icon ? '0 12px' : '0 14px',
        borderRadius: 9999,
        border: selected
          ? 'none'
          : '1px solid rgba(0,23,51,0.02)',
        background: selected
          ? 'rgba(0,12,30,0.80)'
          : 'rgba(7,25,76,0.05)',
        color: selected ? '#ffffff' : 'rgba(3,18,40,0.70)',
        fontSize,
        fontWeight: 590,
        flexShrink: 0,
        cursor: 'pointer',
      }}
    >
      {icon && <span style={{ fontSize: fontSize }}>{icon}</span>}
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
        background: checked ? '#252525' : 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
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

  // 슬라이더 트랙 활성화 퍼센트
  const sliderPct = ((filters.priceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
      {/* 딤 배경 — 피그마: rgba(0,0,0,0.20) */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.20)' }}
      />

      {/* 시트 — 피그마: r=28, fill=#ffffff */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 10,
          right: 10,
          background: '#ffffff',
          borderRadius: 28,
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'filterSlideUp 0.25s ease',
        }}
      >
        {/* 핸들 — 피그마: 48×4 r=40 fill=#e5e8eb, Handle Area h=20 */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 20 }}>
          <div style={{ width: 48, height: 4, borderRadius: 40, background: '#e5e8eb' }} />
        </div>

        {/* 타이틀 "필터" — 피그마: fs=20 fw=700 fill=#000c1e a=0.80, Title instance h=48 */}
        <div style={{ height: 48, display: 'flex', alignItems: 'center', padding: '0 24px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'rgba(0,12,30,0.80)', lineHeight: '27px' }}>
            필터
          </h2>
        </div>

        {/* ── 스크롤 가능 콘텐츠 ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>

          {/* 지금 영업중인 카페만 보기
              피그마: fs=14 fw=400 lh=18.9 fill=#777777, Title instance h=39 */}
          <div
            onClick={() => setFilters(f => ({ ...f, openNow: !f.openNow }))}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              height: 39,
              cursor: 'pointer',
            }}
          >
            <Checkbox
              checked={filters.openNow}
              onToggle={() => setFilters(f => ({ ...f, openNow: !f.openNow }))}
            />
            <span style={{ fontSize: 14, fontWeight: 400, lineHeight: '18.9px', color: '#777777', userSelect: 'none' }}>
              지금 영업중인 카페만 보기
            </span>
          </div>

          {/* 분위기 섹션
              피그마: 섹션 타이틀 fs=14 fw=400 lh=18.9 fill=#000c1e a=0.80, Title h=40
              칩 행 각 h=44 (칩 자체 h=32, 상하 여백 6px씩) */}
          <div>
            <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 400, lineHeight: '18.9px', color: 'rgba(0,12,30,0.80)' }}>
                분위기
              </h3>
            </div>
            {/* 칩 행 — 피그마: 가로 줄바꿈, 행 높이 44px */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingBottom: 8 }}>
              {MOOD_CHIPS.map(m => (
                <Chip
                  key={m}
                  label={m}
                  selected={filters.moods.includes(m)}
                  onClick={() => toggleMood(m)}
                  fontSize={13}
                />
              ))}
            </div>
          </div>

          <Divider />

          {/* 가격대 섹션
              피그마: 타이틀 "가격대 (핫아메리카노 1잔 기준)" fs=14 fw=400 fill=#000c1e a=0.80
              슬라이더 트랙: r=2.5 h=5 fill=#e5e8eb / 활성트랙: fill=#252525
              Knob: 26×26 r=9999 fill=#ffffff stroke=#001d3a a=0.18
              값 라벨 (5,000 / 15,000): fs=14 fw=400 fill=#000c1e a=0.80 */}
          <div style={{ padding: '0 0 8px' }}>
            <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: 6 }}>
              <h3 style={{ fontSize: 14, fontWeight: 400, lineHeight: '18.9px', color: 'rgba(0,12,30,0.80)', margin: 0 }}>
                가격대
              </h3>
              <span style={{ fontSize: 14, fontWeight: 400, lineHeight: '18.9px', color: 'rgba(0,12,30,0.80)' }}>
                (핫아메리카노 1잔 기준)
              </span>
            </div>

            {/* 현재 선택 가격 — 피그마 슬라이더 툴팁: fs=15 fw=700 fill=#000c1e a=0.80 */}
            <p style={{
              fontSize: 15,
              fontWeight: 700,
              color: 'rgba(0,12,30,0.80)',
              margin: '4px 0 12px',
            }}>
              {filters.priceMax.toLocaleString()}원
            </p>

            {/* 슬라이더 래퍼 — 피그마: 트랙 h=5 r=2.5 fill=#e5e8eb, 활성 fill=#252525 */}
            <div style={{ position: 'relative', margin: '0 0 8px' }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                right: 0,
                height: 5,
                borderRadius: 2.5,
                background: '#e5e8eb',
                transform: 'translateY(-50%)',
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                width: `${sliderPct}%`,
                height: 5,
                borderRadius: 2.5,
                background: '#252525',
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
                  height: 28,
                  appearance: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  zIndex: 1,
                }}
              />
            </div>

            {/* 최솟값 ~ 최댓값 레이블 — 피그마: fs=14 fw=400 fill=#000c1e a=0.80 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 14,
              fontWeight: 400,
              color: 'rgba(0,12,30,0.80)',
              lineHeight: '18.9px',
            }}>
              <span>5,000</span>
              <span>15,000</span>
            </div>
          </div>

          <Divider />

          {/* 옵션 섹션
              피그마: 타이틀 fs=14 fw=400 fill=#000c1e a=0.80
              옵션 칩 fs=12 fw=590 (분위기 칩보다 작음) */}
          <div style={{ paddingBottom: 12 }}>
            <div style={{ height: 40, display: 'flex', alignItems: 'center' }}>
              <h3 style={{ fontSize: 14, fontWeight: 400, lineHeight: '18.9px', color: 'rgba(0,12,30,0.80)' }}>
                옵션
              </h3>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {OPTION_CHIPS.map(({ icon, label }) => (
                <Chip
                  key={label}
                  icon={icon}
                  label={label}
                  selected={filters.options.includes(label)}
                  onClick={() => toggleOption(label)}
                  fontSize={12}
                />
              ))}
            </div>
          </div>

          <div style={{ height: 16 }} />
        </div>

        {/* ── 하단 고정: 적용하기 버튼
            피그마: Button Area h=90, 버튼 pad-top=34px
            버튼: h=56 r=16 fill=#252525 fs=17 fw=590 fill=#ffffff ── */}
        <div
          style={{
            height: 90,
            padding: '34px 20px 0',
            background: '#ffffff',
          }}
        >
          <button
            onClick={handleApply}
            style={{
              width: '100%',
              height: 56,
              borderRadius: 16,
              background: '#252525',
              color: '#ffffff',
              fontSize: 17,
              fontWeight: 590,
              cursor: 'pointer',
              border: 'none',
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
        /* 슬라이더 Knob — 피그마: 26×26 r=9999 fill=#ffffff stroke=#001d3a a=0.18 */
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 26px;
          height: 26px;
          border-radius: 9999px;
          background: #ffffff;
          border: 1px solid rgba(0,29,58,0.18);
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
          cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 26px;
          height: 26px;
          border-radius: 9999px;
          background: #ffffff;
          border: 1px solid rgba(0,29,58,0.18);
          box-shadow: 0 2px 6px rgba(0,0,0,0.12);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
