import React from 'react';
import IcPencil from '../../assets/icons/icon_pencil.svg?react';
import IcArrowUpDown from '../../assets/icons/icon_arrowupdown.svg?react';
import { IcOutletMini, IcSeatMini } from './icons';

// ─── 공통 매장 타입 ───────────────────────────────────────────
export interface StoreItem {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  badge?: string;
  photos: string[];
  memo?: string;
  distance?: number;
  /** 폐업/휴업 시점 — 채워져 있으면 카드에 "폐업" 표시 */
  closedAt?: string | null;
  /** 좌석 규모 — '소형' | '중형' | '대형' */
  seatStatus?: string;
  /** 콘센트 상태 — '부족' | '적당' | '넉넉' */
  outletStatus?: string;
  /** vibe_tags 파싱 결과 (조명 태그 먼저, 그 다음 무드 태그 순) */
  badges?: string[];
}

interface StoreCardProps {
  store: StoreItem;
  isEditMode?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  /** 하트 채움 여부 (기본값 true = 항상 채워진 하트) */
  heartFilled?: boolean;
  /** 하트 버튼 표시 여부 (기본값 true) */
  showHeart?: boolean;
  /** 메모 영역 표시 여부 (기본값 false) */
  showMemo?: boolean;
  /** 우측 상단에 하트 대신 체크서클만 표시 (드래그 없음) — 컬렉션에 매장 추가 바텀시트 전용 */
  selectionMode?: boolean;
  onSelect?: (id: string) => void;
  onPress?: (id: string) => void;
  onHandleDrag?: (e: React.PointerEvent<HTMLDivElement>) => void;
  onHeartTap?: (id: string) => void;
  onMemoTap?: (id: string) => void;
  onPhotoMore?: () => void;
}

export default function StoreCardCollection({
  store,
  isEditMode = false,
  isSelected = false,
  isDragging = false,
  isDragOver = false,
  heartFilled = true,
  showHeart = true,
  showMemo = false,
  selectionMode = false,
  onSelect,
  onPress,
  onHandleDrag,
  onHeartTap,
  onMemoTap,
  onPhotoMore,
}: StoreCardProps) {
  return (
    <div
      onClick={() => { if (isEditMode || selectionMode) onSelect?.(store.id); }}
      style={{
        cursor: (isEditMode || selectionMode) ? 'pointer' : 'default',
        opacity: isDragging ? 0.4 : (isEditMode && !isSelected ? 0.7 : 1),
        borderTop: isDragOver ? '2px solid #252525' : '2px solid transparent',
        transition: 'opacity 0.15s',
        userSelect: 'none',
      }}
    >
      <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'flex-start' }}>
        {/* 편집 모드 체크박스 */}
        {isEditMode && (
          <button
            type="button"
            aria-label={isSelected ? '선택 해제' : '선택'}
            aria-pressed={isSelected}
            onClick={(e) => { e.stopPropagation(); onSelect?.(store.id); }}
            style={{
              width: 24, height: 24, flexShrink: 0, marginRight: 10, marginTop: 2,
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              {isSelected ? (
                <>
                  <circle cx="12" cy="12" r="12" fill="#252525" />
                  <path d="M7 12l3.5 3.5L17 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </>
              ) : (
                <>
                  <circle cx="12" cy="12" r="11" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" fill="none" />
                  <path d="M7 12l3.5 3.5L17 8" stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </>
              )}
            </svg>
          </button>
        )}

        {/* 메인 콘텐츠 */}
        <div
          style={{ flex: 1, minWidth: 0, cursor: (isEditMode || selectionMode) ? 'default' : 'pointer' }}
          onClick={(e) => { if (!isEditMode && !selectionMode) { e.stopPropagation(); onPress?.(store.id); } }}
        >
          {/* 이름 / 주소 / 거리·리뷰 + 우측 버튼 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <p style={{
                  fontWeight: 600, fontSize: 16,
                  color: store.closedAt ? '#8B95A1' : '#191F28',
                  lineHeight: '23px',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1, minWidth: 0,
                  textDecoration: store.closedAt ? 'line-through' : 'none',
                }}>
                  {store.name}
                </p>
                {store.closedAt && (
                  <span style={{
                    flexShrink: 0,
                    padding: '2px 6px',
                    borderRadius: 6,
                    background: '#FFE5E5',
                    color: '#D6403C',
                    fontSize: 10,
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}>
                    폐업
                  </span>
                )}
              </div>
              <p style={{
                fontWeight: 510, fontSize: 13, color: '#6B7684', lineHeight: '17.6px',
                marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {store.address}
              </p>
              {(store.seatStatus || store.outletStatus) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#6B7684' }}>
                  {store.seatStatus && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <IcSeatMini /> 좌석 {store.seatStatus}
                    </span>
                  )}
                  {store.seatStatus && store.outletStatus && <span>·</span>}
                  {store.outletStatus && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <IcOutletMini /> 콘센트 {store.outletStatus}
                    </span>
                  )}
                </div>
              )}
              {store.badges && store.badges.length > 0 && (
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 3 }}>
                  {store.badges.map((badge, i) => (
                    <span
                      key={i}
                      style={{
                        display: 'inline-block',
                        padding: '0px 8px',
                        background: '#D1D6DB',
                        borderRadius: 20,
                        fontSize: 12,
                        color: '#4E5968',
                      }}
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 편집모드: 드래그 핸들 / 기본모드: 하트 */}
            {isEditMode ? (
              <div
                onPointerDown={onHandleDrag}
                style={{
                  width: 44, height: 44, flexShrink: 0, marginLeft: 4, marginTop: -11,
                  cursor: 'grab', touchAction: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <IcArrowUpDown width={22} height={22} style={{ color: 'rgba(0,29,58,0.18)' }} />
              </div>
            ) : selectionMode ? (
              <button
                type="button"
                aria-label={isSelected ? '선택 해제' : '선택'}
                aria-pressed={isSelected}
                onClick={(e) => { e.stopPropagation(); onSelect?.(store.id); }}
                style={{
                  width: 44, height: 44, flexShrink: 0, marginLeft: 4, marginTop: -11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  {isSelected ? (
                    <>
                      <circle cx="12" cy="12" r="12" fill="#252525" />
                      <path d="M7 12l3.5 3.5L17 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  ) : (
                    <>
                      <circle cx="12" cy="12" r="11" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" fill="none" />
                      <path d="M7 12l3.5 3.5L17 8" stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  )}
                </svg>
              </button>
            ) : showHeart ? (
              <button
                type="button"
                aria-label={heartFilled ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                aria-pressed={heartFilled}
                onClick={(e) => { e.stopPropagation(); onHeartTap?.(store.id); }}
                style={{
                  width: 44, height: 44, flexShrink: 0, marginLeft: 4, marginTop: -11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path
                    fillRule="evenodd" clipRule="evenodd"
                    d="M10.9038 21.2884C11.5698 21.7284 12.4288 21.7284 13.0938 21.2884C15.2088 19.8924 19.8138 16.5554 21.7978 12.8214C24.4128 7.89542 21.3418 2.98242 17.2818 2.98242C14.9678 2.98242 13.5758 4.19142 12.8058 5.23042C12.4818 5.67542 11.8588 5.77442 11.4128 5.45042C11.3278 5.38942 11.2538 5.31442 11.1928 5.23042C10.4228 4.19142 9.03076 2.98242 6.71676 2.98242C2.65676 2.98242 -0.414244 7.89542 2.20176 12.8214C4.18376 16.5554 8.79076 19.8924 10.9038 21.2884Z"
                    fill={heartFilled ? '#252525' : '#D1D6DB'}
                  />
                </svg>
              </button>
            ) : null}
          </div>

          {/* 이미지 — 가로 스크롤 (최대 10장, 초과 시 마지막에 더보기) */}
          <div
            style={{ overflowX: 'auto', scrollbarWidth: 'none' } as React.CSSProperties}
            onWheel={(e) => { e.preventDefault(); (e.currentTarget as HTMLDivElement).scrollLeft += e.deltaY; }}
          >
            <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
              {(() => {
                const total = store.photos.length;
                const count = Math.min(total, 10);
                return Array.from({ length: count }, (_, idx) => {
                  const isLast = idx === 9 && total >= 10;
                  const showOverlay = isLast && !isEditMode;
                  return (
                    <div
                      key={idx}
                      onClick={!isLast && !isEditMode && !selectionMode
                        ? (e) => { e.stopPropagation(); onPress?.(store.id); }
                        : undefined}
                      style={{
                        position: 'relative', width: 80, height: 80, borderRadius: 4,
                        flexShrink: 0, overflow: 'hidden',
                        backgroundColor: store.photos[idx] ? undefined : '#E8EDF4',
                        cursor: !isLast && !isEditMode && !selectionMode ? 'pointer' : 'default',
                      }}
                    >
                      {store.photos[idx] && (
                        <img
                          src={store.photos[idx]}
                          alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                      {showOverlay && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onPhotoMore?.(); }}
                          style={{
                            position: 'absolute', inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: 'none', cursor: 'pointer', borderRadius: 4,
                          }}
                        >
                          <span style={{ fontWeight: 510, fontSize: 14, color: '#ffffff' }}>더보기</span>
                        </button>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* 메모 영역 (showMemo=true이고 편집모드/선택모드 아닐 때만) */}
      {showMemo && !isEditMode && !selectionMode && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px 20px', minHeight: 40, cursor: 'pointer',
          }}
          onClick={(e) => { e.stopPropagation(); onMemoTap?.(store.id); }}
        >
          <IcPencil width={12} height={12} style={{ flexShrink: 0, color: 'rgba(0,19,43,0.38)' }} />
          {store.memo ? (
            <span style={{
              fontWeight: 400, fontSize: 12, color: 'rgba(0,19,43,0.58)',
              lineHeight: '16.2px', flex: 1,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            } as React.CSSProperties}>
              {store.memo}
            </span>
          ) : (
            <span style={{
              fontWeight: 400, fontSize: 12, color: 'rgba(0,19,43,0.25)', lineHeight: '16.2px',
            }}>
              이곳을 기억하고 싶은 특별한 이유를 적어두세요
            </span>
          )}
        </div>
      )}
      {(!showMemo || isEditMode || selectionMode) && <div style={{ paddingBottom: 20 }} />}
    </div>
  );
}
