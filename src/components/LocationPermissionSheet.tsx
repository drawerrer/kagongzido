// ── 위치 권한 바텀시트 컴포넌트 ────────────────────────────
// SheetType별 UI:
//   'ask'     - 최초 권한 요청 (아니요 / 허용하기)
//   'granted' - 권한 허용 확인 (확인)
//   'denied'  - 권한 거부 확인 (설정에서 변경하기 / 확인)
//   'reask'   - 권한 재요청 (나중에 / 허용하기 → 설정으로)
//
// 피그마 수치 기준:
//   시트 r=28, Handle 48×4 r=40 fill=#e5e8eb
//   타이틀 fs=20 fw=700 fill=#000c1e a=0.80 (rgba(0,12,30,0.80))
//   서브텍스트 fs=15 fw=400
//     ask/reask: fill=#6b7684
//     granted/denied: fill=rgba(3,18,40,0.70)
//   버튼 h=56 r=16
//     아니요/나중에: fill=rgba(7,25,76,0.05) text=rgba(3,18,40,0.70) fs=17 fw=590
//     허용하기: fill=#3182f6 text=#ffffff fs=17 fw=590
//     확인(granted/denied): fill=#2272eb text=#ffffff fs=17 fw=590
//   딤: rgba(0,0,0,0.20)

export type LocationSheetType = 'ask' | 'granted' | 'denied' | 'reask';

interface LocationPermissionSheetProps {
  type: LocationSheetType;
  onClose: () => void;       // 닫기 (외부 탭 / 아니요 / 나중에 / 확인)
  onAllow: () => void;       // 허용하기 (ask 상태)
  onOpenSettings: () => void; // 설정 앱으로 이동 (denied / reask 상태)
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

// ── 컨텐츠 설정 — 피그마 텍스트 원문 그대로 ─────────────────
function getContent(type: LocationSheetType) {
  switch (type) {
    case 'ask':
      return {
        icon: <LocationIcon />,
        title: '위치 권한을 허용할까요?',
        desc: '현재 위치 기반으로 주변 카페를 탐색하고\n거리 정보를 제공하기 위해 위치 권한이 필요해요.',
        // ask: desc fill=#6b7684
        descColor: '#6b7684',
      };
    case 'granted':
      return {
        icon: <CheckIcon />,
        title: '위치 권한이 허용됐어요',
        desc: '현재 위치 기반으로 주변 카페를 탐색할 수 있어요.\n가까운 카페부터 살펴보세요!',
        // granted: desc fill=rgba(3,18,40,0.70)
        descColor: 'rgba(3,18,40,0.70)',
      };
    case 'denied':
      return {
        icon: <BlockIcon />,
        title: '위치 권한이 거부됐어요',
        desc: '위치 권한 없이도 검색으로 카페를 탐색할 수 있어요.\n지도는 기본 지역(서울 중구)으로 표시돼요.',
        // denied: desc fill=rgba(3,18,40,0.70)
        descColor: 'rgba(3,18,40,0.70)',
      };
    case 'reask':
      return {
        icon: <LocationIcon />,
        title: '위치 권한을 허용해주세요',
        desc: '현재 위치 권한이 거부된 상태입니다. 길찾기를 이용하시려면, [설정] > [위치권한] 에서 \'허용\'으로 변경해주세요.',
        // reask: desc fill=#6b7684
        descColor: '#6b7684',
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
  const { icon, title, desc, descColor } = getContent(type);

  // ask/denied/reask: 2-버튼 레이아웃
  // granted: 1-버튼 레이아웃 (확인)
  const hasTwoButtons = type === 'ask' || type === 'denied' || type === 'reask';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400 }}>
      {/* 딤 배경 — 피그마: rgba(0,0,0,0.20) */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.20)',
        }}
      />

      {/* 시트 — 피그마 ask/reask: 355×222(~267) r=28 fill=#ffffff, 10px margin 각 측 */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 10,
        right: 10,
        background: '#ffffff',
        borderRadius: 28,
        animation: 'locSlideUp 0.25s ease',
      }}>
        {/* Handle Area — 피그마: h=20 */}
        <div style={{
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* Handle — 피그마: 48×4 r=40 fill=#e5e8eb */}
          <div style={{
            width: 48, height: 4, borderRadius: 40,
            background: '#e5e8eb',
          }} />
        </div>

        {/* Title 인스턴스 — 피그마: h=48, 텍스트 fs=20 fw=700 lh=27 fill=rgba(0,12,30,0.80) */}
        <div style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
        }}>
          <p style={{
            fontSize: 20,
            fontWeight: 700,
            lineHeight: '27px',
            color: 'rgba(0,12,30,0.80)',
          }}>
            {title}
          </p>
        </div>

        {/* Sub title 인스턴스 — 피그마: h=44, 텍스트 fs=15 fw=400 lh=22.5 */}
        <div style={{
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          paddingBottom: 8,
        }}>
          <p style={{
            fontSize: 15,
            fontWeight: 400,
            lineHeight: '22.5px',
            color: descColor,
          }}>
            {desc}
          </p>
        </div>

        {/* 아이콘 (중앙 정렬) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '8px 24px 0',
        }}>
          {icon}
        </div>

        {/* Button Area — 피그마: h=90 (버튼 34px top pad, 버튼 56px, bottom safe area)
            버튼 가로: 각 153.5px (2개) or full width (1개) */}
        <div style={{
          height: 90,
          padding: '17px 20px',
          paddingBottom: 'max(17px, env(safe-area-inset-bottom))',
          display: 'flex',
          gap: 8,
        }}>
          {type === 'ask' && (
            <>
              {/* 아니요 */}
              <button
                onClick={onClose}
                style={{
                  flex: 1, height: 56, borderRadius: 16, border: 'none',
                  background: 'rgba(7,25,76,0.05)', fontSize: 17,
                  fontWeight: 590, color: 'rgba(3,18,40,0.70)', cursor: 'pointer',
                }}
              >
                아니요
              </button>
              {/* 허용하기 */}
              <button
                onClick={onAllow}
                style={{
                  flex: 1, height: 56, borderRadius: 16, border: 'none',
                  background: '#3182F6', fontSize: 17,
                  fontWeight: 590, color: '#ffffff', cursor: 'pointer',
                }}
              >
                허용하기
              </button>
            </>
          )}

          {type === 'denied' && (
            <>
              {/* 설정에서 변경하기 — SDK openPermissionDialog() 호출 */}
              <button
                onClick={onOpenSettings}
                style={{
                  flex: 1, height: 56, borderRadius: 16, border: 'none',
                  background: 'rgba(7,25,76,0.05)', fontSize: 17,
                  fontWeight: 590, color: 'rgba(3,18,40,0.70)', cursor: 'pointer',
                }}
              >
                설정에서 변경하기
              </button>
              {/* 확인 */}
              <button
                onClick={onClose}
                style={{
                  flex: 1, height: 56, borderRadius: 16, border: 'none',
                  background: 'rgba(34,114,235,0.08)', fontSize: 17,
                  fontWeight: 590, color: '#2272eb', cursor: 'pointer',
                }}
              >
                확인
              </button>
            </>
          )}

          {type === 'reask' && (
            <>
              {/* 나중에 */}
              <button
                onClick={onClose}
                style={{
                  flex: 1, height: 56, borderRadius: 16, border: 'none',
                  background: 'rgba(7,25,76,0.05)', fontSize: 17,
                  fontWeight: 590, color: 'rgba(3,18,40,0.70)', cursor: 'pointer',
                }}
              >
                나중에
              </button>
              {/* 허용하기 → 설정으로 */}
              <button
                onClick={onOpenSettings}
                style={{
                  flex: 1, height: 56, borderRadius: 16, border: 'none',
                  background: '#3182F6', fontSize: 17,
                  fontWeight: 590, color: '#ffffff', cursor: 'pointer',
                }}
              >
                허용하기
              </button>
            </>
          )}

          {type === 'granted' && (
            /* 확인 — 피그마: fill=rgba(34,114,235,0.08) text=#2272eb */
            <button
              onClick={onClose}
              style={{
                flex: 1, height: 56, borderRadius: 16, border: 'none',
                background: 'rgba(34,114,235,0.08)', fontSize: 17,
                fontWeight: 590, color: '#2272eb', cursor: 'pointer',
              }}
            >
              확인
            </button>
          )}
        </div>
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
