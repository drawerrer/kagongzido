// =============================================
// 마이페이지 화면
// 디자이너 참고: 피그마 "마이페이지" 화면과 대응해요
//
// 구현 예정 기능:
// - [ ] 토스 로그인 / 로그아웃
// - [ ] 닉네임 표시 및 변경
// - [ ] 내가 남긴 리뷰 목록
// =============================================

export default function MyPage() {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 'var(--space-md)',
      color: 'var(--color-text-secondary)',
    }}>
      <span style={{ fontSize: 48 }}>👤</span>
      <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        마이페이지
      </p>
      <p style={{ fontSize: 'var(--font-size-sm)' }}>
        로그인 기능을 개발 중이에요
      </p>
    </div>
  );
}
