// ───────────────────────────────────────────────────────────────
// 닉네임 입력 BottomSheet 미리보기 (개발용 — 라우트: ?preview=nickname)
// 리뷰 작성·제보·마이페이지 닉네임 변경 시점에 노출되는 시트의 디자인 확인용
// ───────────────────────────────────────────────────────────────

import { useState } from 'react';
import NicknameRequiredSheet from '../components/NicknameRequiredSheet';

export default function NicknameSheetPreviewPage({ onClose }: { onClose: () => void }) {
  type SheetMode = 'closed' | 'empty' | 'edit';
  const [sheetMode, setSheetMode] = useState<SheetMode>('empty');
  const [lastAction, setLastAction] = useState<string | null>(null);

  const openEmpty = () => { setLastAction(null); setSheetMode('empty'); };
  const openEdit = () => { setLastAction(null); setSheetMode('edit'); };

  return (
    <div style={{ height: '100%', background: '#f3f3f3', position: 'relative' }}>
      {/* 상단 닫기 바 */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: '#FFFFFF', padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #E5E8EB',
      }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28' }}>
          닉네임 입력 BottomSheet 미리보기
        </p>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: 14, color: '#3182F6', cursor: 'pointer', fontWeight: 600 }}
        >
          닫기
        </button>
      </div>

      {/* 안내 + 컨트롤 */}
      <div style={{ padding: 20 }}>
        <p style={{ fontSize: 14, color: '#6B7684', lineHeight: 1.6, marginBottom: 20 }}>
          ※ 이 시트는 다음 3가지 시점에 동일하게 노출돼요:<br />
          1) 카페 상세에서 <b>리뷰 쓰기</b> 탭<br />
          2) 마이페이지에서 <b>제보하기</b> 탭<br />
          3) 마이페이지에서 <b>닉네임 변경</b> 탭 (기존 닉네임이 초기값으로 들어옴)
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          <button
            onClick={openEmpty}
            style={{ height: 48, borderRadius: 10, background: '#252525', color: 'white', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            신규 입력 시트 열기 (빈 상태)
          </button>
          <button
            onClick={openEdit}
            style={{ height: 48, borderRadius: 10, background: '#FFFFFF', color: '#252525', border: '1px solid #E5E8EB', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            닉네임 변경 시트 열기 (기존 "카페인덱서" 초기값)
          </button>
        </div>

        <div style={{
          padding: '14px 16px', borderRadius: 12,
          background: '#FFFFFF', border: '1px solid #E5E8EB',
          fontSize: 13, color: '#191F28', lineHeight: 1.6,
        }}>
          <p style={{ color: '#6B7684', marginBottom: 6, fontWeight: 600 }}>스펙</p>
          <p>· 메모 바텀시트와 동일 디자인 (TDS BottomSheet + Button)</p>
          <p>· 최대 글자수: <b>10자</b></p>
          <p>· 확정 버튼: <b>저장하기</b> (1글자 이상일 때 활성)</p>
          <p style={{ color: '#6B7684', margin: '12px 0 6px', fontWeight: 600 }}>
            ▸ 신규 입력 모드 (initialName 없음)
          </p>
          <p>· header: <b>사용할 닉네임을 알려주세요</b></p>
          <p>· placeholder: <b>마이페이지에서 얼마든지 바꿀 수 있어요</b></p>
          <p style={{ color: '#6B7684', margin: '12px 0 6px', fontWeight: 600 }}>
            ▸ 변경 모드 (initialName 있음 — 마이페이지 연필 클릭 시)
          </p>
          <p>· header: <b>{`{기존 닉네임}`}</b> (예: "카페인덱서")</p>
          <p>· placeholder: <b>변경할 닉네임</b></p>
        </div>

        {/* 최근 사용자 액션 결과 */}
        {lastAction && (
          <div style={{
            marginTop: 16,
            padding: '14px 16px', borderRadius: 12,
            background: '#FFFFFF', border: '1px solid #E5E8EB',
            fontSize: 13, color: '#191F28',
          }}>
            <span style={{ color: '#6B7684', marginRight: 6 }}>최근 동작 :</span>
            {lastAction}
          </div>
        )}
      </div>

      {/* 미리보기 시트 본체 — 조건부 렌더 (MemoSheet 와 동일 패턴) */}
      {sheetMode !== 'closed' && (
        <NicknameRequiredSheet
          initialName={sheetMode === 'edit' ? '카페인덱서' : null}
          onSubmit={async (name) => {
            setLastAction(`✅ 저장됨 — "${name}"  (실제 앱에서는 DB 저장 + requireNickname() Promise resolve(true))`);
            setSheetMode('closed');
            return true;
          }}
          onClose={() => {
            setLastAction('❎ 취소됨 — 시트 닫음 (실제 앱에서는 Promise resolve(false), 호출자는 액션 중단)');
            setSheetMode('closed');
          }}
        />
      )}
    </div>
  );
}
