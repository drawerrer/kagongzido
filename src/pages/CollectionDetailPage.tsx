import { useState, useRef, useEffect, useCallback } from 'react';
import { useFavorites, FavoritedStore, RecentCafe } from '../context/FavoritesContext';
import Snackbar from '../components/Snackbar';
import ShareSheet from '../components/ShareSheet';
import { BottomSheet, ConfirmDialog, BottomCTA, CTAButton, Button, Toast } from '@toss/tds-mobile';
import { graniteEvent } from '@apps-in-toss/web-framework';
import IcPencil from '../assets/icons/icon_pencil.svg?react';
import IcDelete from '../assets/icons/icon_delete.svg?react';
import IcArrowUpDown from '../assets/icons/icon_arrowupdown.svg?react';


// ─── 타입 ─────────────────────────────────────────────────────
interface CollectionStore {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  distance?: number;
  timeLimit: string;
  photos: string[];
  memo: string;
}

// ─── 팝오버 메뉴 ──────────────────────────────────────────────

// ─── 컬렉션 삭제 다이얼로그 ───────────────────────────────────
function DeleteCollectionDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <ConfirmDialog
      open={true}
      title={<ConfirmDialog.Title>컬렉션을 삭제할까요?</ConfirmDialog.Title>}
      description={<ConfirmDialog.Description>만들어둔 컬렉션이 사라져요.{'\n'}담아둔 매장은 전체 모음집에서 계속 볼 수 있어요.</ConfirmDialog.Description>}
      cancelButton={<ConfirmDialog.CancelButton onClick={onCancel}>닫기</ConfirmDialog.CancelButton>}
      confirmButton={<ConfirmDialog.ConfirmButton color="danger" variant="weak" onClick={onConfirm}>삭제하기</ConfirmDialog.ConfirmButton>}
      onClose={onCancel}
    />
  );
}

// ─── 탭(컬렉션) 삭제 다이얼로그 ──────────────────────────────
function DeleteTabDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <ConfirmDialog
      open={true}
      title={<ConfirmDialog.Title>컬렉션을 삭제할까요?</ConfirmDialog.Title>}
      description={<ConfirmDialog.Description>만들어둔 컬렉션이 사라져요.{'\n'}담아둔 매장은 전체 모음집에서 계속 볼 수 있어요.</ConfirmDialog.Description>}
      cancelButton={<ConfirmDialog.CancelButton onClick={onCancel}>닫기</ConfirmDialog.CancelButton>}
      confirmButton={<ConfirmDialog.ConfirmButton color="danger" variant="weak" onClick={onConfirm}>삭제하기</ConfirmDialog.ConfirmButton>}
      onClose={onCancel}
    />
  );
}

// ─── 매장 삭제 다이얼로그 ─────────────────────────────────────
function DeleteStoreDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <ConfirmDialog
      open={true}
      title={<ConfirmDialog.Title>매장을 삭제할까요?</ConfirmDialog.Title>}
      description={<ConfirmDialog.Description>모음집에서 매장이 사라져요.{'\n'}담아둔 컬렉션에서도 함께 지워져요.</ConfirmDialog.Description>}
      cancelButton={<ConfirmDialog.CancelButton onClick={onCancel}>닫기</ConfirmDialog.CancelButton>}
      confirmButton={<ConfirmDialog.ConfirmButton color="danger" variant="weak" onClick={onConfirm}>삭제하기</ConfirmDialog.ConfirmButton>}
      onClose={onCancel}
    />
  );
}

// ─── 메모 바텀시트 ─────────────────────────────────────────────
function MemoSheet({ initialMemo, onApply, onClose }: { initialMemo: string; onApply: (memo: string) => void; onClose: () => void }) {
  const [value, setValue] = useState(initialMemo);
  const MAX = 45;
  const isActive = value.trim().length > 0;

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        backgroundColor: 'rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div style={{ margin: '0 10px' }} onClick={e => e.stopPropagation()}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '28px 28px 0 0', overflow: 'hidden' }}>
          {/* 핸들 */}
          <div style={{ height: 41, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 4, borderRadius: 40, backgroundColor: '#e5e8eb' }} />
          </div>
          {/* 제목 */}
          <div style={{ padding: '0 24px 16px' }}>
            <span style={{ fontWeight: 700, fontSize: 20, color: 'rgba(0,12,30,0.8)' }}>메모</span>
          </div>
          {/* 입력 */}
          <div style={{ padding: '0 24px 16px' }}>
            <div style={{ borderBottom: '1px solid #f2f4f6', paddingBottom: 4 }}>
              <input
                value={value}
                onChange={e => setValue(e.target.value.slice(0, MAX))}
                placeholder="남기고 싶은 메모를 적을 수 있어요"
                style={{
                  width: '100%', border: 'none', outline: 'none',
                  fontWeight: 590, fontSize: 17,
                  color: '#191f28', backgroundColor: 'transparent',
                } as React.CSSProperties}
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <span style={{ fontWeight: 400, fontSize: 12, color: 'rgba(0,19,43,0.38)' }}>{value.length}/{MAX}</span>
            </div>
          </div>
          {/* 적용하기 버튼 */}
          <Button color="primary" size="xlarge" style={{ width: '100%' }} onClick={() => isActive && onApply(value)} disabled={!isActive}>적용하기</Button>
        </div>
      </div>
    </div>
  );
}

// ─── 토스트 ────────────────────────────────────────────────────

// ─── 매장 추가 바텀시트 ─────────────────────────────────────────
function AddStoreSheet({
  availableStores,
  onConfirm,
  onClose,
  onGoHome,
}: {
  availableStores: FavoritedStore[];
  onConfirm: (ids: string[]) => void;
  onClose: () => void;
  onGoHome?: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);
  const touchStartY = useRef(0);
  const dragStartScrollTop = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasSelection = selectedIds.size > 0;

  const scrollToTop = () => {
    requestAnimationFrame(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    });
  };

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // 핸들 터치 드래그 (위: 확장, 아래: 축소)
  const onHandleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onHandleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (dy > 30) { setExpanded(true); scrollToTop(); }
    else if (dy < -30) setExpanded(false);
  };

  // 콘텐츠 터치 — 스크롤 최상단일 때만 시트 확장/축소로 인식
  const onContentTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
    dragStartScrollTop.current = scrollRef.current?.scrollTop ?? 0;
  };
  const onContentTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    const wasAtTop = dragStartScrollTop.current === 0;
    if (!expanded && wasAtTop && dy > 50) { setExpanded(true); scrollToTop(); }
    else if (expanded && wasAtTop && dy < -50) setExpanded(false);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1200,
        backgroundColor: 'rgba(0,0,0,0.4)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: expanded ? '92%' : '55%',
          backgroundColor: '#ffffff',
          borderRadius: '20px 20px 0 0',
          display: 'flex', flexDirection: 'column',
          transition: 'height 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 드래그 핸들 */}
        <div
          onTouchStart={onHandleTouchStart}
          onTouchEnd={onHandleTouchEnd}
          style={{
            height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, cursor: 'grab', touchAction: 'pan-x',
          }}
        >
          <div style={{ width: 36, height: 4, borderRadius: 40, backgroundColor: '#e5e8eb' }} />
        </div>

        {/* 타이틀 */}
        <div style={{ padding: '4px 20px 0', flexShrink: 0 }}>
          <p style={{ fontWeight: 700, fontSize: 20, color: 'rgba(0,12,30,0.8)', marginBottom: 0 }}>
            어떤 매장을 추가할까요?
          </p>
          {hasSelection && (
            <p style={{ fontWeight: 510, fontSize: 14, color: 'rgba(0,19,43,0.45)', marginTop: 4, marginBottom: 0 }}>
              {selectedIds.size}개의 매장을 선택했어요
            </p>
          )}
        </div>

        {/* 매장 리스트 */}
        <div
          ref={scrollRef}
          style={{ flex: 1, overflowY: 'auto', marginTop: 12 }}
          onTouchStart={onContentTouchStart}
          onTouchEnd={onContentTouchEnd}
        >
          {availableStores.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontWeight: 590, fontSize: 14, color: 'rgba(0,19,43,0.45)' }}>
                저장한 매장이 없어요
              </p>
            </div>
          ) : (
            availableStores.map(store => {
              const isSelected = selectedIds.has(store.id);
              return (
                <div
                  key={store.id}
                  onClick={() => toggle(store.id)}
                  onPointerDown={(e) => e.stopPropagation()}
                  style={{ padding: '20px 16px 0', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    {/* 이름·주소·별점 */}
                    <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                      <p style={{ fontWeight: 700, fontSize: 17, color: '#191F28', lineHeight: '23px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {store.name}
                      </p>
                      <p style={{ fontWeight: 510, fontSize: 13, color: '#6B7684', lineHeight: '17.6px', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {store.address}
                      </p>
                      <span style={{ fontWeight: 510, fontSize: 13, color: '#6B7684' }}>
                        {`리뷰 ${store.reviewCount.toLocaleString()}`}
                      </span>
                    </div>
                    {/* 체크 서클 */}
                    <div style={{ flexShrink: 0 }}>
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
                    </div>
                  </div>
                  {/* 사진 10장 — 가로 스크롤 */}
                  <div
                    style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
                    onWheel={(e) => { e.preventDefault(); (e.currentTarget as HTMLDivElement).scrollLeft += e.deltaY; }}
                  >
                    <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
                      {Array.from({ length: 10 }, (_, idx) => {
                        const isLast = idx === 9;
                        return (
                          <div key={idx} style={{
                            position: 'relative', width: 80, height: 80, borderRadius: 4, flexShrink: 0, overflow: 'hidden',
                            backgroundColor: store.photos[idx] ? undefined : ['#D4C4B0','#C4B4A0','#B4A490','#A49480'][idx % 4],
                          }}>
                            {store.photos[idx] && (
                              <img src={store.photos[idx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            )}
                            {isLast && (
                              <div style={{
                                position: 'absolute', inset: 0,
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: 4,
                              }}>
                                <span style={{ fontWeight: 510, fontSize: 14, color: '#ffffff' }}>더보기</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ paddingBottom: 16 }} />
                </div>
              );
            })
          )}

          {/* 새로운 매장 찾아보기 */}
          <div
            onClick={(e) => { e.stopPropagation(); onGoHome?.(); }}
            style={{
              padding: '12px 16px 20px',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              backgroundColor: 'rgba(0,27,55,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="rgba(0,12,30,0.8)" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontWeight: 590, fontSize: 17, color: 'rgba(0,12,30,0.8)' }}>새로운 매장 찾아보기</span>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div style={{
          flexShrink: 0,
          padding: '12px 20px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          backgroundColor: '#ffffff',
        }}>
          {!hasSelection ? (
            /* 선택 없음: 완료 버튼(비활성 스타일, 탭 시 닫힘) */
            <button
              onClick={onClose}
              style={{
                width: '100%', height: 52, borderRadius: 12,
                backgroundColor: 'rgba(0,23,51,0.06)',
                border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 17,
                color: 'rgba(0,12,30,0.25)',
              }}
            >완료</button>
          ) : (
            /* 선택됨: 닫기 + 확인 */
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, height: 52, borderRadius: 12,
                  backgroundColor: 'rgba(0,23,51,0.06)',
                  border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 17,
                  color: 'rgba(0,12,30,0.8)',
                }}
              >닫기</button>
              <button
                onClick={() => onConfirm([...selectedIds])}
                style={{
                  flex: 1, height: 52, borderRadius: 12,
                  backgroundColor: '#252525',
                  border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 17,
                  color: '#ffffff',
                }}
              >확인</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 카드 아이템 ──────────────────────────────────────────────
function StoreCard({
  store,
  isEditMode,
  isSelected,
  heartFilled,
  showHeart = true,
  showMemo = true,
  isDragging = false,
  isDragOver = false,
  onToggleSelect,
  onMemoTap,
  onDetailOpen,
  onHeartTap,
  onPhotoMore,
  onHandleDrag,
}: {
  store: CollectionStore;
  isEditMode: boolean;
  isSelected: boolean;
  heartFilled: boolean;
  showHeart?: boolean;
  showMemo?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  onToggleSelect: (id: string) => void;
  onMemoTap: (id: string) => void;
  onDetailOpen?: (id: string) => void;
  onHeartTap?: (id: string) => void;
  onPhotoMore?: () => void;
  onHandleDrag?: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  const placeholderColors = ['#E8EDF4', '#E8EDF4', '#E8EDF4', '#E8EDF4'];

  return (
    <div
      onClick={() => isEditMode && onToggleSelect(store.id)}
      style={{
        cursor: isEditMode ? 'pointer' : 'default',
        opacity: isDragging ? 0.4 : 1,
        borderTop: isDragOver ? '2px solid #252525' : '2px solid transparent',
        transition: 'opacity 0.15s',
      }}
    >
      <div style={{ padding: '20px 16px 0', display: 'flex', alignItems: 'flex-start' }}>
        {/* 체크박스 (편집모드) */}
        {isEditMode && (
          <button
            type="button"
            aria-label={isSelected ? '선택 해제' : '선택'}
            aria-pressed={isSelected}
            onClick={(e) => { e.stopPropagation(); onToggleSelect(store.id); }}
            style={{ width: 24, height: 24, flexShrink: 0, marginRight: 10, marginTop: 2, background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 0 }}
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
          style={{ flex: 1, minWidth: 0, cursor: isEditMode ? 'default' : 'pointer' }}
          onClick={(e) => { if (!isEditMode) { e.stopPropagation(); onDetailOpen?.(store.id); } }}
        >
          {/* Info + 아이콘 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 17, color: '#191F28', lineHeight: '23px', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {store.name}
              </p>
              <p style={{ fontWeight: 510, fontSize: 13, color: '#6B7684', lineHeight: '17.6px', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {store.address}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontWeight: 510, fontSize: 13, color: '#6B7684' }}>
                  {`리뷰 ${store.reviewCount.toLocaleString()}`}
                </span>
                {store.timeLimit && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: 'rgba(0,27,55,0.1)', borderRadius: 9, padding: '3px 7px' }}>
                    <span style={{ fontWeight: 590, fontSize: 10, color: 'rgba(3,18,40,0.7)' }}>{store.timeLimit}</span>
                  </div>
                )}
              </div>
            </div>
            {/* 편집모드: 순서 핸들 / 기본: 하트(최근 탭만) */}
            {isEditMode ? (
              <div
                onPointerDown={onHandleDrag}
                style={{ width: 44, height: 44, flexShrink: 0, marginLeft: 4, marginTop: -11, cursor: 'grab', touchAction: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <IcArrowUpDown width={22} height={22} style={{ color: 'rgba(0,29,58,0.18)' }} />
              </div>
            ) : showHeart ? (
              <button
                type="button"
                aria-label={heartFilled ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                aria-pressed={heartFilled}
                onClick={(e) => { e.stopPropagation(); onHeartTap?.(store.id); }}
                style={{ width: 44, height: 44, flexShrink: 0, marginLeft: 4, marginTop: -11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd"
                    d="M10.9038 21.2884C11.5698 21.7284 12.4288 21.7284 13.0938 21.2884C15.2088 19.8924 19.8138 16.5554 21.7978 12.8214C24.4128 7.89542 21.3418 2.98242 17.2818 2.98242C14.9678 2.98242 13.5758 4.19142 12.8058 5.23042C12.4818 5.67542 11.8588 5.77442 11.4128 5.45042C11.3278 5.38942 11.2538 5.31442 11.1928 5.23042C10.4228 4.19142 9.03076 2.98242 6.71676 2.98242C2.65676 2.98242 -0.414244 7.89542 2.20176 12.8214C4.18376 16.5554 8.79076 19.8924 10.9038 21.2884Z"
                    fill={heartFilled ? '#252525' : '#D1D6DB'}
                  />
                </svg>
              </button>
            ) : null}
          </div>

          {/* 이미지 10장 — 가로 스크롤 */}
          <div
            style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
            onWheel={(e) => { e.preventDefault(); (e.currentTarget as HTMLDivElement).scrollLeft += e.deltaY; }}
          >
            <div style={{ display: 'flex', gap: 8, width: 'max-content' }}>
              {Array.from({ length: 10 }, (_, idx) => {
                const isLast = idx === 9;
                const showOverlay = isLast && !isEditMode;
                return (
                  <div
                    key={idx}
                    onClick={!isLast && !isEditMode ? (e) => { e.stopPropagation(); onDetailOpen?.(store.id); } : undefined}
                    style={{
                      position: 'relative', width: 80, height: 80, borderRadius: 4, flexShrink: 0, overflow: 'hidden',
                      backgroundColor: store.photos[idx] ? undefined : placeholderColors[idx % 4],
                      cursor: !isLast && !isEditMode ? 'pointer' : 'default',
                    }}
                  >
                    {store.photos[idx] && (
                      <img src={store.photos[idx]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 메모 영역 (최근 탭·편집모드에서는 숨김) */}
      {showMemo && !isEditMode && (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 16px 20px',
            minHeight: 40,
            cursor: isEditMode ? 'default' : 'pointer',
          }}
          onClick={(e) => { if (!isEditMode) { e.stopPropagation(); onMemoTap(store.id); } }}
        >
          <IcPencil width={12} height={12} style={{ flexShrink: 0, color: 'rgba(0,19,43,0.38)' }} />
          {store.memo ? (
            <span style={{
              fontWeight: 400, fontSize: 12, color: 'rgba(0,19,43,0.58)',
              lineHeight: '16.2px', flex: 1,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            } as React.CSSProperties}>{store.memo}</span>
          ) : (
            <span style={{
              fontWeight: 400, fontSize: 12, color: 'rgba(0,19,43,0.25)',
              lineHeight: '16.2px',
            }}>이곳을 기억하고 싶은 특별한 이유를 적어두세요</span>
          )}
        </div>
      )}
      {(!showMemo || isEditMode) && <div style={{ paddingBottom: 20 }} />}
    </div>
  );
}

// ─── 빈 상태 ──────────────────────────────────────────────────
function EmptyState({
  title,
  subtitle,
  buttonLabel,
  buttonIcon,
  onButtonClick,
}: {
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonIcon: React.ReactNode;
  onButtonClick?: () => void;
}) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', paddingTop: 52,
    }}>
      <p style={{
        fontWeight: 590, fontSize: 13, color: '#4e5968',
        textAlign: 'center', lineHeight: '22.5px', margin: 0,
      }}>
        {title}
      </p>
      <p style={{
        fontWeight: 590, fontSize: 13, color: '#4e5968',
        textAlign: 'center', lineHeight: '22.5px', margin: 0,
      }}>
        {subtitle}
      </p>
      <button
        onClick={onButtonClick}
        style={{
          marginTop: 52,
          height: 38,
          borderRadius: 10,
          backgroundColor: 'rgba(211,211,223,0.19)',
          border: 'none', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center',
          padding: '0 16px',
          gap: 6,
          flexShrink: 0,
        }}
      >
        <span style={{ fontWeight: 590, fontSize: 15, color: '#252525', whiteSpace: 'nowrap' }}>{buttonLabel}</span>
        {buttonIcon}
      </button>
    </div>
  );
}

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M12 5v14M5 12h14" stroke="#252525" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
    <path d="M5 12h14M13 6l6 6-6 6" stroke="#252525" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ─── 메인 페이지 ──────────────────────────────────────────────
export default function CollectionDetailPage({
  collectionName,
  collectionId,
  onBack,
  onClose: _onClose,
  onDetailOpen,
  onPhotoMore,
  onCollectionDeleted,
  onGoHome,
}: {
  collectionName: string;
  collectionId: string;
  onBack?: () => void;
  onClose?: () => void;
  onDetailOpen?: (id: string) => void;
  onPhotoMore?: (storeId: string, photos: string[], cafeName: string) => void;
  onCollectionDeleted?: (data: { id: string; name: string; storeIds: string[] }) => void;
  onGoHome?: () => void;
}) {
  const {
    recentlyViewed, favorites, collections,
    removeCollection, removeFavorite, addFavorite, isFavorited,
    addStoresToCollection, removeStoresFromCollection, updateCollectionMemo, updateCollection,
    reorderCollections,
  } = useFavorites();

  const [showShareSheet, setShowShareSheet] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showDeleteCollectionDialog, setShowDeleteCollectionDialog] = useState(false);
  const [showDeleteStoreId, setShowDeleteStoreId] = useState<string | null>(null);
  const [showAddStoreSheet, setShowAddStoreSheet] = useState(false);
  const [memoTargetId, setMemoTargetId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ msg: string; actionLabel?: string; undoFn?: () => void; type?: 'positive' | 'negative' } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const snackbarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 드래그 순서변경 ──
  const [orderedStoreIds, setOrderedStoreIds] = useState<string[]>([]);
  const [dragIndex, setDragIndex] = useState(-1);
  const [dragOverIndex, setDragOverIndex] = useState(-1);
  const storeListRef = useRef<HTMLDivElement>(null);
  const itemRefsArr = useRef<(HTMLDivElement | null)[]>([]);

  const [activeTab, setActiveTab] = useState<string>(collectionId);
  const [tabManageTargetId, setTabManageTargetId] = useState<string | null>(null);
  const [deleteTabTargetId, setDeleteTabTargetId] = useState<string | null>(null);
  const [renameTabId, setRenameTabId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── 칩 드래그 상태 ──
  const [chipDragId, setChipDragId] = useState<string | null>(null);
  const [chipDragOrderState, setChipDragOrderState] = useState<string[]>([]);
  const chipDragOrderRef = useRef<string[]>([]);
  const chipLongPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chipDragPointerIdRef = useRef<number>(-1);
  const chipContainerRef = useRef<HTMLDivElement>(null);

  const isActiveRecent = activeTab === 'recent';

  const activeCollection = collections.find(c => c.id === activeTab);
  const allTabs = [
    { id: 'recent', name: '최근' },
    ...collections
      .filter(c => c.id !== 'recent')
      .map(c => ({ id: c.id, name: c.name })),
  ];

  // 드래그 중이 아닐 때 collection storeIds와 동기화
  useEffect(() => {
    if (!isActiveRecent && dragIndex === -1) {
      setOrderedStoreIds(activeCollection?.storeIds ?? []);
    }
  }, [activeCollection?.storeIds, dragIndex, isActiveRecent]);

  const stores: CollectionStore[] = isActiveRecent
    ? recentlyViewed.map((r: RecentCafe) => ({
        id: r.id,
        name: r.name,
        address: '주소 정보 없음',
        rating: 0,
        reviewCount: 0,
        timeLimit: '',
        photos: r.photo ? [r.photo] : [],
        memo: '',
      }))
    : orderedStoreIds
        .map((id) => favorites.find((f: FavoritedStore) => f.id === id))
        .filter((f): f is FavoritedStore => !!f)
        .map((f: FavoritedStore) => ({
          id: f.id,
          name: f.name,
          address: f.address,
          rating: f.rating,
          reviewCount: f.reviewCount,
          distance: f.distance,
          timeLimit: '',
          photos: f.photos ?? [],
          memo: activeCollection?.memos?.[f.id] ?? '',
        }));


  const onHandlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragIndex(index);
    setDragOverIndex(index);
    storeListRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const onListPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (dragIndex === -1) return;
    const y = e.clientY;
    let newOver = itemRefsArr.current.length - 1;
    for (let i = 0; i < itemRefsArr.current.length; i++) {
      const el = itemRefsArr.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (y < rect.top + rect.height / 2) { newOver = i; break; }
    }
    if (newOver !== dragOverIndex) setDragOverIndex(newOver);
  }, [dragIndex, dragOverIndex]);

  const onListPointerUp = useCallback(() => {
    if (dragIndex !== -1 && dragOverIndex !== -1 && dragIndex !== dragOverIndex) {
      setOrderedStoreIds(prev => {
        const arr = [...prev];
        const [moved] = arr.splice(dragIndex, 1);
        arr.splice(dragOverIndex, 0, moved);
        updateCollection(activeTab, { storeIds: arr });
        return arr;
      });
    }
    setDragIndex(-1);
    setDragOverIndex(-1);
  }, [dragIndex, dragOverIndex, updateCollection, activeTab]);


  // ── 편집모드 ──
  function enterEditMode(targetTabId?: string) {
    const userCollections = collections.filter(c => c.id !== 'recent');

    // 사용자 생성 컬렉션이 없으면 토스트 표시 후 편집 비활성화
    if (userCollections.length === 0) {
      showToast('기본 폴더는 수정하거나 삭제할 수 없어요');
      return;
    }

    // 최근 탭에서 편집 진입 시 첫 번째 사용자 컬렉션으로 자동 이동
    const resolvedTab = targetTabId ?? activeTab;
    if (resolvedTab === 'recent') {
      setActiveTab(userCollections[0].id);
    }

    setIsEditMode(true);
    setSelectedIds(new Set());
  }

  const exitEditMode = () => {
    setIsEditMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── 선택 매장 삭제 ──
  const handleDeleteSelected = () => {
    const deletedIds = [...selectedIds];
    removeStoresFromCollection(activeTab, deletedIds);
    exitEditMode();

    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    setSnackbar({
      msg: `${deletedIds.length}개의 매장을 삭제했어요`,
      actionLabel: '되돌리기',
      type: 'negative',
      undoFn: () => {
        addStoresToCollection(activeTab, deletedIds);
        setSnackbar(null);
      },
    });
    snackbarTimerRef.current = setTimeout(() => setSnackbar(null), 3000);
  };

  // ── 컬렉션 삭제 ──
  const handleDeleteCollection = () => {
    const col = collections.find(c => c.id === collectionId);
    removeCollection(collectionId);
    setShowDeleteCollectionDialog(false);
    if (onCollectionDeleted) {
      onCollectionDeleted({ id: collectionId, name: collectionName, storeIds: col?.storeIds ?? [] });
    } else {
      onBack?.();
    }
  };

  // ── 매장 하트 탭 ──
  const handleHeartTap = (storeId: string) => {
    if (isActiveRecent) {
      if (isFavorited(storeId)) {
        // 최근 탭: 다이얼로그 없이 바로 삭제 + 스낵바
        const favStore = favorites.find(f => f.id === storeId);
        removeFavorite(storeId);
        if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
        setSnackbar({
          msg: '매장을 삭제했어요',
          actionLabel: '되돌리기',
          type: 'negative',
          undoFn: () => {
            if (favStore) addFavorite(favStore);
            setSnackbar(null);
          },
        });
        snackbarTimerRef.current = setTimeout(() => setSnackbar(null), 3000);
      } else {
        // 찜 안됨 → 추가
        const store = stores.find(s => s.id === storeId);
        if (store) {
          addFavorite({ id: store.id, name: store.name, address: store.address, rating: store.rating, reviewCount: store.reviewCount, photos: store.photos });
          showSnackbar('모음집에 저장했어요', '보러가기', onBack);
        }
      }
    } else {
      // 커스텀 컬렉션 → 다이얼로그 → 삭제
      setShowDeleteStoreId(storeId);
    }
  };

  // ── 매장 삭제 확인 ──
  const handleStoreDeleteConfirm = () => {
    const storeId = showDeleteStoreId!;
    const favStore = favorites.find(f => f.id === storeId);
    removeFavorite(storeId);
    setShowDeleteStoreId(null);

    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    setSnackbar({
      msg: '1개의 매장을 삭제했어요',
      actionLabel: '되돌리기',
      type: 'negative',
      undoFn: () => {
        if (favStore) addFavorite(favStore);
        setSnackbar(null);
      },
    });
    snackbarTimerRef.current = setTimeout(() => setSnackbar(null), 3000);
  };

  // ── 매장 추가 확인 ──
  const handleAddStoreConfirm = (selectedStoreIds: string[]) => {
    addStoresToCollection(activeTab, selectedStoreIds);
    setShowAddStoreSheet(false);
    showToast('매장을 추가했어요');
  };

  // ── 메모 저장 ──
  const handleApplyMemo = (memo: string) => {
    if (!memoTargetId || isActiveRecent) return;
    updateCollectionMemo(activeTab, memoTargetId, memo);
    setMemoTargetId(null);
    showToast('메모를 저장했어요');
  };

  // ── 스낵바/토스트 유틸 ──
  function showSnackbar(msg: string, actionLabel?: string, undoFn?: () => void) {
    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current);
    setSnackbar({ msg, actionLabel, undoFn });
    snackbarTimerRef.current = setTimeout(() => setSnackbar(null), 3000);
  }

  function showToast(msg: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(msg);
    toastTimerRef.current = setTimeout(() => setToast(null), 2500);
  }

  // ── 칩 이름 변경 시트 열기 ──
  const openRenameTab = (tabId: string) => {
    const col = collections.find(c => c.id === tabId);
    setRenameValue(col?.name ?? '');
    setRenameTabId(tabId);
  };

  // ── 칩 포인터 이벤트 (일반 모드: 탭 관리 시트 / 편집 모드: 드래그) ──
  const handleChipPointerDown = (tabId: string, e: React.PointerEvent) => {
    if (isEditMode) {
      chipDragPointerIdRef.current = e.pointerId;
      chipLongPressTimerRef.current = setTimeout(() => {
        chipLongPressTimerRef.current = null;
        if (tabId === 'recent') {
          showToast('기본 폴더는 수정하거나 삭제할 수 없어요');
          return;
        }
        if (navigator.vibrate) navigator.vibrate(50);
        const initialOrder = allTabs.map(t => t.id);
        chipDragOrderRef.current = initialOrder;
        setChipDragOrderState(initialOrder);
        setChipDragId(tabId);
      }, 500);
    } else {
      longPressTimerRef.current = setTimeout(() => {
        longPressTimerRef.current = null;
        if (navigator.vibrate) navigator.vibrate(50);
        if (tabId === 'recent') {
          showToast('기본 폴더는 수정하거나 삭제할 수 없어요');
        } else {
          setTabManageTargetId(tabId);
        }
      }, 500);
    }
  };

  const handleChipPointerUp = () => {
    if (chipLongPressTimerRef.current) {
      clearTimeout(chipLongPressTimerRef.current);
      chipLongPressTimerRef.current = null;
    }
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // ── 칩 드래그 전역 이벤트 ──
  useEffect(() => {
    if (!chipDragId) return;

    const onMove = (e: PointerEvent) => {
      if (e.pointerId !== chipDragPointerIdRef.current) return;
      const container = chipContainerRef.current;
      if (!container) return;

      const chipEls = Array.from(container.querySelectorAll('[data-chip-id]')) as HTMLElement[];
      const pointerX = e.clientX;

      // 드래그 중인 칩과 최근 탭 제외한 나머지 칩의 중심 위치 수집
      const positions: { id: string; center: number }[] = [];
      for (const el of chipEls) {
        const id = el.getAttribute('data-chip-id');
        if (id && id !== 'recent' && id !== chipDragId) {
          const rect = el.getBoundingClientRect();
          positions.push({ id, center: rect.left + rect.width / 2 });
        }
      }

      // 포인터 위치 기반으로 삽입 위치 결정
      let insertAfterIndex = -1;
      for (let i = 0; i < positions.length; i++) {
        if (pointerX > positions[i].center) insertAfterIndex = i;
        else break;
      }

      const others = positions.map(p => p.id);
      others.splice(insertAfterIndex + 1, 0, chipDragId);
      const newOrder = ['recent', ...others];

      chipDragOrderRef.current = newOrder;
      setChipDragOrderState(newOrder);
    };

    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== chipDragPointerIdRef.current) return;

      const finalOrder = chipDragOrderRef.current.filter(id => id !== 'recent');
      const newCollectionOrder = finalOrder
        .map(id => collections.find(c => c.id === id))
        .filter((c): c is NonNullable<typeof c> => Boolean(c));
      if (newCollectionOrder.length === collections.filter(c => c.id !== 'recent').length) {
        reorderCollections(newCollectionOrder);
      }
      setChipDragId(null);
      setChipDragOrderState([]);
      chipDragOrderRef.current = [];
    };

    document.addEventListener('pointermove', onMove);
    document.addEventListener('pointerup', onUp);
    document.addEventListener('pointercancel', onUp);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
    };
  }, [chipDragId, collections, reorderCollections]);

  // ── 탭(컬렉션) 삭제 ──
  const handleTabDelete = (tabId: string) => {
    const col = collections.find(c => c.id === tabId);
    removeCollection(tabId);
    setTabManageTargetId(null);
    // 삭제된 탭이 현재 활성 탭이면 '최근'으로 이동
    if (activeTab === tabId) {
      setActiveTab('recent');
    }
    if (tabId === collectionId && onCollectionDeleted) {
      onCollectionDeleted({ id: tabId, name: col?.name ?? '', storeIds: col?.storeIds ?? [] });
    }
  };

  // ── 탭(컬렉션) 이름 변경 ──
  const handleTabRenameConfirm = () => {
    if (!renameTabId || !renameValue.trim()) return;
    updateCollection(renameTabId, { name: renameValue.trim() });
    setRenameTabId(null);
    setRenameValue('');
    showToast('컬렉션 이름을 변경했어요');
  };

  const currentMemo = memoTargetId ? (activeCollection?.memos?.[memoTargetId] ?? '') : '';

  const handleBack = useCallback(() => {
    if (isEditMode) { exitEditMode(); return; }
    onBack?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);


  // SDK 네이티브 백 이벤트 등록 (Toss 앱 외부 환경에서는 무시)
  useEffect(() => {
    try {
      const unsubscribe = graniteEvent.addEventListener('backEvent', {
        onEvent: handleBack,
        onError: (err) => console.error(err),
      });
      return unsubscribe;
    } catch {
      return undefined;
    }
  }, [handleBack]);


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#F3F3F3', position: 'relative' }}>
      {/* ── info_2 (46px) — 항상 "컬렉션명 + 편집" 고정 ── */}
      <div style={{ height: 46, backgroundColor: '#f3f3f3', display: 'flex', alignItems: 'center', position: 'relative', flexShrink: 0, borderBottom: '1px solid #F2F4F6' }}>
        <span style={{ flex: 1, textAlign: 'center', fontWeight: 600, fontSize: 14, color: '#191F28', letterSpacing: -0.2 }}>
          {isEditMode ? '편집모드' : '컬렉션'}
        </span>
        {/* 편집 버튼 — 일반 모드 항상 고정 노출 */}
        {!isEditMode && (
          <button
            onClick={() => enterEditMode()}
            style={{
              position: 'absolute', right: 16,
              background: 'none', border: 'none', cursor: 'pointer',
              fontWeight: 510, fontSize: 13,
              color: 'rgba(0,19,43,0.55)',
              padding: '4px 0',
            }}
          >
            편집
          </button>
        )}
      </div>

      {/* ── 탭 칩 (가로 스크롤) ── */}
      <style>{`
        @keyframes chip-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25%       { transform: rotate(-2deg); }
          75%       { transform: rotate(2deg); }
        }
      `}</style>
      <div
        ref={chipContainerRef}
        style={{
          display: 'flex', gap: 8, padding: '10px 16px',
          overflowX: 'auto', scrollbarWidth: 'none', flexShrink: 0,
        }}
      >
        {(isEditMode && chipDragOrderState.length > 0
          ? chipDragOrderState.map(id => allTabs.find(t => t.id === id)!).filter(Boolean)
          : allTabs
        ).map((tab) => {
          const isCustom = tab.id !== 'recent';
          const showPencil = isEditMode && isCustom;
          const isDragging = chipDragId === tab.id;
          const wiggle = isEditMode && isCustom && !isDragging;
          return (
            <div
              key={tab.id}
              data-chip-id={tab.id}
              onPointerDown={(e) => handleChipPointerDown(tab.id, e)}
              onPointerUp={handleChipPointerUp}
              onPointerCancel={handleChipPointerUp}
              onClick={() => {
                if (isEditMode && tab.id === 'recent') {
                  showToast('기본 폴더는 수정하거나 삭제할 수 없어요');
                  return;
                }
                setActiveTab(tab.id);
              }}
              style={{
                height: 32,
                padding: showPencil ? '0 2px 0 10px' : '0 10px',
                borderRadius: 8,
                backgroundColor: activeTab === tab.id ? '#252525' : 'rgba(46,46,46,0.08)',
                color: activeTab === tab.id ? '#ffffff' : 'rgba(0,0,0,0.7)',
                fontWeight: 590,
                fontSize: 13,
                lineHeight: '16px',
                flexShrink: 0,
                whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 4,
                cursor: 'pointer',
                userSelect: 'none',
                touchAction: 'none',
                position: 'relative',
                zIndex: isDragging ? 10 : 1,
                animation: wiggle ? 'chip-wiggle 0.45s ease-in-out infinite' : 'none',
                transformOrigin: 'center bottom',
                transform: isDragging ? 'scale(1.02) translateY(-2px)' : 'none',
                boxShadow: isDragging ? '0 4px 10px rgba(0,0,0,0.12)' : 'none',
                transition: isDragging ? 'none' : 'transform 0.15s, box-shadow 0.15s',
              }}
            >
              <span style={{ pointerEvents: 'none' }}>{tab.name}</span>
              {showPencil && (
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); openRenameTab(tab.id); }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '8px 7px',
                    margin: '-8px -2px -8px 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <IcPencil
                    width={12} height={12}
                    color={activeTab === tab.id ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'}
                    style={{ flexShrink: 0 }}
                  />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ── 총 N개 ── */}
      <div style={{
        height: 32, display: 'flex', alignItems: 'center',
        paddingLeft: 20, paddingRight: 20,
      }}>
        <span style={{ fontWeight: 600, fontSize: 12, lineHeight: '16.2px' }}>
          <span style={{ color: '#6B7684' }}>총 </span>
          <span style={{ color: '#4E5968' }}>{stores.length}</span>
          <span style={{ color: '#6B7684' }}>개</span>
        </span>
      </div>

      {/* ── 편집 모드 — 매장 추가하기 행 ── */}
      {isEditMode && !isActiveRecent && (
        <button
          onClick={() => setShowAddStoreSheet(true)}
          style={{
            height: 64, width: '100%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: 17, color: 'rgba(0,12,30,0.8)' }}>매장 추가하기</span>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            backgroundColor: '#E5E5E5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </button>
      )}

      {/* ── Body ── */}
      {stores.length === 0 && !isEditMode ? (
        isActiveRecent ? (
          <EmptyState
            title="아직 최근에 본 매장이 없어요"
            subtitle="홈에서 카페를 탐색하면 여기에 기록돼요"
            buttonLabel="매장 보러가기"
            buttonIcon={<IconArrow />}
            onButtonClick={onGoHome}
          />
        ) : (
          <EmptyState
            title="아직 컬렉션에 담은 매장이 없어요"
            subtitle="저장해 둔 매장을 목적에 맞게 쏙쏙 골라 담아보세요"
            buttonLabel="매장 추가하기"
            buttonIcon={<IconPlus />}
            onButtonClick={() => setShowAddStoreSheet(true)}
          />
        )
      ) : (
        <div
          ref={storeListRef}
          style={{ flex: 1, overflowY: 'auto' }}
          onPointerMove={isEditMode ? onListPointerMove : undefined}
          onPointerUp={isEditMode ? onListPointerUp : undefined}
          onPointerCancel={isEditMode ? onListPointerUp : undefined}
        >
          {stores.map((store, index) => (
            <div
              key={store.id}
              ref={el => { itemRefsArr.current[index] = el; }}
            >
              <StoreCard
                store={store}
                isEditMode={isEditMode}
                isSelected={selectedIds.has(store.id)}
                heartFilled={isFavorited(store.id)}
                showHeart={isActiveRecent}
                showMemo={!isActiveRecent}
                isDragging={isEditMode && dragIndex === index}
                isDragOver={isEditMode && dragOverIndex === index && dragIndex !== index}
                onToggleSelect={toggleSelect}
                onMemoTap={(id) => setMemoTargetId(id)}
                onDetailOpen={onDetailOpen}
                onHeartTap={handleHeartTap}
                onPhotoMore={() => onPhotoMore?.(store.id, store.photos, store.name)}
                onHandleDrag={isEditMode && !isActiveRecent ? (e) => onHandlePointerDown(e, index) : undefined}
              />
            </div>
          ))}
          {/* 탭바 가림 방지 spacer */}
          <div style={{ height: 'calc(env(safe-area-inset-bottom, 0px) + 76px)' }} />
        </div>
      )}

      {/* ── 편집모드 하단 CTA ── */}
      {isEditMode && (
        selectedIds.size > 0 ? (
          <BottomCTA.Double
            fixed
            leftButton={<CTAButton color="dark" variant="weak" onClick={handleDeleteSelected}>삭제</CTAButton>}
            rightButton={<CTAButton onClick={exitEditMode}>완료</CTAButton>}
          />
        ) : (
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            padding: '12px 20px',
            paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
            background: '#fff',
            zIndex: 1000,
          }}>
            <CTAButton color="dark" variant="weak" onClick={exitEditMode}>완료</CTAButton>
          </div>
        )
      )}

      {/* ── 오버레이 레이어들 ── */}

      {/* 컬렉션 삭제 다이얼로그 */}
      {showDeleteCollectionDialog && (
        <DeleteCollectionDialog
          onConfirm={handleDeleteCollection}
          onCancel={() => setShowDeleteCollectionDialog(false)}
        />
      )}

      {/* 매장 삭제 다이얼로그 */}
      {showDeleteStoreId && (
        <DeleteStoreDialog
          onConfirm={handleStoreDeleteConfirm}
          onCancel={() => setShowDeleteStoreId(null)}
        />
      )}

      {/* 메모 바텀시트 */}
      {memoTargetId && (
        <MemoSheet
          initialMemo={currentMemo}
          onApply={handleApplyMemo}
          onClose={() => setMemoTargetId(null)}
        />
      )}

      {/* 매장 추가 바텀시트 */}
      {showAddStoreSheet && (
        <AddStoreSheet
          availableStores={favorites.filter(f => !activeCollection?.storeIds.includes(f.id))}
          onConfirm={handleAddStoreConfirm}
          onClose={() => setShowAddStoreSheet(false)}
          onGoHome={() => { setShowAddStoreSheet(false); onGoHome?.(); }}
        />
      )}

      {/* 탭 관리 바텀시트 (롱프레스) */}
      <BottomSheet
        open={!!tabManageTargetId}
        header={<BottomSheet.Header>{collections.find(c => c.id === tabManageTargetId)?.name}</BottomSheet.Header>}
        onClose={() => setTabManageTargetId(null)}
      >
        <button
          onClick={() => {
            const targetId = tabManageTargetId!;
            setTabManageTargetId(null);
            setActiveTab(targetId);
            enterEditMode(targetId);
          }}
          style={{
            width: '100%', height: 56, display: 'flex', alignItems: 'center', gap: 12,
            paddingLeft: 20, background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 510, fontSize: 17, color: '#000C1E',
          }}
        >
          <IcPencil width={20} height={20} color="#333D4B" style={{ display: 'block', flexShrink: 0 }} />
          <span style={{ lineHeight: '20px' }}>편집</span>
        </button>
        <button
          onClick={() => {
            const id = tabManageTargetId;
            setTabManageTargetId(null);
            setTimeout(() => setDeleteTabTargetId(id), 200);
          }}
          style={{
            width: '100%', height: 56, display: 'flex', alignItems: 'center', gap: 12,
            paddingLeft: 20, background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 510, fontSize: 17, color: '#000C1E',
          }}
        >
          <IcDelete width={20} height={20} color="#333D4B" style={{ display: 'block', flexShrink: 0 }} />
          <span style={{ lineHeight: '20px' }}>삭제</span>
        </button>
        <div style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }} />
      </BottomSheet>

      {/* 탭 삭제 확인 다이얼로그 */}
      {deleteTabTargetId && (
        <DeleteTabDialog
          onConfirm={() => { handleTabDelete(deleteTabTargetId); setDeleteTabTargetId(null); }}
          onCancel={() => setDeleteTabTargetId(null)}
        />
      )}

      {/* 컬렉션 이름 변경 바텀시트 */}
      <BottomSheet
        open={!!renameTabId}
        header={<BottomSheet.Header>컬렉션 이름 변경</BottomSheet.Header>}
        onClose={() => { setRenameTabId(null); setRenameValue(''); }}
        hasTextField
      >
        <div style={{ padding: '8px 20px 16px' }}>
          <input
            autoFocus
            value={renameValue}
            onChange={e => setRenameValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleTabRenameConfirm(); }}
            maxLength={20}
            placeholder="컬렉션 이름"
            style={{
              width: '100%', height: 48, borderRadius: 10,
              border: '1px solid rgba(0,0,0,0.12)',
              padding: '0 14px', fontSize: 17, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <Button
          color="primary"
          size="xlarge"
          style={{ width: '100%' }}
          onClick={handleTabRenameConfirm}
          disabled={!renameValue.trim()}
        >
          변경하기
        </Button>
      </BottomSheet>

      {/* 토스트 (메모/추가 후) — TDS Toast */}
      <Toast
        open={!!toast}
        position="top"
        text={toast ?? ''}
        duration={2500}
        onClose={() => setToast(null)}
      />

      {/* 스낵바 */}
      {snackbar && (
        <Snackbar
          message={snackbar.msg}
          actionLabel={snackbar.actionLabel}
          onAction={snackbar.undoFn}
          onDismiss={() => setSnackbar(null)}
          type={snackbar.type ?? 'positive'}
          duration={3000}
        />
      )}

      {/* 공유 바텀시트 */}
      <ShareSheet
        isOpen={showShareSheet}
        onClose={() => setShowShareSheet(false)}
        shareTitle={collectionName}
      />
    </div>
  );
}
