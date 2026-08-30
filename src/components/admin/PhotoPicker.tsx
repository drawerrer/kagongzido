import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../pages/AdminPage';

export interface PhotoItem {
  id: string;
  url: string;
  isThumbnail: boolean;
}

const BUCKET = 'cafe-images';
const MAX_PHOTOS = 5;
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 0.78;

// 업로드 전 압축 — sharp(resize width:1600, jpeg quality:78) 파라미터와 동일한 타깃으로
// 브라우저 canvas에서 재현. 항상 jpeg로 통일(투명 배경은 흰색으로 합성).
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_WIDTH / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      URL.revokeObjectURL(objectUrl);
      if (!ctx) { reject(new Error('canvas context 생성 실패')); return; }
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        blob => (blob ? resolve(blob) : reject(new Error('이미지 압축 실패'))),
        'image/jpeg',
        JPEG_QUALITY,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('이미지를 열 수 없어요')); };
    img.src = objectUrl;
  });
}

export default function PhotoPicker({
  folderId,
  value,
  onChange,
}: {
  folderId: string;
  value: PhotoItem[];
  onChange: (next: PhotoItem[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 업로드 전 저장공간 상태 확인 — DB 트리거가 최종 방어선이지만,
  // 여기서 먼저 막아야 업로드 시도/압축 낭비 없이 바로 경고를 보여줄 수 있음
  async function checkStorageStatus(): Promise<boolean> {
    const { data, error: rpcError } = await supabase.rpc('get_cafe_images_storage_status').single();
    if (rpcError) {
      setError('저장공간 상태 확인 실패: ' + rpcError.message);
      return false;
    }
    if ((data as { blocked?: boolean } | null)?.blocked) {
      setBlocked(true);
      setError('');
      return false;
    }
    return true;
  }

  async function addFiles(files: FileList | File[]) {
    if (value.length >= MAX_PHOTOS) {
      setError(`사진은 최대 ${MAX_PHOTOS}장까지예요.`);
      return;
    }
    setError('');
    const ok = await checkStorageStatus();
    if (!ok) return;

    setUploading(true);
    const next = [...value];

    for (const file of Array.from(files)) {
      if (next.length >= MAX_PHOTOS) break;
      if (!file.type.startsWith('image/')) continue;

      try {
        const blob = await compressImage(file);
        const path = `${folderId}/${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, blob, { contentType: 'image/jpeg', upsert: false });

        if (upErr) {
          if (/cap reached|check_violation/i.test(upErr.message)) {
            setBlocked(true);
            break;
          }
          throw upErr;
        }

        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        next.push({ id: crypto.randomUUID(), url: pub.publicUrl, isThumbnail: next.length === 0 });
      } catch (e) {
        setError('업로드 실패: ' + (e instanceof Error ? e.message : String(e)));
      }
    }

    onChange(next);
    setUploading(false);
  }

  // 드롭존을 클릭하면 파일 선택창이 열려서 포커스가 OS 다이얼로그로 넘어가버림 —
  // div의 onPaste(포커스 필요)에 의존하면 그 직후 Ctrl+V가 안 먹음.
  // 그래서 이 패널이 열려있는 동안은 문서 전체에서 붙여넣기를 감지함.
  const addFilesRef = useRef(addFiles);
  addFilesRef.current = addFiles;

  useEffect(() => {
    function onDocumentPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files = Array.from(items)
        .filter(it => it.type.startsWith('image/'))
        .map(it => it.getAsFile())
        .filter((f): f is File => !!f);
      if (files.length > 0) {
        e.preventDefault();
        addFilesRef.current(files);
      }
    }
    document.addEventListener('paste', onDocumentPaste);
    return () => document.removeEventListener('paste', onDocumentPaste);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  function remove(id: string) {
    const filtered = value.filter(p => p.id !== id);
    if (filtered.length > 0 && !filtered.some(p => p.isThumbnail)) filtered[0].isThumbnail = true;
    onChange(filtered);
  }

  function setThumbnail(id: string) {
    onChange(value.map(p => ({ ...p, isThumbnail: p.id === id })));
  }

  // ── 순서 바꾸기: 길게 누른 다음 좌우로 움직이면 자리를 바꿈 ──────────
  const LONG_PRESS_MS = 350;
  const MOVE_CANCEL_PX = 8;
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const pressStart = useRef<{ x: number; y: number } | null>(null);
  const orderRef = useRef(value);
  orderRef.current = value;

  function clearLongPressTimer() {
    if (longPressTimer.current != null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handlePhotoPointerDown(e: React.PointerEvent<HTMLDivElement>, id: string) {
    pressStart.current = { x: e.clientX, y: e.clientY };
    clearLongPressTimer();
    longPressTimer.current = window.setTimeout(() => {
      setDraggingId(id);
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* 이미 릴리즈된 경우 무시 */ }
    }, LONG_PRESS_MS);
  }

  function handlePhotoPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!draggingId) {
      if (!pressStart.current) return;
      const dx = Math.abs(e.clientX - pressStart.current.x);
      const dy = Math.abs(e.clientY - pressStart.current.y);
      if (dx > MOVE_CANCEL_PX || dy > MOVE_CANCEL_PX) clearLongPressTimer();
      return;
    }
    const overEl = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-photo-id]') as HTMLElement | null;
    const overId = overEl?.dataset.photoId;
    if (!overId || overId === draggingId) return;

    const current = orderRef.current;
    const fromIdx = current.findIndex(p => p.id === draggingId);
    const toIdx = current.findIndex(p => p.id === overId);
    if (fromIdx === -1 || toIdx === -1) return;

    const next = [...current];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onChange(next);
  }

  function handlePhotoPointerUp() {
    clearLongPressTimer();
    pressStart.current = null;
    setDraggingId(null);
  }

  return (
    <div>
      {blocked && (
        <div style={{
          background: '#FFF0F0', border: '1px solid #FFD0D0', borderRadius: 10,
          padding: '10px 12px', fontSize: 12.5, color: '#E53E3E', marginBottom: 10, lineHeight: 1.5,
        }}>
          저장공간이 거의 다 찼어요. 새 사진을 업로드할 수 없어요 — 기존 사진을 정리하거나 관리자에게 문의해주세요.
        </div>
      )}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => !blocked && inputRef.current?.click()}
        style={{
          border: '1.5px dashed #C4C9D0', borderRadius: 12, padding: '18px 12px',
          textAlign: 'center', cursor: blocked ? 'not-allowed' : 'pointer', fontSize: 12.5, color: '#8B95A1',
          background: '#FAFBFC', outline: 'none', opacity: blocked ? 0.5 : 1,
        }}
      >
        {uploading ? '업로드 중...' : '클릭해서 선택 · 드래그앤드롭 · Ctrl+V로 붙여넣기'}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          disabled={blocked}
          onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {error && <p style={{ fontSize: 12, color: '#E53E3E', marginTop: 6 }}>{error}</p>}

      {value.length > 0 && (
        <>
          <p style={{ fontSize: 11, color: '#B0B8C1', marginTop: 10, marginBottom: 6 }}>
            사진을 길게 누른 채로 움직이면 순서를 바꿀 수 있어요.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {value.map(p => (
            <div
              key={p.id}
              data-photo-id={p.id}
              onPointerDown={e => handlePhotoPointerDown(e, p.id)}
              onPointerMove={handlePhotoPointerMove}
              onPointerUp={handlePhotoPointerUp}
              onPointerCancel={handlePhotoPointerUp}
              style={{
                position: 'relative', width: 84, height: 84,
                touchAction: 'none', cursor: draggingId === p.id ? 'grabbing' : 'grab',
                opacity: draggingId === p.id ? 0.55 : 1,
                transform: draggingId === p.id ? 'scale(1.05)' : 'scale(1)',
                transition: draggingId === p.id ? 'none' : 'opacity .12s, transform .12s',
                zIndex: draggingId === p.id ? 1 : 0,
              }}
            >
              <img
                src={p.url}
                alt=""
                draggable={false}
                style={{
                  width: 84, height: 84, objectFit: 'cover', borderRadius: 8,
                  border: p.isThumbnail ? '2px solid #3182F6' : '1px solid #E5E8EB',
                  pointerEvents: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => remove(p.id)}
                style={{
                  position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
                  background: '#191F28', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer', lineHeight: 1,
                }}
              >
                ×
              </button>
              {p.isThumbnail ? (
                <span style={{
                  position: 'absolute', bottom: 2, left: 2, right: 2, fontSize: 9.5, fontWeight: 700,
                  padding: '2px 0', borderRadius: 5, background: '#3182F6', color: '#fff', textAlign: 'center',
                }}>
                  대표
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setThumbnail(p.id)}
                  style={{
                    position: 'absolute', bottom: 2, left: 2, right: 2, fontSize: 9.5, fontWeight: 700,
                    padding: '2px 0', borderRadius: 5, background: 'rgba(25,31,40,0.7)', color: '#fff',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  대표로
                </button>
              )}
            </div>
          ))}
          </div>
        </>
      )}
    </div>
  );
}
