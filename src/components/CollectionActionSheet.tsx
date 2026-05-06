import { BottomSheet } from '@toss/tds-mobile';
import IcPencil from '../assets/icons/icon_pencil.svg?react';
import IcDelete from '../assets/icons/icon_delete.svg?react';

interface CollectionActionSheetProps {
  open: boolean;
  collectionName: string;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const actionButtonStyle: React.CSSProperties = {
  width: '100%', height: 56, display: 'flex', alignItems: 'center', gap: 12,
  paddingLeft: 20, background: 'none', border: 'none', cursor: 'pointer',
  fontWeight: 510, fontSize: 17, color: '#000C1E',
};

export default function CollectionActionSheet({
  open,
  collectionName,
  onEdit,
  onDelete,
  onClose,
}: CollectionActionSheetProps) {
  return (
    <BottomSheet
      open={open}
      header={<BottomSheet.Header>{collectionName}</BottomSheet.Header>}
      onClose={onClose}
    >
      <button onClick={onEdit} style={actionButtonStyle}>
        <IcPencil width={20} height={20} color="#333D4B" style={{ display: 'block', flexShrink: 0 }} />
        <span style={{ lineHeight: '20px' }}>편집</span>
      </button>
      <button onClick={onDelete} style={actionButtonStyle}>
        <IcDelete width={20} height={20} color="#333D4B" style={{ display: 'block', flexShrink: 0 }} />
        <span style={{ lineHeight: '20px' }}>삭제</span>
      </button>
      <div style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }} />
    </BottomSheet>
  );
}
