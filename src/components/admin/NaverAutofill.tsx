import { useState } from 'react';
import { supabase } from '../../pages/AdminPage';

export interface NaverAutofillResult {
  sourceUrl: string;
  amenities: string[];
  businessHoursText: string;
  basePrice: number | null;
  rawConveniences: string[];
}

export default function NaverAutofill({ onResult }: { onResult: (r: NaverAutofillResult) => void }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastResult, setLastResult] = useState<NaverAutofillResult | null>(null);

  async function run() {
    const trimmed = url.trim();
    if (!trimmed || loading) return;
    setLoading(true);
    setError('');
    setLastResult(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('로그인 세션이 없어요.');

      const res = await fetch('/api/naver-place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ url: trimmed }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `요청 실패 (${res.status})`);

      const result: NaverAutofillResult = {
        sourceUrl: trimmed,
        amenities: json.amenities ?? [],
        businessHoursText: json.businessHoursText ?? '',
        basePrice: json.basePrice ?? null,
        rawConveniences: json.rawConveniences ?? [],
      };
      onResult(result);
      setLastResult(result);
      setUrl('');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') run(); }}
          placeholder="네이버 지도/플레이스 링크 붙여넣기"
          style={{
            flex: 1, height: 38, borderRadius: 9, border: '1.5px solid #E5E8EB',
            padding: '0 12px', fontSize: 13, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
          }}
        />
        <button
          type="button"
          onClick={run}
          disabled={loading || !url.trim()}
          style={{
            height: 38, padding: '0 14px', borderRadius: 9, border: 'none',
            background: '#191F28', color: '#fff', fontSize: 13, fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer', opacity: !url.trim() ? 0.5 : 1, flexShrink: 0,
          }}
        >
          {loading ? '불러오는 중...' : '자동 채우기'}
        </button>
      </div>
      {error && <p style={{ fontSize: 12, color: '#E53E3E', marginTop: 6 }}>{error}</p>}
      {lastResult && (
        <div style={{ fontSize: 11.5, color: '#6B7684', marginTop: 8, lineHeight: 1.6 }}>
          <p>네이버가 알려준 편의시설: {lastResult.rawConveniences.length ? lastResult.rawConveniences.join(', ') : '없음'}</p>
          <p>
            그중 자동으로 체크된 것: {lastResult.amenities.length ? `${lastResult.amenities.length}개 (아래 편의시설에서 확인)` : '없음 — 위 목록을 보고 직접 체크해주세요'}
          </p>
        </div>
      )}
      <p style={{ fontSize: 11.5, color: '#B0B8C1', marginTop: 6 }}>
        편의시설·이용시간(카페는 아메리카노 가격도)을 네이버플레이스에서 가져와요. 값은 덮어써지니 확인 후 저장하세요.
      </p>
    </div>
  );
}
