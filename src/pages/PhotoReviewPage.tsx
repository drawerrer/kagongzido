import { useState, useRef } from 'react';
import BottomSheet from '../components/BottomSheet';

// ────────── 타입 ─────────────────────────────────────────────
export interface ReviewPhoto {
  bg: string;
  reviewId: string;
  reviewAuthor: string;
  reviewAvatarColor: string;
  reviewDate: string;
  reviewContent: string;
  isReporter: boolean;
}

interface PhotoReviewPageProps {
  photos: ReviewPhoto[];
  cafeName: string;
  isFavorite: boolean;
  onFavoriteToggle: () => void;
  onBack: () => void;
  onClose: () => void;
}

// ────────── 상수 ─────────────────────────────────────────────
const REPORT_REASONS = [
  '스팸/광고',
  '욕설/혐오 표현',
  '부적절한 사진',
  '기타',
];

// ────────── 아이콘 ────────────────────────────────────────────
function BackIcon({ color = '#191F28' }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function HeartIcon({ filled, color = '#6B7684' }: { filled: boolean; color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill={filled ? color : 'none'} stroke={color} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function MoreDotsIcon({ color = '#6B7684' }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
      <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    </svg>
  );
}

function CloseIcon({ color = '#6B7684' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function HeartFilledSmall({ filled, color }: { filled: boolean; color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24"
      fill={filled ? color : 'none'} stroke={color} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// ────────── 공통 헤더 버튼 스타일 ────────────────────────────
const hdrBtn: React.CSSProperties = {
  width: 36, height: 36, borderRadius: 18,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0,
};

// ────────── 포토리뷰 상세 뷰 ─────────────────────────────────
function PhotoDetailView({
  photos,
  initialIndex,
  onBack,
}: {
  photos: ReviewPhoto[];
  initialIndex: number;
  onBack: () => void;
}) {
  const [idx, setIdx] = useState(initialIndex);
  const [likedSet, setLikedSet] = useState<Set<number>>(new Set());
  const [showMeatball, setShowMeatball] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [textExpanded, setTextExpanded] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const photo = photos[idx];
  const isLiked = likedSet.has(idx);

  const toggleLike = () => {
    setLikedSet(s => {
      const ns = new Set(s);
      ns.has(idx) ? ns.delete(idx) : ns.add(idx);
      return ns;
    });
  };

  const goNext = () => { if (idx < photos.length - 1) { setIdx(i => i + 1); setTextExpanded(false); } };
  const goPrev = () => { if (idx > 0) { setIdx(i => i - 1); setTextExpanded(false); } };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = Math.abs(touchStartY.current - e.changedTouches[0].clientY);
    if (dy > Math.abs(dx)) return; // 세로 스크롤이면 무시
    if (dx > 50) goNext();
    else if (dx < -50) goPrev();
  };

  const handleReport = (reason: string) => {
    setShowReport(false);
    setReportDone(true);
    setTimeout(() => setReportDone(false), 2000);
    console.log('신고 사유:', reason);
  };

  return (
    <div style={{ height: '100%', background: '#111', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* 뒤로가기 버튼 */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute', top: 14, left: 16, zIndex: 20,
          width: 36, height: 36, borderRadius: 18,
          background: 'rgba(0,0,0,0.35)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: 'none', cursor: 'pointer',
        }}
      >
        <BackIcon color="white" />
      </button>

      {/* 페이지 인디케이터 */}
      <div style={{
        position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)',
        zIndex: 20, fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: 500,
        background: 'rgba(0,0,0,0.3)', borderRadius: 20, padding: '3px 12px',
        pointerEvents: 'none',
      }}>
        {idx + 1} / {photos.length}
      </div>

      {/* 풀스크린 사진 (스와이프 영역) */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          flex: 1,
          background: photo.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', overflow: 'hidden',
          transition: 'background 0.25s ease',
        }}
      >
        <span style={{ fontSize: 90, opacity: 0.08 }}>☕</span>

        {/* 좌/우 탐색 화살표 (터치가 어려운 경우 대비) */}
        {idx > 0 && (
          <button
            onClick={goPrev}
            style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              width: 36, height: 36, borderRadius: 18,
              background: 'rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer',
            }}
          >
            <BackIcon color="white" />
          </button>
        )}
        {idx < photos.length - 1 && (
          <button
            onClick={goNext}
            style={{
              position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
              width: 36, height: 36, borderRadius: 18,
              background: 'rgba(0,0,0,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: 'none', cursor: 'pointer', rotate: '180deg',
            }}
          >
            <BackIcon color="white" />
          </button>
        )}

        {/* 하단 점 인디케이터 */}
        <div style={{
          position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', gap: 5,
        }}>
          {photos.slice(Math.max(0, idx - 4), Math.min(photos.length, idx + 5)).map((_, i) => {
            const absIdx = Math.max(0, idx - 4) + i;
            return (
              <div key={absIdx} style={{
                width: absIdx === idx ? 18 : 6, height: 6,
                borderRadius: 3,
                background: absIdx === idx ? 'white' : 'rgba(255,255,255,0.4)',
                transition: 'width 0.2s, background 0.2s',
              }} />
            );
          })}
        </div>
      </div>

      {/* 하단 리뷰 정보 카드 */}
      <div style={{
        background: 'white',
        padding: '16px 20px 24px',
        borderRadius: '16px 16px 0 0',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {/* 아바타 */}
          <div style={{
            width: 38, height: 38, borderRadius: 19, flexShrink: 0,
            background: photo.reviewAvatarColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>
              {photo.reviewAuthor[0]}
            </span>
          </div>

          {/* 텍스트 영역 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* 닉네임 + 날짜 + 미트볼/좋아요 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#191F28' }}>
                  {photo.reviewAuthor}
                </span>
                {photo.isReporter && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#3182F6',
                    background: '#EBF3FE', borderRadius: 4, padding: '2px 6px',
                    flexShrink: 0,
                  }}>
                    카페 제보자
                  </span>
                )}
              </div>
              {/* 우측: 미트볼 + 좋아요 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <button
                  onClick={() => setShowMeatball(true)}
                  style={{ display: 'flex', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer', padding: 2 }}
                >
                  <MoreDotsIcon color="#B0B8C1" />
                </button>
                <button
                  onClick={toggleLike}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: 'pointer', padding: 2 }}
                >
                  <HeartFilledSmall filled={isLiked} color={isLiked ? '#3182F6' : '#B0B8C1'} />
                  <span style={{ fontSize: 12, color: isLiked ? '#3182F6' : '#B0B8C1', fontWeight: 600 }}>
                    좋아요
                  </span>
                </button>
              </div>
            </div>

            {/* 작성일 */}
            <p style={{ fontSize: 12, color: '#B0B8C1', marginBottom: 8 }}>{photo.reviewDate}</p>

            {/* 리뷰 텍스트 (2줄 말줄임) */}
            <p style={{
              fontSize: 14, color: '#4E5968', lineHeight: 1.6,
              ...(!textExpanded ? {
                display: '-webkit-box' as any,
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as any,
                overflow: 'hidden',
              } : {}),
            }}>
              {photo.reviewContent}
            </p>
            {photo.reviewContent.length > 55 && (
              <button
                onClick={() => setTextExpanded(e => !e)}
                style={{ fontSize: 13, color: '#B0B8C1', marginTop: 2, fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              >
                {textExpanded ? '접기' : '더보기'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 미트볼 메뉴 바텀시트 ── */}
      {showMeatball && (
        <BottomSheet isOpen onClose={() => setShowMeatball(false)}>
          <div style={{ padding: '4px 20px 24px' }}>
            {[
              { label: '신고하기', icon: '🚨', color: '#FF3B30', action: () => { setShowMeatball(false); setShowReport(true); } },
              { label: '차단하기', icon: '🚫', color: '#FF3B30', action: () => setShowMeatball(false) },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  width: '100%', padding: '15px 4px',
                  borderBottom: '1px solid #F2F4F6',
                  textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer',
                  borderBottomColor: '#F2F4F6',
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 16, color: item.color, fontWeight: 500 }}>{item.label}</span>
              </button>
            ))}
          </div>
        </BottomSheet>
      )}

      {/* ── 신고 사유 선택 바텀시트 ── */}
      {showReport && (
        <BottomSheet isOpen onClose={() => setShowReport(false)}>
          <div style={{ padding: '4px 20px 24px' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>
              신고 사유를 선택해주세요
            </p>
            {REPORT_REASONS.map(reason => (
              <button
                key={reason}
                onClick={() => handleReport(reason)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '15px 4px',
                  borderBottom: '1px solid #F2F4F6',
                  textAlign: 'left', border: 'none', background: 'none', cursor: 'pointer',
                  borderBottomColor: '#F2F4F6',
                }}
              >
                <span style={{ fontSize: 15, color: '#191F28' }}>{reason}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
          </div>
        </BottomSheet>
      )}

      {/* 신고 완료 토스트 */}
      <div style={{
        position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
        background: '#191F28', color: 'white',
        borderRadius: 8, padding: '8px 16px',
        fontSize: 13, fontWeight: 500,
        zIndex: 300, pointerEvents: 'none',
        opacity: reportDone ? 1 : 0,
        transition: 'opacity 0.2s',
        whiteSpace: 'nowrap',
      }}>
        신고가 접수됐어요
      </div>
    </div>
  );
}

// ────────── 포토리뷰 전체보기 (그리드 뷰) ──────────────────────
export default function PhotoReviewPage({
  photos,
  cafeName,
  isFavorite,
  onFavoriteToggle,
  onBack,
  onClose,
}: PhotoReviewPageProps) {
  const [detailIndex, setDetailIndex] = useState<number | null>(null);

  // 상세 뷰
  if (detailIndex !== null) {
    return (
      <PhotoDetailView
        photos={photos}
        initialIndex={detailIndex}
        onBack={() => setDetailIndex(null)}
      />
    );
  }

  // 그리드 뷰
  return (
    <div style={{ height: '100%', background: 'white', display: 'flex', flexDirection: 'column' }}>

      {/* ── 헤더 ── */}
      <header style={{
        display: 'flex', alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #F2F4F6',
        flexShrink: 0,
        background: 'white',
      }}>
        {/* 뒤로가기 */}
        <button onClick={onBack} style={hdrBtn}>
          <BackIcon />
        </button>

        {/* 타이틀 */}
        <span style={{
          flex: 1, textAlign: 'center',
          fontSize: 17, fontWeight: 700, color: '#191F28',
        }}>
          {cafeName} 포토리뷰
        </span>

        {/* 우측: 하트 / 더보기 / 닫기 */}
        <div style={{ display: 'flex', gap: 2 }}>
          <button onClick={onFavoriteToggle} style={hdrBtn}>
            <HeartIcon
              filled={isFavorite}
              color={isFavorite ? '#3182F6' : '#6B7684'}
            />
          </button>
          <button style={hdrBtn}>
            <MoreDotsIcon />
          </button>
          <button onClick={onClose} style={hdrBtn}>
            <CloseIcon />
          </button>
        </div>
      </header>

      {/* 사진 수 */}
      <div style={{ padding: '10px 16px 6px', flexShrink: 0 }}>
        <span style={{ fontSize: 13, color: '#8B95A1' }}>
          사진 <strong style={{ color: '#191F28' }}>{photos.length}</strong>장
        </span>
      </div>

      {/* ── 3열 그리드 ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
        }}>
          {photos.map((photo, i) => (
            <div
              key={i}
              onClick={() => setDetailIndex(i)}
              style={{
                aspectRatio: '1 / 1',
                background: photo.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
              }}
            >
              <span style={{ fontSize: 22, opacity: 0.15 }}>☕</span>
              {/* 제보자 첫 번째 사진 배지 */}
              {i === 0 && photo.isReporter && (
                <div style={{
                  position: 'absolute', top: 6, left: 6,
                  background: '#3182F6', borderRadius: 4,
                  padding: '2px 6px', fontSize: 9, fontWeight: 700, color: 'white',
                }}>
                  제보
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 하단 여백 */}
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
