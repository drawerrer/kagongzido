// =============================================
// 즐겨찾기 화면
// 디자이너 참고: 피그마 "즐겨찾기" 화면과 대응해요
//
// 구현 예정 기능:
// - [ ] 저장한 카페 목록 표시
// - [ ] 카페 카드 컴포넌트
// - [ ] 즐겨찾기 해제 기능
// - [ ] 빈 상태(Empty State) UI
// =============================================

export default function FavoritesPage() {
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
      <span style={{ fontSize: 48 }}>⭐</span>
      <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        즐겨찾기
      </p>
      <p style={{ fontSize: 'var(--font-size-sm)' }}>
        저장한 카페가 없어요
      </p>
    </div>
  );
}
