import { useState } from 'react';
import { BottomSheet, Button } from '@toss/tds-mobile';

const MAX = 10;

interface NicknameRequiredSheetProps {
  /** 기존 닉네임 (변경 모드일 때) — 없으면 null/undefined → 신규 입력 모드 */
  initialName?: string | null;
  /** 저장 — 부모가 DB 저장 + state 갱신 책임 */
  onSubmit: (name: string) => void;
  /** 닫기 — 외부 탭/시스템 백 등 */
  onClose: () => void;
}

/**
 * 닉네임 입력 바텀시트.
 * MemoSheet 와 동일한 패턴 — 부모가 조건부 렌더로 표시 제어.
 *   사용 예: `{nicknameSheetOpen && <NicknameRequiredSheet ... />}`
 *
 * 두 가지 모드 (initialName 유무로 자동 분기):
 *   ┌────────────┬───────────────────────────────────────┬──────────────────────┐
 *   │            │ 신규 입력 (initialName 없음)             │ 변경 (initialName 있음)│
 *   ├────────────┼───────────────────────────────────────┼──────────────────────┤
 *   │ header     │ "사용할 닉네임을 알려주세요"               │ 기존 닉네임 (그대로)   │
 *   │ placeholder│ "마이페이지에서 얼마든지 바꿀 수 있어요"     │ "변경할 닉네임"        │
 *   │ value 초기값│ ''                                      │ ''                  │
 *   └────────────┴───────────────────────────────────────┴──────────────────────┘
 *
 * 사용처: 리뷰 작성·제보 작성·마이페이지 닉네임 변경.
 *   FavoritesContext.requireNickname() 호출 시 자동 노출.
 */
export default function NicknameRequiredSheet({
  initialName,
  onSubmit,
  onClose,
}: NicknameRequiredSheetProps) {
  // 변경 모드 판단 — 기존 닉네임이 의미 있는 값(공백 X)일 때
  const isEditMode = !!(initialName && initialName.trim());

  // 변경 모드여도 인풋은 빈 상태로 시작 (사용자가 새 닉네임을 자유롭게 입력)
  const [value, setValue] = useState('');
  const isActive = value.trim().length > 0;

  // 모드별 텍스트
  const headerText = isEditMode ? initialName! : '사용할 닉네임을 알려주세요';
  const placeholderText = isEditMode ? '변경할 닉네임' : '마이페이지에서 얼마든지 바꿀 수 있어요';

  return (
    <BottomSheet
      open
      header={<BottomSheet.Header>{headerText}</BottomSheet.Header>}
      onClose={onClose}
      hasTextField
    >
      <style>{`.nickname-sheet-input::placeholder { color: #8b95a1; }`}</style>
      <div style={{ padding: '0 24px 16px' }}>
        <div style={{ borderBottom: '1px solid #f2f4f6', paddingBottom: 4 }}>
          <input
            className="nickname-sheet-input"
            value={value}
            onChange={e => setValue(e.target.value.slice(0, MAX))}
            onKeyDown={e => { if (e.key === 'Enter' && isActive) onSubmit(value.trim()); }}
            placeholder={placeholderText}
            autoFocus
            maxLength={MAX}
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
        onClick={() => isActive && onSubmit(value.trim())}
        disabled={!isActive}
      >
        저장하기
      </Button>
    </BottomSheet>
  );
}
