import { ConfirmDialog } from '@toss/tds-mobile';

type DeleteDialogType = 'collection' | 'store';

const DIALOG_CONTENT: Record<DeleteDialogType, { title: string; description: string }> = {
  collection: {
    title: '컬렉션을 삭제할까요?',
    description: '담아둔 카페는 모음집에서 계속 볼 수 있어요.',
  },
  store: {
    title: '카페를 삭제할까요?',
    description: '담아둔 컬렉션에서도 함께 지워져요.',
  },
};

interface DeleteConfirmDialogProps {
  type: DeleteDialogType;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({ type, onConfirm, onCancel }: DeleteConfirmDialogProps) {
  const { title, description } = DIALOG_CONTENT[type];
  return (
    <ConfirmDialog
      open={true}
      title={<ConfirmDialog.Title>{title}</ConfirmDialog.Title>}
      description={<ConfirmDialog.Description>{description}</ConfirmDialog.Description>}
      cancelButton={<ConfirmDialog.CancelButton onClick={onCancel}>닫기</ConfirmDialog.CancelButton>}
      confirmButton={
        <ConfirmDialog.ConfirmButton color="danger" variant="weak" onClick={onConfirm}>
          삭제하기
        </ConfirmDialog.ConfirmButton>
      }
      onClose={onCancel}
    />
  );
}
