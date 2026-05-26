import { BottomSheet, Button } from '@toss/tds-mobile';

interface CollectionNameSheetProps {
  open: boolean;
  title: string;
  value: string;
  onChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  placeholder?: string;
  confirmLabel?: string;
}

const MAX = 10;

export default function CollectionNameSheet({
  open,
  title,
  value,
  onChange,
  onConfirm,
  onClose,
  placeholder = '컬렉션명',
  confirmLabel = '적용하기',
}: CollectionNameSheetProps) {
  return (
    <BottomSheet
      open={open}
      header={<BottomSheet.Header>{title}</BottomSheet.Header>}
      onClose={onClose}
      hasTextField
    >
      <style>{`.collection-name-sheet-input::placeholder { color: #8b95a1; }`}</style>
      {/* 서비스 기본 배경 #F3F3F3 으로 통일 */}
      <div style={{ backgroundColor: '#F3F3F3' }}>
        <div style={{ padding: '16px 24px 14px' }}>
          <div style={{ borderBottom: '1px solid #f2f4f6' }}>
            <input
              className="collection-name-sheet-input"
              autoFocus
              value={value}
              onChange={e => onChange(e.target.value.slice(0, MAX))}
              onKeyDown={e => { if (e.key === 'Enter' && value.trim()) onConfirm(); }}
              placeholder={placeholder}
              maxLength={MAX}
              style={{
                width: '100%', padding: '4px 0 8px',
                border: 'none', outline: 'none',
                fontWeight: 590, fontSize: 22,
                color: '#191F28', backgroundColor: 'transparent',
                boxSizing: 'border-box',
              }}
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
          onClick={onConfirm}
          disabled={!value.trim()}
        >
          {confirmLabel}
        </Button>
      </div>
    </BottomSheet>
  );
}
