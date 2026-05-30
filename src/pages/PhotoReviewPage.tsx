import { useState, useRef, useEffect } from 'react';
import { useBackEvent } from '../hooks/useBackEvent';
import BottomSheet from '../components/BottomSheet';
import CafePlaceholder from '../components/CafePlaceholder';

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
  /** (옵션) DetailPage 진입 시 — DB 좋아요 연동용 */
  userId?: string;
  /** (옵션) 부모에서 prefetch한 본인 좋아요 reviewId 집합 */
  initialLikedReviewIds?: Set<string>;
  /** (옵션) 좋아요 토글 — DB 동기화 후 최종 좋아요 상태 반환. 없으면 로컬 토글만 */
  onToggleReviewLike?: (reviewId: string) => Promise<boolean>;
  /** (옵션) 처음 보여줄 사진 인덱스 */
  initialIndex?: number;
}

// ────────── 상수 ─────────────────────────────────────────────
const REPORT_REASONS = [
  '스팸/광고',
  '욕설/혐오 표현',
  '부적절한 사진',
  '기타',
];

const BLOCK_REASONS = [
  '불쾌한 내용을 게시해요',
  '스팸 또는 광고성 글을 올려요',
  '욕설 또는 혐오 표현을 사용해요',
  '허위 정보를 올려요',
  '기타',
];

// ────────── 아이콘 ────────────────────────────────────────────
function MoreDotsIcon({ color = '#B0B8C1' }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
      <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    </svg>
  );
}

// ────────── 포토리뷰 상세 뷰 ─────────────────────────────────
function PhotoDetailView({
  photos,
  initialIndex,
  onBack,
  initialLikedReviewIds,
  onToggleReviewLike,
}: {
  photos: ReviewPhoto[];
  initialIndex: number;
  onBack: () => void;
  initialLikedReviewIds: Set<string>;
  onToggleReviewLike?: (reviewId: string) => Promise<boolean>;
}) {
  // 선택한 사진 하나만 표시
  const authorPhotos = [photos[initialIndex]];
  const reviewId = authorPhotos[0]?.reviewId ?? '';

  const [liked, setLiked] = useState(initialLikedReviewIds.has(reviewId));
  const [likeCount, setLikeCount] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);

  // prefetch 변경 시 동기화
  useEffect(() => { setLiked(initialLikedReviewIds.has(reviewId)); }, [initialLikedReviewIds, reviewId]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showMeatball, setShowMeatball] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [showBlock, setShowBlock] = useState(false);
  const [blockDone, setBlockDone] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [textExpanded, setTextExpanded] = useState(false);

  const photo = authorPhotos[0];

  // 공통 내비게이션 백버튼 → onBack 연결
  useBackEvent(onBack);

  const toggleLike = async () => {
    if (!reviewId) return;
    // 낙관적 업데이트
    const prevLiked = liked;
    const nextLiked = !prevLiked;
    setLiked(nextLiked);
    setLikeCount(c => c + (nextLiked ? 1 : -1));
    // DB 동기화 (즐겨찾기 그리드 등에서는 onToggleReviewLike 미전달 → 로컬 토글로 끝)
    if (!onToggleReviewLike) return;
    const dbLiked = await onToggleReviewLike(reviewId);
    if (dbLiked !== nextLiked) {
      setLiked(dbLiked);
      setLikeCount(c => c + (dbLiked ? 1 : -1) - (nextLiked ? 1 : -1));
    }
  };

  const handleReport = (reason: string) => {
    setShowReport(false);
    setReportDone(true);
    setTimeout(() => setReportDone(false), 2000);
    console.log('신고 사유:', reason);
  };

  const handleBlock = (reason: string) => {
    setShowBlock(false);
    setIsBlocked(true);
    setBlockDone(true);
    setTimeout(() => setBlockDone(false), 2500);
    console.log('차단 사유:', reason);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f3f3f3' }}>

      {/* ── info_2: 포토리뷰 페이지명 ── */}
      <div style={{
        height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, background: '#f3f3f3',
        borderBottom: '1px solid #F2F4F6',
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#191F28', letterSpacing: -0.2 }}>
          포토리뷰
        </span>
      </div>

      {/* ── 사진 영역 — 고정 프레임 내부 수평 스크롤 ── */}
      <div style={{ flexShrink: 0, background: '#f3f3f3', padding: 10, display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: 343, height: 343, borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
          {/* 내부 수평 스크롤 */}
          <div
            ref={scrollRef}
            onScroll={() => {
              if (!scrollRef.current) return;
              setImgIdx(Math.round(scrollRef.current.scrollLeft / 343));
            }}
            style={{
              display: 'flex', width: '100%', height: '100%',
              overflowX: 'auto', scrollSnapType: 'x mandatory',
              scrollbarWidth: 'none' as React.CSSProperties['scrollbarWidth'],
            }}
          >
            {authorPhotos.map((p, i) => (
              <div key={i} style={{
                flexShrink: 0, width: 343, height: 343,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                scrollSnapAlign: 'start',
                background: '#000',
                position: 'relative', overflow: 'hidden',
              }}>
                {p.bg ? (
                  <img src={p.bg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <CafePlaceholder size="35%" />
                )}
              </div>
            ))}
          </div>
          {/* 점 인디케이터 */}
          {authorPhotos.length > 1 && (
            <div style={{
              position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
              display: 'flex', gap: 5, pointerEvents: 'none',
            }}>
              {authorPhotos.map((_, i) => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: 3.5,
                  background: i === imgIdx ? 'white' : '#4F4F4F',
                  transition: 'background 0.2s',
                }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 리뷰 카드 ── */}
      <div style={{
        background: '#f3f3f3', padding: '20px 20px 24px',
        flexShrink: 0, borderTop: '1px solid #F2F4F6',
        position: 'relative',
      }}>
        {/* 차단된 사용자 오버레이 */}
        {isBlocked && (
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: 0,
            background: 'rgba(243,243,243,0.88)',
            backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 10,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              border: '1px solid #E5E8EB', borderRadius: 12,
              background: 'white', padding: '10px 18px',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
              </svg>
              <span style={{ fontSize: 14, color: '#8B95A1', fontWeight: 500 }}>
                차단된 사용자의 댓글입니다
              </span>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          {/* 아바타 — 32×32, rx=16 */}
          <div style={{
            width: 32, height: 32, borderRadius: 16, flexShrink: 0,
            background: photo.reviewAvatarColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
              {photo.reviewAuthor[0]}
            </span>
          </div>

          {/* 텍스트 영역 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* 닉네임 + 뱃지 + 미트볼 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#191F28' }}>
                  {photo.reviewAuthor}
                </span>
                {photo.isReporter && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#252525',
                    background: '#EBEBEB', borderRadius: 4, padding: '2px 6px',
                    flexShrink: 0,
                  }}>
                    카페 제보자
                  </span>
                )}
              </div>
              {/* 미트볼 드롭다운 */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowMeatball(v => !v)}
                  style={{ display: 'flex', alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
                >
                  <MoreDotsIcon color="#B0B8C1" />
                </button>
                {showMeatball && (
                  <>
                    <div onClick={() => setShowMeatball(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />
                    <div style={{
                      position: 'absolute', bottom: 40, right: 0, zIndex: 200,
                      background: 'rgba(253,253,254,0.89)',
                      backdropFilter: 'blur(11px)', WebkitBackdropFilter: 'blur(11px)',
                      borderRadius: 20, border: '1px solid rgba(253,253,255,0.75)',
                      boxShadow: '0 16px 60px rgba(0,27,55,0.10)',
                      minWidth: 160, padding: 4,
                    }}>
                      <div style={{ padding: '10px 14px 6px', fontSize: 12, fontWeight: 600, color: 'rgba(3,18,40,0.35)' }}>메뉴</div>
                      {[
                        { label: '신고하기', action: () => { setShowMeatball(false); setShowReport(true); } },
                        { label: '차단하기', action: () => { setShowMeatball(false); setShowBlock(true); } },
                      ].map(item => (
                        <button key={item.label} onClick={item.action} style={{
                          display: 'flex', alignItems: 'center', width: '100%',
                          padding: '12px 14px', borderRadius: 12,
                          textAlign: 'left', background: 'transparent',
                          border: 'none', cursor: 'pointer',
                        }}>
                          <span style={{ fontSize: 15, fontWeight: 500, color: 'rgba(3,18,40,0.70)', whiteSpace: 'nowrap' }}>
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 작성일 */}
            <p style={{ fontSize: 12, color: '#B0B8C1', marginBottom: 6 }}>{photo.reviewDate}</p>

            {/* 리뷰 텍스트 */}
            {(() => {
              const THRESHOLD = 50;
              const isLong = photo.reviewContent.length > THRESHOLD;
              return (
                <>
                  <p style={{ fontSize: 14, color: '#4E5968', lineHeight: 1.6, marginBottom: isLong ? 2 : 0 }}>
                    {isLong && !textExpanded
                      ? photo.reviewContent.slice(0, THRESHOLD) + '...'
                      : photo.reviewContent}
                  </p>
                  {isLong && (
                    <button
                      onClick={() => setTextExpanded(e => !e)}
                      style={{ fontSize: 13, color: '#B0B8C1', fontWeight: 500, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      {textExpanded ? '접기' : '더보기'}
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* 좋아요 버튼 — 하단 우측, rx=13 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <button
            onClick={toggleLike}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              width: liked ? 44 : 46, height: 29, borderRadius: 13,
              background: liked ? '#EBEBEB' : '#FAFAFB',
              border: 'none', justifyContent: 'center', flexShrink: 0,
              transition: 'background 0.15s, width 0.15s',
              boxSizing: 'border-box', padding: 0, cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M10.9038 21.2884C11.5698 21.7284 12.4288 21.7284 13.0938 21.2884C15.2088 19.8924 19.8138 16.5554 21.7978 12.8214C24.4128 7.89542 21.3418 2.98242 17.2818 2.98242C14.9678 2.98242 13.5758 4.19142 12.8058 5.23042C12.4818 5.67542 11.8588 5.77442 11.4128 5.45042C11.3278 5.38942 11.2538 5.31442 11.1928 5.23042C10.4228 4.19142 9.03076 2.98242 6.71676 2.98242C2.65676 2.98242 -0.414244 7.89542 2.20176 12.8214C4.18376 16.5554 8.79076 19.8924 10.9038 21.2884Z"
                fill={liked ? '#252525' : '#D1D6DB'} />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1, color: liked ? '#252525' : '#697482', letterSpacing: -0.3 }}>
              {likeCount}
            </span>
          </button>
        </div>
      </div>

      {/* ── 신고 사유 선택 바텀시트 ── */}
      {showReport && (
        <BottomSheet isOpen onClose={() => setShowReport(false)}>
          <div style={{ padding: '4px 20px 0', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
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
                  textAlign: 'left', border: 'none', borderBottom: '1px solid #F2F4F6',
                  background: 'none', cursor: 'pointer',
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

      {/* ── 차단 사유 선택 바텀시트 ── */}
      {showBlock && (
        <BottomSheet isOpen onClose={() => setShowBlock(false)}>
          <div style={{ padding: '4px 20px 0', paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>
              차단 사유를 선택해주세요
            </p>
            {BLOCK_REASONS.map(reason => (
              <button
                key={reason}
                onClick={() => handleBlock(reason)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '15px 4px',
                  textAlign: 'left', border: 'none', borderBottom: '1px solid #F2F4F6',
                  background: 'none', cursor: 'pointer',
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

      {/* 차단 완료 토스트 */}
      <div style={{
        position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
        background: '#191F28', color: 'white',
        borderRadius: 8, padding: '8px 16px',
        fontSize: 13, fontWeight: 500,
        zIndex: 300, pointerEvents: 'none',
        opacity: blockDone ? 1 : 0,
        transition: 'opacity 0.2s',
        whiteSpace: 'nowrap',
      }}>
        이제 {photo.reviewAuthor}님의 글은 볼 수 없게 됩니다
      </div>
    </div>
  );
}

// ────────── 포토리뷰 전체보기 (그리드 뷰) ──────────────────────
export default function PhotoReviewPage({
  photos,
  cafeName: _cafeName,
  isFavorite: _isFavorite,
  onFavoriteToggle: _onFavoriteToggle,
  onBack,
  onClose: _onClose,
  userId: _userId,
  initialLikedReviewIds,
  onToggleReviewLike,
  initialIndex,
}: PhotoReviewPageProps) {
  const [detailIndex, setDetailIndex] = useState<number | null>(initialIndex ?? null);

  // 백버튼 — 상세 뷰 떠 있을 땐 PhotoDetailView 가 자체 처리 (위임)
  // 그리드 뷰에서는 onBack(=상위에서 PhotoReviewPage 닫기) 호출
  useBackEvent(onBack, detailIndex === null);

  // 상세 뷰 — isFavorite/onFavoriteToggle 전달
  if (detailIndex !== null) {
    return (
      <PhotoDetailView
        photos={photos}
        initialIndex={detailIndex}
        onBack={() => setDetailIndex(null)}
        initialLikedReviewIds={initialLikedReviewIds ?? new Set()}
        onToggleReviewLike={onToggleReviewLike}
      />
    );
  }

  // 그리드 뷰
  return (
    <div style={{ height: '100%', background: '#f3f3f3', display: 'flex', flexDirection: 'column' }}>

      {/* info_2 섹션: '포토리뷰 전체보기' */}
      <div style={{
        height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, background: '#f3f3f3',
        borderBottom: '1px solid #F2F4F6',
      }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#191F28', letterSpacing: -0.2 }}>
          포토리뷰 전체보기
        </span>
      </div>

      {/* ── 3열 그리드 (작성자 단위) ── */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1,
          padding: '0 16px',
        }}>
          {photos.map((photo, i) => (
            <div
              key={i}
              onClick={() => setDetailIndex(i)}
              style={{
                aspectRatio: '1 / 1',
                background: '#F2F4F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', position: 'relative', overflow: 'hidden',
              }}
            >
              {photo.bg ? (
                <img src={photo.bg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <CafePlaceholder size="45%" />
              )}
              {/* 제보자 뱃지 */}
              {photo.isReporter && (
                <div style={{
                  position: 'absolute', top: 6, left: 6,
                  background: '#252525', borderRadius: 4,
                  padding: '2px 6px', fontSize: 9, fontWeight: 700, color: 'white',
                }}>
                  제보
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
