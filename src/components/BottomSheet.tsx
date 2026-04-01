import { useEffect } from 'react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function BottomSheet({ isOpen, onClose, children }: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
      {/* 딤 배경 */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.2s ease',
        }}
      />
      {/* 시트 본체 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: 'var(--color-surface)',
        borderRadius: '16px 16px 0 0',
        paddingBottom: 'env(safe-area-inset-bottom)',
        animation: 'slideUp 0.25s ease',
      }}>
        {/* 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 8 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#E5E8EB' }} />
        </div>
        {children}
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </div>
  );
}
