// ── 위치 권한 바텀시트 컴포넌트 ────────────────────────────
// SheetType별 UI:
//   'ask'     - 최초 권한 요청 (아니요 / 허용하기)
//   'granted' - 권한 허용 확인 (확인)
//   'denied'  - 권한 거부 확인 (설정에서 변경하기 / 확인)
//   'reask'   - 권한 재요청 (확인) — OS 설정에서 완전히 꺼진 상태라 앱 내
//               재요청 다이얼로그로는 실제로 허용되지 않으므로 안내만 하고 닫음
//
// 피그마 수치 기준:
//   시트 r=28, Handle 48×4 r=40 fill=#e5e8eb
//   타이틀 fs=20 fw=700 fill=#000c1e a=0.80 (rgba(0,12,30,0.80))
//   서브텍스트 fs=15 fw=400
//     ask/reask: fill=#6b7684
//     granted/denied: fill=rgba(3,18,40,0.70)
//   버튼 h=56 r=16
//     아니요/나중에: fill=rgba(7,25,76,0.05) text=rgba(3,18,40,0.70) fs=17 fw=590
//     허용하기: fill=#252525 text=#ffffff fs=17 fw=590
//     확인(granted/denied): fill=#2272eb text=#ffffff fs=17 fw=590
//   딤: rgba(0,0,0,0.20)

import SheetCTA from './SheetCTA';

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
      background: '#e0e0e0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 16,
    }}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="5" fill="#252525" />
        <circle cx="16" cy="16" r="9" stroke="#252525" strokeWidth="2" fill="none" />
        <line x1="16" y1="2" x2="16" y2="7" stroke="#252525" strokeWidth="2" strokeLinecap="round" />
        <line x1="16" y1="25" x2="16" y2="30" stroke="#252525" strokeWidth="2" strokeLinecap="round" />
        <line x1="2" y1="16" x2="7" y2="16" stroke="#252525" strokeWidth="2" strokeLinecap="round" />
        <line x1="25" y1="16" x2="30" y2="16" stroke="#252525" strokeWidth="2" strokeLinecap="round" />
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
interface SheetContent {
  icon: JSX.Element;
  title: string;
  desc: string;
  descColor: string;
  /** 강조 박스로 별도 렌더링할 경로/단계 안내 (reask 전용) */
  highlight?: string;
  /** highlight 박스 아래에 이어지는 설명 (reask 전용) */
  descAfter?: string;
}

function getContent(type: LocationSheetType): SheetContent {
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
        desc: '내 위치로 주변 매장을 보려면 위치 권한이 필요해요.',
        // 경로 안내는 별도 강조 박스로 렌더링 (아래 highlight)
        highlight: '설정 > 앱 목록 > 토스 > 위치 > 허용',
        descAfter: '허용한 뒤 토스앱을 다시 실행해 주세요.',
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
  const { icon, title, desc, descColor, highlight, descAfter } = getContent(type);

  // ask/denied: 2-버튼 레이아웃
  // granted/reask: 1-버튼 레이아웃 (확인)

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
        background: '#FFFFFF',
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

        {/* 강조 박스 — 설정 경로처럼 시선을 끌어야 하는 내용 (reask 전용) */}
        {highlight && (
          <div style={{ padding: '4px 24px 8px' }}>
            <div style={{
              background: '#F3F3F3',
              borderRadius: 14,
              padding: '13px 16px',
            }}>
              <p style={{
                fontSize: 14.5,
                fontWeight: 700,
                lineHeight: '20px',
                color: 'rgba(0,12,30,0.80)',
              }}>
                {highlight}
              </p>
            </div>
          </div>
        )}

        {/* highlight 박스 아래 이어지는 설명 (reask 전용) */}
        {descAfter && (
          <div style={{ padding: '0 24px 8px' }}>
            <p style={{
              fontSize: 15,
              fontWeight: 400,
              lineHeight: '22.5px',
              color: descColor,
            }}>
              {descAfter}
            </p>
          </div>
        )}

        {/* 아이콘 (중앙 정렬) */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '8px 24px 0',
        }}>
          {icon}
        </div>

        {/* Button Area (SheetCTA 통일) — 좌우 패딩은 SheetCTA 내장 */}
        <div style={{
          paddingBottom: 'max(17px, env(safe-area-inset-bottom))',
        }}>
          {type === 'ask' && (
            <SheetCTA.Double
              leftLabel="아니요" leftOnClick={onClose}
              rightLabel="허용하기" rightOnClick={onAllow}
              background="#FFFFFF"
            />
          )}
          {type === 'denied' && (
            <SheetCTA.Double
              leftLabel="설정에서 변경하기" leftOnClick={onOpenSettings}
              rightLabel="확인" rightOnClick={onClose}
              background="#FFFFFF"
            />
          )}
          {type === 'reask' && (
            <SheetCTA.Single label="확인" onClick={onClose} background="#FFFFFF" />
          )}
          {type === 'granted' && (
            <SheetCTA.Single label="확인" onClick={onClose} background="#FFFFFF" />
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
