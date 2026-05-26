import { useState } from 'react';
import { BottomSheet, Button } from '@toss/tds-mobile';

const MAX = 60;

interface MemoSheetProps {
  initialMemo: string;
  onApply: (memo: string) => void;
  onClose: () => void;
}

/**
 * 메모 입력 바텀시트.
 * 부모가 조건부 렌더로 표시 제어 (`{memoTargetId && <MemoSheet ... />}` 패턴).
 * 내부 BottomSheet 는 항상 open=true 로 마운트되며,
 * 닫기는 onClose 콜백을 통해 부모가 unmount 처리.
 */
export default function MemoSheet({ initialMemo, onApply, onClose }: MemoSheetProps) {
  const [value, setValue] = useState(initialMemo);
  const isActive = value.trim().length > 0;

  return (
    <BottomSheet
      open
      header={<BottomSheet.Header>메모</BottomSheet.Header>}
      onClose={onClose}
      hasTextField
    >
      <style>{`.memo-sheet-input::placeholder { color: #8b95a1; }`}</style>
      <div style={{ padding: '0 24px 16px' }}>
        <div style={{ borderBottom: '1px solid #f2f4f6', paddingBottom: 4 }}>
          <input
            className="memo-sheet-input"
            value={value}
            onChange={e => setValue(e.target.value.slice(0, MAX))}
            placeholder="남기고 싶은 메모를 적을 수 있어요"
            autoFocus
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontWeight: 590,
              fontSize: 17,
              color: '#191F28',
              backgroundColor: 'transparent',
            } as React.CSSProperties}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
          <span style={{ fontWeight: 400, fontSize: 12, color: 'rgba(0,19,43,0.38)' }}>
            {value.length}/{MAX}
          </span>
        </div>
      </div>
      <Button
        color="primary"
        size="xlarge"
        style={{ width: '100%' }}
        onClick={() => isActive && onApply(value)}
        disabled={!isActive}
      >
        적용하기
      </Button>
    </BottomSheet>
  );
}
