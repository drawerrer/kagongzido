import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_KEY,
);

const ADMIN_PASSWORD = 'kagong2024';

interface Report {
  id: string;
  store_name: string;
  outlet_status: string | null;
  seat_status: string | null;
  noise_status: string | null;
  content: string | null;
  photo_urls: string[];
  status: string;
  created_at: string;
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', '1');
      onLogin();
    } else {
      setError(true);
      setPw('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 40, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: 320 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#191F28', marginBottom: 8 }}>카공지도 어드민</h2>
        <p style={{ fontSize: 14, color: '#6B7684', marginBottom: 24 }}>비밀번호를 입력하세요</p>
        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setError(false); }}
          placeholder="비밀번호"
          autoFocus
          style={{
            width: '100%', height: 44, borderRadius: 10, border: error ? '1.5px solid #FF4D4F' : '1.5px solid #E5E8EB',
            padding: '0 12px', fontSize: 15, outline: 'none', boxSizing: 'border-box', marginBottom: 8,
          }}
        />
        {error && <p style={{ fontSize: 13, color: '#FF4D4F', marginBottom: 8 }}>비밀번호가 틀렸어요</p>}
        <button
          type="submit"
          style={{ width: '100%', height: 44, borderRadius: 10, background: '#191F28', border: 'none', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}
        >
          로그인
        </button>
      </form>
    </div>
  );
}

function StatusBadge({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#F2F4F6', borderRadius: 6, padding: '3px 8px', fontSize: 12, color: '#4E5968', marginRight: 6 }}>
      <span style={{ color: '#8B95A1' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </span>
  );
}

function ReportCard({ report }: { report: Report }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(report.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: 16, fontWeight: 700, color: '#191F28' }}>{report.store_name}</span>
          <span style={{ fontSize: 12, color: '#8B95A1', marginLeft: 8 }}>{date}</span>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
          background: report.status === 'pending' ? '#FFF3CD' : report.status === 'approved' ? '#D4EDDA' : '#F8D7DA',
          color: report.status === 'pending' ? '#856404' : report.status === 'approved' ? '#155724' : '#721C24',
        }}>
          {report.status === 'pending' ? '검토 중' : report.status === 'approved' ? '승인' : '반려'}
        </span>
      </div>

      <div style={{ marginBottom: 10 }}>
        <StatusBadge label="콘센트" value={report.outlet_status} />
        <StatusBadge label="좌석" value={report.seat_status} />
        <StatusBadge label="소음" value={report.noise_status} />
      </div>

      {report.content && (
        <p style={{ fontSize: 14, color: '#4E5968', lineHeight: 1.6, marginBottom: 10 }}>{report.content}</p>
      )}

      {report.photo_urls?.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ fontSize: 13, color: '#3182F6', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 8 }}
          >
            사진 {report.photo_urls.length}장 {expanded ? '접기 ▲' : '보기 ▼'}
          </button>
          {expanded && (
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
    </div>
  );
}

export default function AdminApp() {
  const [authed, setAuthed] = useState(!!sessionStorage.getItem('admin_auth'));
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setReports((data ?? []) as Report[]);
        setLoading(false);
      });
  }, [authed]);

  if (!authed) return <LoginScreen onLogin={() => setAuthed(true)} />;

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: 'Pretendard, sans-serif' }}>
      {/* 헤더 */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E8EB', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: '#191F28' }}>카공지도 어드민</h1>
        <button
          onClick={() => { sessionStorage.removeItem('admin_auth'); setAuthed(false); }}
          style={{ fontSize: 13, color: '#8B95A1', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          로그아웃
        </button>
      </div>

      {/* 본문 */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#191F28' }}>
            제보 목록 <span style={{ color: '#3182F6' }}>{reports.length}</span>
          </h2>
        </div>

        {loading ? (
          <p style={{ color: '#8B95A1', textAlign: 'center', marginTop: 60 }}>불러오는 중...</p>
        ) : reports.length === 0 ? (
          <p style={{ color: '#8B95A1', textAlign: 'center', marginTop: 60 }}>제보가 없어요</p>
        ) : (
          reports.map(r => <ReportCard key={r.id} report={r} />)
        )}
      </div>
    </div>
  );
}
