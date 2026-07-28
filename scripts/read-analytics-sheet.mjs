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

// 데이터 시트 전체 읽기
const dataRes = await sheets.spreadsheets.values.get({
  spreadsheetId: SPREADSHEET_ID,
  range: "'[카공지도] 데이터'!A1:L",
});
const dataRows = dataRes.data.values || [];
console.log('=== [카공지도] 데이터 시트 ===');
dataRows.forEach(row => console.log(row.join('\t')));

// 월별 시트 읽기
const monthlyRes = await sheets.spreadsheets.values.get({
  spreadsheetId: SPREADSHEET_ID,
  range: "'[카공지도] monthly'!A1:L",
});
const monthlyRows = monthlyRes.data.values || [];
console.log('\n=== [카공지도] monthly 시트 ===');
monthlyRows.forEach(row => console.log(row.join('\t')));
