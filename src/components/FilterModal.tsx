import { useState } from 'react';
import type { ReactNode } from 'react';

// ── 옵션 칩 SVG 아이콘 ─────────────────────────────────────
function IcElectronic() { // temaki:electronic (콘센트 충분)
  return <svg width="16" height="16" viewBox="0 0 15 15" fill="currentColor"><path d="M11 4V1c0-1-1-1-1 0v3H5V1c0-1-1-1-1 0v3H2.5c-1 0-1 1.5-.5 2.5s1.5 3 1.5 5.5c0 0 0 2 1 2H6v1h3v-1h1.5c1 0 1-2 1-2c0-2.5 1-4.5 1.5-5.5s.5-2.5-.5-2.5M7.25 9.5H5.5l3-4l-.5 3h2l-3 4"/></svg>;
}
function IcSoundLow() { // iconoir:sound-low-solid (소음 적당)
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M13.037 3.396c1.163-.767 2.713.068 2.713 1.461v14.286c0 1.394-1.55 2.228-2.713 1.461l-6-3.955a.25.25 0 0 0-.137-.042H4a2.75 2.75 0 0 1-2.75-2.75v-3.714A2.75 2.75 0 0 1 4 7.393h2.9a.25.25 0 0 0 .138-.041zM18.97 8.47a.75.75 0 0 1 1.06 0 6.87 6.87 0 0 1 0 9.31.75.75 0 0 1-1.06-1.06 5.37 5.37 0 0 0 0-7.19.75.75 0 0 1 0-1.06z"/></svg>;
}
function IcSoundOff() { // iconoir:sound-off-solid (조용)
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M13.037 3.396c1.163-.767 2.713.068 2.713 1.461v14.286c0 1.394-1.55 2.228-2.713 1.461l-6-3.955a.25.25 0 0 0-.137-.042H4a2.75 2.75 0 0 1-2.75-2.75v-3.714A2.75 2.75 0 0 1 4 7.393h2.9a.25.25 0 0 0 .138-.041zM18.47 8.47a.75.75 0 0 1 1.06 0l1.5 1.5 1.5-1.5a.75.75 0 1 1 1.06 1.06L21.59 11l1.5 1.5a.75.75 0 1 1-1.06 1.06l-1.5-1.5-1.5 1.5a.75.75 0 1 1-1.06-1.06l1.5-1.5-1.5-1.5a.75.75 0 0 1 0-1.06z"/></svg>;
}
function IcPublicToilet() { // icon-park-solid:public-toilet (남/녀 화장실 구분)
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" clipRule="evenodd" d="M7 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm10 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM4 11a2 2 0 0 0-2 2v4h1.5v5h3V17H8v-4a2 2 0 0 0-2-2zm9 0c-1.1 0-2 .9-2 2l1.5 5H14v5h2v-5h1.5L19 13a2 2 0 0 0-2-2z"/></svg>;
}
function IcToilet() { // picon:toilet (내부 화장실)
  return <svg width="16" height="16" viewBox="0 0 15 15" fill="currentColor"><path d="M11 4V1c0-1-1-1-1 0v3H5V1c0-1-1-1-1 0v3H2.5c-1 0-1 1.5-.5 2.5s1.5 3 1.5 5.5c0 0 0 2 1 2H6v1h3v-1h1.5c1 0 1-2 1-2c0-2.5 1-4.5 1.5-5.5s.5-2.5-.5-2.5M7.25 9.5H5.5l3-4l-.5 3h2l-3 4"/></svg>;
}
function IcPeople() { // ion:people-sharp (단체 방문 가능)
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.35 3c1.18-.17 2.43 1.12 2.79 2.9.36 1.77-.29 3.35-1.47 3.53-1.17.18-2.43-1.11-2.8-2.89C6.5 4.77 7.17 3.19 8.35 3zm7.15 0c1.19.19 1.85 1.77 1.5 3.54-.38 1.78-1.63 3.07-2.81 2.89-1.19-.18-1.84-1.76-1.47-3.53C13.08 4.12 14.31 2.83 15.5 3zM3 7.6c1.14-.49 2.69.4 3.5 1.95.76 1.58.5 3.24-.63 3.73s-2.67-.39-3.46-1.96S1.9 8.08 3 7.6zm18 0c1.1.48 1.38 2.15.59 3.72s-2.33 2.45-3.46 1.96-1.39-2.15-.63-3.73C18.31 8 19.86 7.11 21 7.6zm-1.67 10.78c.04.94-.68 1.98-1.54 2.37-1.79.82-3.91-.88-5.9-.88s-4.13 1.77-5.89.88c-1-.49-1.69-1.79-1.56-2.87.18-1.49 1.97-2.29 3.03-3.38C9.88 13 10.94 10.39 12 10.39c2 0 3.06 2.61 4.41 4.06 1.11 1.22 2.96 2.25 3.03 3.88-.03 0-.06-.06-.11.05z"/></svg>;
}
function IcPets() { // mdi:pets (반려동물 동반 가능)
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8.35 3c1.18-.17 2.43 1.12 2.79 2.9.36 1.77-.29 3.35-1.47 3.53-1.17.18-2.43-1.11-2.8-2.89C6.5 4.77 7.17 3.19 8.35 3m7.15 0c1.19.19 1.85 1.77 1.5 3.54-.38 1.78-1.63 3.07-2.81 2.89-1.19-.18-1.84-1.76-1.47-3.53.36-1.78 1.61-3.07 2.78-2.9M3 7.6c1.14-.49 2.69.4 3.5 1.95.76 1.58.5 3.24-.63 3.73s-2.67-.39-3.46-1.96S1.9 8.08 3 7.6m18 0c1.1.48 1.38 2.15.59 3.72s-2.33 2.45-3.46 1.96-1.39-2.15-.63-3.73C18.31 8 19.86 7.11 21 7.6m-1.67 10.78c.04.94-.68 1.98-1.54 2.37-1.79.82-3.91-.88-5.9-.88s-4.13 1.77-5.89.88c-1-.49-1.69-1.79-1.56-2.87.18-1.49 1.97-2.29 3.03-3.38 1.41-1.41 2.41-4.06 4.42-4.06 2 0 3.06 2.61 4.41 4.06 1.11 1.22 2.96 2.25 3.03 3.88"/></svg>;
}
function IcTimerOff() { // material-symbols:timer-off-rounded (시간제한 없음)
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22q-1.85 0-3.488-.712T5.65 19.35t-1.937-2.863T3 13q0-1.5.463-2.887T4.8 7.6L2.1 4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l17 17q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-1.7-1.7q-1.2.875-2.587 1.338T12 22M10 3q-.425 0-.712-.288T9 2t.288-.712T10 1h4q.425 0 .713.288T15 2t-.288.713T14 3zm8.7 12.9L13 10.2V9q0-.425-.288-.712T12 8q-.25 0-.462.1t-.338.3L9.075 6.275q-.45-.45-.325-1.075t.725-.825t1.238-.288T12 4q1.5 0 2.938.5t2.712 1.45l.7-.7q.275-.275.7-.275t.7.275t.275.7t-.275.7l-.7.7q.95 1.275 1.45 2.713T21 13q0 .65-.088 1.275t-.287 1.25q-.2.6-.825.725t-1.1-.35"/></svg>;
}
function IcParking() { // material-symbols:local-parking-rounded (주차 가능)
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M10 15v4q0 .825-.587 1.413T8 21t-1.412-.587T6 19V5q0-.825.588-1.412T8 3h5q2.5 0 4.25 1.75T19 9t-1.75 4.25T13 15zm0-4h3.2q.825 0 1.413-.587T15.2 9t-.587-1.412T13.2 7H10z"/></svg>;
}
function IcCoffee() { // bxs:coffee (디카페인 무료 변경)
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 2h2v3H5zm4 0h2v3H9zm4 0h2v3h-2zm6 7h-2V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3h2c1.103 0 2-.897 2-2v-5c0-1.103-.897-2-2-2m-2 7v-5h2l.002 5z"/></svg>;
}

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

const OPTION_CHIPS: { icon: ReactNode; label: string }[] = [
  { icon: <IcElectronic />,  label: '콘센트 충분' },
  { icon: <IcSoundLow />,    label: '소음 적당' },
  { icon: <IcSoundOff />,    label: '조용' },
  { icon: <IcPublicToilet />,label: '남/녀 화장실 구분' },
  { icon: <IcToilet />,      label: '내부 화장실' },
  { icon: <IcPeople />,      label: '단체 방문 가능' },
  { icon: <IcPets />,        label: '반려동물 동반 가능' },
  { icon: <IcTimerOff />,    label: '시간제한 없음' },
  { icon: <IcParking />,     label: '주차 가능' },
  { icon: <IcCoffee />,      label: '디카페인 무료 변경' },
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
  icon?: ReactNode;
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
      {icon && <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>}
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

        {/* ── 하단 고정: 초기화 + 적용하기 버튼 ── */}
        <div
          style={{
            padding: '12px 20px',
            paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
            borderTop: '1px solid #F2F4F6',
            background: 'white',
            display: 'flex',
            gap: 8,
          }}
        >
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            style={{
              flex: 1,
              height: 54,
              borderRadius: 12,
              background: '#F2F4F6',
              color: '#191F28',
              fontSize: 17,
              fontWeight: 700,
              cursor: 'pointer',
              border: 'none',
            }}
          >
            초기화
          </button>
          <button
            onClick={handleApply}
            style={{
              flex: 2,
              height: 54,
              borderRadius: 12,
              background: '#3182F6',
              color: 'white',
              fontSize: 17,
              fontWeight: 700,
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
