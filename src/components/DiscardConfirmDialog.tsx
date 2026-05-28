import { ConfirmDialog } from '@toss/tds-mobile';

/**
 * 작성 중인 내용을 버리고 나갈지 묻는 공용 다이얼로그.
 *
 * 사용처: 리뷰 작성·리뷰 수정·카페 제보 — 사용자가 입력하다가
 *         뒤로가기 / 페이지 닫기를 누르면 표시.
 *
 * DeleteConfirmDialog 와 동일하게 TDS `ConfirmDialog` 를 사용하여
 * 컬렉션 삭제 다이얼로그 등과 시각적·동작 일관성을 유지함.
 *
 *  - cancel: 다이얼로그를 닫고 페이지에 머무름 ("계속 작성")
 *  - confirm: 작성 내용을 버리고 페이지를 빠져나감 ("나가기")
 */
type DiscardDialogType = 'review' | 'edit' | 'report';

const DIALOG_CONTENT: Record<DiscardDialogType, {
  title: string; description: string;
  continueLabel: string; discardLabel: string;
}> = {
  // 신규 리뷰 작성 중단
  review: {
    title: '작성을 중단할까요?',
    description: '작성 중인 내용은 저장되지 않아요',
    continueLabel: '계속 작성',
    discardLabel: '나가기',
  },
  // 기존 리뷰 수정 중단
  edit: {
    title: '수정을 취소할까요?',
    description: '지금 나가면 작성한 내용이 사라져요',
    continueLabel: '계속 수정',
    discardLabel: '취소하기',
  },
  // 카페 제보 작성 중단
  report: {
    title: '제보를 중단할까요?',
    description: '작성 중인 내용은 저장되지 않아요',
    continueLabel: '계속 작성',
    discardLabel: '나가기',
  },
};

interface DiscardConfirmDialogProps {
  type: DiscardDialogType;
  open: boolean;
  /** 작성 내용을 버리고 나갈 때 */
  onDiscard: () => void;
  /** 다이얼로그 닫고 계속 작성할 때 */
  onContinue: () => void;
}

export default function DiscardConfirmDialog({
  type, open, onDiscard, onContinue,
}: DiscardConfirmDialogProps) {
  const { title, description, continueLabel, discardLabel } = DIALOG_CONTENT[type];
  return (
    <ConfirmDialog
      open={open}
      title={<ConfirmDialog.Title>{title}</ConfirmDialog.Title>}
      description={<ConfirmDialog.Description>{description}</ConfirmDialog.Description>}
      cancelButton={
        <ConfirmDialog.CancelButton onClick={onContinue}>
          {continueLabel}
        </ConfirmDialog.CancelButton>
      }
      confirmButton={
        <ConfirmDialog.ConfirmButton color="danger" variant="weak" onClick={onDiscard}>
          {discardLabel}
        </ConfirmDialog.ConfirmButton>
      }
      onClose={onContinue}
    />
  );
}
