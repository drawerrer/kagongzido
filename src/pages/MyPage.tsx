import { useState } from 'react';

// ─────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────
type MyTab = '내 활동' | '설정';
type SubPage = 'reported' | 'recent' | 'reviews' | 'review-edit';

interface CafeItem {
  id: string;
  name: string;
  address: string;
  bg: string;
}

interface ReviewItem {
  id: string;
  cafeId: string;
  cafeName: string;
  cafeAddress: string;
  cafeBg: string;
  date: string;
  content: string;
  photos: string[];
}

// ─────────────────────────────────────────────────────────────
// 목업 데이터
// ─────────────────────────────────────────────────────────────
const CAFE_BG = [
  'linear-gradient(145deg,#1a1a2e 0%,#2d2d44 100%)',
  'linear-gradient(145deg,#2d1b0e 0%,#4e3020 100%)',
  'linear-gradient(145deg,#0f2530 0%,#1a3d50 100%)',
  'linear-gradient(145deg,#1a2a1a 0%,#2d4a2d 100%)',
  'linear-gradient(145deg,#2a1a2a 0%,#4a2a4a 100%)',
  'linear-gradient(145deg,#1C1C1E 0%,#2C2C2E 100%)',
];

const MOCK_REPORTED: CafeItem[] = [
  { id: 'r1', name: '우모에', address: '서울 용산구 한강대로84길 21-17 1층', bg: CAFE_BG[0] },
  { id: 'r2', name: '본지르본 연희', address: '서울 서대문구 연희로 93-10', bg: CAFE_BG[1] },
  { id: 'r3', name: '카페 온도', address: '서울 마포구 와우산로 21', bg: CAFE_BG[2] },
  { id: 'r4', name: '모노 커피', address: '서울 강남구 언주로 234', bg: CAFE_BG[3] },
];

const MOCK_RECENT: CafeItem[] = [
  { id: 'rc1', name: '블루보틀 강남', address: '서울 강남구 논현로 508', bg: CAFE_BG[4] },
  { id: 'rc2', name: '스타벅스 역삼역점', address: '서울 강남구 역삼로 123', bg: CAFE_BG[5] },
  { id: 'rc3', name: '우모에', address: '서울 용산구 한강대로84길 21-17 1층', bg: CAFE_BG[0] },
  { id: 'rc4', name: '더 로스터리', address: '서울 강남구 도곡로 321', bg: CAFE_BG[1] },
  { id: 'rc5', name: '카페 베이커리', address: '서울 강남구 역삼동 567', bg: CAFE_BG[2] },
];

const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: 'rv1',
    cafeId: '1',
    cafeName: '우모에',
    cafeAddress: '서울 용산구 한강대로84길 21-17 1층',
    cafeBg: CAFE_BG[0],
    date: '2026.03.29',
    content: '카피와 조용한 분위기 덕분에 작업하기 좋았어요. 사장님 음악 취향도 좋으셔서 집중도 잘 되더라고요. 다음에 또 방문하고 싶어요.',
    photos: [CAFE_BG[1], CAFE_BG[2]],
  },
  {
    id: 'rv2',
    cafeId: '2',
    cafeName: '본지르본 연희',
    cafeAddress: '서울 서대문구 연희로 93-10',
    cafeBg: CAFE_BG[1],
    date: '2026.03.29',
    content: '커피와 조용한 분위기 덕분에 작업하기 좋았어요. 사장님 음악 취향도 좋으셔서 집중도 잘 되더라고요. 다음에 또 방문하고 싶어요.',
    photos: [],
  },
  {
    id: 'rv3',
    cafeId: '3',
    cafeName: '카페 온도',
    cafeAddress: '서울 마포구 와우산로 21',
    cafeBg: CAFE_BG[2],
    date: '2026.02.14',
    content: '아늑하고 따뜻한 분위기가 좋아요. 콘센트도 충분하고 와이파이도 빠릅니다.',
    photos: [CAFE_BG[3]],
  },
  {
    id: 'rv4',
    cafeId: '4',
    cafeName: '모노 커피',
    cafeAddress: '서울 강남구 언주로 234',
    cafeBg: CAFE_BG[3],
    date: '2026.01.20',
    content: '조용하고 깔끔해요. 에스프레소가 특히 맛있었어요.',
    photos: [],
  },
  {
    id: 'rv5',
    cafeId: '5',
    cafeName: '블루보틀 강남',
    cafeAddress: '서울 강남구 논현로 508',
    cafeBg: CAFE_BG[4],
    date: '2025.12.10',
    content: '늘 대기가 있지만 그만한 가치가 있어요. 분위기가 정말 좋습니다.',
    photos: [],
  },
];

// ─────────────────────────────────────────────────────────────
// 공통 컴포넌트
// ─────────────────────────────────────────────────────────────

/** 상단 헤더: ···  |  X */
function TopHeader({
  onMore,
  onClose,
}: {
  onMore: () => void;
  onClose: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      padding: '12px 16px 0',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: '#F2F4F6',
        borderRadius: 20,
        overflow: 'hidden',
        height: 36,
      }}>
        <button
          onClick={onMore}
          style={{
            width: 44, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#4E5968', letterSpacing: 1,
          }}
        >
          ···
        </button>
        <div style={{ width: 1, height: 16, background: '#D1D6DB' }} />
        <button
          onClick={onClose}
          style={{
            width: 40, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="#4E5968" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/** 서브페이지 헤더: 뒤로가기 + 타이틀 + ···|X */
function SubHeader({
  title,
  onBack,
  onMore,
  onClose,
}: {
  title: string;
  onBack: () => void;
  onMore?: () => void;
  onClose?: () => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '12px 16px',
      borderBottom: '1px solid #F2F4F6',
      flexShrink: 0,
    }}>
      <button onClick={onBack} style={{ marginRight: 8, padding: 4 }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#191F28" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: 700, color: '#191F28' }}>
        {title}
      </span>
      {(onMore || onClose) && (
        <div style={{
          display: 'flex', alignItems: 'center',
          background: '#F2F4F6', borderRadius: 20, overflow: 'hidden', height: 34,
        }}>
          {onMore && (
            <button onClick={onMore} style={{
              width: 40, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, color: '#4E5968', letterSpacing: 1,
            }}>···</button>
          )}
          {onMore && onClose && <div style={{ width: 1, height: 14, background: '#D1D6DB' }} />}
          {onClose && (
            <button onClick={onClose} style={{
              width: 36, height: 34,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1L11 11M11 1L1 11" stroke="#4E5968" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** 카페 2-컬럼 그리드 카드 */
function CafeGrid({ cafes }: { cafes: CafeItem[] }) {
  return (
    <div style={{ padding: '16px 16px 0' }}>
      <p style={{ fontSize: 13, color: '#8B95A1', marginBottom: 14 }}>
        총 <strong style={{ color: '#191F28' }}>{cafes.length}</strong>개
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}>
        {cafes.map(cafe => (
          <div key={cafe.id} style={{ cursor: 'pointer' }}>
            {/* 썸네일 */}
            <div style={{
              width: '100%',
              aspectRatio: '1/1',
              borderRadius: 10,
              background: cafe.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 8,
              overflow: 'hidden',
            }}>
              <span style={{ fontSize: 28, opacity: 0.2 }}>☕</span>
            </div>
            {/* 카페명 */}
            <p style={{
              fontSize: 14, fontWeight: 700, color: '#191F28',
              marginBottom: 3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {cafe.name}
            </p>
            {/* 주소 */}
            <p style={{
              fontSize: 12, color: '#8B95A1',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {cafe.address}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 메뉴 행 */
function MenuRow({
  label,
  right,
  dimmed,
  onTap,
}: {
  label: string;
  right?: React.ReactNode;
  dimmed?: boolean;
  onTap?: () => void;
}) {
  return (
    <button
      onClick={onTap}
      disabled={!onTap}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%', padding: '18px 0',
        borderBottom: '1px solid #F9FAFB',
        cursor: onTap ? 'pointer' : 'default',
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(3,18,40,0.70)' }}>
        {label}
      </span>
      {right ?? (
        onTap && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 5L12.5 10L7.5 15" stroke={dimmed ? '#C9CDD2' : '#B0B8C1'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// 서브 페이지: 제보한 카페
// ─────────────────────────────────────────────────────────────
function ReportedCafePage({
  onBack,
  onClose,
}: {
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'white' }}>
      <SubHeader title="제보한 카페" onBack={onBack} onMore={() => {}} onClose={onClose} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <CafeGrid cafes={MOCK_REPORTED} />
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 서브 페이지: 최근 본 카페
// ─────────────────────────────────────────────────────────────
function RecentCafePage({
  onBack,
  onClose,
}: {
  onBack: () => void;
  onClose: () => void;
}) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'white' }}>
      <SubHeader title="최근 본 카페" onBack={onBack} onMore={() => {}} onClose={onClose} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <CafeGrid cafes={MOCK_RECENT} />
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 서브 페이지: 수정하기
// ─────────────────────────────────────────────────────────────
function ReviewEditPage({
  review,
  onBack,
  onClose,
  onSave,
}: {
  review: ReviewItem;
  onBack: () => void;
  onClose: () => void;
  onSave: (text: string, photos: string[]) => void;
}) {
  const [text, setText] = useState(review.content);
  const [photos, setPhotos] = useState<string[]>(review.photos);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCancel = () => setShowCancelDialog(true);

  const handleSave = () => {
    onSave(text, photos);
    setSaved(true);
    setTimeout(() => onBack(), 1200);
  };

  const removePhoto = (idx: number) => setPhotos(prev => prev.filter((_, i) => i !== idx));

  const addMockPhoto = () => {
    if (photos.length >= 5) return;
    const GRADIENTS = [CAFE_BG[4], CAFE_BG[5], CAFE_BG[0]];
    setPhotos(prev => [...prev, GRADIENTS[prev.length % GRADIENTS.length]]);
    setShowPhotoSheet(false);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'white', position: 'relative' }}>
      <SubHeader title="수정하기" onBack={handleCancel} onMore={() => {}} onClose={onClose} />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 88 }}>
        {/* 카페 정보 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 20px',
          borderBottom: '1px solid #F2F4F6',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 10,
            background: review.cafeBg, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 20, opacity: 0.2 }}>☕</span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p style={{
              fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 3,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{review.cafeName}</p>
            <p style={{
              fontSize: 12, color: '#8B95A1',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{review.cafeAddress}</p>
          </div>
        </div>

        {/* 사진 기록 */}
        <div style={{ padding: '20px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#191F28' }}>사진 기록</p>
            <p style={{ fontSize: 12, color: '#B0B8C1' }}>*사진은 최대 5장까지 추가할 수 있어요</p>
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {photos.map((bg, idx) => (
              <div key={idx} style={{
                width: 80, height: 80, borderRadius: 8, flexShrink: 0,
                background: bg, position: 'relative', overflow: 'hidden',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 18, opacity: 0.15 }}>☕</span>
                <button
                  onClick={() => removePhoto(idx)}
                  style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 22, height: 22, borderRadius: 11,
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
            {photos.length < 5 && (
              <button
                onClick={() => setShowPhotoSheet(true)}
                style={{
                  width: 80, height: 80, borderRadius: 8, flexShrink: 0,
                  border: '1.5px dashed #C9CDD2', background: '#F9FAFB',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4V16M4 10H16" stroke="#B0B8C1" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 11, color: '#B0B8C1' }}>사진 추가</span>
              </button>
            )}
          </div>
        </div>

        {/* 텍스트 입력 */}
        <div style={{ padding: '20px' }}>
          <div style={{
            border: '1.5px solid #E5E8EB',
            borderRadius: 12, padding: '14px',
            background: '#FAFBFC',
          }}>
            <textarea
              value={text}
              onChange={e => { if (e.target.value.length <= 200) setText(e.target.value); }}
              rows={5}
              style={{
                width: '100%', border: 'none', background: 'transparent',
                fontSize: 14, color: '#191F28', lineHeight: 1.6,
                resize: 'none', outline: 'none', fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              onFocus={e => { (e.target.parentElement as HTMLElement).style.borderColor = '#3182F6'; }}
              onBlur={e => { (e.target.parentElement as HTMLElement).style.borderColor = '#E5E8EB'; }}
            />
            <div style={{ textAlign: 'right', fontSize: 12, color: '#B0B8C1' }}>
              {text.length}/200
            </div>
          </div>
        </div>
      </div>

      {/* 하단 버튼 */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex', gap: 10,
        padding: '12px 20px 24px',
        background: 'white', borderTop: '1px solid #F2F4F6',
      }}>
        <button
          onClick={handleCancel}
          style={{
            flex: 1, height: 52, borderRadius: 12,
            background: '#EBF3FE', color: '#3182F6',
            fontSize: 16, fontWeight: 600,
          }}
        >
          취소하기
        </button>
        <button
          onClick={handleSave}
          style={{
            flex: 1, height: 52, borderRadius: 12,
            background: '#3182F6', color: 'white',
            fontSize: 16, fontWeight: 700,
          }}
        >
          {saved ? '✓ 완료' : '등록하기'}
        </button>
      </div>

      {/* 취소 확인 다이얼로그 */}
      {showCancelDialog && (
        <>
          <div
            onClick={() => setShowCancelDialog(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
          />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            zIndex: 201, background: 'white', borderRadius: 16,
            padding: '28px 24px 20px', width: 280, textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#191F28', marginBottom: 10 }}>
              수정을 취소할까요?
            </p>
            <p style={{ fontSize: 14, color: '#8B95A1', lineHeight: 1.5, marginBottom: 24 }}>
              작성하시던 내용이 사라집니다.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setShowCancelDialog(false)}
                style={{
                  flex: 1, height: 44, borderRadius: 10,
                  border: '1.5px solid #E5E8EB', background: 'white',
                  fontSize: 15, fontWeight: 600, color: '#4E5968',
                }}
              >
                계속 수정
              </button>
              <button
                onClick={onBack}
                style={{
                  flex: 1, height: 44, borderRadius: 10,
                  background: '#FF4B4B', border: 'none',
                  fontSize: 15, fontWeight: 700, color: 'white',
                }}
              >
                취소하기
              </button>
            </div>
          </div>
        </>
      )}

      {/* 사진 추가 바텀시트 */}
      {showPhotoSheet && (
        <>
          <div
            onClick={() => setShowPhotoSheet(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
          />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'white', borderRadius: '16px 16px 0 0',
            padding: '16px 20px 32px', zIndex: 201,
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E8EB', margin: '0 auto 18px' }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>사진 추가</p>
            {[
              { label: '갤러리에서 선택', icon: '🖼️' },
              { label: '카메라로 촬영', icon: '📷' },
            ].map(item => (
              <button
                key={item.label}
                onClick={addMockPhoto}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  width: '100%', padding: '14px 4px',
                  borderBottom: '1px solid #F2F4F6', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 16, color: '#191F28' }}>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 서브 페이지: 작성한 리뷰
// ─────────────────────────────────────────────────────────────
function WrittenReviewPage({
  onBack,
  onClose,
  onEdit,
}: {
  onBack: () => void;
  onClose: () => void;
  onEdit: (review: ReviewItem) => void;
}) {
  const [reviews, setReviews] = useState<ReviewItem[]>(MOCK_REVIEWS);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteToast, setDeleteToast] = useState(false);

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    setReviews(prev => prev.filter(r => r.id !== deleteTargetId));
    setDeleteTargetId(null);
    setDeleteToast(true);
    setTimeout(() => setDeleteToast(false), 2000);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'white', position: 'relative' }}>
      <SubHeader title="작성한 리뷰" onBack={onBack} onMore={() => {}} onClose={onClose} />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* 총 개수 */}
        <div style={{ padding: '16px 20px 8px' }}>
          <p style={{ fontSize: 13, color: '#8B95A1' }}>
            총 <strong style={{ color: '#191F28' }}>{reviews.length}</strong>개
          </p>
        </div>

        {reviews.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '60px 0', gap: 10,
          }}>
            <span style={{ fontSize: 40 }}>💬</span>
            <p style={{ fontSize: 15, color: '#8B95A1' }}>작성한 리뷰가 없어요</p>
          </div>
        ) : (
          reviews.map(review => (
            <div
              key={review.id}
              style={{
                display: 'flex', gap: 12,
                padding: '16px 20px',
                borderBottom: '1px solid #F2F4F6',
              }}
            >
              {/* 썸네일 */}
              <div style={{
                width: 76, height: 76, borderRadius: 10,
                background: review.cafeBg, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: 22, opacity: 0.18 }}>☕</span>
              </div>

              {/* 내용 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 2 }}>
                  {review.cafeName}
                </p>
                <p style={{ fontSize: 12, color: '#B0B8C1', marginBottom: 6 }}>
                  작성일시&nbsp;&nbsp;{review.date}
                </p>
                <p style={{
                  fontSize: 13, color: '#4E5968', lineHeight: 1.55,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                } as React.CSSProperties}>
                  {review.content}
                </p>
                {/* 액션 버튼 */}
                <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                  <button
                    onClick={() => setDeleteTargetId(review.id)}
                    style={{
                      fontSize: 13, color: '#8B95A1',
                      textDecoration: 'underline',
                    }}
                  >
                    삭제하기
                  </button>
                  <button
                    onClick={() => onEdit(review)}
                    style={{
                      fontSize: 13, color: '#4E5968',
                      textDecoration: 'underline', fontWeight: 600,
                    }}
                  >
                    수정하기
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        <div style={{ height: 24 }} />
      </div>

      {/* 삭제 확인 다이얼로그 */}
      {deleteTargetId && (
        <>
          <div
            onClick={() => setDeleteTargetId(null)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
          />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%,-50%)',
            zIndex: 201, background: 'white', borderRadius: 16,
            padding: '28px 24px 20px', width: 280, textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#191F28', marginBottom: 10 }}>
              리뷰를 삭제할까요?
            </p>
            <p style={{ fontSize: 14, color: '#8B95A1', lineHeight: 1.5, marginBottom: 24 }}>
              삭제된 리뷰는 복구할 수 없어요
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setDeleteTargetId(null)}
                style={{
                  flex: 1, height: 44, borderRadius: 10,
                  border: '1.5px solid #E5E8EB', background: 'white',
                  fontSize: 15, fontWeight: 600, color: '#4E5968',
                }}
              >
                취소
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  flex: 1, height: 44, borderRadius: 10,
                  background: '#FF4B4B', border: 'none',
                  fontSize: 15, fontWeight: 700, color: 'white',
                }}
              >
                삭제하기
              </button>
            </div>
          </div>
        </>
      )}

      {/* 삭제 완료 토스트 */}
      <div style={{
        position: 'absolute', bottom: 24, left: '50%',
        transform: `translateX(-50%) translateY(${deleteToast ? 0 : 10}px)`,
        opacity: deleteToast ? 1 : 0,
        transition: 'opacity 0.2s, transform 0.2s',
        background: '#191F28', color: 'white',
        borderRadius: 8, padding: '9px 16px',
        fontSize: 13, fontWeight: 500,
        whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 100,
      }}>
        리뷰가 삭제되었어요
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인: 마이페이지
// ─────────────────────────────────────────────────────────────
export default function MyPage() {
  const [tab, setTab] = useState<MyTab>('내 활동');
  const [subPage, setSubPage] = useState<SubPage | null>(null);
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [versionToast, setVersionToast] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  const handleMoreAction = () => setShowMoreSheet(true);
  const handleClose = () => {
    // 탭 바 있는 구조에서 '닫기'는 서브페이지 닫기 or 마이페이지 기본 상태로
    if (subPage) { setSubPage(null); setEditingReview(null); }
    // 전체 닫기는 App.tsx에서 탭 전환으로 처리됨 (탭 바 구조이므로 onClose prop 없음)
  };

  const showVersionToast = () => {
    setVersionToast(true);
    setTimeout(() => setVersionToast(false), 2000);
  };

  // ── 서브페이지 렌더 ──────────────────────────────────────
  if (editingReview) {
    return (
      <ReviewEditPage
        review={editingReview}
        onBack={() => setEditingReview(null)}
        onClose={() => { setEditingReview(null); setSubPage(null); }}
        onSave={(_text, _photos) => setEditingReview(null)}
      />
    );
  }

  if (subPage === 'reported') {
    return <ReportedCafePage onBack={() => setSubPage(null)} onClose={() => setSubPage(null)} />;
  }
  if (subPage === 'recent') {
    return <RecentCafePage onBack={() => setSubPage(null)} onClose={() => setSubPage(null)} />;
  }
  if (subPage === 'reviews') {
    return (
      <WrittenReviewPage
        onBack={() => setSubPage(null)}
        onClose={() => setSubPage(null)}
        onEdit={review => setEditingReview(review)}
      />
    );
  }

  // ── 메인 마이페이지 ──────────────────────────────────────
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'white', position: 'relative', overflow: 'hidden',
    }}>
      {/* 상단 헤더 */}
      <TopHeader onMore={handleMoreAction} onClose={handleClose} />

      {/* 스크롤 영역 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* 닉네임 */}
        <div style={{ padding: '16px 20px 0' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#191F28', letterSpacing: '-0.5px' }}>
            김카페
          </h1>
        </div>

        {/* 탭 바 */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #F2F4F6',
          margin: '16px 0 0',
        }}>
          {(['내 활동', '설정'] as MyTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '12px 0',
                fontSize: 15,
                fontWeight: tab === t ? 700 : 590,
                color: tab === t ? 'rgba(0,12,30,0.80)' : 'rgba(0,19,43,0.58)',
                borderBottom: tab === t ? '2px solid #333d4b' : '2px solid transparent',
                marginBottom: -1,
                transition: 'all 0.15s',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* 탭 콘텐츠 */}
        <div style={{ padding: '8px 20px' }}>
          {tab === '내 활동' ? (
            <>
              <MenuRow label="제보한 카페" onTap={() => setSubPage('reported')} />
              <MenuRow label="최근 본 카페" onTap={() => setSubPage('recent')} />
              <MenuRow label="작성한 리뷰" onTap={() => setSubPage('reviews')} />
            </>
          ) : (
            <>
              <MenuRow label="공지사항" onTap={() => {}} />
              <MenuRow label="문의하기" onTap={() => {}} />
              <MenuRow
                label="버전 관리"
                dimmed
                onTap={showVersionToast}
                right={<span style={{ fontSize: 14, color: '#C9CDD2' }}>v1</span>}
              />
              <MenuRow
                label="회원탈퇴"
                dimmed
                onTap={() => {}}
              />
            </>
          )}
        </div>

        <div style={{ height: 40 }} />
      </div>

      {/* 버전 토스트 */}
      <div style={{
        position: 'absolute', bottom: 24, left: '50%',
        transform: `translateX(-50%) translateY(${versionToast ? 0 : 10}px)`,
        opacity: versionToast ? 1 : 0,
        transition: 'opacity 0.2s, transform 0.2s',
        background: '#191F28', color: 'white',
        borderRadius: 8, padding: '9px 16px',
        fontSize: 13, fontWeight: 500,
        whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 100,
      }}>
        현재 최신 버전을 사용 중입니다
      </div>

      {/* 더보기 바텀시트 */}
      {showMoreSheet && (
        <>
          <div
            onClick={() => setShowMoreSheet(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
          />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'white', borderRadius: '16px 16px 0 0',
            padding: '16px 20px 32px', zIndex: 201,
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E8EB', margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>더보기</p>
            {[
              { label: '프로필 수정', icon: '✏️' },
              { label: '계정 설정', icon: '⚙️' },
              { label: '로그아웃', icon: '🚪' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => setShowMoreSheet(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  width: '100%', padding: '15px 4px',
                  borderBottom: '1px solid #F2F4F6', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 16, color: '#191F28' }}>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
