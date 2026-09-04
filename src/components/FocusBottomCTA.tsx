/**
 * FocusBottomCTA — 하단 탭바가 숨겨진 풀스크린 모드 전용 하단 CTA 컴포넌트
 *
 * 사용 컨텍스트: 작성·편집·제보처럼 사용자가 한 화면에 집중하는 모드
 *  - 리뷰 작성, 카페 제보하기
 *  - 모음집 편집·조직화 모드
 *  - 모음집 상세 편집 모드
 *
 * 부모 컨테이너 요구사항:
 *  - position: relative
 *  - overflow: hidden (스크롤 영역과 분리)
 *
 * 세 변형:
 *  - <FocusBottomCTA.Single label="..." onClick={...} disabled={...} />
 *  - <FocusBottomCTA.Double leftLabel="..." rightLabel="..." ... />
 *  - <FocusBottomCTA.SingleWithUndo label="..." onClick={...} undoLabel="..." onUndo={...} undoDisabled={...} />
 *      → 메인 버튼 위에 "이전으로" 같은 보조 텍스트 링크가 한 줄 더 있는 형태.
 *        카페 취향 월드컵 진행 화면(Figma "Worldcup_checking") 전용 스펙이라
 *        버튼 높이(56)·radius(16)·폰트(17/590)·그라데이션 높이(36)가 Single/Double과 다름 — 의도된 차이.
 *        undoLabel/onUndo를 생략하면 텍스트 링크 줄 없이 버튼만 렌더링 — 같은 스펙을 쓰는
 *        카페 취향 월드컵 결과 화면(Figma "Worldcup_result")에서 사용.
 *
 * Safe area는 컴포넌트 내부에서 통일 처리:
 *   padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 8px)
 */

import type { CSSProperties } from 'react';

const COLOR_PRIMARY = '#252525';
const COLOR_PRIMARY_DISABLED_BG = '#E5E8EB';
const COLOR_PRIMARY_DISABLED_TEXT = '#B0B8C1';
const COLOR_TEXT_ON_PRIMARY = '#FFFFFF';
const COLOR_SECONDARY_BG = '#E5E8EB';
const COLOR_SECONDARY_TEXT = '#252525';
const PAGE_BG = '#F3F3F3';
const GRADIENT_HEIGHT = 24; // 상단 페이드 영역 (TDS BottomCTA 동일 스펙)

const CONTAINER_BASE: CSSProperties = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  // 상단 GRADIENT_HEIGHT 영역은 투명→PAGE_BG 페이드, 그 아래는 솔리드 PAGE_BG
  // → 스크롤 콘텐츠가 CTA로 부드럽게 가려지는 효과
  background: `linear-gradient(180deg, rgba(243, 243, 243, 0) 0%, ${PAGE_BG} ${GRADIENT_HEIGHT}px, ${PAGE_BG} 100%)`,
  paddingTop: GRADIENT_HEIGHT,
  paddingLeft: 20,
  paddingRight: 20,
  paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 8px)`,
  display: 'flex',
  gap: 8,
};

const BUTTON_BASE: CSSProperties = {
  flex: 1,
  height: 52,
  borderRadius: 12,
  fontSize: 16,
  fontWeight: 600,
  border: 'none',
  transition: 'background 0.15s, color 0.15s',
};

interface SingleProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Single({ label, onClick, disabled = false }: SingleProps) {
  return (
    <div style={CONTAINER_BASE}>
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          ...BUTTON_BASE,
          background: disabled ? COLOR_PRIMARY_DISABLED_BG : COLOR_PRIMARY,
          color: disabled ? COLOR_PRIMARY_DISABLED_TEXT : COLOR_TEXT_ON_PRIMARY,
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
  rightLabel: string;
  rightOnClick: () => void;
  rightDisabled?: boolean;
}

function Double({
  leftLabel, leftOnClick, leftDisabled = false,
  rightLabel, rightOnClick, rightDisabled = false,
}: DoubleProps) {
  return (
    <div style={CONTAINER_BASE}>
      {/* 좌측: 보조 액션 (취소·삭제) */}
      <button
        onClick={leftOnClick}
        disabled={leftDisabled}
        style={{
          ...BUTTON_BASE,
          background: leftDisabled ? COLOR_PRIMARY_DISABLED_BG : COLOR_SECONDARY_BG,
          color: leftDisabled ? COLOR_PRIMARY_DISABLED_TEXT : COLOR_SECONDARY_TEXT,
          cursor: leftDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {leftLabel}
      </button>
      {/* 우측: 주 액션 (완료·확인) */}
      <button
        onClick={rightOnClick}
        disabled={rightDisabled}
        style={{
          ...BUTTON_BASE,
          background: rightDisabled ? COLOR_PRIMARY_DISABLED_BG : COLOR_PRIMARY,
          color: rightDisabled ? COLOR_PRIMARY_DISABLED_TEXT : COLOR_TEXT_ON_PRIMARY,
          cursor: rightDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {rightLabel}
      </button>
    </div>
  );
}

interface SingleWithUndoProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  /** 생략하면 보조 텍스트 링크 줄 없이 버튼만 렌더링 (예: 월드컵 결과 화면) */
  undoLabel?: string;
  onUndo?: () => void;
  undoDisabled?: boolean;
}

function SingleWithUndo({
  label, onClick, disabled = false,
  undoLabel, onUndo, undoDisabled = false,
}: SingleWithUndoProps) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      // 그라데이션 높이 36px — Single/Double(24px)과 다른 이 화면 전용 값
      background: `linear-gradient(180deg, rgba(243, 243, 243, 0) 0%, ${PAGE_BG} 36px, ${PAGE_BG} 100%)`,
      paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 8px)`,
    }}>
      {/* 보조 액션: 이전으로 등 텍스트 링크 — undoLabel/onUndo 없으면 렌더링 생략 */}
      {undoLabel && onUndo && (
        <div style={{ height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={onUndo}
            disabled={undoDisabled}
            style={{
              background: 'none', border: 'none',
              fontSize: 14, color: 'rgba(0,19,43,0.58)',
              opacity: undoDisabled ? 0.4 : 1,
              cursor: undoDisabled ? 'default' : 'pointer',
            }}
          >
            {undoLabel}
          </button>
        </div>
      )}
      {/* 주 액션 */}
      <div style={{ padding: '0 20px' }}>
        <button
          onClick={onClick}
          disabled={disabled}
          style={{
            width: '100%', height: 56, borderRadius: 16,
            fontSize: 17, fontWeight: 590, border: 'none',
            transition: 'background 0.15s, color 0.15s',
            background: disabled ? COLOR_PRIMARY_DISABLED_BG : COLOR_PRIMARY,
            color: disabled ? COLOR_PRIMARY_DISABLED_TEXT : COLOR_TEXT_ON_PRIMARY,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {label}
        </button>
      </div>
    </div>
  );
}

// 네임스페이스 패턴 — TDS의 BottomCTA.Single / BottomCTA.Double 과 동일한 API
const FocusBottomCTA = { Single, Double, SingleWithUndo };
export default FocusBottomCTA;
