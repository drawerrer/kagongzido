import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CLIENT_SECRET_PATH = path.join(ROOT, 'client_secret_697539499200-fsv3thv3ibheiamq4ac5gdtici9cl3cq.apps.googleusercontent.com.json');
const TOKEN_PATH = path.join(ROOT, '.ga4-token.json');
const SPREADSHEET_ID = '18tT-i-TS1qI4NBUKVx70TllgxqOsOakZe_mF5HSXylY';

const { client_id, client_secret } = JSON.parse(fs.readFileSync(CLIENT_SECRET_PATH, 'utf-8')).installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, 'http://localhost:53682');
oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8')));

const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
const res = await sheets.spreadsheets.values.get({
  spreadsheetId: SPREADSHEET_ID,
  range: "'[카공지도] 데이터'!A3:L",
});

const rows = res.data.values || [];
const COLS = ['A(날짜)', 'B(전체유저)', 'C(신규유저)', 'D(기존유저)', 'E(검색)', 'F(전체탭)', 'G(미니앱홈)', 'H(기타)', 'I(음식/음료순위)', 'J(여행순위)', 'K(상세진입)', 'L(좋아요)'];

// 최근 10행만 출력
const recent = rows.slice(-10);
console.log('최근 10일 데이터:');
for (const row of recent) {
  const filled = row.map((v, i) => v !== '' && v !== undefined ? COLS[i] + '=✓' : COLS[i] + '=✗');
  console.log(row[0], '|', filled.slice(1).join(' '));
}

// 비어있는 컬럼 통계
const emptyCounts = new Array(12).fill(0);
for (const row of rows) {
  for (let i = 0; i < 12; i++) {
    if (!row[i] || row[i] === '') emptyCounts[i]++;
  }
}
console.log('\n전체 빈 셀 수 (총', rows.length, '행):');
COLS.forEach((col, i) => { if (emptyCounts[i] > 0) console.log(' ', col, ':', emptyCounts[i], '개 비어있음'); });
