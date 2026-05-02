/**
 * fill-kakao-data.gs
 * 구글 시트 "카페DB" → 카카오 키워드 검색 API → API 정보 자동 입력
 *
 * 사용법:
 *   1. 구글 시트 상단 메뉴 → 확장 프로그램 → Apps Script
 *   2. 이 코드 전체 붙여넣기
 *   3. 상단 메뉴 → 실행 → setup() 한 번 실행 (카카오 REST 키 입력)
 *   4. 이후 매번 → 실행 → fillKakaoData() 실행
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
function setup() {
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

// ── 메인: 카카오 데이터 자동 입력 ─────────────────────────────
function fillKakaoData() {
  const kakaoKey = PropertiesService.getScriptProperties().getProperty('KAKAO_REST_KEY');
  if (!kakaoKey) {
    SpreadsheetApp.getUi().alert('먼저 setup()을 실행해서 카카오 REST 키를 저장해주세요.');
    return;
  }

  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    SpreadsheetApp.getUi().alert('시트를 찾을 수 없어요: ' + SHEET_NAME);
    return;
  }

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
    if (!name || alreadyDone) { skipped++; continue; }

    const query  = region ? `${name} ${region}` : name;
    const result = searchKakao(query, kakaoKey);

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
function searchKakao(query, key) {
  const url = 'https://dapi.kakao.com/v2/local/search/keyword.json'
            + '?query='               + encodeURIComponent(query)
            + '&category_group_code=' + 'CE7'   // 카페만
            + '&size=1';

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

// ── Supabase CSV 내보내기 형식으로 변환 ──────────────────────────
// 시트 데이터 → Supabase upsert용 JSON 출력 (Logger에서 확인)
function exportToJson() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data  = sheet.getDataRange().getValues();

  const rows = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[COL_NAME] || !r[COL_API_PLACE_ID]) continue; // api_place_id 없는 행 제외

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
