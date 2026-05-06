import React from 'react';

interface PageHeaderProps {
  title: string;
  /** 우측 고정 버튼 슬롯 (선택) */
  rightButton?: React.ReactNode;
}

export default function PageHeader({ title, rightButton }: PageHeaderProps) {
  return (
    <div style={{
      height: 46, backgroundColor: '#f3f3f3',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, position: 'relative',
      borderBottom: '1px solid #F2F4F6',
    }}>
      <span style={{
        fontWeight: 600, fontSize: 14,
        color: '#191F28', letterSpacing: -0.2,
      }}>
        {title}
      </span>
      {rightButton && (
        <div style={{ position: 'absolute', right: 16 }}>
          {rightButton}
        </div>
      )}
    </div>
  );
}
