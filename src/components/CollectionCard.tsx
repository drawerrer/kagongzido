import { useRef } from 'react';

interface CollectionCardProps {
  label: string;
  size?: number;
  isNew?: boolean;
  isEditMode?: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
  wiggleDelay?: number;
  onPress?: () => void;
  onLongPress?: () => void;
  onRename?: () => void;
  onHandlePointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  previewPhotos?: string[];
}

export default function CollectionCard({
  label,
  size = 121,
  isNew = false,
  isEditMode = false,
  isDragging = false,
  isDragOver = false,
  wiggleDelay = 0,
  onPress,
  onLongPress,
  onRename,
  onHandlePointerDown,
  previewPhotos = [],
}: CollectionCardProps) {
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePointerDown = (_e: React.PointerEvent<HTMLButtonElement>) => {
    if (!onLongPress || isEditMode || isNew) return;
    longPressTimer.current = setTimeout(() => { onLongPress(); }, 500);
  };
  const cancelLongPress = () => {
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; }
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0,
      opacity: isDragging ? 0.4 : isEditMode ? 0.7 : 1,
      borderLeft: isDragOver ? '2px solid #252525' : '2px solid transparent',
      transition: 'opacity 0.15s',
    }}>
      <button
        onClick={onPress}
        onPointerDown={handlePointerDown}
        onPointerUp={cancelLongPress}
        onPointerLeave={cancelLongPress}
        onPointerCancel={cancelLongPress}
        style={{
          width: size,
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer', position: 'relative',
        }}
      >
        {/* 이미지 카드 */}
        <div style={{
          width: size, height: size,
          border: isNew ? '1px dashed #c5c5c5' : 'none',
          borderRadius: 4, overflow: 'hidden',
          backgroundColor: '#F3F3F3', position: 'relative',
        }}>
          {isNew ? (
            /* 새 컬렉션 */
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#b0b8c1" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{
                fontWeight: 590, fontSize: 12,
                color: 'rgba(3,24,50,0.46)', lineHeight: '22.5px',
              }}>새 컬렉션</span>
            </div>
          ) : (
            /* 2×2 이미지 그리드 */
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 1,
              width: size, height: size,
            }}>
              {[0, 1, 2, 3].map((i) => {
                const photo = previewPhotos[i];
                const cellRadius = ({
                  0: { borderTopLeftRadius: 4 },
                  1: { borderTopRightRadius: 4 },
                  2: { borderBottomLeftRadius: 4 },
                  3: { borderBottomRightRadius: 4 },
                } as Record<number, React.CSSProperties>)[i];
                return (
                  <div key={i} style={{ backgroundColor: '#E8EDF4', overflow: 'hidden', ...cellRadius }}>
                    {photo && (
                      <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 편집모드: 드래그 소트 오버레이 */}
          {isEditMode && !isNew && label !== '최근' && (
            <div
              onPointerDown={onHandlePointerDown}
              style={{
                position: 'absolute', inset: 0,
                backgroundColor: 'rgba(232,232,253,0.36)',
                borderRadius: 4,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'grab', touchAction: 'none',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 20 20" fill="none" style={{ transform: 'rotate(90deg)' }}>
                <g fill="rgba(0,19,43,0.3)" fillRule="evenodd" clipRule="evenodd">
                  <path d="M10.293 7.707a1 1 0 0 1 0-1.414l3-3a1 1 0 1 1 1.414 1.414l-3 3a1 1 0 0 1-1.414 0"/>
                  <path d="M17.707 7.707a1 1 0 0 1-1.414 0l-3-3a1 1 0 0 1 1.414-1.414l3 3a1 1 0 0 1 0 1.414"/>
                  <path d="M14 5a1 1 0 0 1 1 1v8a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1m-4.293 7.293a1 1 0 0 1 0 1.414l-3 3a1 1 0 0 1-1.414-1.414l3-3a1 1 0 0 1 1.414 0"/>
                  <path d="M2.293 12.293a1 1 0 0 1 1.414 0l3 3a1 1 0 1 1-1.414 1.414l-3-3a1 1 0 0 1 0-1.414"/>
                  <path d="M6 15a1 1 0 0 1-1-1V6a1 1 0 1 1 2 0v8a1 1 0 0 1-1 1"/>
                </g>
              </svg>
            </div>
          )}
        </div>
      </button>

      {/* 라벨 */}
      {!isNew && (
        isEditMode && label !== '최근' ? (
          <button
            type="button"
            aria-label={`${label} 이름 변경`}
            onClick={onRename}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, width: size,
              background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left',
            }}
          >
            <span
              className="collection-name-wiggle"
              style={{
                fontWeight: 590, fontSize: 15,
                color: '#191f28', lineHeight: '22.5px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
                ['--wiggle-delay' as string]: wiggleDelay,
              }}
            >
              {label}
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="rgba(0,19,43,0.45)" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', width: size }}>
            <span style={{
              fontWeight: 590, fontSize: 15,
              color: '#191f28', lineHeight: '22.5px',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {label}
            </span>
          </div>
        )
      )}
    </div>
  );
}
