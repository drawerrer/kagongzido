/**
 * seed-stores.mjs
 * 카카오 로컬 API → Supabase stores 테이블 자동 등록 스크립트
 *
 * 사용법:
 *   node scripts/seed-stores.mjs
 *
 * .env 파일에 아래 값이 필요해요:
 *   VITE_KAKAO_REST_KEY=카카오_REST_API_키
 *   VITE_SUPABASE_URL=Supabase_URL
 *   VITE_SUPABASE_ANON_KEY=Supabase_익명키
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// ── .env 파일 파싱 ──────────────────────────────────────────────
function loadEnv() {
  try {
    const raw = readFileSync('.env', 'utf-8');
    const env = {};
    raw.split('\n').forEach(line => {
      const [key, ...rest] = line.split('=');
      if (key && rest.length) env[key.trim()] = rest.join('=').trim();
    });
    return env;
  } catch {
    console.error('❌ .env 파일을 찾을 수 없어요.');
    process.exit(1);
  }
}

const env = loadEnv();
const KAKAO_REST_KEY  = env.VITE_KAKAO_REST_KEY;
const SUPABASE_URL    = env.VITE_SUPABASE_URL;
const SUPABASE_ANON   = env.VITE_SUPABASE_ANON_KEY;

if (!KAKAO_REST_KEY)  { console.error('❌ VITE_KAKAO_REST_KEY가 .env에 없어요.'); process.exit(1); }
if (!SUPABASE_URL)    { console.error('❌ VITE_SUPABASE_URL이 .env에 없어요.');    process.exit(1); }
if (!SUPABASE_ANON)   { console.error('❌ VITE_SUPABASE_ANON_KEY가 .env에 없어요.'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── 검색할 지역 목록 (위도, 경도, 반경m) ────────────────────────
// 원하는 지역을 추가/수정하세요
const LOCATIONS = [
  { label: '강남역',    lat: 37.4979, lng: 127.0276, radius: 1000 },
  { label: '홍대입구',  lat: 37.5573, lng: 126.9240, radius: 1000 },
  { label: '성수동',    lat: 37.5444, lng: 127.0557, radius: 1000 },
  { label: '이태원',    lat: 37.5345, lng: 126.9944, radius: 1000 },
  { label: '연남동',    lat: 37.5635, lng: 126.9232, radius: 800  },
];

// ── 카카오 로컬 API 카페 검색 (페이지네이션) ──────────────────────
async function fetchCafes(lat, lng, radius) {
  const results = [];
  let page = 1;

  while (true) {
    const url = new URL('https://dapi.kakao.com/v2/local/search/category.json');
    url.searchParams.set('category_group_code', 'CE7'); // 카페
    url.searchParams.set('y', lat);
    url.searchParams.set('x', lng);
    url.searchParams.set('radius', radius);
    url.searchParams.set('size', '15');
    url.searchParams.set('page', page);
    url.searchParams.set('sort', 'distance');

    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` },
    });

    if (!res.ok) {
      console.error(`  카카오 API 오류: ${res.status} ${res.statusText}`);
      break;
    }

    const json = await res.json();
    results.push(...json.documents);

    if (json.meta.is_end || page >= 3) break; // 최대 3페이지 (45개)
    page++;
    await new Promise(r => setTimeout(r, 200)); // API 레이트리밋 방지
  }

  return results;
}

// ── 카카오 결과 → stores 테이블 포맷 변환 ─────────────────────────
function toStoreRow(doc) {
  return {
    api_place_id:  doc.id,
    name:          doc.place_name,
    category:      doc.category_group_name || '카페',
    address_road:  doc.road_address_name || doc.address_name,
    latitude:      parseFloat(doc.y),
    longitude:     parseFloat(doc.x),
    phone_number:  doc.phone || null,
    thumbnail_url: '', // 카카오 기본 검색엔 썸네일 없음 — 나중에 직접 입력
    photo_urls:    [],
    website_url:   doc.place_url || null,

    // ── 직접 검수 필요한 항목 — 기본값으로 채워둠 ──
    seat_status:   '정보없음',
    outlet_status: '정보없음',
    noise_status:  '정보없음',
    vibe_tags:     [],
    base_price:    0,
    amenities:     [],
    badges:        [],
  };
}

// ── 메인 ──────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 카페 데이터 수집 시작\n');
  let totalInserted = 0;
  let totalSkipped  = 0;

  for (const loc of LOCATIONS) {
    console.log(`📍 ${loc.label} (반경 ${loc.radius}m) 검색 중...`);
    const cafes = await fetchCafes(loc.lat, loc.lng, loc.radius);
    console.log(`  → ${cafes.length}개 카페 발견`);

    if (cafes.length === 0) continue;

    const rows = cafes.map(toStoreRow);

    // upsert: api_place_id 중복이면 기본 정보만 업데이트
    // (검수 완료된 seat_status 등은 덮어쓰지 않음)
    const { data, error } = await supabase
      .from('stores')
      .upsert(rows, {
        onConflict: 'api_place_id',
        ignoreDuplicates: false,
      })
      .select('id');

    if (error) {
      console.error(`  ❌ Supabase 오류:`, error.message);
    } else {
      console.log(`  ✅ ${data.length}개 등록/업데이트 완료`);
      totalInserted += data.length;
    }
  }

  console.log(`\n🎉 완료! 총 ${totalInserted}개 등록, ${totalSkipped}개 건너뜀`);
  console.log('\n📋 다음 단계:');
  console.log('  1. Supabase Dashboard에서 stores 테이블 확인');
  console.log('  2. seat_status, outlet_status, noise_status 등 직접 검수');
  console.log('  3. 구글 시트로 검수 완료 후 CSV 임포트로 업데이트');
}

main().catch(console.error);
