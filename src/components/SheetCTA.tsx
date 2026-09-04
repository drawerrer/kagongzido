/**
 * SheetCTA — 바텀시트 하단 CTA 통일 컴포넌트
 *
 * Canonical 스펙 (토스 표준):
 *   height: 56  ·  borderRadius: 16  ·  gap: 8
 *   fontSize: 17  ·  fontWeight: 590
 *   상단 그라데이션 페이드 24px (스크롤 콘텐츠 → CTA 부드러운 전환)
 *
 * 사용 예:
 *   <SheetCTA.Single label="확인" onClick={...} disabled={...} background="#F3F3F3" />
 *   <SheetCTA.Single label="확인" onClick={...} height={48} />   // 컴팩트 다이얼로그 전용 예외
 *   <SheetCTA.Double leftLabel="닫기" leftOnClick={...} rightLabel="확인" rightOnClick={...} background="#FFFFFF" />
 *   <SheetCTA.Double leftLabel="초기화" leftOnClick={...} leftWidth={88}
 *                    rightLabel="적용하기" rightOnClick={...} background="#F3F3F3" />   // 비대칭(FilterModal)
 *
 * background prop: 시트의 바탕색을 정확히 전달해야 그라데이션이 자연스러움 (기본 #FFFFFF)
 *
 * 색상 토큰:
 *   Primary BG   #252525           |  Primary Text  #FFFFFF
 *   Secondary BG rgba(7,25,76,.05) |  Secondary Tx  rgba(3,18,40,.70)
 *   Disabled BG  #E5E8EB           |  Disabled Tx   #B0B8C1
 */

import type { CSSProperties } from 'react';

const HEIGHT = 56;
const BORDER_RADIUS = 16;
const FONT_SIZE = 17;
const FONT_WEIGHT = 590;
const GAP = 8;
const GRADIENT_HEIGHT = 24; // FocusBottomCTA와 동일 스펙

const PRIMARY_BG = '#252525';
const PRIMARY_TEXT = '#FFFFFF';
const DISABLED_BG = '#E5E8EB';
const DISABLED_TEXT = '#B0B8C1';
const SECONDARY_BG = 'rgba(7, 25, 76, 0.05)';
const SECONDARY_TEXT = 'rgba(3, 18, 40, 0.70)';

const BUTTON_BASE: CSSProperties = {
  height: HEIGHT,
  borderRadius: BORDER_RADIUS,
  border: 'none',
  fontSize: FONT_SIZE,
  fontWeight: FONT_WEIGHT,
  transition: 'background 0.15s, color 0.15s',
};

function makeContainer(background: string): CSSProperties {
  return {
    display: 'flex',
    gap: GAP,
    paddingTop: GRADIENT_HEIGHT,
    // 좌우 패딩을 컴포넌트 내부에 내장 — 그라데이션 BG 가 시트 풀너비로 확장되어
    // 양옆 빈 공간으로 리스트 콘텐츠가 비치는 문제 방지.
    // 호출 측 래퍼에서 paddingLeft/Right 따로 주지 않도록 주의.
    paddingLeft: 20,
    paddingRight: 20,
    // 상단 GRADIENT_HEIGHT 영역: 투명 → background 페이드 / 아래는 솔리드 background
    background: `linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, ${background} ${GRADIENT_HEIGHT}px, ${background} 100%)`,
  };
}

interface SingleProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** 'primary' (기본, dark fill) | 'secondary' (weak fill — 닫기/취소 등) */
  variant?: 'primary' | 'secondary';
  /** 시트의 바탕색 — 그라데이션 끝 색상으로 사용 (기본 #FFFFFF) */
  background?: string;
  /**
   * 버튼 높이 예외값 (px). 기본은 토스 표준 56.
   * 콘텐츠가 작아 표준 높이가 과하게 보이는 컴팩트 다이얼로그에서만 쓸 것
   * (예: NearbyLaptopCafesDialog). 일반 바텀시트는 기본값을 유지한다.
   */
  height?: number;
}

function Single({ label, onClick, disabled = false, variant = 'primary', background = '#FFFFFF', height = HEIGHT }: SingleProps) {
  const bg = disabled
    ? DISABLED_BG
    : variant === 'secondary' ? SECONDARY_BG : PRIMARY_BG;
  const text = disabled
    ? DISABLED_TEXT
    : variant === 'secondary' ? SECONDARY_TEXT : PRIMARY_TEXT;
  return (
    <div style={makeContainer(background)}>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          ...BUTTON_BASE,
          height,
          flex: 1,
          background: bg,
          color: text,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {label}
      </button>
    </div>
  );
}

interface DoubleProps {
  leftLabel: string;
  leftOnClick: () => void;
  leftDisabled?: boolean;
  /** 좌측 버튼 고정폭 (px). 지정하지 않으면 flex:1 (대칭) */
  leftWidth?: number;
  rightLabel: string;
  rightOnClick: () => void;
  rightDisabled?: boolean;
  /** 시트의 바탕색 — 그라데이션 끝 색상으로 사용 (기본 #FFFFFF) */
  background?: string;
}

function Double({
  leftLabel, leftOnClick, leftDisabled = false, leftWidth,
  rightLabel, rightOnClick, rightDisabled = false,
  background = '#FFFFFF',
}: DoubleProps) {
  const leftFlex: CSSProperties = leftWidth !== undefined
    ? { flex: '0 0 auto', width: leftWidth }
    : { flex: 1 };

  return (
    <div style={makeContainer(background)}>
      <button
        onClick={leftOnClick}
        disabled={leftDisabled}
        style={{
          ...BUTTON_BASE,
          ...leftFlex,
          background: leftDisabled ? DISABLED_BG : SECONDARY_BG,
          color: leftDisabled ? DISABLED_TEXT : SECONDARY_TEXT,
          cursor: leftDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {leftLabel}
      </button>
      <button
        onClick={rightOnClick}
        disabled={rightDisabled}
        style={{
          ...BUTTON_BASE,
          flex: 1,
          background: rightDisabled ? DISABLED_BG : PRIMARY_BG,
          color: rightDisabled ? DISABLED_TEXT : PRIMARY_TEXT,
          cursor: rightDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {rightLabel}
      </button>
    </div>
  );
}

const SheetCTA = { Single, Double };
export default SheetCTA;
