import { useState, useRef } from 'react';
import { insertReview } from '../services/db';

// ────────── 타입 ─────────────────────────────────────────────
interface CafeInfo {
  name: string;
  address: string;
  thumbnailBg?: string;
}

interface WriteReviewPageProps {
  cafe: CafeInfo;
  cafeId: string;
  userId: string;
  onBack: () => void;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

// ────────── 평가 칩 데이터 ────────────────────────────────────
const EVAL_CATEGORIES = [
  {
    id: 'outlet' as const,
    label: '콘센트',
    options: ['부족', '적당', '넉넉'],
  },
  {
    id: 'seat' as const,
    label: '좌석',
    options: ['불편', '적당', '편안'],
  },
  {
    id: 'noise' as const,
    label: '소음',
    options: ['시끄러움', '적당', '조용'],
  },
];

type CategoryId = 'outlet' | 'seat' | 'noise';
type EvalState = Partial<Record<CategoryId, string>>;

// ────────── 페이지 상태 ───────────────────────────────────────
type PageState = 'form' | 'loading' | 'success' | 'fail';

// ────────── 메인 컴포넌트 ────────────────────────────────────
export default function WriteReviewPage({ cafe, cafeId, userId, onBack, onClose, onReviewSubmitted }: WriteReviewPageProps) {
  const [pageState, setPageState] = useState<PageState>('form');
  const [evalState, setEvalState] = useState<EvalState>({});
  const [photos, setPhotos] = useState<string[]>([]); // gradient strings (mock)
  const [text, setText] = useState('');
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasContent =
    Object.keys(evalState).length > 0 || photos.length > 0 || text.trim().length > 0;
  const allEvalSelected = EVAL_CATEGORIES.every(c => evalState[c.id] !== undefined);
  const canSubmit = allEvalSelected && text.trim().length >= 10;

  // ── 뒤로가기 / 닫기 핸들러 ───────────────────────────────
  const handleBack = () => {
    if (hasContent) { setShowDiscardDialog(true); } else { onBack(); }
  };
  const handleClose = () => {
    if (hasContent) { setShowDiscardDialog(true); } else { onClose(); }
  };

  // ── 칩 토글 ──────────────────────────────────────────────
  const toggleChip = (categoryId: CategoryId, option: string) => {
    setEvalState(prev => {
      if (prev[categoryId] === option) {
        const next = { ...prev };
        delete next[categoryId];
        return next;
      }
      return { ...prev, [categoryId]: option };
    });
  };

  // ── 사진 추가 (mock: 그라디언트 추가) ────────────────────
  const handleAddPhoto = () => {
    if (photos.length >= 5) return;
    setShowPhotoSheet(true);
  };

  const addMockPhoto = () => {
    if (photos.length >= 5) return;
    const GRADIENTS = [
      'linear-gradient(145deg,#1C1C1E 0%,#2C2C2E 100%)',
      'linear-gradient(145deg,#1a1a2e 0%,#2d2d44 100%)',
      'linear-gradient(145deg,#2d1b0e 0%,#4e3020 100%)',
      'linear-gradient(145deg,#0f2530 0%,#1a3d50 100%)',
      'linear-gradient(145deg,#1a2a1a 0%,#2d4a2d 100%)',
    ];
    setPhotos(prev => [...prev, GRADIENTS[prev.length % GRADIENTS.length]]);
    setShowPhotoSheet(false);
  };

  const removePhoto = (idx: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  };

  // ── 제출 ─────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setPageState('loading');
    const success = await insertReview({
      user_id: userId,
      cafe_id: cafeId,
      content: text.trim(),
      outlet: evalState.outlet,
      seat: evalState.seat,
      noise: evalState.noise,
      images: photos,
    });
    setPageState(success ? 'success' : 'fail');
    if (success) onReviewSubmitted?.();
  };

  // ── 재시도 ────────────────────────────────────────────────
  const handleRetry = () => setPageState('form');

  // ═══════════════════════════════════════════════════════════
  // 로딩 상태
  // ═══════════════════════════════════════════════════════════
  if (pageState === 'loading') {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#f3f3f3', gap: 20,
      }}>
        <Spinner />
        <p style={{ fontSize: 16, fontWeight: 600, color: '#191F28' }}>로딩중이에요</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 성공 상태
  // ═══════════════════════════════════════════════════════════
  if (pageState === 'success') {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#f3f3f3', gap: 16, padding: '0 24px',
      }}>
        {/* 체크 아이콘 */}
        <div style={{
          width: 72, height: 72, borderRadius: 36,
          background: '#EBEBEB',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 4,
        }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M9 18.5L15 24.5L27 12" stroke="#252525" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#191F28', textAlign: 'center' }}>
          등록 완료되었어요
        </p>
        <p style={{ fontSize: 14, color: '#8B95A1', textAlign: 'center', lineHeight: 1.5 }}>
          소중한 리뷰 감사해요!<br />다른 분들께 큰 도움이 될 거예요
        </p>
        <button
          onClick={onBack}
          style={{
            marginTop: 16,
            width: '100%', height: 52, borderRadius: 12,
            background: '#252525', color: 'white',
            fontSize: 16, fontWeight: 700,
          }}
        >
          상세페이지로 이동하기
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 실패 상태
  // ═══════════════════════════════════════════════════════════
  if (pageState === 'fail') {
    return (
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#f3f3f3', gap: 16, padding: '0 24px',
      }}>
        {/* 실패 아이콘 */}
        <div style={{
          width: 72, height: 72, borderRadius: 36,
          background: '#FFF0F0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 4,
        }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path d="M12 12L24 24M24 12L12 24" stroke="#FF4B4B" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <p style={{ fontSize: 20, fontWeight: 700, color: '#191F28', textAlign: 'center' }}>
          다시 시도해주세요
        </p>
        <p style={{ fontSize: 14, color: '#8B95A1', textAlign: 'center', lineHeight: 1.5 }}>
          일시적인 오류가 발생했어요<br />잠시 후 다시 시도해주세요
        </p>
        <button
          onClick={handleRetry}
          style={{
            marginTop: 16,
            width: '100%', height: 52, borderRadius: 12,
            background: '#252525', color: 'white',
            fontSize: 16, fontWeight: 700,
          }}
        >
          다시 시도하기
        </button>
        <button
          onClick={onBack}
          style={{ fontSize: 14, color: '#8B95A1', marginTop: 4 }}
        >
          상세페이지로 돌아가기
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 폼 상태 (메인)
  // ═══════════════════════════════════════════════════════════
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#f3f3f3', position: 'relative',
    }}>

      {/* ── 헤더 ── */}
      <header style={{
        display: 'flex', alignItems: 'center',
        height: 60, padding: '0 4px',
        background: '#f3f3f3',
        flexShrink: 0,
      }}>
        {/* 뒤로가기 */}
        <button
          onClick={handleBack}
          style={{
            width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#191F28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* 우측 여백 (닫기 버튼 정렬용) */}
        <div style={{ flex: 1 }} />

        {/* 닫기 */}
        <button
          onClick={handleClose}
          style={{
            width: 44, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 4L16 16M16 4L4 16" stroke="#6B7684" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* ── 스크롤 영역 ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>

        {/* ── 카페 정보 카드 ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid #F2F4F6',
          background: '#f3f3f3',
        }}>
          {/* 썸네일 */}
          <div style={{
            width: 52, height: 52, borderRadius: 10,
            background: cafe.thumbnailBg ?? 'linear-gradient(145deg,#1a1a2e 0%,#2d2d44 100%)',
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 22, opacity: 0.3 }}>☕</span>
          </div>
          {/* 이름 + 주소 */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{
              fontSize: 15, fontWeight: 700, color: '#191F28',
              marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {cafe.name}
            </p>
            <p style={{
              fontSize: 13, color: '#8B95A1',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {cafe.address}
            </p>
          </div>
        </div>

        {/* ── 평가 칩 섹션 ── */}
        <div style={{ padding: '24px 20px 0' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 16 }}>
            이 카페를 평가해주세요
          </p>

          {EVAL_CATEGORIES.map(cat => (
            <div key={cat.id} style={{ marginBottom: 20 }}>
              {/* 카테고리 라벨 */}
              <p style={{ fontSize: 13, fontWeight: 600, color: '#4E5968', marginBottom: 10 }}>
                {cat.label}
              </p>
              {/* 칩 그룹 */}
              <div style={{ display: 'flex', gap: 8 }}>
                {cat.options.map(option => {
                  const isSelected = evalState[cat.id] === option;
                  return (
                    <button
                      key={option}
                      onClick={() => toggleChip(cat.id, option)}
                      style={{
                        flex: 1,
                        height: 40,
                        borderRadius: 20,
                        border: isSelected ? '1.5px solid #252525' : '1.5px solid #E5E8EB',
                        background: isSelected ? '#EBEBEB' : 'white',
                        color: isSelected ? '#252525' : '#6B7684',
                        fontSize: 14,
                        fontWeight: isSelected ? 700 : 400,
                        transition: 'all 0.15s',
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── 구분선 ── */}
        <div style={{ height: 8, background: '#F3F3F3', margin: '8px 0' }} />

        {/* ── 사진 첨부 섹션 ── */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#191F28' }}>사진 첨부</p>
            <span style={{ fontSize: 13, color: '#B0B8C1' }}>{photos.length}/5</span>
          </div>

          {/* 사진 목록 (가로 스크롤) */}
          <div style={{
            display: 'flex', gap: 10,
            overflowX: 'auto', paddingBottom: 4,
          }}>
            {/* 사진 추가 버튼 */}
            {photos.length < 5 && (
              <button
                onClick={handleAddPhoto}
                style={{
                  width: 80, height: 80, borderRadius: 10, flexShrink: 0,
                  border: '1.5px dashed #C9CDD2',
                  background: '#F3F3F3',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 11, color: '#B0B8C1' }}>사진 추가</span>
              </button>
            )}

            {/* 첨부된 사진들 */}
            {photos.map((bg, idx) => (
              <div
                key={idx}
                style={{
                  width: 80, height: 80, borderRadius: 10, flexShrink: 0,
                  background: bg, position: 'relative', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: 20, opacity: 0.2 }}>☕</span>
                {/* 삭제 버튼 */}
                <button
                  onClick={() => removePhoto(idx)}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 20, height: 20, borderRadius: 10,
                    background: 'rgba(0,0,0,0.55)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 2L8 8M8 2L2 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── 구분선 ── */}
        <div style={{ height: 8, background: '#F3F3F3', margin: '20px 0 0' }} />

        {/* ── 텍스트 입력 섹션 ── */}
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#191F28' }}>리뷰 작성</p>
            <span style={{ fontSize: 13, color: text.length >= 10 ? '#252525' : '#B0B8C1' }}>
              {text.length}/200
            </span>
          </div>

          <textarea
            value={text}
            onChange={e => {
              if (e.target.value.length <= 200) setText(e.target.value);
            }}
            placeholder="이 카페의 분위기, 좌석, 콘센트 등 솔직한 후기를 남겨주세요. (최소 10자)"
            rows={5}
            style={{
              width: '100%',
              border: '1.5px solid #E5E8EB',
              borderRadius: 12,
              padding: '14px',
              fontSize: 14,
              color: '#191F28',
              lineHeight: 1.6,
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              background: '#FAFBFC',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = '#252525'; e.target.style.background = 'white'; }}
            onBlur={e => { e.target.style.borderColor = '#E5E8EB'; e.target.style.background = '#FAFBFC'; }}
          />

          {/* 최소 글자 안내 */}
          {text.length > 0 && text.length < 10 && (
            <p style={{ fontSize: 12, color: '#FF6B6B', marginTop: 6 }}>
              최소 10자 이상 입력해주세요 ({10 - text.length}자 더 필요)
            </p>
          )}
        </div>
      </div>

      {/* ── 하단 고정: 제출 버튼 ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '12px 20px 24px',
        background: '#f3f3f3',
        borderTop: '1px solid #F2F4F6',
      }}>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            width: '100%', height: 52, borderRadius: 12,
            background: canSubmit ? '#252525' : '#E5E8EB',
            color: canSubmit ? 'white' : '#B0B8C1',
            fontSize: 16, fontWeight: 700,
            transition: 'background 0.15s, color 0.15s',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}
        >
          리뷰 등록하기
        </button>
      </div>

      {/* ── 작성 중단 확인 다이얼로그 ── */}
      {showDiscardDialog && (
        <DiscardDialog
          onDiscard={onBack}
          onContinue={() => setShowDiscardDialog(false)}
        />
      )}

      {/* ── 사진 추가 바텀시트 ── */}
      {showPhotoSheet && (
        <PhotoSourceSheet
          onGallery={addMockPhoto}
          onCamera={addMockPhoto}
          onClose={() => setShowPhotoSheet(false)}
        />
      )}

      {/* hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} />
    </div>
  );
}

// ────────── 스피너 ────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{
      width: 48, height: 48,
      border: '4px solid #E5E8EB',
      borderTop: '4px solid #252525',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ────────── 작성 중단 다이얼로그 ─────────────────────────────
function DiscardDialog({
  onDiscard,
  onContinue,
}: {
  onDiscard: () => void;
  onContinue: () => void;
}) {
  return (
    <>
      {/* 딤 배경 */}
      <div
        onClick={onContinue}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 300,
        }}
      />
      {/* 다이얼로그 */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        zIndex: 301,
        background: 'white',
        borderRadius: 16,
        padding: '28px 24px 20px',
        width: 280,
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
      }}>
        <p style={{ fontSize: 17, fontWeight: 700, color: '#191F28', marginBottom: 10 }}>
          작성을 중단할까요?
        </p>
        <p style={{ fontSize: 14, color: '#8B95A1', lineHeight: 1.5, marginBottom: 24 }}>
          작성 중인 내용은 저장되지 않아요
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onContinue}
            style={{
              flex: 1, height: 44, borderRadius: 10,
              border: '1.5px solid #E5E8EB',
              background: 'white',
              fontSize: 15, fontWeight: 600, color: '#4E5968',
            }}
          >
            계속 작성
          </button>
          <button
            onClick={onDiscard}
            style={{
              flex: 1, height: 44, borderRadius: 10,
              background: '#FF4B4B',
              fontSize: 15, fontWeight: 700, color: 'white',
            }}
          >
            중단하기
          </button>
        </div>
      </div>
    </>
  );
}

// ────────── 사진 소스 바텀시트 ────────────────────────────────
function PhotoSourceSheet({
  onGallery,
  onCamera,
  onClose,
}: {
  onGallery: () => void;
  onCamera: () => void;
  onClose: () => void;
}) {
  return (
    <>
      {/* 딤 배경 */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 200,
        }}
      />
      {/* 시트 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'white',
        borderRadius: '20px 20px 0 0',
        padding: '20px 20px 32px',
        zIndex: 201,
      }}>
        {/* 드래그 핸들 */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: '#E5E8EB',
          margin: '0 auto 20px',
        }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28', marginBottom: 16 }}>사진 추가</p>

        {[
          { label: '갤러리에서 선택', icon: '🖼️', onClick: onGallery },
          { label: '카메라로 촬영', icon: '📷', onClick: onCamera },
        ].map(item => (
          <button
            key={item.label}
            onClick={item.onClick}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              width: '100%', padding: '15px 4px',
              borderBottom: '1px solid #F2F4F6',
              textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 16, color: '#191F28' }}>{item.label}</span>
          </button>
        ))}

        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            width: '100%', height: 48, borderRadius: 12,
            border: '1px solid #E5E8EB',
            fontSize: 15, fontWeight: 600, color: '#6B7684',
            background: 'white',
          }}
        >
          닫기
        </button>
      </div>
    </>
  );
}
