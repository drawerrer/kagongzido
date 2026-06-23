export type DayKey = '월' | '화' | '수' | '목' | '금' | '토' | '일';
export interface BusinessHour { open: string; close: string; }

export const DAY_ORDER: DayKey[] = ['월', '화', '수', '목', '금', '토', '일'];
const JS_TO_KR: DayKey[] = ['일', '월', '화', '수', '목', '금', '토'];
const WEEKDAYS: DayKey[] = ['월', '화', '수', '목', '금'];
const WEEKEND:  DayKey[] = ['토', '일'];

const DAY_PATTERNS: [RegExp, DayKey][] = [
  [/월요일|월(?=요|,|$|\s)/, '월'],
  [/화요일|화(?=요|,|$|\s)/, '화'],
  [/수요일|수(?=요|,|$|\s)/, '수'],
  [/목요일|목(?=요|,|$|\s)/, '목'],
  [/금요일|금(?=요|,|$|\s)/, '금'],
  [/토요일|토(?=요|,|$|\s)/, '토'],
  [/일요일|일(?=요|,|$|\s)/, '일'],
];

function parseHourEntry(val: unknown): BusinessHour | null {
  if (!val) return null;
  if (typeof val === 'object' && !Array.isArray(val)) {
    const v = val as Record<string, unknown>;
    if (typeof v.open === 'string' && typeof v.close === 'string')
      return { open: v.open.trim(), close: v.close.trim() };
  }
  if (typeof val === 'string') {
    const m = val.match(/(\d{1,2}:\d{2})\s*[~\-]\s*(다음날\s*)?(\d{1,2}:\d{2})/);
    if (m) return { open: m[1], close: (m[2] ? '다음날 ' : '') + m[3] };
  }
  return null;
}

function extractDays(line: string): DayKey[] {
  return DAY_PATTERNS.filter(([pat]) => pat.test(line)).map(([, day]) => day);
}

function parseHoursText(text: string): { hours: Partial<Record<DayKey, BusinessHour | null>>; regularHoliday: DayKey[] } {
  const hours: Partial<Record<DayKey, BusinessHour | null>> = {};
  const regularHoliday: DayKey[] = [];

  if (/24\s*시간|연중무휴/i.test(text)) {
    DAY_ORDER.forEach(d => { hours[d] = { open: '00:00', close: '24:00' }; });
    return { hours, regularHoliday };
  }

  for (const line of text.split('\n')) {
    const t = line.trim();
    if (!t) continue;

    if (/정기\s*휴무|정기\s*휴일|매주\s*(.*)\s*휴무|휴무일/.test(t)) {
      const days = extractDays(t);
      if (days.length === 0) {
        if (/주중/.test(t)) WEEKDAYS.forEach(d => regularHoliday.push(d));
        if (/주말/.test(t)) WEEKEND.forEach(d  => regularHoliday.push(d));
      } else {
        days.forEach(d => regularHoliday.push(d));
      }
      continue;
    }

    const m = t.match(/(\d{1,2}:\d{2})\s*[~\-]\s*(다음날\s*)?(\d{1,2}:\d{2})/);
    if (!m) continue;

    const h: BusinessHour = {
      open:  m[1].trim(),
      close: (m[2] ? '다음날 ' : '') + m[3].trim(),
    };

    if      (/매일/.test(t)) DAY_ORDER.forEach(d => { hours[d] = h; });
    else if (/주중/.test(t)) WEEKDAYS.forEach(d  => { hours[d] = h; });
    else if (/주말/.test(t)) WEEKEND.forEach(d   => { hours[d] = h; });
    else {
      const days = extractDays(t);
      if (days.length > 0) days.forEach(d => { hours[d] = h; });
    }
  }

  return { hours, regularHoliday };
}

export function expandHours(
  raw: string | Record<string, unknown> | null
): { hours: Partial<Record<DayKey, BusinessHour | null>>; regularHoliday: DayKey[] } {
  if (!raw) return { hours: {}, regularHoliday: [] };
  if (typeof raw === 'string') return parseHoursText(raw);

  const result: Partial<Record<DayKey, BusinessHour | null>> = {};
  const set = (days: DayKey[], key: string) => {
    const h = parseHourEntry(raw[key]);
    days.forEach(d => { result[d] = h; });
  };
  if (raw['매일'] !== undefined) set(DAY_ORDER, '매일');
  if (raw['주중'] !== undefined) set(WEEKDAYS,  '주중');
  if (raw['주말'] !== undefined) set(WEEKEND,   '주말');
  DAY_ORDER.forEach(d => { if (raw[d] !== undefined) result[d] = parseHourEntry(raw[d]); });

  return { hours: result, regularHoliday: [] };
}

export function getTodayKey(): DayKey {
  return JS_TO_KR[new Date().getDay()];
}

export function parseTimeMinutes(timeStr: string): number {
  const isNextDay = timeStr.startsWith('다음날');
  const t = timeStr.replace('다음날', '').trim();
  const [h, m] = t.split(':').map(Number);
  return (isNextDay ? 24 * 60 : 0) + (h || 0) * 60 + (m || 0);
}

export function getHoursStatus(
  hours: Partial<Record<DayKey, BusinessHour | null>>,
  regularHoliday: DayKey[]
): { label: string; color: string } {
  const today = getTodayKey();
  const h = hours[today];
  if (regularHoliday.includes(today) || h === null || h === undefined)
    return { label: '휴무', color: '#8B95A1' };
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const open  = parseTimeMinutes(h.open);
  const close = parseTimeMinutes(h.close);
  if (cur < open - 30) return { label: '영업 종료', color: '#8B95A1' };
  if (cur < open)      return { label: '준비 중',   color: '#F59E0B' };
  if (cur >= close)    return { label: '영업 종료', color: '#8B95A1' };
  return { label: '영업 중', color: '#00B493' };
}
