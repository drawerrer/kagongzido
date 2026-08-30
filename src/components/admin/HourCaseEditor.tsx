import { DAY_ORDER, expandHours, type DayKey } from '../../utils/hours';

// ─── 공통: 5분 단위 시간 선택 ─────────────────────────────────────
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const selectStyle: React.CSSProperties = {
  height: 34, borderRadius: 8, border: '1.5px solid #E5E8EB', padding: '0 6px',
  fontSize: 13, outline: 'none', background: '#fff', fontFamily: 'inherit', color: '#191F28',
};

function TimeSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [h, m] = value ? value.split(':') : ['', ''];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <select value={h} onChange={e => onChange(`${e.target.value}:${m || '00'}`)} style={selectStyle}>
        <option value="" disabled>시</option>
        {HOURS.map(v => <option key={v} value={v}>{v}</option>)}
      </select>
      <span style={{ color: '#C4C9D0' }}>:</span>
      <select value={m} onChange={e => onChange(`${h || '00'}:${e.target.value}`)} style={selectStyle}>
        <option value="" disabled>분</option>
        {MINUTES.map(v => <option key={v} value={v}>{v}</option>)}
      </select>
    </div>
  );
}

function DaySelector({ value, onChange }: { value: DayKey[]; onChange: (v: DayKey[]) => void }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {DAY_ORDER.map(day => {
        const active = value.includes(day);
        return (
          <button
            key={day}
            type="button"
            onClick={() => onChange(active ? value.filter(d => d !== day) : [...value, day])}
            style={{
              width: 30, height: 30, borderRadius: 8, fontSize: 12.5, fontWeight: 700,
              border: `1.5px solid ${active ? '#191F28' : '#E5E8EB'}`,
              background: active ? '#191F28' : '#fff',
              color: active ? '#fff' : '#6B7684',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}

const removeBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: '#B0B8C1', fontSize: 18, cursor: 'pointer', padding: '0 4px', lineHeight: 1,
};
const addBtnStyle: React.CSSProperties = {
  alignSelf: 'flex-start', fontSize: 12.5, fontWeight: 700, color: '#3182F6',
  background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'inherit',
};
const caseCardStyle: React.CSSProperties = {
  background: '#FAFBFC', border: '1px solid #E5E8EB', borderRadius: 10, padding: 10,
};

// ─── 이용시간(운영시간) — 요일 + 시간 범위 또는 정기휴무 ────────────
export interface HourCase {
  id: string;
  days: DayKey[];
  closed: boolean;
  open: string;
  close: string;
}

function newHourCase(): HourCase {
  return { id: crypto.randomUUID(), days: [], closed: false, open: '', close: '' };
}

// 기존 저장 값(문자열 또는 jsonb)을 케이스 목록으로 역변환 — 같은 시간대를 쓰는 요일끼리 한 케이스로 묶음
export function hourCasesFromRaw(raw: string | Record<string, unknown> | null): HourCase[] {
  const { hours, regularHoliday } = expandHours(raw);
  const groups = new Map<string, HourCase>();

  DAY_ORDER.forEach(day => {
    const isClosed = regularHoliday.includes(day);
    const h = hours[day];
    if (!isClosed && !h) return; // 정보 없는 요일은 케이스로 만들지 않음

    const open = isClosed ? '' : (h?.open ?? '');
    const close = isClosed ? '' : (h?.close.replace('다음날', '').trim() ?? '');
    const key = `${isClosed}|${open}|${close}`;

    if (!groups.has(key)) groups.set(key, { id: crypto.randomUUID(), days: [], closed: isClosed, open, close });
    groups.get(key)!.days.push(day);
  });

  return Array.from(groups.values());
}

// 케이스 목록 → 기존 파서(expandHours/parseHoursText)가 읽을 수 있는 요일별 한 줄 텍스트로 직렬화
// (요일 범위 표기 "화~토"는 기존 파서가 못 읽어서 항상 요일 1개씩 풀어서 저장)
export function serializeHourCases(cases: HourCase[]): string {
  const perDay = new Map<DayKey, HourCase>();
  cases.forEach(c => c.days.forEach(d => perDay.set(d, c)));

  const lines: string[] = [];
  DAY_ORDER.forEach(day => {
    const c = perDay.get(day);
    if (!c) return;
    if (c.closed) lines.push(`${day} 정기휴무`);
    else if (c.open && c.close) lines.push(`${day} ${c.open}~${c.close}`);
  });
  return lines.join('\n');
}

export default function HourCaseEditor({ value, onChange }: { value: HourCase[]; onChange: (v: HourCase[]) => void }) {
  function update(id: string, patch: Partial<HourCase>) {
    onChange(value.map(c => (c.id === id ? { ...c, ...patch } : c)));
  }
  function remove(id: string) {
    onChange(value.filter(c => c.id !== id));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {value.length === 0 && <p style={{ fontSize: 12.5, color: '#8B95A1', margin: 0 }}>등록된 이용시간이 없어요.</p>}
      {value.map(c => (
        <div key={c.id} style={caseCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <DaySelector value={c.days} onChange={days => update(c.id, { days })} />
            <button type="button" onClick={() => remove(c.id)} style={removeBtnStyle}>×</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {c.closed ? (
              <span style={{ fontSize: 13, color: '#8B95A1', flex: 1 }}>정기휴무</span>
            ) : (
              <>
                <TimeSelect value={c.open} onChange={v => update(c.id, { open: v })} />
                <span style={{ color: '#C4C9D0' }}>~</span>
                <TimeSelect value={c.close} onChange={v => update(c.id, { close: v })} />
              </>
            )}
            <button
              type="button"
              onClick={() => update(c.id, c.closed ? { closed: false } : { closed: true, open: '', close: '' })}
              style={{
                marginLeft: 'auto', fontSize: 11.5, fontWeight: 700, padding: '5px 10px', borderRadius: 8, flexShrink: 0,
                border: `1.5px solid ${c.closed ? '#191F28' : '#E5E8EB'}`,
                background: c.closed ? '#191F28' : '#fff',
                color: c.closed ? '#fff' : '#6B7684',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              정기휴무
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, newHourCase()])} style={addBtnStyle}>
        + 케이스 추가
      </button>
    </div>
  );
}

// ─── 라스트오더 시간 (카페 전용) — 요일 + 시간 1개 ──────────────────
export interface LastOrderCase {
  id: string;
  days: DayKey[];
  time: string;
}

function newLastOrderCase(): LastOrderCase {
  return { id: crypto.randomUUID(), days: [], time: '' };
}

// stores.last_order jsonb: { "월": "21:30", "화": "21:30", ... } (값 없는 요일은 키 생략)
export function lastOrderCasesFromRaw(raw: Record<string, unknown> | null | undefined): LastOrderCase[] {
  if (!raw || typeof raw !== 'object') return [];
  const groups = new Map<string, LastOrderCase>();

  DAY_ORDER.forEach(day => {
    const t = raw[day];
    if (typeof t !== 'string' || !t) return;
    if (!groups.has(t)) groups.set(t, { id: crypto.randomUUID(), days: [], time: t });
    groups.get(t)!.days.push(day);
  });

  return Array.from(groups.values());
}

export function serializeLastOrderCases(cases: LastOrderCase[]): Record<string, string> | null {
  const result: Record<string, string> = {};
  cases.forEach(c => c.days.forEach(d => { if (c.time) result[d] = c.time; }));
  return Object.keys(result).length > 0 ? result : null;
}

export function LastOrderCaseEditor({ value, onChange }: { value: LastOrderCase[]; onChange: (v: LastOrderCase[]) => void }) {
  function update(id: string, patch: Partial<LastOrderCase>) {
    onChange(value.map(c => (c.id === id ? { ...c, ...patch } : c)));
  }
  function remove(id: string) {
    onChange(value.filter(c => c.id !== id));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {value.length === 0 && <p style={{ fontSize: 12.5, color: '#8B95A1', margin: 0 }}>등록된 라스트오더 시간이 없어요.</p>}
      {value.map(c => (
        <div key={c.id} style={caseCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <DaySelector value={c.days} onChange={days => update(c.id, { days })} />
            <button type="button" onClick={() => remove(c.id)} style={removeBtnStyle}>×</button>
          </div>
          <TimeSelect value={c.time} onChange={v => update(c.id, { time: v })} />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, newLastOrderCase()])} style={addBtnStyle}>
        + 케이스 추가
      </button>
    </div>
  );
}
