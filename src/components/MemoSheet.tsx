import { useState } from 'react';
import { Button } from '@toss/tds-mobile';

const MAX = 60;

interface MemoSheetProps {
  initialMemo: string;
  onApply: (memo: string) => void;
  onClose: () => void;
}

export default function MemoSheet({ initialMemo, onApply, onClose }: MemoSheetProps) {
  const [value, setValue] = useState(initialMemo);
  const isActive = value.trim().length > 0;

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div style={{ margin: '0 10px' }} onClick={e => e.stopPropagation()}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '28px 28px 0 0', overflow: 'hidden' }}>
          {/* 핸들 */}
          <div style={{ height: 41, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 4, borderRadius: 40, backgroundColor: '#e5e8eb' }} />
          </div>
          {/* 제목 */}
          <div style={{ padding: '0 24px 16px' }}>
            <span style={{ fontWeight: 700, fontSize: 20, color: 'rgba(0,12,30,0.8)' }}>메모</span>
          </div>
          {/* 입력 */}
          <div style={{ padding: '0 24px 16px' }}>
            <div style={{ borderBottom: '1px solid #f2f4f6', paddingBottom: 4 }}>
              <input
                value={value}
                onChange={e => setValue(e.target.value.slice(0, MAX))}
                placeholder="남기고 싶은 메모를 적을 수 있어요"
                style={{
                  width: '100%', border: 'none', outline: 'none',
                  fontWeight: 590, fontSize: 17,
                  color: '#191f28', backgroundColor: 'transparent',
                } as React.CSSProperties}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <span style={{ fontWeight: 400, fontSize: 12, color: 'rgba(0,19,43,0.38)' }}>
                {value.length}/{MAX}
              </span>
            </div>
          </div>
          {/* 적용하기 버튼 */}
          <Button
            color="primary"
            size="xlarge"
            style={{ width: '100%' }}
            onClick={() => isActive && onApply(value)}
            disabled={!isActive}
          >
            적용하기
          </Button>
        </div>
      </div>
    </div>
  );
}
