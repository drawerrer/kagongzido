import { useState, useEffect } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';
import PlaceRegisterTab from '../components/admin/PlaceRegisterTab';

// ⚠️ 보안: 어드민 페이지는 사용자 인증(Supabase Auth) 기반으로 동작
//   - ANON 키를 사용 (SERVICE 키는 브라우저 번들에 노출되므로 금지)
//   - 데이터 쓰기 권한은 Supabase의 RLS 정책으로 ALLOWED_ADMIN_EMAILS 만 허용
// export: PlaceRegisterTab 등 다른 어드민 탭 컴포넌트가 동일 세션을 공유해서 쓰기 위함
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
);

const ALLOWED_ADMIN_EMAILS = [
  'dsgj0024@gmail.com',
  'juliesba1015@gmail.com',
];

function isAllowedAdmin(email: string | null | undefined): boolean {
  return !!email && ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase());
}

// ─── 타입 ─────────────────────────────────────────────────────
interface Report {
  id: string;
  store_name: string;
  outlet_status: string | null;
  seat_status: string | null;
  noise_status: string | null;
  content: string | null;
  photo_urls: string[];
  status: string;
  admin_comment: string | null;
  created_at: string;
}

interface Guidebook {
  id: string;
  title: string;
  is_published: boolean;
  created_at: string;
}

interface GuidebookItem {
  id: string;
  guidebook_id: string;
  store_id: string;
  comment: string | null;
  sort_order: number;
  store: {
    id: string;
    name: string;
    address_road: string;
    thumbnail_url: string;
  };
}

interface StoreOption {
  id: string;
  name: string;
  address_road: string;
  thumbnail_url: string;
}

// ─── 코멘트 윗줄/아랫줄 입력 ─────────────────────────────────────
// onBlur 시 부모에 현재 값 알림 (자동저장 X — 저장 버튼 통합)
function CommentFields({
  itemId,
  initialComment,
  onChange,
}: {
  itemId: string;
  initialComment: string | null;
  onChange: (id: string, combined: string) => void;
}) {
  const parts = (initialComment ?? '').split('\n');
  const [line1, setLine1] = useState(parts[0] ?? '');
  const [line2, setLine2] = useState(parts[1] ?? '');

  const notify = (l1: string, l2: string) => {
    const combined = l2.trim() ? `${l1}\n${l2}` : l1;
    onChange(itemId, combined);
  };

  const inputStyle: React.CSSProperties = {
    flex: 1, height: 34, borderRadius: 8, border: '1.5px solid #E5E8EB',
    padding: '0 8px', fontSize: 13, outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, color: '#8B95A1', width: 30, flexShrink: 0,
  };
  const countStyle: React.CSSProperties = {
    fontSize: 11, color: '#C4C9D0', width: 30, textAlign: 'right', flexShrink: 0,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={labelStyle}>윗줄</span>
        <input
          value={line1}
          onChange={e => setLine1(e.target.value)}
          onBlur={() => notify(line1, line2)}
          maxLength={25}
          placeholder="윗줄 텍스트"
          style={inputStyle}
        />
        <span style={countStyle}>{line1.length}/25</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={labelStyle}>아랫줄</span>
        <input
          value={line2}
          onChange={e => setLine2(e.target.value)}
          onBlur={() => notify(line1, line2)}
          maxLength={25}
          placeholder="아랫줄 텍스트 (선택)"
          style={inputStyle}
        />
        <span style={countStyle}>{line2.length}/25</span>
      </div>
    </div>
  );
}

// ─── 공통 UI ──────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? '#3182F6' : '#D9D9D9',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 2, left: checked ? 22 : 2,
        width: 20, height: 20,
        borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

// ─── 로그인 화면 ──────────────────────────────────────────────
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError('이메일 또는 비밀번호가 올바르지 않아요');
      setPassword('');
      return;
    }
    // 허용된 어드민 이메일이 아니면 즉시 로그아웃 (DB 접근 차단은 RLS에서 추가 보호)
    if (!isAllowedAdmin(data.user?.email)) {
      await supabase.auth.signOut();
      setError('어드민 권한이 없는 계정이에요');
      setPassword('');
      return;
    }
    // 로그인 성공 — AdminApp의 onAuthStateChange가 세션 갱신을 감지해서 자동 진입
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 40, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: 320 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#191F28', marginBottom: 8 }}>카공지도 어드민</h2>
        <p style={{ fontSize: 14, color: '#6B7684', marginBottom: 24 }}>이메일과 비밀번호로 로그인하세요</p>
        <input
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setError(''); }}
          placeholder="이메일"
          autoComplete="username"
          autoFocus
          required
          style={{
            width: '100%', height: 44, borderRadius: 10,
            border: error ? '1.5px solid #FF4D4F' : '1.5px solid #E5E8EB',
            padding: '0 12px', fontSize: 15, outline: 'none', boxSizing: 'border-box', marginBottom: 8,
          }}
        />
        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
          placeholder="비밀번호"
          autoComplete="current-password"
          required
          style={{
            width: '100%', height: 44, borderRadius: 10,
            border: error ? '1.5px solid #FF4D4F' : '1.5px solid #E5E8EB',
            padding: '0 12px', fontSize: 15, outline: 'none', boxSizing: 'border-box', marginBottom: 8,
          }}
        />
        {error && <p style={{ fontSize: 13, color: '#FF4D4F', marginBottom: 8 }}>{error}</p>}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', height: 44, borderRadius: 10,
            background: loading ? '#6B7684' : '#191F28',
            border: 'none', color: '#fff', fontSize: 15, fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer', marginTop: 4,
          }}
        >
          {loading ? '로그인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}

// ─── 제보 관련 컴포넌트 ───────────────────────────────────────
function StatusBadge({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F2F4F6', borderRadius: 6, padding: '3px 8px', fontSize: 12, color: '#4E5968', marginRight: 6 }}>
      <span style={{ color: '#8B95A1' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </span>
  );
}

// ─ 제보 상태 옵션 (DB CHECK 제약과 일치) ─
const REPORT_STATUS_OPTIONS = [
  { value: 'pending',   label: '대기 중',   bg: '#FFF3CD', fg: '#856404' },
  { value: 'reviewing', label: '검토 중',   bg: '#CCE5FF', fg: '#004085' },
  { value: 'resolved',  label: '완료',     bg: '#D4EDDA', fg: '#155724' },
  { value: 'rejected',  label: '반려',     bg: '#F8D7DA', fg: '#721C24' },
] as const;

function getStatusMeta(status: string) {
  return REPORT_STATUS_OPTIONS.find(o => o.value === status) ?? REPORT_STATUS_OPTIONS[0];
}

function ReportCard({ report, onStatusChange, onCommentSave }: {
  report: Report;
  onStatusChange: (id: string, status: string) => Promise<void>;
  onCommentSave: (id: string, comment: string) => Promise<void>;
}) {
  const [cardExpanded, setCardExpanded] = useState(false);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [comment, setComment] = useState(report.admin_comment ?? '');
  const [savingComment, setSavingComment] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const date = new Date(report.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const meta = getStatusMeta(report.status);
  const commentDirty = comment !== (report.admin_comment ?? '');

  const handleChange = async (next: string) => {
    if (next === report.status || updating) return;
    setUpdating(true);
    await onStatusChange(report.id, next);
    setUpdating(false);
  };

  const handleSaveComment = async () => {
    if (!commentDirty || savingComment) return;
    setSavingComment(true);
    await onCommentSave(report.id, comment.trim());
    setSavingComment(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12 }}>
      {/* ── 요약 영역 (항상 보임) — 클릭 시 펼치기/접기 토글 ── */}
      <div
        onClick={() => setCardExpanded(v => !v)}
        style={{ cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#191F28' }}>{report.store_name}</span>
            <span style={{ fontSize: 12, color: '#8B95A1', marginLeft: 8 }}>{date}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <span style={{
              fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
              background: meta.bg, color: meta.fg,
            }}>
              {meta.label}
            </span>
            <svg
              width="16" height="16" viewBox="0 0 16 16" fill="none"
              style={{ transition: 'transform 0.2s', transform: cardExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
            >
              <path d="M4 6L8 10L12 6" stroke="#8B95A1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <StatusBadge label="콘센트" value={report.outlet_status} />
          <StatusBadge label="좌석" value={report.seat_status} />
          <StatusBadge label="소음" value={report.noise_status} />
        </div>

        {report.content && (
          <p style={{
            fontSize: 14, color: '#4E5968', lineHeight: 1.6,
            marginBottom: cardExpanded ? 10 : 0,
            // 접힌 상태에선 2줄까지만 표시
            ...(cardExpanded ? {} : {
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
            }),
          }}>{report.content}</p>
        )}
      </div>

      {/* ── 펼침 영역 (cardExpanded 시에만 표시) ── */}
      {!cardExpanded ? null : (
        <>
      {report.photo_urls?.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <button
            onClick={() => setPhotosOpen(o => !o)}
            style={{ fontSize: 13, color: '#3182F6', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 8 }}
          >
            사진 {report.photo_urls.length}장 {photosOpen ? '접기 ▲' : '보기 ▼'}
          </button>
          {photosOpen && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {report.photo_urls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer">
                  <img src={url} alt={`사진 ${i + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 상태 변경 버튼 그룹 */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid #F2F4F6', paddingTop: 12 }}>
        <span style={{ fontSize: 12, color: '#8B95A1', alignSelf: 'center', marginRight: 4 }}>상태 변경:</span>
        {REPORT_STATUS_OPTIONS.map(opt => {
          const active = opt.value === report.status;
          return (
            <button
              key={opt.value}
              onClick={() => handleChange(opt.value)}
              disabled={updating || active}
              style={{
                padding: '5px 12px', borderRadius: 8,
                background: active ? opt.bg : '#FFFFFF',
                color: active ? opt.fg : '#6B7684',
                border: active ? `1px solid ${opt.fg}33` : '1px solid #E5E8EB',
                fontSize: 12, fontWeight: 600,
                cursor: (updating || active) ? 'default' : 'pointer',
                opacity: updating && !active ? 0.5 : 1,
                transition: 'all 0.15s',
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* 어드민 메모 (admin_comment) */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F2F4F6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#8B95A1', fontWeight: 600 }}>어드민 메모</span>
          {justSaved && (
            <span style={{ fontSize: 11, color: '#00C471', fontWeight: 600 }}>✓ 저장됨</span>
          )}
        </div>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="내부 검토 메모를 남기세요 (예: 방문 확인 완료, 사용자 추가 확인 필요 등)"
          rows={3}
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 8,
            border: '1px solid #E5E8EB', outline: 'none',
            fontSize: 13, fontFamily: 'inherit', resize: 'vertical',
            lineHeight: 1.5, boxSizing: 'border-box',
            color: '#191F28', background: '#FAFBFC',
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            onClick={handleSaveComment}
            disabled={!commentDirty || savingComment}
            style={{
              padding: '7px 16px', borderRadius: 8,
              background: commentDirty && !savingComment ? '#3182F6' : '#E5E8EB',
              color: commentDirty && !savingComment ? '#FFFFFF' : '#ADB5BD',
              border: 'none',
              fontSize: 13, fontWeight: 600,
              cursor: (commentDirty && !savingComment) ? 'pointer' : 'default',
              transition: 'background 0.15s',
            }}
          >
            {savingComment ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

// ─── 가이드북 상세 편집 ────────────────────────────────────────
function GuidebookDetailView({
  guidebook,
  onBack,
  onDeleted,
}: {
  guidebook: Guidebook;
  onBack: () => void;
  onDeleted: () => void;
}) {
  const [title, setTitle] = useState(guidebook.title);
  const [isPublished, setIsPublished] = useState(guidebook.is_published);
  const [savedTitle, setSavedTitle] = useState(guidebook.title);
  const [savedIsPublished, setSavedIsPublished] = useState(guidebook.is_published);
  // 코멘트 변경 추적 (itemId → 현재 draft 값)
  const [dirtyComments, setDirtyComments] = useState<Map<string, string>>(new Map());
  const hasUnsavedChanges =
    title !== savedTitle || isPublished !== savedIsPublished || dirtyComments.size > 0;
  const [items, setItems] = useState<GuidebookItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [allStores, setAllStores] = useState<StoreOption[]>([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [showAddStore, setShowAddStore] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedStoreIds, setSelectedStoreIds] = useState<Set<string>>(new Set());
  const [addingStores, setAddingStores] = useState(false);

  useEffect(() => {
    loadItems();
    loadAllStores();
  }, []);

  async function loadItems() {
    setLoadingItems(true);
    const { data: rawItems, error } = await supabase
      .from('guidebook_items')
      .select('id, guidebook_id, store_id, comment, sort_order')
      .eq('guidebook_id', guidebook.id)
      .order('sort_order', { ascending: true });
    if (error || !rawItems?.length) {
      setItems([]);
      setLoadingItems(false);
      return;
    }
    const storeIds = rawItems.map(i => i.store_id);
    const { data: storeRows } = await supabase
      .from('stores')
      .select('id, name, address_road, thumbnail_url')
      .in('id', storeIds);
    const storeMap = new Map((storeRows ?? []).map(s => [s.id, s]));
    const combined: GuidebookItem[] = rawItems.map(item => ({
      ...item,
      store: storeMap.get(item.store_id) ?? { id: item.store_id, name: '알 수 없음', address_road: '', thumbnail_url: '' },
    }));
    setItems(combined);
    setDirtyComments(new Map()); // 새 데이터 로드 시 draft 초기화
    setLoadingItems(false);
  }

  async function loadAllStores() {
    const { data } = await supabase
      .from('stores')
      .select('id, name, address_road, thumbnail_url')
      .order('name', { ascending: true });
    setAllStores((data ?? []) as StoreOption[]);
  }

  async function saveGuidebook() {
    setSaving(true);
    await supabase.from('guidebooks').update({ title, is_published: isPublished }).eq('id', guidebook.id);
    // 변경된 코멘트 일괄 저장
    for (const [itemId, comment] of dirtyComments) {
      await updateComment(itemId, comment);
    }
    setSavedTitle(title);
    setSavedIsPublished(isPublished);
    setDirtyComments(new Map());
    setSaving(false);
  }

  async function deleteGuidebook() {
    if (!window.confirm(`"${title}" 가이드북을 삭제할까요?\n포함된 매장 항목도 모두 삭제돼요.`)) return;
    await supabase.from('guidebook_items').delete().eq('guidebook_id', guidebook.id);
    await supabase.from('guidebooks').delete().eq('id', guidebook.id);
    onDeleted();
  }

  async function addSelectedStores() {
    if (selectedStoreIds.size === 0) return;
    setAddingStores(true);
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order)) : -1;
    const toAdd = allStores.filter(s => selectedStoreIds.has(s.id));
    console.log('추가할 매장:', toAdd.map(s => s.name), 'guidebook_id:', guidebook.id);
    const inserts = toAdd.map((s, idx) => ({
      guidebook_id: guidebook.id,
      store_id: s.id,
      comment: null,
      sort_order: maxOrder + 1 + idx,
    }));
    const { error: insertError } = await supabase.from('guidebook_items').insert(inserts);
    if (insertError) {
      console.error('❌ insert 오류:', insertError.message);
    }
    await loadItems();
    setSelectedStoreIds(new Set());
    setStoreSearch('');
    setAddingStores(false);
  }

  async function removeItem(itemId: string) {
    await supabase.from('guidebook_items').delete().eq('id', itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
  }

  async function updateComment(itemId: string, comment: string) {
    await supabase.from('guidebook_items').update({ comment: comment || null }).eq('id', itemId);
  }

  // CommentFields에서 blur 시 호출 — 원본과 다르면 dirty로 표시
  function handleCommentDraft(itemId: string, combined: string) {
    const original = items.find(i => i.id === itemId)?.comment ?? '';
    setDirtyComments(prev => {
      const next = new Map(prev);
      if (combined !== original) {
        next.set(itemId, combined);
      } else {
        next.delete(itemId); // 원본으로 되돌린 경우 dirty 해제
      }
      return next;
    });
  }

  const addedStoreIds = new Set(items.map(i => i.store_id));
  const filteredStores = allStores.filter(s =>
    !addedStoreIds.has(s.id) &&
    (storeSearch === '' || s.name.includes(storeSearch) || s.address_road.includes(storeSearch))
  );

  return (
    <div>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, padding: '4px 8px', color: '#4E5968', lineHeight: 1 }}
        >
          ←
        </button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#191F28' }}>가이드북 편집</span>
      </div>

      {/* 제목 + 공개 여부 + 저장/삭제 */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 20, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: '#8B95A1', display: 'block', marginBottom: 6 }}>
          제목 <span style={{ fontWeight: 400 }}>(줄바꿈은 Enter — 카드에서 2줄로 표시돼요)</span>
        </label>
        <textarea
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="가이드북 제목"
          rows={2}
          style={{
            width: '100%', borderRadius: 10, border: '1.5px solid #E5E8EB',
            padding: '10px 12px', fontSize: 15, outline: 'none',
            boxSizing: 'border-box', marginBottom: 16, resize: 'none',
            fontFamily: 'inherit', lineHeight: 1.5,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#191F28', marginBottom: 2 }}>앱에 공개</p>
            <p style={{ fontSize: 12, color: '#8B95A1' }}>켜면 가이드북 탭에서 바로 보여요</p>
          </div>
          <Toggle checked={isPublished} onChange={setIsPublished} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={saveGuidebook}
            disabled={saving || !hasUnsavedChanges}
            style={{
              flex: 1, height: 44, borderRadius: 10, border: 'none',
              background: hasUnsavedChanges ? '#191F28' : '#E5E8EB',
              color: hasUnsavedChanges ? '#fff' : '#ADB5BD',
              fontSize: 15, fontWeight: 600,
              cursor: hasUnsavedChanges ? 'pointer' : 'default',
              opacity: saving ? 0.6 : 1,
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {saving ? '저장 중...' : '저장'}
          </button>
          <button
            onClick={deleteGuidebook}
            style={{
              height: 44, padding: '0 18px', borderRadius: 10,
              background: '#FFF0F0', border: 'none',
              color: '#E53E3E', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            삭제
          </button>
        </div>
      </div>

      {/* 포함된 매장 */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#191F28', marginBottom: 12 }}>
        포함된 매장 <span style={{ color: '#3182F6' }}>{items.length}</span>
      </h3>

      {loadingItems ? (
        <p style={{ color: '#8B95A1', fontSize: 14, marginBottom: 16 }}>불러오는 중...</p>
      ) : items.length === 0 ? (
        <p style={{ color: '#8B95A1', fontSize: 14, marginBottom: 16 }}>아직 매장이 없어요. 아래에서 추가하세요.</p>
      ) : (
        <div style={{ marginBottom: 16 }}>
          {items.map((item) => (
            <div key={item.id} style={{
              background: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              {/* 썸네일 */}
              <div style={{
                width: 56, height: 56, borderRadius: 8, flexShrink: 0,
                backgroundColor: '#E5E8EB',
                backgroundImage: item.store.thumbnail_url ? `url(${item.store.thumbnail_url})` : undefined,
                backgroundSize: 'cover', backgroundPosition: 'center',
              }} />
              {/* 정보 */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#191F28', marginBottom: 2 }}>{item.store.name}</p>
                <p style={{ fontSize: 12, color: '#8B95A1', marginBottom: 8 }}>{item.store.address_road}</p>
                <CommentFields
                  itemId={item.id}
                  initialComment={item.comment}
                  onChange={handleCommentDraft}
                />
              </div>
              {/* 삭제 버튼 */}
              <button
                onClick={() => removeItem(item.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#8B95A1', fontSize: 20, padding: '2px 4px', flexShrink: 0, lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 매장 추가 패널 */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 40 }}>
        <button
          onClick={() => setShowAddStore(s => !s)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <span style={{ fontSize: 22, color: '#3182F6', lineHeight: 1, fontWeight: 400 }}>
            {showAddStore ? '−' : '+'}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#3182F6' }}>매장 추가</span>
        </button>

        {showAddStore && (
          <div style={{ marginTop: 12 }}>
            <input
              value={storeSearch}
              onChange={e => setStoreSearch(e.target.value)}
              placeholder="매장 이름 또는 주소로 검색"
              autoFocus
              style={{
                width: '100%', height: 40, borderRadius: 8, border: '1.5px solid #E5E8EB',
                padding: '0 12px', fontSize: 14, outline: 'none',
                boxSizing: 'border-box', marginBottom: 8, fontFamily: 'inherit',
              }}
            />
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {filteredStores.length === 0 ? (
                <p style={{ fontSize: 13, color: '#8B95A1', padding: '8px 0' }}>
                  {storeSearch ? '검색 결과가 없어요' : '추가할 수 있는 매장이 없어요'}
                </p>
              ) : (
                filteredStores.slice(0, 40).map((store, idx) => {
                  const checked = selectedStoreIds.has(store.id);
                  return (
                    <div
                      key={store.id}
                      onClick={() => setSelectedStoreIds(prev => {
                        const next = new Set(prev);
                        if (next.has(store.id)) next.delete(store.id);
                        else next.add(store.id);
                        return next;
                      })}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                        cursor: 'pointer',
                        padding: '10px 0', textAlign: 'left',
                        borderBottom: idx < filteredStores.slice(0, 40).length - 1 ? '1px solid #F2F4F6' : 'none',
                        background: checked ? '#EFF6FF' : 'transparent',
                        borderRadius: checked ? 8 : 0,
                        paddingLeft: checked ? 8 : 0,
                        paddingRight: checked ? 8 : 0,
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* 체크박스 */}
                      <div style={{
                        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                        border: checked ? 'none' : '2px solid #D1D5DB',
                        background: checked ? '#3182F6' : '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background 0.15s, border 0.15s',
                      }}>
                        {checked && (
                          <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                            <path d="M1.5 5L5 8.5L11.5 1.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      {/* 썸네일 */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 6, flexShrink: 0,
                        backgroundColor: '#E5E8EB',
                        backgroundImage: store.thumbnail_url ? `url(${store.thumbnail_url})` : undefined,
                        backgroundSize: 'cover', backgroundPosition: 'center',
                      }} />
                      {/* 정보 */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: '#191F28' }}>{store.name}</p>
                        <p style={{ fontSize: 12, color: '#8B95A1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {store.address_road}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* 추가 확인 버튼 */}
            {selectedStoreIds.size > 0 && (
              <button
                onClick={addSelectedStores}
                disabled={addingStores}
                style={{
                  marginTop: 12, width: '100%', height: 46, borderRadius: 10,
                  background: '#3182F6', border: 'none', color: '#fff',
                  fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  opacity: addingStores ? 0.6 : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                {addingStores ? '추가 중...' : `${selectedStoreIds.size}개 매장 추가하기`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 가이드북 목록 ────────────────────────────────────────────
function GuidebooksView() {
  const [guidebooks, setGuidebooks] = useState<Guidebook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Guidebook | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => { loadGuidebooks(); }, []);

  async function loadGuidebooks() {
    setLoading(true);
    const { data } = await supabase
      .from('guidebooks')
      .select('*')
      .order('created_at', { ascending: false });
    setGuidebooks((data ?? []) as Guidebook[]);
    setLoading(false);
  }

  async function createGuidebook() {
    if (!newTitle.trim()) return;
    setCreating(true);
    const { data, error } = await supabase
      .from('guidebooks')
      .insert({ title: newTitle.trim(), is_published: false })
      .select()
      .single();
    if (!error && data) {
      setSelected(data as Guidebook);
      setNewTitle('');
      setShowCreate(false);
    }
    setCreating(false);
  }

  if (selected) {
    return (
      <GuidebookDetailView
        guidebook={selected}
        onBack={() => { setSelected(null); loadGuidebooks(); }}
        onDeleted={() => { setSelected(null); loadGuidebooks(); }}
      />
    );
  }

  return (
    <div>
      {/* 새 가이드북 만들기 */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 16, marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <button
          onClick={() => setShowCreate(s => !s)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          <span style={{ fontSize: 22, color: '#3182F6', lineHeight: 1, fontWeight: 400 }}>
            {showCreate ? '−' : '+'}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#3182F6' }}>새 가이드북 만들기</span>
        </button>

        {showCreate && (
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#8B95A1', display: 'block', marginBottom: 6 }}>
              제목 <span style={{ fontWeight: 400 }}>(줄바꿈은 Enter — 카드에서 2줄로 표시돼요)</span>
            </label>
            <textarea
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder={'예) 서울 근교\n신상 카페'}
              rows={2}
              autoFocus
              style={{
                width: '100%', borderRadius: 10, border: '1.5px solid #E5E8EB',
                padding: '10px 12px', fontSize: 15, outline: 'none',
                boxSizing: 'border-box', marginBottom: 10, resize: 'none',
                fontFamily: 'inherit', lineHeight: 1.5,
              }}
            />
            <button
              onClick={createGuidebook}
              disabled={creating || !newTitle.trim()}
              style={{
                width: '100%', height: 44, borderRadius: 10, background: '#191F28', border: 'none',
                color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                opacity: creating || !newTitle.trim() ? 0.5 : 1,
              }}
            >
              {creating ? '만드는 중...' : '만들기 →'}
            </button>
          </div>
        )}
      </div>

      {/* 가이드북 목록 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#191F28' }}>
          가이드북 <span style={{ color: '#3182F6' }}>{guidebooks.length}</span>
        </h2>
      </div>

      {loading ? (
        <p style={{ color: '#8B95A1', textAlign: 'center', marginTop: 60 }}>불러오는 중...</p>
      ) : guidebooks.length === 0 ? (
        <p style={{ color: '#8B95A1', textAlign: 'center', marginTop: 60 }}>가이드북이 없어요</p>
      ) : (
        guidebooks.map(g => (
          <button
            key={g.id}
            onClick={() => setSelected(g)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#fff', borderRadius: 14, padding: '16px 20px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 10,
              border: 'none', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: 15, fontWeight: 600, color: '#191F28',
                whiteSpace: 'pre-line', marginBottom: 4,
              }}>
                {g.title}
              </p>
              <p style={{ fontSize: 12, color: '#8B95A1' }}>
                {new Date(g.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 12 }}>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                background: g.is_published ? '#D4EDDA' : '#F2F4F6',
                color: g.is_published ? '#155724' : '#6B7684',
              }}>
                {g.is_published ? '공개' : '비공개'}
              </span>
              <span style={{ color: '#C4C9CF', fontSize: 18 }}>›</span>
            </div>
          </button>
        ))
      )}
    </div>
  );
}

// ─── 메인 어드민 앱 ───────────────────────────────────────────
export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [tab, setTab] = useState<'places' | 'reports' | 'guidebooks' | 'notices'>('places');

  // 세션 초기 로드 + 변경 구독 (로그인/로그아웃 시 자동 갱신)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingAuth(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const authed = !!session && isAllowedAdmin(session.user.email);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    if (!authed) return;
    setLoadingReports(true);
    supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReports((data ?? []) as Report[]);
        setLoadingReports(false);
      });
  }, [authed]);

  // 제보 상태 변경 (낙관적 업데이트 + Supabase 동기화)
  const handleReportStatusChange = async (id: string, status: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    const { error } = await supabase.from('reports').update({ status }).eq('id', id);
    if (error) {
      alert('상태 변경 실패: ' + error.message);
      // 롤백
      const { data } = await supabase.from('reports').select('*').eq('id', id).maybeSingle();
      if (data) setReports(prev => prev.map(r => r.id === id ? (data as Report) : r));
    }
  };

  // 제보 어드민 메모 저장
  const handleReportCommentSave = async (id: string, comment: string) => {
    const next = comment.length > 0 ? comment : null;
    setReports(prev => prev.map(r => r.id === id ? { ...r, admin_comment: next } : r));
    const { error } = await supabase.from('reports').update({ admin_comment: next }).eq('id', id);
    if (error) {
      alert('메모 저장 실패: ' + error.message);
      const { data } = await supabase.from('reports').select('*').eq('id', id).maybeSingle();
      if (data) setReports(prev => prev.map(r => r.id === id ? (data as Report) : r));
    }
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB', color: '#6B7684', fontSize: 14 }}>
        로그인 상태 확인 중...
      </div>
    );
  }
  if (!authed) return <LoginScreen />;

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: 'inherit' }}>
      {/* 헤더 */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #E5E8EB',
        padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#191F28' }}>카공지도 어드민</h1>
          <p style={{ fontSize: 12, color: '#8B95A1', marginTop: 2 }}>{session?.user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          style={{ fontSize: 13, color: '#8B95A1', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          로그아웃
        </button>
      </div>

      {/* 탭 */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E8EB', display: 'flex', padding: '0 24px' }}>
        {(['places', 'reports', 'guidebooks', 'notices'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600,
              color: tab === t ? '#191F28' : '#8B95A1',
              borderBottom: tab === t ? '2.5px solid #191F28' : '2.5px solid transparent',
              marginBottom: -1,
            }}
          >
            {t === 'places' ? '장소 등록' : t === 'reports' ? '제보 목록' : t === 'guidebooks' ? '가이드북' : '공지사항'}
          </button>
        ))}
      </div>

      {/* 본문 */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        {tab === 'places' && <PlaceRegisterTab />}
        {tab === 'reports' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#191F28' }}>
                제보 목록 <span style={{ color: '#3182F6' }}>{reports.length}</span>
              </h2>
            </div>
            {loadingReports ? (
              <p style={{ color: '#8B95A1', textAlign: 'center', marginTop: 60 }}>불러오는 중...</p>
            ) : reports.length === 0 ? (
              <p style={{ color: '#8B95A1', textAlign: 'center', marginTop: 60 }}>제보가 없어요</p>
            ) : (
              reports.map(r => (
                <ReportCard
                  key={r.id}
                  report={r}
                  onStatusChange={handleReportStatusChange}
                  onCommentSave={handleReportCommentSave}
                />
              ))
            )}
          </>
        )}
        {tab === 'guidebooks' && <GuidebooksView />}
        {tab === 'notices' && <NoticesView />}
      </div>
    </div>
  );
}

// ─── 공지사항 관리 ──────────────────────────────────────────────
interface NoticeRow {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

function NoticesView() {
  const [notices, setNotices] = useState<NoticeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<NoticeRow | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('published_at', { ascending: false });
    if (error) { console.error('fetch notices:', error); setLoading(false); return; }
    setNotices((data ?? []) as NoticeRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleTogglePublish = async (n: NoticeRow) => {
    const { error } = await supabase
      .from('notices')
      .update({ is_published: !n.is_published })
      .eq('id', n.id);
    if (error) { alert('발행 상태 변경 실패: ' + error.message); return; }
    await load();
  };

  const handleDelete = async (n: NoticeRow) => {
    if (!confirm(`공지 "${n.title}" 을(를) 삭제하시겠어요?`)) return;
    const { error } = await supabase.from('notices').delete().eq('id', n.id);
    if (error) { alert('삭제 실패: ' + error.message); return; }
    await load();
  };

  if (editing || creating) {
    return (
      <NoticeEditor
        notice={editing}
        onClose={() => { setEditing(null); setCreating(false); }}
        onSaved={() => { setEditing(null); setCreating(false); load(); }}
      />
    );
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#191F28' }}>
          공지사항 <span style={{ color: '#3182F6' }}>{notices.length}</span>
        </h2>
        <button
          onClick={() => setCreating(true)}
          style={{
            padding: '8px 16px', borderRadius: 8, background: '#3182F6',
            color: 'white', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
          }}
        >
          + 새 공지
        </button>
      </div>
      {loading ? (
        <p style={{ color: '#8B95A1', textAlign: 'center', marginTop: 60 }}>불러오는 중...</p>
      ) : notices.length === 0 ? (
        <p style={{ color: '#8B95A1', textAlign: 'center', marginTop: 60 }}>등록된 공지가 없어요</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notices.map(n => (
            <div key={n.id} style={{
              padding: 16, borderRadius: 12, background: 'white',
              border: '1px solid #E5E8EB',
              display: 'flex', flexDirection: 'column', gap: 8,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600,
                    background: n.is_published ? '#E8F4FF' : '#F3F3F3',
                    color: n.is_published ? '#3182F6' : '#8B95A1',
                    flexShrink: 0,
                  }}>
                    {n.is_published ? '발행' : '비공개'}
                  </span>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#191F28', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.title}
                  </p>
                </div>
                <p style={{ fontSize: 12, color: '#B0B8C1', flexShrink: 0 }}>
                  {new Date(n.published_at).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })}
                </p>
              </div>
              <p style={{ fontSize: 12, color: '#6B7684', whiteSpace: 'pre-line',
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {n.content}
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button onClick={() => setEditing(n)} style={{
                  padding: '6px 12px', borderRadius: 6, background: '#F3F3F3',
                  color: '#191F28', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                }}>수정</button>
                <button onClick={() => handleTogglePublish(n)} style={{
                  padding: '6px 12px', borderRadius: 6, background: '#F3F3F3',
                  color: '#191F28', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                }}>{n.is_published ? '비공개로' : '발행'}</button>
                <button onClick={() => handleDelete(n)} style={{
                  padding: '6px 12px', borderRadius: 6, background: '#FFE5E5',
                  color: '#FF4D4D', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
                  marginLeft: 'auto',
                }}>삭제</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function NoticeEditor({ notice, onClose, onSaved }: {
  notice: NoticeRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(notice?.title ?? '');
  const [content, setContent] = useState(notice?.content ?? '');
  const [isPublished, setIsPublished] = useState(notice?.is_published ?? true);
  const [publishedDate, setPublishedDate] = useState(
    notice?.published_at ? notice.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
  );
  const [saving, setSaving] = useState(false);

  const canSave = title.trim().length > 0 && content.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    const payload = {
      title: title.trim(),
      content: content.trim(),
      is_published: isPublished,
      published_at: new Date(publishedDate).toISOString(),
    };
    const { error } = notice
      ? await supabase.from('notices').update(payload).eq('id', notice.id)
      : await supabase.from('notices').insert(payload);
    setSaving(false);
    if (error) { alert('저장 실패: ' + error.message); return; }
    onSaved();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#191F28' }}>
          {notice ? '공지 수정' : '새 공지 작성'}
        </h2>
        <button onClick={onClose} style={{
          padding: '6px 12px', borderRadius: 6, background: '#F3F3F3',
          color: '#8B95A1', fontSize: 13, border: 'none', cursor: 'pointer',
        }}>취소</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, color: '#6B7684', fontWeight: 600 }}>제목</label>
        <input
          type="text" value={title} onChange={e => setTitle(e.target.value)} maxLength={120}
          placeholder="공지 제목을 입력하세요"
          style={{
            padding: '12px 14px', borderRadius: 8, border: '1px solid #E5E8EB',
            fontSize: 14, fontFamily: 'inherit', outline: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, color: '#6B7684', fontWeight: 600 }}>내용</label>
        <textarea
          value={content} onChange={e => setContent(e.target.value)} rows={10}
          placeholder="공지 내용을 입력하세요 (줄바꿈 포함)"
          style={{
            padding: '12px 14px', borderRadius: 8, border: '1px solid #E5E8EB',
            fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', lineHeight: 1.5,
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          <label style={{ fontSize: 12, color: '#6B7684', fontWeight: 600 }}>발행일</label>
          <input
            type="date" value={publishedDate} onChange={e => setPublishedDate(e.target.value)}
            style={{
              padding: '10px 14px', borderRadius: 8, border: '1px solid #E5E8EB',
              fontSize: 14, fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', cursor: 'pointer' }}>
          <input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#191F28' }}>발행</span>
        </label>
      </div>

      <button
        onClick={handleSave} disabled={!canSave}
        style={{
          marginTop: 8, padding: '14px', borderRadius: 8,
          background: canSave ? '#3182F6' : '#E5E8EB',
          color: canSave ? 'white' : '#ADB5BD',
          fontSize: 14, fontWeight: 700, border: 'none',
          cursor: canSave ? 'pointer' : 'default',
        }}
      >
        {saving ? '저장 중...' : (notice ? '수정 완료' : '공지 등록')}
      </button>
    </div>
  );
}
