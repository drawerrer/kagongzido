// ───────────────────────────────────────────────────────────────
// CafePlaceholder 미리보기 페이지 (개발용 — 라우트: ?preview=placeholder)
// 실제 서비스의 각 컨텍스트에 ☕→로고가 어떻게 보이는지 한눈에 확인용
// ───────────────────────────────────────────────────────────────

import CafePlaceholder from '../components/CafePlaceholder';
import IcWarning from '../assets/icons/icon_warning.svg?react';
import IcPhoto from '../assets/icons/icon_photo.svg?react';
import IcCamera from '../assets/icons/icon_camera.svg?react';

export default function PlaceholderPreviewPage({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#f3f3f3', paddingBottom: 40 }}>
      {/* 상단 닫기 바 */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#FFFFFF', padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #E5E8EB',
      }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28' }}>CafePlaceholder 미리보기</p>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: 14, color: '#3182F6', cursor: 'pointer', fontWeight: 600 }}
        >
          닫기
        </button>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* 섹션 1: 정사각형 썸네일 (45% 기본) — 회색 배경 */}
        <Section title="① 정사각형 썸네일 (45%, opacity 0.75)" subtitle="검색 결과·MyPage 작은 카드 등">
          <Row>
            {[44, 52, 60, 76, 80].map(s => (
              <Sample key={s} label={`${s}px`} bg="#F2F4F6">
                <div style={SQUARE(s, '#F2F4F6')}>
                  <CafePlaceholder size="45%" />
                </div>
              </Sample>
            ))}
          </Row>
        </Section>

        {/* 섹션 2: 그라데이션 카드 (MyPage CafeGrid 패턴) */}
        <Section title="② MyPage CafeGrid 폴백 (25%, opacity 0.75)" subtitle="제보한 카페 / 최근 본 카페 그리드">
          <Row>
            {[140, 165, 180].map(s => (
              <Sample key={s} label={`${s}px`} bg="transparent">
                <div style={{
                  width: s, height: s, borderRadius: 10,
                  background: 'radial-gradient(circle at center, #F3F3F3 30%, #FFFFFF 100%)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CafePlaceholder size="25%" />
                </div>
              </Sample>
            ))}
          </Row>
        </Section>

        {/* 섹션 3: 큰 사진 영역 (DetailPage 확대 / PhotoReview) */}
        <Section title="③ 큰 사진 영역 (35%)" subtitle="DetailPage 사진 확대 / PhotoReview 풀스크린">
          <Row>
            {[200, 250].map(s => (
              <Sample key={s} label={`${s}×${Math.round(s * 0.75)}`} bg="transparent">
                <div style={{
                  width: s, aspectRatio: '4/3', borderRadius: 12,
                  background: '#E8EDF4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CafePlaceholder size="35%" />
                </div>
              </Sample>
            ))}
            <Sample label="343×343" bg="transparent">
              <div style={{
                width: 280, height: 280,
                background: 'linear-gradient(145deg,#1a1a2e 0%,#2d2d44 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CafePlaceholder size="35%" />
              </div>
            </Sample>
          </Row>
        </Section>

        {/* 섹션 4: 다양한 배경색에서 톤 확인 */}
        <Section title="④ 다양한 배경 톤 (80px × 45%)" subtitle="opacity 0.75 통일 — 다크 배경에서도 식별 가능 확인">
          <Row>
            {[
              { bg: '#F2F4F6', label: '회색 라이트' },
              { bg: '#E8EDF4', label: '블루그레이' },
              { bg: '#FAFAFA', label: '거의 흰색' },
              { bg: 'linear-gradient(145deg,#1a1a2e 0%,#2d2d44 100%)', label: '다크 그라데' },
              { bg: 'radial-gradient(circle at center, #F3F3F3 30%, #FFFFFF 100%)', label: '라디얼' },
            ].map(({ bg, label }) => (
              <Sample key={label} label={label} bg="transparent">
                <div style={{
                  width: 80, height: 80, borderRadius: 10,
                  background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid #E5E8EB',
                }}>
                  <CafePlaceholder size="45%" />
                </div>
              </Sample>
            ))}
          </Row>
        </Section>

        {/* 섹션 5: opacity 비교 */}
        <Section title="⑤ opacity 비교 (80px × 45%, 회색 배경)" subtitle="현재 기본값 0.75 — 다른 값과 비교">
          <Row>
            {[0.5, 0.6, 0.7, 0.75, 0.8, 0.9, 1.0].map(op => (
              <Sample key={op} label={`opacity ${op}`} bg="transparent">
                <div style={SQUARE(80, '#F2F4F6')}>
                  <CafePlaceholder size="45%" opacity={op} />
                </div>
              </Sample>
            ))}
          </Row>
        </Section>

        {/* 섹션 6: 사이즈 비율 비교 */}
        <Section title="⑥ 사이즈 비율 비교 (80px 컨테이너, opacity 0.75)" subtitle="컨테이너 대비 로고 비율">
          <Row>
            {['25%', '30%', '35%', '40%', '45%', '50%', '60%'].map(sz => (
              <Sample key={sz} label={sz} bg="transparent">
                <div style={SQUARE(80, '#F2F4F6')}>
                  <CafePlaceholder size={sz} />
                </div>
              </Sample>
            ))}
          </Row>
        </Section>

        {/* 섹션 7: 픽셀 고정 (빈 상태 컨텍스트) */}
        <Section title="⑦ 픽셀 고정 — 빈 상태 (컨테이너 없음)" subtitle="DetailPage '매장 없음' 등">
          <Row>
            {[42, 48, 64, 80, 100].map(s => (
              <Sample key={s} label={`${s}px`} bg="transparent">
                <div style={{
                  width: 120, height: 120,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: '#FFFFFF', borderRadius: 12,
                  border: '1px solid #E5E8EB',
                }}>
                  <CafePlaceholder size={s} />
                </div>
              </Sample>
            ))}
          </Row>
        </Section>

        {/* 섹션 8: 지도 핀 인라인 칩 */}
        <Section title="⑧ 지도 핀 인라인 칩 (14px, opacity 0.75/0.95)" subtitle="MapPage 카카오맵 마커">
          <Row>
            <Sample label="비선택" bg="transparent">
              <div dangerouslySetInnerHTML={{ __html: PIN_HTML(false) }} />
            </Sample>
            <Sample label="선택됨" bg="transparent">
              <div dangerouslySetInnerHTML={{ __html: PIN_HTML(true) }} />
            </Sample>
          </Row>
        </Section>

        {/* 섹션 9: 폐업 매장 경고 배너 (DetailPage) */}
        <Section title="⑨ 폐업/휴업 경고 배너" subtitle="DetailPage 상단 — 실제 폐업 매장 없을 때 미리보기용">
          <div style={{
            margin: '0 0 8px',
            padding: '14px 16px',
            borderRadius: 12,
            background: '#FFF4F4',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-start',
          }}>
            <IcWarning width={18} height={18} style={{ color: '#D6403C', flexShrink: 0, display: 'block', marginTop: 1 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#D6403C', marginBottom: 2 }}>
                폐업 또는 휴업한 카페예요
              </p>
              <p style={{ fontSize: 12, color: '#8B95A1', lineHeight: 1.4 }}>
                저장한 기록은 그대로 두지만, 방문 전 운영 여부를 다시 확인해 주세요.
              </p>
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#6B7684', fontWeight: 500, textAlign: 'center', marginTop: 8 }}>
            ⚠️ 이모지 → icon_warning.svg (#D6403C)
          </p>
        </Section>

        {/* 섹션 10: 사진/카메라 시트 아이콘 */}
        <Section title="⑩ 사진 추가 시트 아이콘 (#333D4B)" subtitle="모음집 액션시트와 동일 톤">
          <Row>
            <Sample label="icon_photo" bg="transparent">
              <div style={{ width: 56, height: 56, borderRadius: 12, background: '#FFFFFF', border: '1px solid #E5E8EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IcPhoto width={24} height={24} style={{ color: '#333D4B', display: 'block' }} />
              </div>
            </Sample>
            <Sample label="icon_camera" bg="transparent">
              <div style={{ width: 56, height: 56, borderRadius: 12, background: '#FFFFFF', border: '1px solid #E5E8EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <IcCamera width={24} height={24} style={{ color: '#333D4B', display: 'block' }} />
              </div>
            </Sample>
          </Row>
        </Section>

      </div>
    </div>
  );
}

// 도우미 ─────────────────────────────────────────────────────
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: 14, padding: 16,
      marginTop: 16,
    }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#191F28' }}>{title}</p>
      {subtitle && <p style={{ fontSize: 12, color: '#8B95A1', marginTop: 4 }}>{subtitle}</p>}
      <div style={{ marginTop: 12 }}>{children}</div>
    </div>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-start' }}>
      {children}
    </div>
  );
}
function Sample({ label, children }: { label: string; bg: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {children}
      <p style={{ fontSize: 11, color: '#6B7684', fontWeight: 500 }}>{label}</p>
    </div>
  );
}
function SQUARE(size: number, bg: string): React.CSSProperties {
  return {
    width: size, height: size, borderRadius: 10,
    background: bg, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };
}
// 실제 MapPage 의 makePillHtml 과 동일 구조 — LogoImg 인라인은 미리보기에선 src 만 다르게
import LogoImg from '../assets/LOGO/logo_mockup.png';
function PIN_HTML(selected: boolean): string {
  const bg = selected ? '#252525' : '#ffffff';
  const color = selected ? '#ffffff' : '#191F28';
  const shadow = selected ? '0 2px 10px rgba(0,0,0,0.45)' : '0 2px 6px rgba(0,0,0,0.18)';
  const border = selected ? 'none' : '1px solid #e5e8eb';
  const logoOpacity = selected ? 0.95 : 0.75;
  return `<div style="display:inline-flex;align-items:center;gap:4px;background:${bg};color:${color};border-radius:999px;padding:5px 10px 5px 8px;box-shadow:${shadow};white-space:nowrap;font-size:12px;font-weight:600;font-family:Pretendard,sans-serif;border:${border};"><img src="${LogoImg}" alt="" style="width:14px;height:14px;object-fit:contain;opacity:${logoOpacity};display:block;" draggable="false"/>스타벅스 강남점</div>`;
}
