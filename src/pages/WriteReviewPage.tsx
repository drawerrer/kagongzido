import { useState, useCallback } from 'react';
import { fetchAlbumPhotos, openCamera } from '@apps-in-toss/web-framework';
import { useBackEvent } from '../hooks/useBackEvent';
import { insertReview, type PlaceKind } from '../services/db';
import { trackReviewWriteComplete } from '../services/analytics';
import FocusBottomCTA from '../components/FocusBottomCTA';
import SheetMenuRow from '../components/SheetMenuRow';
import SheetCTA from '../components/SheetCTA';
import CafePlaceholder from '../components/CafePlaceholder';
import DiscardConfirmDialog from '../components/DiscardConfirmDialog';
import IcPhoto from '../assets/icons/icon_photo.svg?react';
import IcCamera from '../assets/icons/icon_camera.svg?react';

// ────────── 타입 ─────────────────────────────────────────────
interface CafeInfo {
  name: string;
  address: string;
  thumbnailBg?: string;
  /** stores.thumbnail_url — 있으면 우선 노출, 없으면 CafePlaceholder 폴백 */
  thumbnailUrl?: string;
}

interface WriteReviewPageProps {
  cafe: CafeInfo;
  cafeId: string;
  userId: string;
  /** 카페/도서관/공유공간 구분 — 미지정 시 기존 동작(카페)과 동일 */
  placeType?: PlaceKind;
  onBack: () => void;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

// ────────── 평가 칩 데이터 ────────────────────────────────────
const EVAL_CATEGORIES = [
  {
    id: 'outlet_status' as const,
    label: '콘센트',
    options: ['부족', '적당', '넉넉'],
  },
  {
    id: 'seat_status' as const,
    label: '좌석',
    options: ['불편', '적당', '편안'],
  },
  {
    id: 'noise_status' as const,
    label: '소음',
    options: ['시끄러움', '적당', '조용'],
  },
];

type CategoryId = 'outlet_status' | 'seat_status' | 'noise_status';
type EvalState = Partial<Record<CategoryId, string>>;

// ────────── 페이지 상태 ───────────────────────────────────────
type PageState = 'form' | 'loading' | 'success' | 'fail';

// ────────── 메인 컴포넌트 ────────────────────────────────────
export default function WriteReviewPage({ cafe, cafeId, userId, placeType = 'cafe', onBack, onClose: _onClose, onReviewSubmitted }: WriteReviewPageProps) {
  const [pageState, setPageState] = useState<PageState>('form');
  const [evalState, setEvalState] = useState<EvalState>({});
  const [photos, setPhotos] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);

  const hasContent =
    Object.keys(evalState).length > 0 || photos.length > 0 || text.trim().length > 0;
  const allEvalSelected = EVAL_CATEGORIES.every(c => evalState[c.id] !== undefined);
  const canSubmit = allEvalSelected && text.trim().length >= 10;

  // ── 뒤로가기 / 닫기 핸들러 ───────────────────────────────
  const handleBack = useCallback(() => {
    if (hasContent) { setShowDiscardDialog(true); } else { onBack(); }
  }, [hasContent, onBack]);
  // 공통 내비게이션 백버튼 → handleBack 연결
  useBackEvent(handleBack);

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

  // ── 사진 추가 ────────────────────────────────────────────
  const handleAddPhoto = () => {
    if (photos.length >= 5) return;
    setShowPhotoSheet(true);
  };

  const handleGallery = async () => {
    try {
      const remaining = 5 - photos.length;
      const results = await fetchAlbumPhotos({ maxCount: remaining, maxWidth: 1024, base64: true });
      const uris = results.map(r => 'data:image/jpeg;base64,' + r.dataUri);
      setPhotos(prev => [...prev, ...uris].slice(0, 5));
    } catch {
      // 권한 거부 등 실패 시 무시
    }
    setShowPhotoSheet(false);
  };

  const handleCamera = async () => {
    try {
      const result = await openCamera({ base64: true, maxWidth: 1024 });
      const uri = 'data:image/jpeg;base64,' + result.dataUri;
      setPhotos(prev => [...prev, uri].slice(0, 5));
    } catch {
      // 권한 거부 등 실패 시 무시
    }
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
      store_id: cafeId,
      content: text.trim(),
      outlet_status: evalState.outlet_status ?? '',
      seat_status: evalState.seat_status ?? '',
      noise_status: evalState.noise_status ?? '',
      photo_urls: photos,
    }, placeType);
    if (success) {
      trackReviewWriteComplete(cafeId, photos.length > 0);
      onReviewSubmitted?.();
      onBack();
    } else {
      setPageState('fail');
    }
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
        <p style={{ fontSize: 16, fontWeight: 600, color: '#191F28' }}>리뷰를 등록하고 있어요</p>
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

      {/* ── 스크롤 영역 ── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 140px)' }}>

        {/* ── 카페 정보 카드 ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid #F2F4F6',
          background: '#f3f3f3',
        }}>
          {/* 썸네일 — thumbnailUrl 있으면 실제 이미지, 없으면 폴백 */}
          <div style={{
            width: 52, height: 52, borderRadius: 10,
            background: cafe.thumbnailUrl ? '#F2F4F6' : (cafe.thumbnailBg ?? 'linear-gradient(145deg,#1a1a2e 0%,#2d2d44 100%)'),
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
            position: 'relative',
          }}>
            {cafe.thumbnailUrl ? (
              <img
                src={cafe.thumbnailUrl}
                alt={cafe.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <CafePlaceholder size="45%" />
            )}
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
          <p style={{ fontSize: 15, fontWeight: 700, color: '#000000', marginBottom: 16 }}>
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
                        border: 'none',
                        background: isSelected ? '#252525' : '#E7E8EB',
                        color: isSelected ? '#ffffff' : 'rgba(3,18,40,0.7)',
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
            {photos.map((uri, idx) => (
              <div
                key={idx}
                style={{
                  width: 80, height: 80, borderRadius: 10, flexShrink: 0,
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <img src={uri} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
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
            <p style={{ fontSize: 15, fontWeight: 700, color: '#000000' }}>리뷰 작성</p>
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
              border: 'none',
              borderRadius: 12,
              padding: '14px',
              fontSize: 14,
              fontWeight: 510,
              color: '#252525',
              lineHeight: 1.6,
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              background: '#FAFBFC',
              transition: 'background 0.15s',
            }}
            onFocus={e => { e.target.style.background = '#ffffff'; }}
            onBlur={e => { e.target.style.background = '#FAFBFC'; }}
          />

          {/* 최소 글자 안내 */}
          {text.length > 0 && text.length < 10 && (
            <p style={{ fontSize: 12, color: '#FF6B6B', marginTop: 6 }}>
              최소 10자 이상 입력해주세요 ({10 - text.length}자 더 필요)
            </p>
          )}
        </div>
      </div>

      {/* ── 하단 고정: 제출 CTA (FocusBottomCTA 통일) ── */}
      <FocusBottomCTA.Single
        label="리뷰 등록하기"
        onClick={handleSubmit}
        disabled={!canSubmit}
      />

      {/* ── 작성 중단 확인 다이얼로그 (TDS ConfirmDialog 공용 컴포넌트) ── */}
      <DiscardConfirmDialog
        type="review"
        open={showDiscardDialog}
        onDiscard={onBack}
        onContinue={() => setShowDiscardDialog(false)}
      />

      {/* ── 사진 추가 바텀시트 ── */}
      {showPhotoSheet && (
        <PhotoSourceSheet
          onGallery={handleGallery}
          onCamera={handleCamera}
          onClose={() => setShowPhotoSheet(false)}
        />
      )}

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
  // 모음집 액션시트(CollectionActionSheet)와 동일 톤 — #333D4B
  const IconGallery = <IcPhoto width={24} height={24} style={{ color: '#333D4B', display: 'block' }} />;
  const IconCamera = <IcCamera width={24} height={24} style={{ color: '#333D4B', display: 'block' }} />;
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200 }}
      />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: '#f3f3f3',
        borderRadius: '20px 20px 0 0',
        paddingTop: 20,
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        zIndex: 201,
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E8EB', margin: '0 auto 20px' }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28', padding: '0 20px', marginBottom: 4 }}>사진 추가</p>
        <SheetMenuRow icon={IconGallery} label="갤러리에서 선택" onClick={onGallery} />
        <SheetMenuRow icon={IconCamera} label="카메라로 촬영" onClick={onCamera} />
        <SheetCTA.Single label="닫기" onClick={onClose} variant="secondary" background="#F3F3F3" />
      </div>
    </>
  );
}
