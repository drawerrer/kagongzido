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
const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
console.log('시트 목록:', spreadsheet.data.sheets.map(s => s.properties.title + ' (gid=' + s.properties.sheetId + ')').join(', '));

for (const sheet of spreadsheet.data.sheets) {
  const title = sheet.properties.title;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "'" + title + "'!1:3",
  });
  console.log('\n[' + title + '] 상단 행:', JSON.stringify(res.data.values, null, 2));
}
