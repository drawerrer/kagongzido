import { useState, useRef } from 'react';
import StoreCard, { type StoreItem } from './StoreCard/Collection';
import SheetCTA from './SheetCTA';

interface AddStoreSheetProps {
  availableStores: StoreItem[];
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
          backgroundColor: '#FFFFFF',
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

        {/* 매장 리스트 — paddingBottom 으로 CTA(약 92px) 영역만큼 여백 확보 (CTA 가 absolute 로 겹치므로) */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            marginTop: 12,
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 92px)',
          }}
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
            availableStores.map(store => (
              <StoreCard
                key={store.id}
                store={store}
                selectionMode
                isSelected={selectedIds.has(store.id)}
                onSelect={() => toggle(store.id)}
              />
            ))
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

        {/* 하단 버튼 — position: absolute, 좌우 패딩은 SheetCTA 가 내장 (그라데이션 풀너비) */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
        }}>
          {!hasSelection ? (
            <SheetCTA.Single label="완료" onClick={onClose} variant="secondary" background="#FFFFFF" />
          ) : (
            <SheetCTA.Double
              leftLabel="닫기"
              leftOnClick={onClose}
              rightLabel="확인"
              rightOnClick={() => onConfirm([...selectedIds])}
              background="#FFFFFF"
            />
          )}
          {/* safe-area 영역 보강용 솔리드 스트립 — 시트 본문 흰색과 일치 */}
          <div style={{
            height: 'max(12px, env(safe-area-inset-bottom))',
            background: '#FFFFFF',
          }} />
        </div>
      </div>
    </div>
  );
}
