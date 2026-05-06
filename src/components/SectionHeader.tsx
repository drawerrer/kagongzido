import React from 'react';

interface SectionHeaderProps {
  title: React.ReactNode;
  /** 우측 요소 슬롯 (선택) */
  right?: React.ReactNode;
  /** 하단 여백 (선택, 기본 0) */
  marginBottom?: number;
}

export default function SectionHeader({ title, right, marginBottom = 0 }: SectionHeaderProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      ...(marginBottom > 0 ? { marginBottom } : {}),
    }}>
      <h2 style={{
        fontWeight: 700, fontSize: 17, color: '#191F28',
        lineHeight: '21.25px', margin: 0,
        ...(right ? { flex: 1 } : {}),
      }}>
        {title}
      </h2>
      {right}
    </div>
  );
}
