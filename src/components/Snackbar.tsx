import { Toast } from '@toss/tds-mobile';

interface SnackbarProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  onDismiss: () => void;
  duration?: number;
}

// TDS Toast 래퍼 — 기존 props 인터페이스 유지
export default function Snackbar({ message, actionLabel, onAction, onDismiss, duration = 3000 }: SnackbarProps) {
  return (
    <Toast
      open={true}
      position="bottom"
      text={message}
      duration={duration}
      onClose={onDismiss}
      button={actionLabel ? <Toast.Button onClick={onAction}>{actionLabel}</Toast.Button> : undefined}
    />
  );
}
