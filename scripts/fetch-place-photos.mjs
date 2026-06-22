/**
 * fetch-place-photos.mjs
 * 구글 Places API → 도서관/공유공간 사진 다운로드 → images/places/{name}/ 에 저장
 *
 * 사용법:
 *   node scripts/fetch-place-photos.mjs
 *
 * 동작:
 *   1. Supabase libraries + shared_spaces 에서 thumbnail_url 없는 항목 조회
 *   2. 구글 Places API로 검색 → 사진 최대 5장 다운로드
 *   3. images/places/{name}/ 폴더에 저장
 *      - thumbnail.jpg (대표 사진)
 *      - 1.jpg, 2.jpg ... (추가 사진)
 *
 * 다음 단계:
 *   사진 확인 후 node scripts/upload-place-images.mjs 실행
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const raw = readFileSync('.env', 'utf-8');
  const env = {};
  raw.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) env[key.trim()] = rest.join('=').trim();
  });
  return env;
}

const env            = loadEnv();
const SUPABASE_URL   = env.VITE_SUPABASE_URL;
const SUPABASE_SVC   = env.SUPABASE_SERVICE_KEY;
const GOOGLE_KEY     = env.GOOGLE_PLACES_KEY;
const PLACES_DIR     = './images/places';
const MAX_PHOTOS     = 5;
const IMG_EXTS       = ['.jpg', '.jpeg', '.png', '.webp'];

if (!SUPABASE_URL) { console.error('❌ VITE_SUPABASE_URL 없음'); process.exit(1); }
if (!SUPABASE_SVC) { console.error('❌ SUPABASE_SERVICE_KEY 없음'); process.exit(1); }
if (!GOOGLE_KEY)   { console.error('❌ GOOGLE_PLACES_KEY 없음'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_SVC);

async function searchGooglePlace(name, address) {
  const query = encodeURIComponent(`${name} ${address ?? ''}`);
  const url   = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`
              + `?input=${query}&inputtype=textquery&fields=place_id,photos&language=ko&key=${GOOGLE_KEY}`;
  const res  = await fetch(url);
  const json = await res.json();
  if (json.status !== 'OK' || !json.candidates?.length) return null;
  return json.candidates[0].photos ?? null;
}

async function downloadPhoto(photoReference) {
  const url = `https://maps.googleapis.com/maps/api/place/photo`
            + `?maxwidth=1200&photo_reference=${photoReference}&key=${GOOGLE_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  mkdirSync(PLACES_DIR, { recursive: true });

  // libraries + shared_spaces 에서 thumbnail 없는 항목 조회
  const [{ data: libs }, { data: sps }] = await Promise.all([
    supabase.from('libraries').select('name, address_road, thumbnail_url').or('thumbnail_url.is.null,thumbnail_url.eq.'),
    supabase.from('shared_spaces').select('name, address_road, thumbnail_url').or('thumbnail_url.is.null,thumbnail_url.eq.'),
  ]);

  const targets = [
    ...(libs ?? []).map(r => ({ ...r, table: 'libraries' })),
    ...(sps  ?? []).map(r => ({ ...r, table: 'shared_spaces' })),
  ];

  if (!targets.length) { console.log('✅ 모든 장소에 이미지가 있어요!'); return; }

  console.log(`🔍 ${targets.length}개 장소 사진 수집 시작\n`);

  let success = 0, fail = 0;

  for (const place of targets) {
    console.log(`📍 [${place.table}] ${place.name}`);

    const folderPath = join(PLACES_DIR, place.name);
    mkdirSync(folderPath, { recursive: true });

    // 이미 이미지 있으면 건너뜀
    const existing = readdirSync(folderPath).filter(f => IMG_EXTS.includes(f.slice(f.lastIndexOf('.')).toLowerCase()));
    if (existing.length > 0) {
      console.log(`  ⏭️  로컬에 이미지 있음 (${existing.length}장) — 건너뜀\n`);
      continue;
    }

    try {
      const photos = await searchGooglePlace(place.name, place.address_road);
      if (!photos?.length) {
        console.log(`  ⚠️  구글에서 사진 없음\n`);
        fail++;
        continue;
      }

      const targets2 = photos.slice(0, MAX_PHOTOS);
      let saved = 0;

      for (let i = 0; i < targets2.length; i++) {
        try {
          const buffer   = await downloadPhoto(targets2[i].photo_reference);
          const fileName = i === 0 ? 'thumbnail.jpg' : `${i}.jpg`;
          writeFileSync(join(folderPath, fileName), buffer);
          console.log(`  ✅ ${fileName}`);
          saved++;
        } catch (e) {
          console.error(`  ❌ 사진 ${i + 1} 실패: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 200));
      }

      if (saved > 0) { success++; console.log(`  📁 ${saved}장 저장\n`); }
      else { fail++; }

    } catch (e) {
      console.error(`  ❌ 오류: ${e.message}\n`);
      fail++;
    }

    await new Promise(r => setTimeout(r, 500));
  }

  console.log('─'.repeat(50));
  console.log(`🎉 완료! ✅ ${success}개 성공  ❌ ${fail}개 실패`);
  console.log(`\n📋 다음 단계:`);
  console.log(`  1. images/places/ 폴더 열어서 사진 확인/교체`);
  console.log(`  2. node scripts/upload-place-images.mjs 실행`);
}

main().catch(console.error);
