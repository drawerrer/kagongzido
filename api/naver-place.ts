// Vercel Edge Function — 네이버플레이스 공개 페이지에서 편의시설/영업시간/아메리카노 가격을 읽어와
// 어드민 "장소 등록" 폼 자동 채우기용으로 넘겨줌.
//
// 비용 안전: 유료 API를 호출하지 않음 — 공개 웹페이지 하나를 서버에서 대신 읽어서
// 정규식으로 파싱할 뿐이라 이 함수 자체엔 외부 과금이 없음 (Vercel 함수 실행량만 있음).
// 인증: Supabase 액세스 토큰으로 is_admin()을 서버에서 검증 — 어드민이 아니면 거부.
//
// 필요한 Vercel 환경변수: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

export const config = { runtime: 'edge' };

// 네이버가 쓰는 정확한 표현이 장소마다 조금씩 달라서("무선인터넷" vs "무선 인터넷" 등)
// 정확히 일치하는 문자열만 찾는 사전 매칭 대신 키워드 포함 여부로 판단 — 훨씬 넓게 잡힘
const AMENITY_KEYWORD_RULES: [RegExp, string][] = [
  [/주차|발렛/, 'parking'],
  [/포장/, 'takeout'],
  [/무선.?인터넷|와이파이|wi.?fi/i, 'wifi'],
  [/남.?녀.*화장실|화장실.*구분/, 'separateRestroom'],
  [/내부.?화장실/, 'indoorRestroom'],
  [/단체/, 'groupVisit'],
  [/반려동물|펫\s?프렌들리/, 'pets'],
  [/시간.?제한.?없|24시간/, 'noTimeLimit'],
  [/휠체어|장애인.?편의/, 'wheelchair'],
];

function mapConvenienceToAmenityKey(raw: string): string | null {
  for (const [pattern, key] of AMENITY_KEYWORD_RULES) {
    if (pattern.test(raw)) return key;
  }
  return null;
}

const DAY_ORDER = ['월', '화', '수', '목', '금', '토', '일'];

const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

function extractPlaceId(inputUrl: string, resolvedUrl: string): string | null {
  // 일반 업체(POI)는 .../place/<id>로 바로 안착하지만, 공원/공공장소 등 pinType=site인 경우
  // map.naver.com → m.map.naver.com → appLink.naver로 추가 리다이렉트되면서 경로에서
  // "place/<id>"가 사라지고 쿼리스트링(pinId=<id> 또는 id=<id>)에만 남음 — 둘 다 확인
  const fromPath = resolvedUrl.match(/place\/(\d+)/) || inputUrl.match(/place\/(\d+)/);
  if (fromPath) return fromPath[1];
  const fromQuery = resolvedUrl.match(/[?&]pinId=(\d+)/) || resolvedUrl.match(/[?&]id=(\d+)/);
  return fromQuery ? fromQuery[1] : null;
}

async function resolveAndFetchHtml(inputUrl: string): Promise<{ html: string; placeId: string }> {
  const first = await fetch(inputUrl, { redirect: 'follow', headers: { 'User-Agent': MOBILE_UA } });
  const resolvedUrl = first.url;
  const placeId = extractPlaceId(inputUrl, resolvedUrl);
  if (!placeId) throw new Error('네이버 장소 링크에서 장소 ID를 찾을 수 없어요. 링크를 확인해주세요.');

  const pageRes = await fetch(`https://m.place.naver.com/place/${placeId}/home`, {
    headers: { 'User-Agent': MOBILE_UA },
  });
  if (!pageRes.ok) throw new Error(`네이버 페이지를 가져오지 못했어요 (${pageRes.status})`);
  const html = await pageRes.text();
  return { html, placeId };
}

function parseConveniences(html: string): string[] {
  const m = html.match(/"conveniences":(\[[^\]]*\])/);
  if (!m) return [];
  try {
    return JSON.parse(m[1]) as string[];
  } catch {
    return [];
  }
}

function parseBusinessHours(html: string): { day: string; start: string; end: string }[] {
  const results: { day: string; start: string; end: string }[] = [];
  const re = /"__typename":"WorkingHoursInfo","day":"([^"]+)","businessHours":\{"__typename":"StartEndTime","start":"(\d{2}:\d{2})","end":"(\d{2}:\d{2})"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    results.push({ day: m[1], start: m[2], end: m[3] });
  }
  return results;
}

function toBusinessHoursText(hours: { day: string; start: string; end: string }[]): string {
  const byDay = new Map<string, { start: string; end: string }>();
  hours.forEach(h => { if (DAY_ORDER.includes(h.day)) byDay.set(h.day, h); });
  const lines: string[] = [];
  DAY_ORDER.forEach(d => {
    const h = byDay.get(d);
    if (h) lines.push(`${d} ${h.start}~${h.end}`);
  });
  return lines.join('\n');
}

// "아메리카노"와 정확히 같은 메뉴만 인정 — "라임 아메리카노"/"디카페인 아메리카노"처럼
// 다른 수식어가 붙은 메뉴는 전혀 다른 음료라 제외. HOT/ICE 표기만 떼고 비교하고,
// 둘 다 있고 가격이 다르면 HOT 기준으로 채택.
function parseAmericanoPrice(html: string, placeId: string): number | null {
  const re = new RegExp(`"Menu:${placeId}_\\d+":\\{[^}]*\\}`, 'g');
  const candidates: { temp: 'hot' | 'ice' | 'plain'; price: number }[] = [];

  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const chunk = m[0];
    const rawName = chunk.match(/"name":"([^"]+)"/)?.[1];
    const priceStr = chunk.match(/"price":"?(\d+)"?/)?.[1];
    if (!rawName || !priceStr) continue;

    const isHot = /HOT|핫|뜨거운/i.test(rawName);
    const isIce = /ICE|아이스|차가운/i.test(rawName);

    // HOT/ICE 표기, 괄호, 하이픈, 공백을 전부 제거하고 남는 게 정확히 "아메리카노"인지 확인
    const stripped = rawName
      .replace(/HOT|ICE/gi, '')
      .replace(/핫|아이스|뜨거운|차가운/g, '')
      .replace(/[()\-]/g, '')
      .replace(/\s/g, '');
    if (stripped !== '아메리카노') continue;

    candidates.push({ temp: isHot ? 'hot' : isIce ? 'ice' : 'plain', price: Number(priceStr) });
  }

  if (candidates.length === 0) return null;
  return (
    candidates.find(c => c.temp === 'hot')?.price ??
    candidates.find(c => c.temp === 'plain')?.price ??
    candidates[0].price
  );
}

async function checkIsAdmin(accessToken: string): Promise<boolean> {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error('서버에 SUPABASE 환경변수가 설정되지 않았어요.');

  const res = await fetch(`${url}/rest/v1/rpc/is_admin`, {
    method: 'POST',
    headers: { apikey: anonKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: '{}',
  });
  if (!res.ok) return false;
  const data = await res.json();
  return data === true;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'POST만 허용돼요.' }), { status: 405 });
  }

  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) {
    return new Response(JSON.stringify({ error: '인증 토큰이 없어요.' }), { status: 401 });
  }

  try {
    const admin = await checkIsAdmin(token);
    if (!admin) {
      return new Response(JSON.stringify({ error: '어드민만 사용할 수 있어요.' }), { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const inputUrl = String((body as { url?: string })?.url || '').trim();
    if (!inputUrl) {
      return new Response(JSON.stringify({ error: '네이버 링크를 입력해주세요.' }), { status: 400 });
    }

    const { html, placeId } = await resolveAndFetchHtml(inputUrl);

    const rawConveniences = parseConveniences(html);
    const amenities = Array.from(
      new Set(rawConveniences.map(mapConvenienceToAmenityKey).filter((v): v is string => !!v)),
    );
    const businessHoursText = toBusinessHoursText(parseBusinessHours(html));
    const basePrice = parseAmericanoPrice(html, placeId);

    return new Response(
      JSON.stringify({ amenities, businessHoursText, basePrice, rawConveniences }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
