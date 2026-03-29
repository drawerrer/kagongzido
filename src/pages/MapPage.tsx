// =============================================
// 메인 지도 화면
// 디자이너 참고: 피그마 "홈 - 지도" 화면과 대응해요
//
// 구현 예정 기능:
// - [ ] 카카오맵 표시
// - [ ] 현재 위치 GPS 버튼
// - [ ] 주변 카공 카페 마커 표시
// - [ ] 카페 클릭 → 바텀시트로 상세 정보 표시
// =============================================

export default function MapPage() {
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
      <span style={{ fontSize: 48 }}>🗺️</span>
      <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
        카공지도
      </p>
      <p style={{ fontSize: 'var(--font-size-sm)' }}>
        지도 기능을 개발 중이에요
      </p>
    </div>
  );
}
