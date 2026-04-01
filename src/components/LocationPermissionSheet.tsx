// ── 위치 권한 바텀시트 컴포넌트 ────────────────────────────
// SheetType별 UI:
//   'ask'     - 최초 권한 요청 (아니요 / 허용하기)
//   'granted' - 권한 허용 확인 (확인)
//   'denied'  - 권한 거부 확인 (설정에서 변경하기 / 확인)
//   'reask'   - 권한 재요청 (나중에 / 허용하기 → 설정으로)

export type LocationSheetType = 'ask' | 'granted' | 'denied' | 'reask';

interface LocationPermissionSheetProps {
  type: LocationSheetType;
  onClose: () => void;       // 닫기 (외부 탭 / 아니요 / 나중에 / 확인)
  onAllow: () => void;       // 허용하기
  onOpenSettings: () => void; // 설정 앱으로 이동 (denied 상태)
}

// ── 아이콘 ────────────────────────────────────────────────
function LocationIcon() {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: 32,
      background: '#EBF3FE',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 16,
    }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="5" fill="#3182F6" />
        <circle cx="16" cy="16" r="9" stroke="#3182F6" strokeWidth="2" fill="none" />
        <line x1="16" y1="2" x2="16" y2="7" stroke="#3182F6" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="25" x2="16" y2="30" stroke="#3182F6" strokeWidth="2" strokeLinecap="round" />
        <line x1="2" y1="16" x2="7" y2="16" stroke="#3182F6" strokeWidth="2" strokeLinecap="round" />
        <line x1="25" y1="16" x2="30" y2="16" stroke="#3182F6" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function CheckIcon() {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: 32,
      background: '#E8FFF3',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 16,
    }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#00C073" fillOpacity="0.15" />
        <path d="M9 16.5L13.5 21L23 11.5" stroke="#00C073" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function BlockIcon() {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: 32,
      background: '#FFF0F0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 16,
    }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="14" fill="#FF4B4B" fillOpacity="0.12" />
        <path d="M11 11L21 21M21 11L11 21" stroke="#FF4B4B" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// ── 컨텐츠 설정 ───────────────────────────────────────────
function getContent(type: LocationSheetType) {
  switch (type) {
    case 'ask':
      return {
        icon: <LocationIcon />,
        title: '위치 권한을 허용하시겠어요?',
        desc: '현재 위치 기반으로 주변 카페를 탐색하고\n거리 정보를 제공하기 위해 위치 권한이 필요해요.',
      };
    case 'granted':
      return {
        icon: <CheckIcon />,
        title: '위치 권한이 허용되었습니다',
        desc: '현재 위치 기반으로 주변 카페를 탐색할 수 있어요.\n가까운 카페부터 살펴보세요!',
      };
    case 'denied':
      return {
        icon: <BlockIcon />,
        title: '위치 권한이 거부되었습니다',
        desc: '위치 권한 없이도 검색으로 카페를 탐색할 수 있어요.\n지도는 기본 지역(서울 중구)으로 표시돼요.',
      };
    case 'reask':
      return {
        icon: <LocationIcon />,
        title: '위치 권한을 허용해주세요',
        desc: '이 기능을 사용하려면 위치 권한이 필요해요.\n설정에서 위치 권한을 허용해주세요.',
      };
  }
}

// ── 메인 컴포넌트 ─────────────────────────────────────────
export default function LocationPermissionSheet({
  type,
  onClose,
  onAllow,
  onOpenSettings,
}: LocationPermissionSheetProps) {
  const { icon, title, desc } = getContent(type);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400 }}>
      {/* 딤 배경 — 외부 탭 시 "아니요/나중에"와 동일하게 닫힘 */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.4)',
        }}
      />

      {/* 시트 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'white',
        borderRadius: '20px 20px 0 0',
        padding: '24px 24px',
        paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
        animation: 'locSlideUp 0.25s ease',
      }}>
        {/* 핸들 */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: '#E5E8EB',
          margin: '0 auto 24px',
        }} />

        {/* 아이콘 + 텍스트 */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', textAlign: 'center',
          marginBottom: 28,
        }}>
          {icon}
          <p style={{
            fontSize: 18, fontWeight: 700, color: '#191F28',
            marginBottom: 10, lineHeight: 1.4,
          }}>
            {title}
          </p>
          <p style={{
            fontSize: 14, color: '#8B95A1',
            lineHeight: 1.6, whiteSpace: 'pre-line',
          }}>
            {desc}
          </p>
        </div>

        {/* 거부 상태: 설정 링크 */}
        {type === 'denied' && (
          <button
            onClick={onOpenSettings}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              fontSize: 14,
              color: '#3182F6',
              fontWeight: 600,
              marginBottom: 16,
              padding: '8px 0',
            }}
          >
            설정에서 변경하기 →
          </button>
        )}

        {/* 버튼 영역 */}
        {(type === 'ask' || type === 'reask') ? (
          /* 2-button layout */
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, height: 52, borderRadius: 12,
                border: '1.5px solid #E5E8EB',
                background: 'white',
                fontSize: 16, fontWeight: 600, color: '#4E5968',
                cursor: 'pointer',
              }}
            >
              {type === 'ask' ? '아니요' : '나중에'}
            </button>
            <button
              onClick={onAllow}
              style={{
                flex: 2, height: 52, borderRadius: 12,
                background: '#3182F6', border: 'none',
                fontSize: 16, fontWeight: 700, color: 'white',
                cursor: 'pointer',
              }}
            >
              허용하기
            </button>
          </div>
        ) : (
          /* single confirm button */
          <button
            onClick={onClose}
            style={{
              width: '100%', height: 52, borderRadius: 12,
              background: '#3182F6', border: 'none',
              fontSize: 16, fontWeight: 700, color: 'white',
              cursor: 'pointer',
            }}
          >
            확인
          </button>
        )}
      </div>

      <style>{`
        @keyframes locSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
