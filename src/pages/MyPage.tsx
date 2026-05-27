import { useState, useEffect, type RefObject } from 'react';
import { fetchAlbumPhotos, openCamera, openURL } from '@apps-in-toss/web-framework';
import { useBackEvent } from '../hooks/useBackEvent';
import { Toast, BottomSheet, Button, ConfirmDialog } from '@toss/tds-mobile';
import FocusBottomCTA from '../components/FocusBottomCTA';
import SheetMenuRow from '../components/SheetMenuRow';
import SheetCTA from '../components/SheetCTA';
import { useFavorites } from '../context/FavoritesContext';
import {
  insertCafeReport, deleteUserData,
  fetchUserReviews, deleteReview, updateReview, type UserReviewRow,
  fetchUserReports, type UserReportRow,
  fetchNotices, type NoticeRow,
} from '../services/db';
import StoreCountBar from '../components/StoreCountBar';
import LogoImg from '../assets/LOGO/logo.png';

// ─────────────────────────────────────────────────────────────
// 타입
// ─────────────────────────────────────────────────────────────
type MyTab = '내 활동' | '설정';
type SubPage = 'reported' | 'recent' | 'reviews' | 'review-edit' | 'report-cafe' | 'notices';

interface CafeItem {
  id: string;
  name: string;
  address: string;
  bg: string;
  photo?: string;
  /** 제보 상태 (제보한 카페 페이지에서만 사용) */
  reportStatus?: 'pending' | 'reviewing' | 'resolved' | 'rejected';
}

// 제보 상태 표시 메타
const REPORT_STATUS_META: Record<NonNullable<CafeItem['reportStatus']>, { label: string; bg: string; fg: string }> = {
  pending:   { label: '대기 중', bg: '#FFF3CD', fg: '#856404' },
  reviewing: { label: '검토 중', bg: '#CCE5FF', fg: '#004085' },
  resolved:  { label: '완료',   bg: '#D4EDDA', fg: '#155724' },
  rejected:  { label: '반려',   bg: '#F8D7DA', fg: '#721C24' },
};

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

// MOCK_RECENT: 최근 방문 카페 (추후 활성화 예정)
// const MOCK_RECENT: CafeItem[] = [...]

function mapReviewRow(row: UserReviewRow, idx: number): ReviewItem {
  return {
    id: row.id,
    cafeId: row.store_id,
    cafeName: row.store_name,
    cafeAddress: row.store_address,
    cafeBg: row.store_thumbnail
      ? `url('${row.store_thumbnail}') center / cover no-repeat`
      : CAFE_BG[idx % CAFE_BG.length],
    date: row.created_at.slice(0, 10).replace(/-/g, '.'),
    content: row.content,
    photos: row.photo_urls,
  };
}

function mapReportRow(row: UserReportRow, idx: number): CafeItem {
  // DB 의 status (text) 를 안전하게 UI 메타와 매칭. 누락/알 수 없는 값은 pending 처리.
  const status = (['pending', 'reviewing', 'resolved', 'rejected'] as const).find(s => s === row.status) ?? 'pending';
  // 사진 첨부 시 첫 번째 사진 표시, 없으면 undefined → CafeGrid 가 그라데이션 + ☕ 이모지 노출
  const firstPhoto = row.photo_urls?.[0];
  return {
    id: row.id,
    name: row.store_name,
    address: row.created_at.slice(0, 10).replace(/-/g, '.') + ' 제보',
    bg: CAFE_BG[idx % CAFE_BG.length],
    reportStatus: status,
    photo: firstPhoto,
  };
}

// ─────────────────────────────────────────────────────────────
// 공통 컴포넌트
// ─────────────────────────────────────────────────────────────


/** 서브페이지 백버튼 핸들러 (TDS 네비바가 시각적 헤더 담당) */
function SubHeader({
  onBack,
}: {
  title?: string;
  onBack: () => void;
  onMore?: () => void;
  onClose?: () => void;
}) {
  useBackEvent(onBack);
  return null;
}

// ─────────────────────────────────────────────────────────────
// 공지사항 페이지 — Supabase notices 테이블에서 발행분만 조회
// ─────────────────────────────────────────────────────────────

function formatNoticeDate(iso: string): string {
  const d = new Date(iso);
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}/${mm}/${dd}`;
}

function NoticesPage({ onBack }: { onBack: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [notices, setNotices] = useState<NoticeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useBackEvent(onBack);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const rows = await fetchNotices();
      setNotices(rows);
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#F3F3F3' }}>
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}>
        {loading ? (
          <p style={{ color: '#8B95A1', textAlign: 'center', marginTop: 60, fontSize: 14 }}>불러오는 중...</p>
        ) : notices.length === 0 ? (
          <p style={{ color: '#8B95A1', textAlign: 'center', marginTop: 60, fontSize: 14 }}>등록된 공지가 없어요</p>
        ) : (
          <div style={{ background: '#FFFFFF', margin: '12px 16px', borderRadius: 14, overflow: 'hidden' }}>
            {notices.map((notice, i) => (
              <div key={notice.id}>
                <button
                  onClick={() => setOpenId(openId === notice.id ? null : notice.id)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    width: '100%', padding: '18px 16px',
                    borderBottom: i < notices.length - 1 || openId === notice.id ? '1px solid #F3F3F3' : 'none',
                    background: 'transparent', cursor: 'pointer', textAlign: 'left', gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, color: '#B0B8C1', fontWeight: 500, marginBottom: 4 }}>
                      {formatNoticeDate(notice.published_at)}
                    </p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'rgba(3,18,40,0.85)', lineHeight: '1.4' }}>{notice.title}</p>
                  </div>
                  <svg
                    width="20" height="20" viewBox="0 0 20 20" fill="none"
                    style={{ flexShrink: 0, marginTop: 2, transition: 'transform 0.2s', transform: openId === notice.id ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  >
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="#B0B8C1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {openId === notice.id && (
                  <div style={{
                    padding: '14px 16px 18px',
                    borderBottom: i < notices.length - 1 ? '1px solid #F3F3F3' : 'none',
                    background: '#FAFAFA',
                  }}>
                    <p style={{ fontSize: 13, color: 'rgba(3,18,40,0.60)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                      {notice.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** 카페 2-컬럼 그리드 카드 */
function CafeGrid({ cafes, onDetailOpen }: { cafes: CafeItem[]; onDetailOpen?: (id: string) => void }) {
  return (
    <div style={{ padding: '16px 16px 0' }}>
      <StoreCountBar count={cafes.length} style={{ paddingLeft: 0 }} />
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 12,
      }}>
        {cafes.map(cafe => {
          const statusMeta = cafe.reportStatus ? REPORT_STATUS_META[cafe.reportStatus] : null;
          return (
          <div key={cafe.id} style={{ cursor: 'pointer' }} onClick={() => onDetailOpen?.(cafe.id)}>
            {/* 썸네일 */}
            <div style={{
              width: '100%',
              aspectRatio: '1/1',
              borderRadius: 10,
              background: cafe.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 8,
              overflow: 'hidden',
              position: 'relative',
            }}>
              {cafe.photo ? (
                <img src={cafe.photo} alt={cafe.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
              ) : (
                // 사진 미첨부 시 서비스 로고 폴백 표시
                <img
                  src={LogoImg}
                  alt="카공지도"
                  style={{
                    width: '40%', height: '40%', objectFit: 'contain',
                    opacity: 0.25, filter: 'brightness(0) invert(1)',
                  }}
                />
              )}
              {/* 제보 상태 배지 (우측 상단) */}
              {statusMeta && (
                <span style={{
                  position: 'absolute', top: 8, right: 8,
                  fontSize: 11, fontWeight: 600,
                  padding: '3px 8px', borderRadius: 12,
                  background: statusMeta.bg, color: statusMeta.fg,
                }}>
                  {statusMeta.label}
                </span>
              )}
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
          );
        })}
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
        borderBottom: '1px solid #F3F3F3',
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
  onReportView,
}: {
  onBack: () => void;
  onClose: () => void;
  /** 카드 클릭 시 호출 — 제보 원본 데이터를 부모에 전달해 뷰 모드 진입 */
  onReportView: (report: UserReportRow) => void;
}) {
  const { userId } = useFavorites();
  const [reports, setReports] = useState<UserReportRow[]>([]);

  useEffect(() => {
    if (!userId) return;
    fetchUserReports(userId).then(setReports);
  }, [userId]);

  const cafes = reports.map(mapReportRow);
  const handleClick = (id: string) => {
    const report = reports.find(r => r.id === id);
    if (report) onReportView(report);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f3f3f3' }}>
      <SubHeader title="제보한 카페" onBack={onBack} onMore={() => {}} onClose={onClose} />
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}>
        <CafeGrid cafes={cafes} onDetailOpen={handleClick} />
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
  onDetailOpen,
}: {
  onBack: () => void;
  onClose: () => void;
  onDetailOpen?: (id: string) => void;
}) {
  const { recentlyViewed } = useFavorites();
  const cafes: CafeItem[] = recentlyViewed.map(r => ({
    id: r.id,
    name: r.name,
    address: '',
    bg: '#E8EDF4',
    photo: r.photo,
  }));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f3f3f3' }}>
      <SubHeader title="최근 본 카페" onBack={onBack} onMore={() => {}} onClose={onClose} />
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}>
        {cafes.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            paddingTop: 80, gap: 10,
          }}>
            <span style={{ fontSize: 40 }}>☕</span>
            <p style={{ fontSize: 15, color: '#8B95A1' }}>아직 최근에 본 카페가 없어요</p>
          </div>
        ) : (
          <CafeGrid cafes={cafes} onDetailOpen={onDetailOpen} />
        )}
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

  const handleGallery = async () => {
    try {
      const remaining = 5 - photos.length;
      const results = await fetchAlbumPhotos({ maxCount: remaining, maxWidth: 1024, base64: true });
      setPhotos(prev => [...prev, ...results.map(r => 'data:image/jpeg;base64,' + r.dataUri)].slice(0, 5));
    } catch {}
    setShowPhotoSheet(false);
  };

  const handleCamera = async () => {
    try {
      const result = await openCamera({ base64: true, maxWidth: 1024 });
      setPhotos(prev => [...prev, 'data:image/jpeg;base64,' + result.dataUri].slice(0, 5));
    } catch {}
    setShowPhotoSheet(false);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f3f3f3', position: 'relative' }}>
      <SubHeader title="수정하기" onBack={handleCancel} onMore={() => {}} onClose={onClose} />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}>
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
                  border: '1.5px dashed #C9CDD2', background: '#F3F3F3',
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
              onFocus={e => { (e.target.parentElement as HTMLElement).style.borderColor = '#252525'; }}
              onBlur={e => { (e.target.parentElement as HTMLElement).style.borderColor = '#E5E8EB'; }}
            />
            <div style={{ textAlign: 'right', fontSize: 12, color: '#B0B8C1' }}>
              {text.length}/200
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div style={{
          display: 'flex', gap: 10,
          padding: '12px 20px 24px',
          background: 'white', borderTop: '1px solid #F2F4F6',
        }}>
        <button
          onClick={handleCancel}
          style={{
            flex: 1, height: 52, borderRadius: 12,
            background: '#EBEBEB', color: '#252525',
            fontSize: 16, fontWeight: 600,
          }}
        >
          취소하기
        </button>
        <button
          onClick={handleSave}
          style={{
            flex: 1, height: 52, borderRadius: 12,
            background: '#252525', color: 'white',
            fontSize: 16, fontWeight: 700,
          }}
        >
          {saved ? '✓ 완료' : '등록하기'}
        </button>
        </div>
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
              지금 나가면 작성한 내용이 사라져요
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

      {/* 사진 추가 바텀시트 (SheetMenuRow 통일) */}
      {showPhotoSheet && (
        <>
          <div
            onClick={() => setShowPhotoSheet(false)}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200 }}
          />
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'white', borderRadius: '16px 16px 0 0',
            paddingTop: 16,
            paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            zIndex: 201,
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E8EB', margin: '0 auto 18px' }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28', padding: '0 20px', marginBottom: 4 }}>사진 추가</p>
            <SheetMenuRow icon={<span style={{ fontSize: 20 }}>🖼️</span>} label="갤러리에서 선택" onClick={handleGallery} />
            <SheetMenuRow icon={<span style={{ fontSize: 20 }}>📷</span>} label="카메라로 촬영" onClick={handleCamera} />
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
  refreshTrigger,
}: {
  onBack: () => void;
  onClose: () => void;
  onEdit: (review: ReviewItem) => void;
  refreshTrigger?: number;
}) {
  const { userId } = useFavorites();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteToast, setDeleteToast] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchUserReviews(userId).then(rows => {
      setReviews(rows.map(mapReviewRow));
    });
  }, [userId, refreshTrigger]);

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    await deleteReview(deleteTargetId);
    setReviews(prev => prev.filter(r => r.id !== deleteTargetId));
    setDeleteTargetId(null);
    setDeleteToast(true);
    setTimeout(() => setDeleteToast(false), 2000);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f3f3f3', position: 'relative' }}>
      <SubHeader title="작성한 리뷰" onBack={onBack} onMore={() => {}} onClose={onClose} />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}>
        <StoreCountBar count={reviews.length} />

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
      <ConfirmDialog
        open={!!deleteTargetId}
        title={<ConfirmDialog.Title>리뷰를 삭제할까요?</ConfirmDialog.Title>}
        description={
          <ConfirmDialog.Description>
            {'삭제된 리뷰는 복구할 수 없어요'}
          </ConfirmDialog.Description>
        }
        cancelButton={
          <ConfirmDialog.CancelButton onClick={() => setDeleteTargetId(null)}>
            닫기
          </ConfirmDialog.CancelButton>
        }
        confirmButton={
          <ConfirmDialog.ConfirmButton onClick={confirmDelete}>
            삭제하기
          </ConfirmDialog.ConfirmButton>
        }
      />

      {/* 삭제 완료 토스트 */}
      <Toast
        open={deleteToast}
        position="top"
        text="리뷰가 삭제되었어요"
        onClose={() => setDeleteToast(false)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 카페 제보하기 페이지 (mypage_recommend / searching / searched)
// ─────────────────────────────────────────────────────────────

const CHIP_OPTIONS: Record<string, string[]> = {
  콘센트: ['부족', '적당', '넉넉'],
  좌석: ['불편', '적당', '편안'],
  소음: ['시끄러움', '적당', '조용'],
};

function ReportCafePage({
  onBack,
  onClose,
  onSubmitted,
  initialReport,
}: {
  onBack: () => void;
  onClose: () => void;
  /** 제보 INSERT 성공 시 호출 — 부모(MyPage) 가 카운트 재조회 트리거 */
  onSubmitted?: () => void;
  /** 제공되면 읽기 전용 뷰 모드 — 사용자가 작성한 제보 내용 확인용 */
  initialReport?: UserReportRow;
}) {
  const { userId, allStores } = useFavorites();
  const readOnly = !!initialReport;
  const [query, setQuery] = useState('');
  const [selectedCafe, setSelectedCafe] = useState<{ id: string; name: string; address: string } | null>(
    initialReport ? { id: initialReport.id, name: initialReport.store_name, address: '' } : null,
  );
  const [chips, setChips] = useState<Record<string, string>>(
    initialReport ? {
      '콘센트': initialReport.outlet_status ?? '',
      '좌석':   initialReport.seat_status ?? '',
      '소음':   initialReport.noise_status ?? '',
    } : {},
  );
  const [reviewText, setReviewText] = useState(initialReport?.content ?? '');
  const [photos, setPhotos] = useState<string[]>(initialReport?.photo_urls ?? []);
  const [showPhotoSheet, setShowPhotoSheet] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [directName, setDirectName] = useState<string | null>(initialReport && !initialReport.store_name ? null : null);
  const [directAddress, setDirectAddress] = useState('');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  const results = query.trim()
    ? allStores
        .filter(c => c.name.includes(query.trim()))
        .slice(0, 20)
        .map(c => ({ id: c.id, name: c.name, address: c.address_road }))
    : [];
  const isSearching = !selectedCafe && !directName && query.trim().length > 0 && results.length > 0;
  const isNoResult = !selectedCafe && !directName && query.trim().length > 0 && results.length === 0;

  const toggleChip = (category: string, option: string) => {
    if (readOnly) return;
    setChips(prev => prev[category] === option ? { ...prev, [category]: '' } : { ...prev, [category]: option });
  };

  // 뷰 모드일 때 상태 메타
  const viewStatusMeta = readOnly && initialReport
    ? REPORT_STATUS_META[(['pending','reviewing','resolved','rejected'] as const).find(s => s === initialReport.status) ?? 'pending']
    : null;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#f3f3f3', position: 'relative', overflow: 'hidden' }}>
      <SubHeader onBack={onBack} />
      {/* 하단 고정 CTA(52px + padding 20px*2 = 92px) + safe-area 만큼 스크롤 영역에 여백 확보 */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)' }}>

        {/* 페이지 타이틀 */}
        <div style={{
          height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#f3f3f3', borderBottom: '1px solid #F2F4F6',
          position: 'relative',
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#191F28', letterSpacing: -0.2 }}>
            {readOnly ? '제보 내용 보기' : '카페 제보하기'}
          </span>
          {viewStatusMeta && (
            <span style={{
              position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
              fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
              background: viewStatusMeta.bg, color: viewStatusMeta.fg,
            }}>
              {viewStatusMeta.label}
            </span>
          )}
        </div>

        {/* 어드민 메모 (뷰 모드 & 메모 있을 때만) */}
        {readOnly && initialReport?.admin_comment && (
          <div style={{
            margin: '16px 16px 0', padding: '14px 16px',
            borderRadius: 12, background: '#E8F4FF',
            border: '1px solid #B3D9FF',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#004085', marginBottom: 6 }}>
              ✉️ 운영진 메모
            </p>
            <p style={{ fontSize: 13, color: '#0F2D52', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
              {initialReport.admin_comment}
            </p>
          </div>
        )}

        {/* 카페명 섹션 */}
        <div style={{ padding: '0 16px 20px', background: '#f3f3f3' }}>
          <span style={{ display: 'block', fontSize: 14, fontWeight: 590, color: '#000000', lineHeight: '25.5px', marginBottom: 8 }}>카페명</span>

          {/* 인풋 1: 카페명 검색 / 선택완료 / 직접입력 */}
          <div style={{
            background: '#ffffff', borderRadius: 12, height: 44,
            display: 'flex', alignItems: 'center', paddingLeft: 10, paddingRight: 10, gap: 6,
          }}>
            {selectedCafe ? (
              /* 선택 완료: 카페명 + 주소 표시 */
              <>
                <span style={{ fontSize: 14, fontWeight: 510, color: '#252525', lineHeight: '17.5px', flexShrink: 0 }}>
                  {selectedCafe.name}
                </span>
                <span style={{
                  fontSize: 12, fontWeight: 510, color: 'rgba(3,24,50,0.46)', lineHeight: '15px',
                  flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {selectedCafe.address}
                </span>
                <button
                  onClick={() => { setSelectedCafe(null); setQuery(''); setDirectName(null); setDirectAddress(''); }}
                  style={{ padding: 0, lineHeight: 0, flexShrink: 0 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#E5E8EB" />
                    <line x1="15" y1="9" x2="9" y2="15" stroke="#6B7684" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="9" y1="9" x2="15" y2="15" stroke="#6B7684" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </>
            ) : directName !== null ? (
              /* 직접 입력 모드: 카페명 표시 + X */
              <>
                <span style={{ fontSize: 14, fontWeight: 510, color: '#252525', lineHeight: '17.5px', flex: 1 }}>
                  {directName}
                </span>
                <button
                  onClick={() => { setDirectName(null); setDirectAddress(''); setQuery(''); }}
                  style={{ padding: 0, lineHeight: 0, flexShrink: 0 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#E5E8EB" />
                    <line x1="15" y1="9" x2="9" y2="15" stroke="#6B7684" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="9" y1="9" x2="15" y2="15" stroke="#6B7684" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </>
            ) : (
              /* 검색 인풋 */
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setSelectedCafe(null); }}
                placeholder="카페 이름을 검색해 보세요"
                style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  fontSize: 17, fontWeight: 510, color: '#191f28', fontFamily: 'inherit',
                }}
              />
            )}
          </div>

          {/* 인풋 2: 주소 입력 (직접 입력 모드) */}
          {directName !== null && (
            <div style={{
              marginTop: 8,
              background: '#ffffff', borderRadius: 12, height: 44,
              display: 'flex', alignItems: 'center', paddingLeft: 10, paddingRight: 10, gap: 6,
            }}>
              <input
                autoFocus
                value={directAddress}
                onChange={e => setDirectAddress(e.target.value)}
                placeholder="제보하시려는 카페의 주소를 알려주세요"
                style={{
                  flex: 1, border: 'none', outline: 'none', background: 'transparent',
                  fontSize: 14, fontWeight: 510, color: '#191f28', fontFamily: 'inherit',
                }}
              />
              <button
                onClick={() => {
                  setSelectedCafe({ id: `manual-${directName}`, name: directName, address: directAddress });
                  setDirectName(null);
                  setDirectAddress('');
                }}
                style={{
                  flexShrink: 0, height: 28, padding: '0 10px', borderRadius: 8,
                  background: '#252525', color: '#ffffff',
                  fontSize: 13, fontWeight: 590, border: 'none', cursor: 'pointer',
                }}
              >
                저장
              </button>
            </div>
          )}

          {/* 검색 결과 없음 */}
          {isNoResult && (
            <div style={{
              marginTop: 16, padding: '32px 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            }}>
              <span style={{ fontSize: 15, fontWeight: 510, color: '#8B95A1', textAlign: 'center' }}>
                찾으시는 카페가 아직 없어요!
              </span>
              <button
                onClick={() => { setDirectName(query); setQuery(''); }}
                style={{
                  height: 38, borderRadius: 10,
                  backgroundColor: 'rgba(211,211,223,0.19)',
                  border: 'none', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center',
                  padding: '0 16px', gap: 6, flexShrink: 0,
                }}
              >
                <span style={{ fontWeight: 590, fontSize: 15, color: '#252525', whiteSpace: 'nowrap' }}>
                  &ldquo;{query}&rdquo; 직접 입력하기
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M12 5v14M5 12h14" stroke="#252525" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
          {isSearching && results.map(cafe => {
            const isDark = hoveredId === cafe.id;
            return (
              <div
                key={cafe.id}
                onClick={() => { setSelectedCafe(cafe); setQuery(''); setHoveredId(null); }}
                onMouseEnter={() => setHoveredId(cafe.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  background: isDark ? '#252525' : '#ffffff',
                  border: isDark ? '1px solid #000000' : 'none',
                  borderRadius: 12, height: 44, marginTop: 4,
                  display: 'flex', alignItems: 'center', paddingLeft: 10, paddingRight: 10,
                  cursor: 'pointer', gap: 8, transition: 'background 0.12s',
                }}
              >
                <span style={{ fontSize: 14, fontWeight: 510, color: isDark ? '#ffffff' : '#252525', lineHeight: '17.5px' }}>{cafe.name}</span>
                <span style={{ fontSize: 12, fontWeight: 510, color: isDark ? '#e9e9e9' : 'rgba(3,24,50,0.46)', lineHeight: '15px' }}>{cafe.address}</span>
              </div>
            );
          })}
        </div>

        {/* 구분선 */}
        <div style={{ height: 1, background: 'rgba(0,27,55,0.1)' }} />

        {/* 편의시설 칩 */}
        <div style={{ padding: '24px 20px 0', background: '#f3f3f3' }}>
          {Object.entries(CHIP_OPTIONS).map(([category, options]) => (
            <div key={category} style={{ marginBottom: 20 }}>
              <p style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#000000', marginBottom: 10, margin: '0 0 10px 0' }}>{category}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {options.map(opt => {
                  const isSel = chips[category] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleChip(category, opt)}
                      style={{
                        flex: 1, height: 40, borderRadius: 20,
                        border: 'none',
                        background: isSel ? '#252525' : '#E7E8EB',
                        fontSize: 14, fontWeight: isSel ? 700 : 400,
                        color: isSel ? '#ffffff' : '#6B7684',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 구분선 */}
        <div style={{ height: 1, background: 'rgba(0,27,55,0.1)' }} />

        {/* 사진 첨부 */}
        <div style={{ padding: '20px 20px 0', background: '#f3f3f3' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#000000' }}>사진 첨부</span>
            <span style={{ fontSize: 13, color: '#B0B8C1' }}>{photos.length}/5</span>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {!readOnly && photos.length < 5 && (
              <button
                onClick={() => setShowPhotoSheet(true)}
                style={{
                  width: 80, height: 80, borderRadius: 10, flexShrink: 0,
                  border: '1.5px dashed #C9CDD2', background: '#F3F3F3',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 11, color: '#B0B8C1' }}>사진 추가</span>
              </button>
            )}
            {readOnly && photos.length === 0 && (
              <span style={{ fontSize: 13, color: '#B0B8C1', padding: '8px 0' }}>첨부된 사진이 없어요</span>
            )}
            {photos.map((uri, i) => (
              <img key={i} src={uri} alt="" style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
            ))}
          </div>
        </div>

        {/* 사진 선택 바텀시트 (SheetMenuRow + SheetCTA 통일) */}
        {showPhotoSheet && (() => {
          const onGallery = async () => {
            try {
              const remaining = 5 - photos.length;
              const res = await fetchAlbumPhotos({ maxCount: remaining, maxWidth: 1024, base64: true });
              setPhotos(prev => [...prev, ...res.map(r => 'data:image/jpeg;base64,' + r.dataUri)].slice(0, 5));
            } catch {}
            setShowPhotoSheet(false);
          };
          const onCamera = async () => {
            try {
              const result = await openCamera({ base64: true, maxWidth: 1024 });
              setPhotos(prev => [...prev, 'data:image/jpeg;base64,' + result.dataUri].slice(0, 5));
            } catch {}
            setShowPhotoSheet(false);
          };
          const IconGallery = (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M16.003 10.668C15.7647 10.6736 15.5277 10.6314 15.3059 10.5441C15.0841 10.4567 14.8821 10.3259 14.7116 10.1593C14.5411 9.99272 14.4057 9.79372 14.3132 9.57402C14.2207 9.35432 14.1732 9.11835 14.1732 8.87999C14.1733 8.64163 14.221 8.40568 14.3136 8.18604C14.4062 7.96639 14.5417 7.76747 14.7123 7.60097C14.8829 7.43448 15.085 7.30377 15.3069 7.21653C15.5287 7.1293 15.7657 7.0873 16.004 7.093C16.4708 7.10417 16.9146 7.29747 17.2407 7.63158C17.5669 7.96569 17.7494 8.4141 17.7492 8.88099C17.7491 9.34787 17.5663 9.79619 17.24 10.1301C16.9137 10.464 16.4698 10.6571 16.003 10.668ZM14.279 16.78H8.255C8.04261 16.7803 7.83407 16.7233 7.6513 16.6152C7.46853 16.507 7.31828 16.3515 7.21637 16.1652C7.11445 15.9789 7.06462 15.7685 7.07212 15.5562C7.07962 15.344 7.14418 15.1377 7.259 14.959L10.272 10.264C10.3789 10.097 10.5261 9.95955 10.7001 9.86435C10.8741 9.76916 11.0692 9.71926 11.2675 9.71926C11.4658 9.71926 11.6609 9.76916 11.8349 9.86435C12.0089 9.95955 12.1561 10.097 12.263 10.264L15.274 14.959C15.3888 15.1376 15.4533 15.3438 15.4609 15.556C15.4684 15.7682 15.4187 15.9785 15.3169 16.1648C15.2151 16.3511 15.065 16.5065 14.8823 16.6148C14.6997 16.723 14.4913 16.7801 14.279 16.78ZM19.287 2.25H4.713C4.05977 2.25 3.4333 2.50949 2.9714 2.9714C2.50949 3.4333 2.25 4.05977 2.25 4.713V19.287C2.25 19.9402 2.50949 20.5667 2.9714 21.0286C3.4333 21.4905 4.05977 21.75 4.713 21.75H19.287C19.9402 21.75 20.5667 21.4905 21.0286 21.0286C21.4905 20.5667 21.75 19.9402 21.75 19.287V4.713C21.75 4.05977 21.4905 3.4333 21.0286 2.9714C20.5667 2.50949 19.9402 2.25 19.287 2.25Z" fill="#141414"/></svg>
          );
          const IconCamera = (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12.0002 18.2662C10.6094 18.2646 9.27595 17.7114 8.29248 16.7279C7.30901 15.7444 6.7558 14.411 6.75421 13.0202C6.75553 11.6292 7.30863 10.2955 8.29213 9.3118C9.27563 8.32811 10.6092 7.77476 12.0002 7.77317C13.3912 7.77476 14.7248 8.32811 15.7083 9.3118C16.6918 10.2955 17.2449 11.6292 17.2462 13.0202C17.2446 14.411 16.6914 15.7444 15.7079 16.7279C14.7245 17.7114 13.391 18.2646 12.0002 18.2662ZM20.1132 5.13517H17.1592L16.0462 2.96617C15.8697 2.6228 15.602 2.33473 15.2724 2.13362C14.9429 1.9325 14.5643 1.82612 14.1782 1.82617H9.76521C9.37154 1.82613 8.98579 1.93673 8.65196 2.14538C8.31813 2.35402 8.04967 2.65229 7.87721 3.00617L6.84121 5.13517H3.88721C3.5562 5.13504 3.2284 5.20013 2.92254 5.32671C2.61669 5.45329 2.33876 5.63889 2.10466 5.87291C1.87055 6.10693 1.68483 6.38477 1.55813 6.69058C1.43143 6.99638 1.36621 7.32416 1.36621 7.65517V19.2562C1.36621 19.5872 1.43143 19.915 1.55813 20.2208C1.68483 20.5266 1.87055 20.8044 2.10466 21.0384C2.33876 21.2725 2.61669 21.4581 2.92254 21.5846C3.2284 21.7112 3.5562 21.7763 3.88721 21.7762H20.1132C20.4442 21.7763 20.772 21.7112 21.0779 21.5846C21.3837 21.4581 21.6617 21.2725 21.8958 21.0384C22.1299 20.8044 22.3156 20.5266 22.4423 20.2208C22.569 19.915 22.6342 19.5872 22.6342 19.2562V7.65517C22.6342 7.32416 22.569 6.99638 22.4423 6.69058C22.3156 6.38477 22.1299 6.10693 21.8958 5.87291C21.6617 5.63889 21.3837 5.45329 21.0779 5.32671C20.772 5.20013 20.4442 5.13504 20.1132 5.13517Z" fill="#141414"/></svg>
          );
          return (
            <>
              <div onClick={() => setShowPhotoSheet(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200 }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#f3f3f3', borderRadius: '20px 20px 0 0', paddingTop: 20, paddingBottom: 'max(16px, env(safe-area-inset-bottom))', zIndex: 201 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: '#E5E8EB', margin: '0 auto 20px' }} />
                <p style={{ fontSize: 16, fontWeight: 700, color: '#191F28', padding: '0 20px', marginBottom: 4 }}>사진 추가</p>
                <SheetMenuRow icon={IconGallery} label="갤러리에서 선택" onClick={onGallery} />
                <SheetMenuRow icon={IconCamera} label="카메라로 촬영" onClick={onCamera} />
                <SheetCTA.Single label="닫기" onClick={() => setShowPhotoSheet(false)} variant="secondary" background="#F3F3F3" />
              </div>
            </>
          );
        })()}

        {/* 리뷰 작성 */}
        <div style={{ padding: '20px', background: '#f3f3f3' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#191F28' }}>리뷰 작성</p>
            <span style={{ fontSize: 13, color: reviewText.length >= 10 ? '#252525' : '#B0B8C1' }}>
              {reviewText.length}/200
            </span>
          </div>
          <textarea
            value={reviewText}
            onChange={e => { if (!readOnly && e.target.value.length <= 200) setReviewText(e.target.value); }}
            placeholder="제보하려는 카페에서 좋았던 점을 작성해 주세요 (최소 10자 이상 입력)"
            rows={6}
            readOnly={readOnly}
            style={{
              width: '100%',
              border: '1.5px solid #E5E8EB', borderRadius: 12,
              padding: '14px', fontSize: 14, color: '#191F28',
              lineHeight: 1.6, resize: 'none', outline: 'none',
              fontFamily: 'inherit', boxSizing: 'border-box',
              background: '#FAFBFC', transition: 'border-color 0.15s',
            }}
            onFocus={e => { if (!readOnly) { e.target.style.borderColor = '#252525'; e.target.style.background = 'white'; } }}
            onBlur={e => { e.target.style.borderColor = '#E5E8EB'; e.target.style.background = '#FAFBFC'; }}
          />
          {reviewText.length > 0 && reviewText.length < 10 && (
            <p style={{ fontSize: 12, color: '#FF6B6B', marginTop: 6 }}>
              최소 10자 이상 입력해주세요 ({10 - reviewText.length}자 더 필요)
            </p>
          )}
        </div>

      </div>

      {/* ── 하단 고정: 제보하기 CTA — 뷰 모드에선 숨김 ── */}
      {!readOnly && (() => {
        const allChipsSelected = Object.keys(CHIP_OPTIONS).every(cat => !!chips[cat]);
        const canSubmit = allChipsSelected && reviewText.trim().length >= 10;
        return (
          <FocusBottomCTA.Single
            label="제보하기"
            onClick={() => canSubmit && setShowSubmitDialog(true)}
            disabled={!canSubmit}
          />
        );
      })()}

      {/* 제보 접수 확인 다이얼로그 */}
      <ConfirmDialog
        open={showSubmitDialog}
        title={<ConfirmDialog.Title>카페가 접수되었어요!</ConfirmDialog.Title>}
        description={
          <ConfirmDialog.Description>
            {`운영진의 검토 후 영업일 3일 내로\n카페가 등록될 예정이에요`}
          </ConfirmDialog.Description>
        }
        cancelButton={<ConfirmDialog.CancelButton onClick={() => setShowSubmitDialog(false)}>제보 취소</ConfirmDialog.CancelButton>}
        confirmButton={<ConfirmDialog.ConfirmButton onClick={async () => {
          await insertCafeReport({
            user_id: userId,
            store_name: selectedCafe?.name ?? directName ?? '',
            outlet_status: chips['콘센트'] || null,
            seat_status: chips['좌석'] || null,
            noise_status: chips['소음'] || null,
            content: reviewText,
            photos,
          });
          setShowSubmitDialog(false);
          onSubmitted?.();   // 부모(MyPage) 가 카운트 재조회
          onClose();
        }}>확인</ConfirmDialog.ConfirmButton>}
        onClose={() => setShowSubmitDialog(false)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 메인: 마이페이지
// ─────────────────────────────────────────────────────────────
export default function MyPage({
  onDetailOpen,
  initialSubPage,
  onSubPageChange,
  onRegisterBack,
  subViewRef,
}: {
  onDetailOpen?: (id: string) => void;
  initialSubPage?: SubPage | null;
  onSubPageChange?: (page: SubPage | null) => void;
  onRegisterBack?: (fn: (() => void) | null) => void;
  subViewRef?: RefObject<HTMLDivElement> | null;
} = {}) {
  const [tab, setTab] = useState<MyTab>('내 활동');
  const [subPage, setSubPage] = useState<SubPage | null>(initialSubPage ?? null);

  const changeSubPage = (page: SubPage | null) => {
    setSubPage(page);
    onSubPageChange?.(page);
  };

  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  /** 제보한 카페 리스트에서 클릭한 제보 — 뷰 모드로 ReportCafePage 표시 */
  const [viewingReport, setViewingReport] = useState<UserReportRow | null>(null);

  const { userId } = useFavorites();
  const [reportCount, setReportCount] = useState(0);
  const [reportRefreshTrigger, setReportRefreshTrigger] = useState(0);
  useEffect(() => {
    if (!userId) return;
    fetchUserReports(userId).then(rows => setReportCount(rows.length));
  }, [userId, reportRefreshTrigger]);

  // 부모(App.tsx)에 엣지스와이프용 back 핸들러 등록
  // 리뷰 작성·수정, 카페 제보, 리뷰 편집 중에는 폼 데이터 손실 방지를 위해 비활성화
  const SWIPE_DISABLED_PAGES: SubPage[] = ['review-edit', 'report-cafe'];
  useEffect(() => {
    const disabled = subPage === null || SWIPE_DISABLED_PAGES.includes(subPage) || !!editingReview;
    if (!disabled) {
      onRegisterBack?.(() => changeSubPage(null));
    } else {
      onRegisterBack?.(null);
    }
    return () => onRegisterBack?.(null);
  }, [subPage, editingReview]); // eslint-disable-line react-hooks/exhaustive-deps
  const [versionToast, setVersionToast] = useState(false);
  const [showMoreSheet, setShowMoreSheet] = useState(false);
  const { nickname, updateNickname } = useFavorites();
  const [displayName, setDisplayName] = useState(nickname ?? '카페인덱서');
  useEffect(() => { if (nickname) setDisplayName(nickname); }, [nickname]);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [showNameSheet, setShowNameSheet] = useState(false);
  const [draftName, setDraftName] = useState('');


  const showVersionToast = () => {
    setVersionToast(true);
    setTimeout(() => setVersionToast(false), 2000);
  };

  // ── 메인 + 서브페이지 (absolute overlay 방식) ────────────
  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>

    {/* 메인 마이페이지 — 항상 렌더링 (서브페이지 스와이프백 시 배경으로 보임) */}
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#f3f3f3', overflow: 'hidden',
    }}>
      {/* 스크롤 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }}>
        {/* 프로필 */}
        <div style={{ padding: '24px', background: '#f3f3f3', display: 'flex', gap: 16, alignItems: 'center' }}>
          {/* 프로필 원형 60×60 */}
          <div style={{
            width: 60, height: 60, borderRadius: 1000,
            background: '#d2d2d2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#101010', lineHeight: 1 }}>{displayName[0]}</span>
          </div>
          {/* 이름 + 정보 + 제보하기 배지 */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 18, fontWeight: 510, color: '#101010', lineHeight: '23px' }}>{displayName}</span>
              <button
                onClick={() => { setDraftName(displayName); setShowNameSheet(true); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path fill="#9b9b9b" fillRule="evenodd" d="m12.335 5.454-9.062 9.062-1.236 4.61-.813 3.037a.501.501 0 0 0 .613.613l3.035-.814 4.61-1.236h.002l9.062-9.062zm9.958 1.05-4.796-4.797a1 1 0 0 0-1.414 0l-2.475 2.474 6.21 6.211 2.475-2.475a1 1 0 0 0 0-1.414" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                onClick={() => changeSubPage('reported')}
                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
              >
                <span style={{ fontSize: 14, fontWeight: 510, color: '#9b9b9b', lineHeight: '18px' }}>제보한 카페</span>
                <span style={{ fontSize: 14, fontWeight: 510, color: '#101010', lineHeight: '18px' }}>{reportCount}개</span>
              </div>
              <div style={{ flex: 1 }} />
              <button
                onClick={() => changeSubPage('report-cafe')}
                style={{
                  background: '#252525', borderRadius: 13,
                  height: 29, padding: '0 10px',
                  fontSize: 12, fontWeight: 510, color: '#ffffff',
                  border: 'none', cursor: 'pointer', lineHeight: '21px',
                }}
              >
                제보하기
              </button>
            </div>
          </div>
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
              <MenuRow label="제보한 카페" onTap={() => changeSubPage('reported')} />
              <MenuRow label="최근 본 카페" onTap={() => changeSubPage('recent')} />
              <MenuRow label="작성한 리뷰" onTap={() => changeSubPage('reviews')} />
            </>
          ) : (
            <>
              <MenuRow label="공지사항" onTap={() => changeSubPage('notices')} />
              <div style={{ position: 'relative' }}>
                <MenuRow label="문의하기" onTap={() => setShowContactPopup(v => !v)} />
                {showContactPopup && (
                  <>
                    {/* 외부 클릭 닫기 */}
                    <div
                      onClick={() => setShowContactPopup(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 299 }}
                    />
                    {/* 말풍선 팝업 */}
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 8px)', left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 300,
                      background: '#FFFFFF',
                      borderRadius: 14,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                      padding: '16px 0 8px',
                      minWidth: 220,
                      width: 'calc(100vw - 80px)',
                      maxWidth: 280,
                    }}>
                      {/* 꼬리 */}
                      <div style={{
                        position: 'absolute', top: -7, left: '50%', transform: 'translateX(-50%)',
                        width: 14, height: 7,
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: 14, height: 14,
                          background: '#FFFFFF',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                          transform: 'rotate(45deg)',
                          transformOrigin: 'bottom center',
                          marginTop: 3,
                          marginLeft: 0,
                          borderRadius: 2,
                        }} />
                      </div>
                      {/* 이메일 주소 */}
                      <p style={{
                        textAlign: 'center', fontSize: 13, color: '#8B95A1',
                        fontWeight: 500, marginBottom: 10, padding: '0 16px',
                      }}>
                        juliesba1015@gmail.com
                      </p>
                      {/* Gmail 버튼 */}
                      <button
                        onClick={() => {
                          setShowContactPopup(false);
                          openURL('https://mail.google.com/mail/?view=cm&to=juliesba1015@gmail.com');
                        }}
                        style={{
                          display: 'block', width: 'calc(100% - 24px)', margin: '0 12px 8px',
                          background: '#F2F2F7', border: 'none', borderRadius: 10,
                          padding: '13px 0', fontSize: 15, fontWeight: 500, color: '#1C1C1E',
                          cursor: 'pointer', textAlign: 'center',
                        }}
                      >
                        Gmail
                      </button>
                      {/* 이메일 주소 복사 버튼 */}
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText('juliesba1015@gmail.com').then(() => {
                            setShowContactPopup(false);
                            setCopiedToast(true);
                            setTimeout(() => setCopiedToast(false), 2000);
                          });
                        }}
                        style={{
                          display: 'block', width: 'calc(100% - 24px)', margin: '0 12px 8px',
                          background: '#F2F2F7', border: 'none', borderRadius: 10,
                          padding: '13px 0', fontSize: 15, fontWeight: 500, color: '#1C1C1E',
                          cursor: 'pointer', textAlign: 'center',
                        }}
                      >
                        이메일 주소 복사
                      </button>
                    </div>
                  </>
                )}
              </div>
              <MenuRow
                label="버전 관리"
                dimmed
                onTap={showVersionToast}
                right={<span style={{ fontSize: 14, color: '#C9CDD2' }}>v1</span>}
              />
              <MenuRow
                label="회원탈퇴"
                dimmed
                onTap={() => setShowWithdrawDialog(true)}
              />
            </>
          )}
        </div>

        <div style={{ height: 40 }} />
      </div>

      {/* 버전 토스트 */}
      {/* 버전 토스트 */}
      <Toast
        open={versionToast}
        position="top"
        text="현재 최신 버전을 사용 중입니다"
        onClose={() => setVersionToast(false)}
      />

      {/* 이메일 복사 토스트 */}
      <Toast
        open={copiedToast}
        position="top"
        text="이메일 주소가 복사되었어요"
        onClose={() => setCopiedToast(false)}
      />

      {/* 더보기 드롭다운 팝업 */}
      {showMoreSheet && (
        <>
          {/* 외부 클릭 시 닫기 — 투명 backdrop */}
          <div
            onClick={() => setShowMoreSheet(false)}
            style={{ position: 'absolute', inset: 0, zIndex: 199 }}
          />
          {/* 팝업 본체 — DetailPage MorePopup과 동일한 디자인 */}
          <div style={{
            position: 'absolute', top: 52, right: 16, zIndex: 200,
            background: 'rgba(253,253,254,0.89)',
            backdropFilter: 'blur(11px)',
            WebkitBackdropFilter: 'blur(11px)',
            borderRadius: 20,
            border: '1px solid rgba(253,253,255,0.75)',
            boxShadow: '0 16px 60px rgba(0,27,55,0.10)',
            minWidth: 180, padding: 4, overflow: 'hidden',
          }}>
            <div style={{ padding: '10px 14px 6px', fontSize: 12, fontWeight: 600, color: 'rgba(3,18,40,0.35)', letterSpacing: '0.3px' }}>
              메뉴
            </div>
            {[
              { label: '프로필 수정' },
              { label: '계정 설정' },
              { label: '로그아웃' },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => setShowMoreSheet(false)}
                style={{
                  display: 'flex', alignItems: 'center',
                  width: '100%', padding: '12px 14px',
                  borderRadius: 12, textAlign: 'left',
                  background: 'transparent',
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 500, color: 'rgba(3,18,40,0.70)', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* 이름 변경 바텀시트 */}
      <BottomSheet
        open={showNameSheet}
        header={<BottomSheet.Header>변경할 이름</BottomSheet.Header>}
        onClose={() => setShowNameSheet(false)}
        hasTextField
      >
        <div style={{ padding: '8px 20px 16px' }}>
          <input
            autoFocus
            value={draftName}
            onChange={e => { if (e.target.value.length <= 45) setDraftName(e.target.value); }}
            onKeyDown={e => {
              if (e.key === 'Enter' && draftName.trim() && draftName.trim() !== displayName) {
                const name = draftName.trim();
                setDisplayName(name);
                updateNickname(name);
                setShowNameSheet(false);
              }
            }}
            maxLength={45}
            placeholder={displayName}
            style={{
              width: '100%', height: 48, borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.12)',
              padding: '0 14px', fontSize: 17, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
            <span style={{ fontSize: 12, color: 'rgba(0,19,43,0.38)' }}>{draftName.length}/45</span>
          </div>
        </div>
        <Button
          color="primary"
          size="xlarge"
          style={{ width: '100%' }}
          onClick={() => { const name = draftName.trim(); setDisplayName(name); updateNickname(name); setShowNameSheet(false); }}
          disabled={!draftName.trim() || draftName.trim() === displayName}
        >
          적용하기
        </Button>
      </BottomSheet>

      {/* 회원탈퇴 확인 다이얼로그 — open={false} 시에도 DOM 마운트되면 TDS backdrop이 터치를 차단하므로 조건부 마운트 */}
      {showWithdrawDialog && (
        <ConfirmDialog
          open={showWithdrawDialog}
          title={<ConfirmDialog.Title>정말 탈퇴하시겠어요?</ConfirmDialog.Title>}
          description={
            <ConfirmDialog.Description>
              {'탈퇴하면 저장된 찜 목록, 모음집,\n작성한 리뷰가 모두 삭제돼요.'}
            </ConfirmDialog.Description>
          }
          cancelButton={
            <ConfirmDialog.CancelButton onClick={() => setShowWithdrawDialog(false)}>
              취소
            </ConfirmDialog.CancelButton>
          }
          confirmButton={
            <ConfirmDialog.ConfirmButton onClick={async () => {
              setShowWithdrawDialog(false);
              const ok = await deleteUserData(userId);
              if (ok) {
                // localStorage 의 토스 익명 ID 도 제거 (없으면 동일 ID 재발급되어 다시 매칭됨)
                try { localStorage.removeItem('cafeindex_anon_id'); } catch { /* noop */ }
                // 앱 전체 재시작 — 새 익명 세션 + 새 user row 생성
                window.location.reload();
              }
            }}>
              탈퇴하기
            </ConfirmDialog.ConfirmButton>
          }
          onClose={() => setShowWithdrawDialog(false)}
        />
      )}
    </div>
    {/* ── 서브페이지 오버레이 (스와이프 애니메이션 지원) ── */}
    {subPage === 'reported' && (
      <div ref={subViewRef ?? undefined} style={{ position: 'absolute', inset: 0, background: '#f3f3f3' }}>
        <ReportedCafePage
          onBack={() => changeSubPage(null)}
          onClose={() => changeSubPage(null)}
          onReportView={(report) => setViewingReport(report)}
        />
      </div>
    )}
    {/* 제보 내용 보기 — 사용자가 작성했던 제보 폼을 읽기 전용으로 표시 */}
    {viewingReport && (
      <div style={{ position: 'absolute', inset: 0, background: '#f3f3f3', zIndex: 10 }}>
        <ReportCafePage
          onBack={() => setViewingReport(null)}
          onClose={() => setViewingReport(null)}
          initialReport={viewingReport}
        />
      </div>
    )}
    {subPage === 'recent' && (
      <div ref={subViewRef ?? undefined} style={{ position: 'absolute', inset: 0, background: '#f3f3f3' }}>
        <RecentCafePage onBack={() => changeSubPage(null)} onClose={() => changeSubPage(null)} onDetailOpen={onDetailOpen} />
      </div>
    )}
    {subPage === 'reviews' && (
      <div ref={subViewRef ?? undefined} style={{ position: 'absolute', inset: 0, background: '#f3f3f3' }}>
        <WrittenReviewPage
          onBack={() => changeSubPage(null)}
          onClose={() => changeSubPage(null)}
          onEdit={review => setEditingReview(review)}
          refreshTrigger={reviewRefreshTrigger}
        />
      </div>
    )}
    {/* 스와이프 비활성 페이지 — ref 없음 */}
    {subPage === 'report-cafe' && (
      <div style={{ position: 'absolute', inset: 0, background: '#f3f3f3' }}>
        <ReportCafePage
          onBack={() => changeSubPage(null)}
          onClose={() => changeSubPage(null)}
          onSubmitted={() => setReportRefreshTrigger(t => t + 1)}
        />
      </div>
    )}
    {subPage === 'notices' && (
      <div style={{ position: 'absolute', inset: 0, background: '#f3f3f3' }}>
        <NoticesPage onBack={() => changeSubPage(null)} />
      </div>
    )}
    {editingReview && (
      <div style={{ position: 'absolute', inset: 0 }}>
        <ReviewEditPage
          review={editingReview}
          onBack={() => setEditingReview(null)}
          onClose={() => { setEditingReview(null); changeSubPage(null); }}
          onSave={async (text, photos) => {
            if (editingReview) {
              await updateReview(editingReview.id, text, photos);
              setReviewRefreshTrigger(t => t + 1);
            }
            setEditingReview(null);
          }}
        />
      </div>
    )}
    </div>
  );
}
