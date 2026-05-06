import { useState, useRef } from 'react';
import { type FavoritedStore, fmtDist } from '../context/FavoritesContext';

interface AddStoreSheetProps {
  availableStores: FavoritedStore[];
  onConfirm: (ids: string[]) => void;
  onClose: () => void;
  onGoHome?: () => void;
}

export default function AddStoreSheet({
  availableStores,
  onConfirm,
  onClose,
  onGoHome,
}: AddStoreSheetProps) {
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

  const onHandleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onHandleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    if (dy > 30) { setExpanded(true); scrollToTop(); }
    else if (dy < -30) setExpanded(false);
  };

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
      style={{ position: 'fixed', inset: 0, zIndex: 1200, backgroundColor: 'rgba(0,0,0,0.4)' }}
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
                    <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                      <p style={{
                        fontWeight: 600, fontSize: 16, color: '#191F28', lineHeight: '23px',
                        marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {store.name}
                      </p>
                      <p style={{
                        fontWeight: 510, fontSize: 13, color: '#6B7684', lineHeight: '17.6px',
                        marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {store.address}
                      </p>
                      <span style={{ fontWeight: 510, fontSize: 13, color: '#6B7684', lineHeight: '17.6px' }}>
                        {store.distance != null
                          ? `${fmtDist(store.distance)} · 리뷰 ${store.reviewCount.toLocaleString()}`
                          : `리뷰 ${store.reviewCount.toLocaleString()}`}
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

                  {/* 사진 가로 스크롤 */}
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
                          return (
                            <div key={idx} style={{
                              position: 'relative', width: 80, height: 80, borderRadius: 4,
                              flexShrink: 0, overflow: 'hidden',
                              backgroundColor: store.photos[idx] ? undefined : '#E8EDF4',
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
                        });
                      })()}
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
            style={{ padding: '12px 16px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
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
            <button
              onClick={onClose}
              style={{
                width: '100%', height: 52, borderRadius: 12,
                backgroundColor: 'rgba(0,23,51,0.06)',
                border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 17,
                color: 'rgba(0,12,30,0.25)',
              }}
            >
              완료
            </button>
          ) : (
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
              >
                닫기
              </button>
              <button
                onClick={() => onConfirm([...selectedIds])}
                style={{
                  flex: 1, height: 52, borderRadius: 12,
                  backgroundColor: '#252525',
                  border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 17,
                  color: '#ffffff',
                }}
              >
                확인
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
