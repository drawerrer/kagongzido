// ───────────────────────────────────────────────────────────────
// 폐업/휴업 안내 배너 미리보기 (개발용 — 라우트: ?preview=closed-store)
// 실제 폐업 매장 데이터가 없을 때도 배너 디자인을 확인할 수 있게
// DetailPage 컨텍스트(헤더 / 히어로 이미지 / 본문) 를 mock 으로 재현
// ───────────────────────────────────────────────────────────────

import IcWarning from '../assets/icons/icon_warning.svg?react';
import CafePlaceholder from '../components/CafePlaceholder';

export default function ClosedStorePreviewPage({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ height: '100%', overflowY: 'auto', background: '#FFFFFF' }}>
      {/* 상단 닫기 바 */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#FFFFFF', padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #E5E8EB',
      }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28' }}>폐업/휴업 배너 미리보기</p>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: 14, color: '#3182F6', cursor: 'pointer', fontWeight: 600 }}
        >
          닫기
        </button>
      </div>

      <div style={{ padding: 16, background: '#F3F3F3' }}>
        <p style={{ fontSize: 12, color: '#6B7684', textAlign: 'center', lineHeight: 1.5 }}>
          ※ 아래는 실제 DetailPage 레이아웃 안에서 배너가 어떻게 보이는지 확인용 mock 입니다.<br/>
          실제 카페 데이터의 <code style={{ background: '#FFFFFF', padding: '2px 6px', borderRadius: 4 }}>closed_at</code> 필드가 있을 때 노출돼요.
        </p>
      </div>

      {/* ───── DetailPage Mock ───── */}
      <div style={{ background: '#FFFFFF' }}>

        {/* 히어로 이미지 (DetailPage 와 동일한 다크 그라디언트 + 로고 폴백) */}
        <div style={{
          width: '100%', height: 240,
          background: 'linear-gradient(160deg, #6B7684 0%, #4E5968 40%, #252525 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
        }}>
          <CafePlaceholder size={100} />
          {/* 상단 좌측 백버튼 mock */}
          <div style={{
            position: 'absolute', top: 16, left: 16,
            width: 36, height: 36, borderRadius: 18,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          {/* 우측 하트 mock */}
          <div style={{
            position: 'absolute', top: 16, right: 16,
            width: 36, height: 36, borderRadius: 18,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 21s-7-4.5-9.5-9.5C0.8 7.5 3.5 4 7 4c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.5 0 6.2 3.5 4.5 7.5C19 16.5 12 21 12 21Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* ── 폐업/휴업 안내 배너 (DetailPage 실제 구현과 동일) ── */}
        <div style={{
          margin: '16px 20px 0',
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

        {/* ── 본문 mock ── */}
        <div style={{ padding: '20px 20px 0' }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#191F28', marginBottom: 8 }}>
            카공지도 카페 (예시)
          </h1>
          <p style={{ fontSize: 14, color: '#6B7684', marginBottom: 16 }}>
            서울 강남구 테헤란로 123
          </p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 12, background: '#F2F4F6', color: '#4E5968' }}>콘센트</span>
            <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 12, background: '#F2F4F6', color: '#4E5968' }}>좌석 여유</span>
            <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 12, background: '#F2F4F6', color: '#4E5968' }}>조용함</span>
          </div>
          <div style={{ height: 1, background: '#F2F4F6', marginBottom: 20 }} />
          <p style={{ fontSize: 14, color: '#8B95A1', lineHeight: 1.6 }}>
            ↑ 위 배너가 카페 헤더 바로 아래에 표시돼요. 다른 본문 정보는 그대로 노출되고,
            저장된 리뷰·즐겨찾기는 유지됩니다.
          </p>
        </div>

        <div style={{ height: 80 }} />
      </div>
    </div>
  );
}
