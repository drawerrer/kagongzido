/**
 * fill-kakao-data.gs
 * 구글 시트 "카페DB" → 카카오 키워드 검색 API → API 정보 자동 입력
 *                    → Supabase stores 테이블 upsert
 *
 * 사용법:
 *   1. 구글 시트 상단 메뉴 → 확장 프로그램 → Apps Script
 *   2. 이 코드 전체 붙여넣기
 *   3. 실행 → setupKakao()   : 카카오 REST 키 저장
 *      실행 → setupSupabase(): Supabase URL + anon key 저장
 *   4. 실행 → fillKakaoData()    : 카카오 API 자동 입력
 *      실행 → uploadToSupabase() : 시트 데이터 → Supabase 업로드
 */

// ── 시트 설정 ──────────────────────────────────────────────────
const SHEET_NAME = '카페DB';

// ── 열 인덱스 (0-based, A=0) ───────────────────────────────────
// 수동 입력 열 (A~O)
const COL_NO             = 0;   // A: no.
const COL_REGION         = 1;   // B: region
const COL_NAME           = 2;   // C: name
const COL_CATEGORY       = 3;   // D: category
const COL_BUSINESS_HOURS = 4;   // E: business_hours
const COL_BASE_PRICE     = 5;   // F: base_price
const COL_BADGES         = 6;   // G: badges
const COL_VIBE_TAGS      = 7;   // H: vibe_tags
const COL_OUTLET_STATUS  = 8;   // I: outlet_status
const COL_SEAT_STATUS    = 9;   // J: seat_status
const COL_NOISE_STATUS   = 10;  // K: noise_status
const COL_AMENITIES      = 11;  // L: amenities
const COL_WEBSITE_URL    = 12;  // M: website_url
const COL_PHOTO_URLS     = 13;  // N: photo_urls
const COL_THUMBNAIL_URL  = 14;  // O: thumbnail_url

// 카카오 API 자동 입력 열 (P~U)
const COL_API_PLACE_ID   = 15;  // P: api_place_id
const COL_ADDRESS_ROAD   = 16;  // Q: address_road
const COL_LATITUDE       = 17;  // R: latitude
const COL_LONGITUDE      = 18;  // S: longitude
const COL_PHONE_NUMBER   = 19;  // T: phone_number
const COL_NAME_KAKAO     = 20;  // U: name_kakao (카카오 검색 결과 이름 — 일치 여부 확인용)

const TOTAL_COLS = 21; // A~U

// ── 1회 설정: 카카오 REST 키 저장 ─────────────────────────────
function setupKakao() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    '카카오 REST API 키 입력',
    'VITE_KAKAO_REST_KEY 값을 입력하세요:',
    ui.ButtonSet.OK_CANCEL
  );
  if (result.getSelectedButton() !== ui.Button.OK) return;

  const key = result.getResponseText().trim();
  if (!key) { ui.alert('키를 입력해주세요.'); return; }

  PropertiesService.getScriptProperties().setProperty('KAKAO_REST_KEY', key);
  ui.alert('✅ 카카오 키 저장 완료!\n이제 fillKakaoData()를 실행하세요.');
}

// 하위 호환: 이전에 setup()으로 저장한 경우에도 동작
function setup() { setupKakao(); }

// ── 1회 설정: Supabase URL + anon key 저장 ────────────────────
function setupSupabase() {
  const ui = SpreadsheetApp.getUi();

  const urlResult = ui.prompt(
    'Supabase URL 입력',
    'VITE_SUPABASE_URL 값을 입력하세요:\n(예: https://xxxx.supabase.co)',
    ui.ButtonSet.OK_CANCEL
  );
  if (urlResult.getSelectedButton() !== ui.Button.OK) return;
  const url = urlResult.getResponseText().trim();
  if (!url) { ui.alert('URL을 입력해주세요.'); return; }

  const keyResult = ui.prompt(
    'Supabase Anon Key 입력',
    'VITE_SUPABASE_ANON_KEY 값을 입력하세요:',
    ui.ButtonSet.OK_CANCEL
  );
  if (keyResult.getSelectedButton() !== ui.Button.OK) return;
  const key = keyResult.getResponseText().trim();
  if (!key) { ui.alert('키를 입력해주세요.'); return; }

  const props = PropertiesService.getScriptProperties();
  props.setProperty('SUPABASE_URL',      url);
  props.setProperty('SUPABASE_ANON_KEY', key);
  ui.alert('✅ Supabase 설정 저장 완료!\n이제 uploadToSupabase()를 실행하세요.');
}

// ── 메인: 카카오 데이터 자동 입력 ─────────────────────────────
function fillKakaoData() {
  const kakaoKey = PropertiesService.getScriptProperties().getProperty('KAKAO_REST_KEY');
  if (!kakaoKey) {
    SpreadsheetApp.getUi().alert('먼저 setupKakao()을 실행해서 카카오 REST 키를 저장해주세요.');
    return;
  }

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();

  // P~U 헤더 자동 세팅 (비어있을 때만)
  const headerRange = sheet.getRange(1, 1, 1, TOTAL_COLS);
  const headers     = headerRange.getValues()[0];
  if (!headers[COL_API_PLACE_ID]) {
    sheet.getRange(1, COL_API_PLACE_ID + 1).setValue('api_place_id');
    sheet.getRange(1, COL_ADDRESS_ROAD  + 1).setValue('address_road');
    sheet.getRange(1, COL_LATITUDE      + 1).setValue('latitude');
    sheet.getRange(1, COL_LONGITUDE     + 1).setValue('longitude');
    sheet.getRange(1, COL_PHONE_NUMBER  + 1).setValue('phone_number');
    sheet.getRange(1, COL_NAME_KAKAO    + 1).setValue('name_kakao');
  }

  const lastRow = sheet.getLastRow();
  let filled = 0, skipped = 0, failed = 0;

  for (let row = 2; row <= lastRow; row++) {
    const rowData    = sheet.getRange(row, 1, 1, TOTAL_COLS).getValues()[0];
    const name       = String(rowData[COL_NAME]   || '').trim();
    const region     = String(rowData[COL_REGION] || '').trim();
    const alreadyDone = rowData[COL_API_PLACE_ID];

    // 이름 없거나 이미 api_place_id 채워진 행은 건너뜀
    // (❌ 검색 실패 표시된 행은 재시도)
    if (!name || (alreadyDone && !String(rowData[COL_NAME_KAKAO]).startsWith('❌'))) { skipped++; continue; }

    const query  = region ? `${name} ${region}` : name;

    // 1차: 카페(CE7) 카테고리로 검색
    let result = searchKakao(query, kakaoKey, 'CE7');

    // 2차: 카페로 안 잡히면 카테고리 없이 재시도 (빵집·베이커리 등 다른 카테고리 매장 대응)
    if (!result) {
      Utilities.sleep(150);
      result = searchKakao(query, kakaoKey, '');
    }

    if (result) {
      sheet.getRange(row, COL_API_PLACE_ID + 1).setValue(result.id);
      sheet.getRange(row, COL_ADDRESS_ROAD  + 1).setValue(result.road_address_name || result.address_name || '');
      sheet.getRange(row, COL_LATITUDE      + 1).setValue(parseFloat(result.y));
      sheet.getRange(row, COL_LONGITUDE     + 1).setValue(parseFloat(result.x));
      sheet.getRange(row, COL_PHONE_NUMBER  + 1).setValue(result.phone || '');
      sheet.getRange(row, COL_NAME_KAKAO    + 1).setValue(result.place_name);
      filled++;
    } else {
      // 검색 실패 표시 — 수동으로 확인 후 직접 입력
      sheet.getRange(row, COL_NAME_KAKAO + 1).setValue('❌ 검색 실패');
      failed++;
    }

    Utilities.sleep(200); // 카카오 API 레이트리밋 방지
  }

  SpreadsheetApp.getUi().alert(
    `완료!\n✅ ${filled}개 자동 입력\n⏭️ ${skipped}개 건너뜀 (이미 완료 또는 이름 없음)\n❌ ${failed}개 검색 실패 (name_kakao 열 확인)`
  );
}

// ── 카카오 키워드 검색 API ─────────────────────────────────────
function searchKakao(query, key, categoryCode) {
  let url = 'https://dapi.kakao.com/v2/local/search/keyword.json'
          + '?query=' + encodeURIComponent(query)
          + '&size=1';
  if (categoryCode) url += '&category_group_code=' + categoryCode;

  try {
    const res  = UrlFetchApp.fetch(url, {
      headers:           { 'Authorization': 'KakaoAK ' + key },
      muteHttpExceptions: true,
    });
    const json = JSON.parse(res.getContentText());
    return (json.documents && json.documents.length > 0) ? json.documents[0] : null;
  } catch (e) {
    Logger.log('Kakao search error [' + query + ']: ' + e.message);
    return null;
  }
}

// ── Supabase upsert ───────────────────────────────────────────
function uploadToSupabase() {
  const props      = PropertiesService.getScriptProperties();
  const supabaseUrl = props.getProperty('SUPABASE_URL');
  const anonKey    = props.getProperty('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !anonKey) {
    SpreadsheetApp.getUi().alert('먼저 setupSupabase()를 실행해서 Supabase 설정을 저장해주세요.');
    return;
  }

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const sheetName = sheet.getName();

  const ui = SpreadsheetApp.getUi();
  const confirm = ui.alert(
    'Supabase 업로드',
    '"' + sheetName + '" 시트를 Supabase에 업로드할까요?',
    ui.ButtonSet.OK_CANCEL
  );
  if (confirm !== ui.Button.OK) return;

  const data  = sheet.getDataRange().getValues();

  // 업로드할 행 수집
  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[COL_NAME] || !r[COL_API_PLACE_ID]) continue; // api_place_id 없는 행 제외

    rows.push({
      api_place_id:   String(r[COL_API_PLACE_ID]),
      name:           String(r[COL_NAME]),
      category:       String(r[COL_CATEGORY]       || '카페'),
      address_road:   String(r[COL_ADDRESS_ROAD]   || ''),
      latitude:       Number(r[COL_LATITUDE])       || 0,
      longitude:      Number(r[COL_LONGITUDE])      || 0,
      phone_number:   r[COL_PHONE_NUMBER]  ? String(r[COL_PHONE_NUMBER])  : null,
      thumbnail_url:  String(r[COL_THUMBNAIL_URL]  || ''),
      photo_urls:     r[COL_PHOTO_URLS]
                        ? String(r[COL_PHOTO_URLS]).split(',').map(s => s.trim()).filter(Boolean)
                        : [],
      business_hours: r[COL_BUSINESS_HOURS] ? String(r[COL_BUSINESS_HOURS]) : null,
      website_url:    r[COL_WEBSITE_URL]    ? String(r[COL_WEBSITE_URL])    : null,
      seat_status:    String(r[COL_SEAT_STATUS]    || '정보없음'),
      outlet_status:  String(r[COL_OUTLET_STATUS]  || '정보없음'),
      noise_status:   String(r[COL_NOISE_STATUS]   || '정보없음'),
      vibe_tags:      r[COL_VIBE_TAGS]
                        ? String(r[COL_VIBE_TAGS]).split(',').map(s => s.trim()).filter(Boolean)
                        : [],
      base_price:     Number(String(r[COL_BASE_PRICE]).replace(/[^0-9]/g, '')) || 0,
      amenities:      r[COL_AMENITIES]
                        ? String(r[COL_AMENITIES]).split(',').map(s => s.trim()).filter(Boolean)
                        : [],
      badges:         r[COL_BADGES]
                        ? String(r[COL_BADGES]).split(',').map(s => s.trim()).filter(Boolean)
                        : [],
    });
  }

  if (rows.length === 0) {
    SpreadsheetApp.getUi().alert('업로드할 데이터가 없어요. api_place_id가 채워진 행이 있는지 확인해주세요.');
    return;
  }

  // 50개씩 나눠서 업로드 (Supabase 요청 크기 제한 대응)
  // 중복 api_place_id가 있으면 의도적으로 23505 오류 발생 → 시트에서 수동 제거
  const BATCH_SIZE = 50;
  let success = 0, failed = 0;
  const endpoint = supabaseUrl.replace(/\/$/, '') + '/rest/v1/stores';

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    try {
      const res = UrlFetchApp.fetch(endpoint, {
        method:             'POST',
        headers: {
          'apikey':        anonKey,
          'Authorization': 'Bearer ' + anonKey,
          'Content-Type':  'application/json',
          'Prefer':        'resolution=merge-duplicates',  // upsert
        },
        payload:            JSON.stringify(batch),
        muteHttpExceptions: true,
      });

      const code = res.getResponseCode();
      if (code === 200 || code === 201) {
        success += batch.length;
      } else {
        Logger.log('Supabase 오류 [batch ' + i + ']: ' + res.getContentText());
        failed += batch.length;
      }
    } catch (e) {
      Logger.log('fetch 오류 [batch ' + i + ']: ' + e.message);
      failed += batch.length;
    }

    Utilities.sleep(300); // 배치 간 딜레이
  }

  SpreadsheetApp.getUi().alert(
    `Supabase 업로드 완료!\n✅ ${success}개 성공\n❌ ${failed}개 실패\n\n실패 항목은 Apps Script → 실행 로그에서 확인하세요.`
  );
}

// ════════════════════════════════════════════════════════════════
// 도서관 / 공유공간 시트 전용 함수
// ════════════════════════════════════════════════════════════════

// ── 열 인덱스 (0-based, 카페DB와 동일 구조) ───────────────────────
// 수동 입력 열 (A~O)
const PLACE_COL_NO             = 0;   // A: no.
const PLACE_COL_REGION         = 1;   // B: region
const PLACE_COL_NAME           = 2;   // C: name
const PLACE_COL_CATEGORY       = 3;   // D: category
const PLACE_COL_BUSINESS_HOURS = 4;   // E: business_hours
const PLACE_COL_ENT_PRICE      = 5;   // F: ent_price
const PLACE_COL_BADGES         = 6;   // G: badges
const PLACE_COL_FACILITIES     = 7;   // H: facilities
const PLACE_COL_ENT_CONDITION  = 8;   // I: ent_condition
const PLACE_COL_LT_SEAT_STATUS = 9;   // J: ltseat_status
const PLACE_COL_NOISE_STATUS   = 10;  // K: noise_status
const PLACE_COL_AMENITIES      = 11;  // L: amenities
const PLACE_COL_WEBSITE_URL    = 12;  // M: website_url
const PLACE_COL_PHOTO_URLS     = 13;  // N: photo_urls
const PLACE_COL_THUMBNAIL_URL  = 14;  // O: thumbnail_url

// 카카오 API 자동 입력 열 (P~U) — 카페DB와 동일 인덱스
const PLACE_COL_API_PLACE_ID   = 15;  // P: api_place_id
const PLACE_COL_ADDRESS_ROAD   = 16;  // Q: address_road
const PLACE_COL_LATITUDE       = 17;  // R: latitude
const PLACE_COL_LONGITUDE      = 18;  // S: longitude
const PLACE_COL_PHONE_NUMBER   = 19;  // T: phone_number
const PLACE_COL_NAME_KAKAO     = 20;  // U: name_kakao

const PLACE_TOTAL_COLS = 21;

// ── 도서관/공유공간 카카오 데이터 자동 입력 ───────────────────────
// 카페DB의 fillKakaoData()와 동일하게 동작하지만
// 카페 카테고리(CE7) 없이 키워드 검색만 수행 (도서관/공유공간에 적합)
function fillPlaceKakaoData() {
  const kakaoKey = PropertiesService.getScriptProperties().getProperty('KAKAO_REST_KEY');
  if (!kakaoKey) {
    SpreadsheetApp.getUi().alert('먼저 setupKakao()을 실행해서 카카오 REST 키를 저장해주세요.');
    return;
  }

  const ss        = SpreadsheetApp.getActiveSpreadsheet();
  const sheet     = ss.getActiveSheet();
  const sheetName = sheet.getName();

  if (sheetName !== '도서관' && sheetName !== '공유공간') {
    SpreadsheetApp.getUi().alert('도서관 또는 공유공간 시트에서 실행해주세요.\n현재 시트: ' + sheetName);
    return;
  }

  // P~U 헤더 자동 세팅 (비어있을 때만)
  const headers = sheet.getRange(1, 1, 1, PLACE_TOTAL_COLS).getValues()[0];
  if (!headers[PLACE_COL_API_PLACE_ID]) {
    sheet.getRange(1, PLACE_COL_API_PLACE_ID + 1).setValue('api_place_id');
    sheet.getRange(1, PLACE_COL_ADDRESS_ROAD  + 1).setValue('address_road');
    sheet.getRange(1, PLACE_COL_LATITUDE      + 1).setValue('latitude');
    sheet.getRange(1, PLACE_COL_LONGITUDE     + 1).setValue('longitude');
    sheet.getRange(1, PLACE_COL_PHONE_NUMBER  + 1).setValue('phone_number');
    sheet.getRange(1, PLACE_COL_NAME_KAKAO    + 1).setValue('name_kakao');
  }

  const lastRow = sheet.getLastRow();
  let filled = 0, skipped = 0, failed = 0;

  for (let row = 2; row <= lastRow; row++) {
    const rowData    = sheet.getRange(row, 1, 1, PLACE_TOTAL_COLS).getValues()[0];
    const name       = String(rowData[PLACE_COL_NAME]   || '').trim();
    const region     = String(rowData[PLACE_COL_REGION] || '').trim();
    const alreadyDone = rowData[PLACE_COL_API_PLACE_ID];

    if (!name || (alreadyDone && !String(rowData[PLACE_COL_NAME_KAKAO]).startsWith('❌'))) {
      skipped++;
      continue;
    }

    const query = region ? name + ' ' + region : name;

    // 카테고리 없이 키워드 검색 (도서관/공유공간은 카페 카테고리 X)
    const result = searchKakao(query, kakaoKey, '');

    if (result) {
      sheet.getRange(row, PLACE_COL_API_PLACE_ID + 1).setValue(result.id);
      sheet.getRange(row, PLACE_COL_ADDRESS_ROAD  + 1).setValue(result.road_address_name || result.address_name || '');
      sheet.getRange(row, PLACE_COL_LATITUDE      + 1).setValue(parseFloat(result.y));
      sheet.getRange(row, PLACE_COL_LONGITUDE     + 1).setValue(parseFloat(result.x));
      sheet.getRange(row, PLACE_COL_PHONE_NUMBER  + 1).setValue(result.phone || '');
      sheet.getRange(row, PLACE_COL_NAME_KAKAO    + 1).setValue(result.place_name);
      filled++;
    } else {
      sheet.getRange(row, PLACE_COL_NAME_KAKAO + 1).setValue('❌ 검색 실패');
      failed++;
    }

    Utilities.sleep(200);
  }

  SpreadsheetApp.getUi().alert(
    '완료!\n✅ ' + filled + '개 자동 입력\n⏭️ ' + skipped + '개 건너뜀 (이미 완료 또는 이름 없음)\n❌ ' + failed + '개 검색 실패 (name_kakao 열 확인)'
  );
}

// ── 도서관/공유공간 → Supabase 업로드 ────────────────────────────
// 활성 시트 이름 기준으로 테이블 자동 선택:
//   도서관   → libraries
//   공유공간 → shared_spaces
// name 컬럼을 upsert 기준 키로 사용 (Supabase unique 제약 필요)
function uploadPlacesToSupabase() {
  const props       = PropertiesService.getScriptProperties();
  const supabaseUrl = props.getProperty('SUPABASE_URL');
  const anonKey     = props.getProperty('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !anonKey) {
    SpreadsheetApp.getUi().alert('먼저 setupSupabase()를 실행해서 Supabase 설정을 저장해주세요.');
    return;
  }

  const ss        = SpreadsheetApp.getActiveSpreadsheet();
  const sheet     = ss.getActiveSheet();
  const sheetName = sheet.getName();

  let tableName;
  if      (sheetName === '도서관')   tableName = 'libraries';
  else if (sheetName === '공유공간') tableName = 'shared_spaces';
  else {
    SpreadsheetApp.getUi().alert('도서관 또는 공유공간 시트에서 실행해주세요.\n현재 시트: ' + sheetName);
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const confirm = ui.alert(
    'Supabase 업로드',
    '"' + sheetName + '" 시트를 ' + tableName + ' 테이블에 업로드할까요?',
    ui.ButtonSet.OK_CANCEL
  );
  if (confirm !== ui.Button.OK) return;

  const data = sheet.getDataRange().getValues();
  const rows = [];

  for (let i = 1; i < data.length; i++) {
    const r    = data[i];
    const name = String(r[PLACE_COL_NAME] || '').trim();
    if (!name) continue; // 이름 없는 행 제외

    rows.push({
      name:            name,
      address_road:    String(r[PLACE_COL_ADDRESS_ROAD]   || ''),
      latitude:        Number(r[PLACE_COL_LATITUDE])  || null,
      longitude:       Number(r[PLACE_COL_LONGITUDE]) || null,
      phone_number:    r[PLACE_COL_PHONE_NUMBER]  ? String(r[PLACE_COL_PHONE_NUMBER])  : null,
      thumbnail_url:   r[PLACE_COL_THUMBNAIL_URL] ? String(r[PLACE_COL_THUMBNAIL_URL]) : null,
      photo_urls:      r[PLACE_COL_PHOTO_URLS]
                         ? String(r[PLACE_COL_PHOTO_URLS]).split(',').map(function(s) { return s.trim(); }).filter(Boolean)
                         : [],
      business_hours:  r[PLACE_COL_BUSINESS_HOURS] ? String(r[PLACE_COL_BUSINESS_HOURS]) : null,
      ent_price:       r[PLACE_COL_ENT_PRICE]      ? String(r[PLACE_COL_ENT_PRICE])      : null,
      ent_condition:   r[PLACE_COL_ENT_CONDITION]  ? String(r[PLACE_COL_ENT_CONDITION])  : null,
      lt_seat_status:  r[PLACE_COL_LT_SEAT_STATUS] ? String(r[PLACE_COL_LT_SEAT_STATUS]) : null,
      noise_status:    r[PLACE_COL_NOISE_STATUS]   ? String(r[PLACE_COL_NOISE_STATUS])   : null,
      facilities:      r[PLACE_COL_FACILITIES]
                         ? String(r[PLACE_COL_FACILITIES]).split(',').map(function(s) { return s.trim(); }).filter(Boolean)
                         : [],
      amenities:       r[PLACE_COL_AMENITIES]
                         ? String(r[PLACE_COL_AMENITIES]).split(',').map(function(s) { return s.trim(); }).filter(Boolean)
                         : [],
      badges:          r[PLACE_COL_BADGES]
                         ? String(r[PLACE_COL_BADGES]).split(',').map(function(s) { return s.trim(); }).filter(Boolean)
                         : [],
      website_url:     r[PLACE_COL_WEBSITE_URL] ? String(r[PLACE_COL_WEBSITE_URL]) : null,
    });
  }

  if (rows.length === 0) {
    ui.alert('업로드할 데이터가 없어요. 이름(C열)이 채워진 행이 있는지 확인해주세요.');
    return;
  }

  const BATCH_SIZE = 50;
  let success = 0, failed = 0;
  // ?on_conflict=name → name 기준으로 upsert (중복 시 업데이트)
  const endpoint = supabaseUrl.replace(/\/$/, '') + '/rest/v1/' + tableName + '?on_conflict=name';

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);

    try {
      const res = UrlFetchApp.fetch(endpoint, {
        method:             'POST',
        headers: {
          'apikey':        anonKey,
          'Authorization': 'Bearer ' + anonKey,
          'Content-Type':  'application/json',
          'Prefer':        'resolution=merge-duplicates',
        },
        payload:            JSON.stringify(batch),
        muteHttpExceptions: true,
      });

      const code = res.getResponseCode();
      if (code === 200 || code === 201) {
        success += batch.length;
      } else {
        Logger.log('Supabase 오류 [batch ' + i + ']: ' + res.getContentText());
        failed += batch.length;
      }
    } catch (e) {
      Logger.log('fetch 오류 [batch ' + i + ']: ' + e.message);
      failed += batch.length;
    }

    Utilities.sleep(300);
  }

  ui.alert(
    'Supabase 업로드 완료!\n✅ ' + success + '개 성공\n❌ ' + failed + '개 실패\n\n실패 항목은 Apps Script → 실행 로그에서 확인하세요.'
  );
}

// ── (참고용) Logger에 JSON 출력 ────────────────────────────────
function exportToJson() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const data  = sheet.getDataRange().getValues();

  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[COL_NAME] || !r[COL_API_PLACE_ID]) continue;

    rows.push({
      api_place_id:  String(r[COL_API_PLACE_ID]),
      name:          r[COL_NAME],
      category:      r[COL_CATEGORY]       || '카페',
      address_road:  r[COL_ADDRESS_ROAD]   || '',
      latitude:      Number(r[COL_LATITUDE])  || 0,
      longitude:     Number(r[COL_LONGITUDE]) || 0,
      phone_number:  r[COL_PHONE_NUMBER]   || null,
      thumbnail_url: r[COL_THUMBNAIL_URL]  || '',
      photo_urls:    r[COL_PHOTO_URLS]
                       ? String(r[COL_PHOTO_URLS]).split(',').map(s => s.trim())
                       : [],
      business_hours: r[COL_BUSINESS_HOURS] || null,
      website_url:   r[COL_WEBSITE_URL]    || null,
      seat_status:   r[COL_SEAT_STATUS]    || '정보없음',
      outlet_status: r[COL_OUTLET_STATUS]  || '정보없음',
      noise_status:  r[COL_NOISE_STATUS]   || '정보없음',
      vibe_tags:     r[COL_VIBE_TAGS]
                       ? String(r[COL_VIBE_TAGS]).split(',').map(s => s.trim())
                       : [],
      base_price:    Number(String(r[COL_BASE_PRICE]).replace(/[^0-9]/g, '')) || 0,
      amenities:     r[COL_AMENITIES]
                       ? String(r[COL_AMENITIES]).split(',').map(s => s.trim())
                       : [],
      badges:        r[COL_BADGES]
                       ? String(r[COL_BADGES]).split(',').map(s => s.trim())
                       : [],
    });
  }

  Logger.log(JSON.stringify(rows, null, 2));
  SpreadsheetApp.getUi().alert(
    `JSON 변환 완료! (${rows.length}개)\nApps Script → 실행 로그에서 확인하세요.`
  );
}
