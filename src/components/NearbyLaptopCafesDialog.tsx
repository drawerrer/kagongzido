import SheetCTA from './SheetCTA';
import StoreCardHome, { type HomeCafe } from './StoreCard/Home';

interface NearbyLaptopCafesDialogProps {
  isOpen: boolean;
  /** 위치 기준 가장 가까운 "노트북 펴기 좋은" 카페 최대 3곳 (이미 정렬된 상태로 전달) */
  cafes: HomeCafe[];
  onClose: () => void;
  onSelectCafe: (cafe: HomeCafe) => void;
}

/**
 * 앱 첫 진입 시 (위치 권한 허용 유저 한정) 노출하는 "지금 내 주변 노트북 펴기
 * 좋은 카페 3곳" 안내 다이얼로그.
 *
 * 바텀시트가 아닌 화면 중앙 플로팅 다이얼로그 형태 — 딤 배경 + 중앙 정렬된
 * 흰색 카드. 딤 클릭 시 onClose 호출(바텀시트와 동일한 닫힘 동작 유지).
 *
 * 카드는 홈 리스트와 동일한 StoreCardHome 을 variant="nearby" 로 재사용:
 *   - 우측 하트 → 화살표 아이콘 (찜 토글이 아닌 "탭하면 상세로 이동" 안내)
 *   - 하단 뱃지 칩 → 콘센트/좌석 아이콘 + 값
 */
export default function NearbyLaptopCafesDialog({
  isOpen,
  cafes,
  onClose,
  onSelectCafe,
}: NearbyLaptopCafesDialogProps) {
  if (!isOpen || cafes.length === 0) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500 }}>
      {/* 딤 배경 */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }}
      />

      {/* 중앙 플로팅 다이얼로그 */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(327px, calc(100vw - 40px))',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF',
          borderRadius: 24,
          paddingBottom: 24,
          overflow: 'hidden',
          animation: 'nearbyDialogPop 0.2s ease',
        }}
      >
        {/* 스크롤 영역 — 타이틀 + 카드 목록 */}
        <div style={{ overflowY: 'auto' }}>
          {/* 타이틀 */}
          <p
            style={{
              fontWeight: 700,
              fontSize: 18,
              color: '#191F28',
              textAlign: 'center',
              margin: 0,
              padding: '24px 20px 12px',
            }}
          >
            지금 내 주변 노트북 펴기 좋은 카페 3곳
          </p>

          {/* 매장 카드 목록 */}
          <div>
            {cafes.map(cafe => (
              <StoreCardHome
                key={cafe.id}
                cafe={cafe}
                variant="nearby"
                onTap={() => onSelectCafe(cafe)}
              />
            ))}
          </div>
        </div>

        {/* 확인 CTA — Primary color */}
        <SheetCTA.Single label="확인" onClick={onClose} background="#FFFFFF" />
      </div>

      <style>{`
        @keyframes nearbyDialogPop {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.94); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
