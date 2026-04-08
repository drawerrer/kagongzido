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
  icon?: ReactNode;
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
        background: checked ? '#3182F6' : 'white',
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
              슬라이더 트랙: r=2.5 h=5 fill=#e5e8eb / 활성트랙: fill=#3182f6
              Knob: 26×26 r=9999 fill=#ffffff stroke=#001d3a a=0.18
              값 라벨 (5,000 / 15,000): fs=14 fw=400 fill=#000c1e a=0.80 */}
          <div style={{ padding: '0 0 8px' }}>
            <div style={{ height: 40, display: 'flex', alignItems: 'center', gap: 6 }}>
              <h3 style={{ fontSize: 14, fontWeight: 400, lineHeight: '18.9px', color: 'rgba(0,12,30,0.80)' }}>
                가격대
              </h3>
              <span style={{ fontSize: 14, fontWeight: 400, color: 'rgba(0,12,30,0.80)' }}>
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

            {/* 슬라이더 래퍼 — 피그마: 트랙 h=5 r=2.5 fill=#e5e8eb, 활성 fill=#3182f6 */}
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
            버튼: h=56 r=16 fill=#3182f6 fs=17 fw=590 fill=#ffffff ── */}
        <div
          style={{
            height: 90,
            padding: '34px 20px 0',
            background: '#ffffff',
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
              width: '100%',
              height: 56,
              borderRadius: 16,
              background: '#3182F6',
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
