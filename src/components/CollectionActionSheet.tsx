import { BottomSheet } from '@toss/tds-mobile';
import IcPencil from '../assets/icons/icon_pencil.svg?react';
import IcDelete from '../assets/icons/icon_delete.svg?react';
import SheetMenuRow from './SheetMenuRow';

interface CollectionActionSheetProps {
  open: boolean;
  collectionName: string;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

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
      {/* 서비스 기본 배경 #F3F3F3 으로 통일 */}
      <div style={{ backgroundColor: '#F3F3F3' }}>
        <SheetMenuRow
          icon={<IcPencil width={20} height={20} color="#333D4B" style={{ display: 'block' }} />}
          label="편집"
          onClick={onEdit}
        />
        <SheetMenuRow
          icon={<IcDelete width={20} height={20} color="#333D4B" style={{ display: 'block' }} />}
          label="삭제"
          onClick={onDelete}
        />
        <div style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }} />
      </div>
    </BottomSheet>
  );
}
