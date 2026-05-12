/**
 * SheetMenuRow — 바텀시트 안의 메뉴 행 (icon + label list)
 *
 * 사용 패턴: 액션 시트의 선택지 리스트
 *   <SheetMenuRow icon={<IcPencil />} label="편집" onClick={...} />
 *   <SheetMenuRow icon={<IcDelete />} label="삭제" onClick={...} />
 *
 * Canonical 스펙:
 *   height: 56  ·  padding: 0 20  ·  gap: 12
 *   fontSize: 17  ·  fontWeight: 510  ·  color: #000C1E
 */

import type { ReactNode } from 'react';

interface SheetMenuRowProps {
  /** 좌측 아이콘 (선택) */
  icon?: ReactNode;
  /** 행 라벨 텍스트 */
  label: string;
  onClick: () => void;
  /** 텍스트 색상 override (예: 위험한 액션의 빨간색) */
  color?: string;
}

export default function SheetMenuRow({ icon, label, onClick, color = '#000C1E' }: SheetMenuRowProps) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        paddingLeft: 20,
        paddingRight: 20,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 17,
        fontWeight: 510,
        color,
        textAlign: 'left',
      }}
    >
      {icon && <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>}
      <span style={{ lineHeight: '20px' }}>{label}</span>
    </button>
  );
}
