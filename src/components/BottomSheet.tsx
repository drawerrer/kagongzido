import { BottomSheet as TDSBottomSheet } from '@toss/tds-mobile';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

// TDS BottomSheet 래퍼 — isOpen/onClose 인터페이스를 유지하면서 TDS BottomSheet 사용
// 서비스 기본 배경 #F3F3F3 으로 children 영역 통일
export default function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  return (
    <TDSBottomSheet open={isOpen} onClose={onClose}>
      <div style={{ backgroundColor: '#F3F3F3' }}>
        {children}
      </div>
    </TDSBottomSheet>
  );
}
