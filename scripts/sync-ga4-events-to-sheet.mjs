/**
 * GA4 이벤트(cafe_detail_view, cafe_favorite_add) 일별 카운트를
 * 구글 시트에 자동으로 채워넣는 스크립트.
 *
 * 최초 실행 시 브라우저 OAuth 인증이 필요하며, 이후에는 캐시된
 * 토큰(.ga4-token.json)으로 자동 인증됩니다.
 *
 * 사용법:
 *   node scripts/sync-ga4-events-to-sheet.mjs
 */
import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath, URL } from 'node:url';
import open from 'open';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const CLIENT_SECRET_PATH = path.join(
  ROOT,
  'client_secret_697539499200-fsv3thv3ibheiamq4ac5gdtici9cl3cq.apps.googleusercontent.com.json',
);
const TOKEN_PATH = path.join(ROOT, '.ga4-token.json');
const SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
];
const OAUTH_PORT = 53682;

const PROPERTY_ID = '541419555';
const SPREADSHEET_ID = '18tT-i-TS1qI4NBUKVx70TllgxqOsOakZe_mF5HSXylY';

// GA4 이벤트 이름 -> 시트 컬럼 매핑
const EVENT_COLUMNS = {
  cafe_detail_view: 'L', // 상세페이지 진입
  cafe_favorite_add: 'M', // 카페 좋아요
};

async function getAuthClient() {
  const { client_id, client_secret } = JSON.parse(
    fs.readFileSync(CLIENT_SECRET_PATH, 'utf-8'),
  ).installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    `http://localhost:${OAUTH_PORT}`,
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('브라우저에서 구글 계정 인증을 진행해주세요...');
  await open(authUrl);

  const code = await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, `http://localhost:${OAUTH_PORT}`);
      const code = url.searchParams.get('code');
      if (code) {
        res.end('인증이 완료되었습니다. 이 창은 닫으셔도 됩니다.');
        server.close();
        resolve(code);
      } else {
        res.end('인증에 실패했습니다.');
        server.close();
        reject(new Error('인가 코드(code)를 받지 못했습니다.'));
      }
    });
    server.listen(OAUTH_PORT);
  });

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  console.log('인증 토큰을 저장했습니다:', TOKEN_PATH);
  return oAuth2Client;
}

function toGa4Date(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function ga4DateStrToSheetDate(dateStr) {
  // dateStr: YYYYMMDD (GA4 반환 형식)
  const y = dateStr.slice(0, 4);
  const m = parseInt(dateStr.slice(4, 6), 10);
  const d = parseInt(dateStr.slice(6, 8), 10);
  return `${y}. ${m}. ${d}`;
}

function parseSheetDate(str) {
  const match = str.match(/^(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

async function main() {
  const auth = await getAuthClient();
  const analyticsData = google.analyticsdata({ version: 'v1beta', auth });
  const sheets = google.sheets({ version: 'v4', auth });

  // 1. gid=0 시트의 실제 탭 이름 확인
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const targetSheet = spreadsheet.data.sheets.find((s) => s.properties.sheetId === 0);
  if (!targetSheet) throw new Error('gid=0 시트를 찾을 수 없습니다.');
  const sheetTitle = targetSheet.properties.title;

  // 2. A열(날짜)을 읽어 "시트 날짜 문자열 -> 행 번호" 매핑 생성
  const dateColumnRes = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${sheetTitle}'!A1:A1000`,
  });
  const dateRows = dateColumnRes.data.values || [];
  const dateToRow = {};
  let minDate = null;
  dateRows.forEach((row, idx) => {
    const raw = row[0];
    if (!raw) return;
    const parsed = parseSheetDate(String(raw).trim());
    if (!parsed) return;
    const key = `${parsed.getFullYear()}. ${parsed.getMonth() + 1}. ${parsed.getDate()}`;
    dateToRow[key] = idx + 1; // 1-indexed
    if (!minDate || parsed < minDate) minDate = parsed;
  });

  if (!minDate) throw new Error('시트에서 날짜 데이터를 찾지 못했습니다.');

  // GA4 데이터는 당일 처리가 완료되지 않았을 수 있으므로 전날까지만 반영한다.
  const yesterday = new Date();
  yesterday.setHours(0, 0, 0, 0);
  yesterday.setDate(yesterday.getDate() - 1);

  const startDate = toGa4Date(minDate);
  const endDate = toGa4Date(yesterday);

  console.log(`GA4 조회 기간: ${startDate} ~ ${endDate}`);

  // 3. GA4 이벤트 카운트 조회
  const response = await analyticsData.properties.runReport({
    property: `properties/${PROPERTY_ID}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }, { name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        filter: {
          fieldName: 'eventName',
          inListFilter: { values: Object.keys(EVENT_COLUMNS) },
        },
      },
      limit: 100000,
    },
  });

  // 4. 조회 기간의 모든 날짜를 0으로 초기화한 뒤 실제 값으로 덮어쓰기
  const counts = {}; // { 'YYYY. M. D': { cafe_detail_view: 0, cafe_favorite_add: 0 } }
  for (const d = new Date(minDate); d <= yesterday; d.setDate(d.getDate() + 1)) {
    const key = `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`;
    counts[key] = { cafe_detail_view: 0, cafe_favorite_add: 0 };
  }

  for (const row of response.data.rows || []) {
    const [dateStr, eventName] = row.dimensionValues.map((v) => v.value);
    const count = Number(row.metricValues[0].value);
    const sheetDateKey = ga4DateStrToSheetDate(dateStr);
    if (counts[sheetDateKey] && eventName in EVENT_COLUMNS) {
      counts[sheetDateKey][eventName] = count;
    }
  }

  // 5. 시트 업데이트 요청 구성
  const updates = [];
  for (const [dateKey, values] of Object.entries(counts)) {
    const rowNumber = dateToRow[dateKey];
    if (!rowNumber) continue; // 시트에 해당 날짜 행이 없으면 건너뜀
    for (const [eventName, col] of Object.entries(EVENT_COLUMNS)) {
      updates.push({
        range: `'${sheetTitle}'!${col}${rowNumber}`,
        values: [[values[eventName]]],
      });
    }
  }

  if (updates.length === 0) {
    console.log('업데이트할 데이터가 없습니다.');
    return;
  }

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: updates,
    },
  });

  console.log(`${updates.length}개 셀을 업데이트했습니다.`);
}

main().catch((err) => {
  console.error('실행 중 오류가 발생했습니다:', err.message);
  process.exit(1);
});
