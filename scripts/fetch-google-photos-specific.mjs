/**
 * fetch-google-photos-specific.mjs
 * 특정 매장만 구글 Places API 사진 가져오기 → 로컬 images/ 폴더에 저장
 *
 * 사용법:
 *   node scripts/fetch-google-photos-specific.mjs --batch "05.1차" 123456789 987654321
 *
 * 인자:
 *   --batch  배치 폴더 이름 (필수)
 *   이후 api_place_id 값들을 스페이스로 구분해서 입력
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync, readdirSync, unlinkSync } from 'fs';
import { join } from 'path';
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
const SUPABASE_URL     = env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE = env.SUPABASE_SERVICE_KEY;
const GOOGLE_KEY       = env.GOOGLE_PLACES_KEY;

if (!SUPABASE_URL)     { console.error('❌ VITE_SUPABASE_URL이 .env에 없어요.');    process.exit(1); }
if (!SUPABASE_SERVICE) { console.error('❌ SUPABASE_SERVICE_KEY가 .env에 없어요.'); process.exit(1); }
if (!GOOGLE_KEY)       { console.error('❌ GOOGLE_PLACES_KEY가 .env에 없어요.');    process.exit(1); }

// ── 인자 파싱 ──────────────────────────────────────────────────
const batchIdx = process.argv.indexOf('--batch');
const BATCH    = batchIdx !== -1 ? process.argv[batchIdx + 1] : null;
const targetIds = process.argv.slice(2).filter(a => a !== '--batch' && a !== BATCH);

if (!BATCH) {
  console.error('❌ 배치 이름을 입력해주세요.');
  console.error('   사용법: node scripts/fetch-google-photos-specific.mjs --batch "05.1차" 123456789 987654321');
  process.exit(1);
}
if (targetIds.length === 0) {
  console.error('❌ api_place_id를 입력해주세요.');
  console.error('   사용법: node scripts/fetch-google-photos-specific.mjs --batch "05.1차" 123456789 987654321');
  process.exit(1);
}

const supabase   = createClient(SUPABASE_URL, SUPABASE_SERVICE);
const IMAGES_DIR = './images';
const MAX_PHOTOS = 10;

// ── 구글 Places 텍스트 검색 → photo_references ─────────────────
async function searchGooglePlace(name, address) {
  const query = encodeURIComponent(`${name} ${address}`);
  const url   = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`
              + `?input=${query}&inputtype=textquery&fields=place_id,photos&language=ko&key=${GOOGLE_KEY}`;

  const res  = await fetch(url);
  const json = await res.json();

  if (json.status !== 'OK' || !json.candidates?.length) return null;
  return json.candidates[0].photos ?? null;
}

// ── photo_reference → Buffer 다운로드 ─────────────────────────
async function downloadPhoto(photoReference) {
  const url = `https://maps.googleapis.com/maps/api/place/photo`
            + `?maxwidth=1200&photo_reference=${photoReference}&key=${GOOGLE_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ── 메인 ──────────────────────────────────────────────────────
async function main() {
  console.log(`🔍 ${targetIds.length}개 매장 조회 중...\n`);

  const { data: stores, error } = await supabase
    .from('stores')
    .select('api_place_id, name, address_road')
    .in('api_place_id', targetIds);

  if (error) { console.error('❌ Supabase 오류:', error.message); process.exit(1); }
  if (!stores?.length) { console.error('❌ 해당 api_place_id 매장을 찾을 수 없어요.'); process.exit(1); }

  // 못 찾은 ID 알려주기
  const foundIds = new Set(stores.map(s => s.api_place_id));
  targetIds.forEach(id => {
    if (!foundIds.has(id)) console.log(`⚠️  ${id}: Supabase에서 찾을 수 없음`);
  });

  // images/{배치}/ 폴더 생성
  if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR);
  const batchDir = join(IMAGES_DIR, BATCH);
  if (!existsSync(batchDir)) mkdirSync(batchDir);

  let successCount = 0;
  let failCount    = 0;

  for (const store of stores) {
    console.log(`📍 ${store.name} (${store.api_place_id})`);

    const folderPath = join(batchDir, store.api_place_id);

    try {
      const photos = await searchGooglePlace(store.name, store.address_road);
      if (!photos?.length) {
        console.log(`  ⏭️  구글에서 사진을 찾지 못했어요\n`);
        failCount++;
        continue;
      }

      // 폴더 생성 (없으면)
      if (!existsSync(folderPath)) {
        mkdirSync(folderPath);
        const info = `이름: ${store.name}\n주소: ${store.address_road ?? ''}\nID: ${store.api_place_id}`;
        writeFileSync(join(folderPath, '_info.txt'), info, 'utf-8');
      }

      // 기존 이미지 삭제 후 새로 저장
      const existingImgs = readdirSync(folderPath).filter(f =>
        ['.jpg', '.jpeg', '.png', '.webp'].includes(f.slice(f.lastIndexOf('.')).toLowerCase())
      );
      existingImgs.forEach(f => unlinkSync(join(folderPath, f)));

      const targets = photos.slice(0, MAX_PHOTOS);
      let saved = 0;

      for (let i = 0; i < targets.length; i++) {
        const ref = targets[i].photo_reference;
        try {
          const buffer   = await downloadPhoto(ref);
          const fileName = i === 0 ? 'thumbnail.jpg' : `${i}.jpg`;
          writeFileSync(join(folderPath, fileName), buffer);
          console.log(`  ✅ ${fileName} 저장 완료`);
          saved++;
        } catch (e) {
          console.error(`  ❌ 사진 ${i + 1} 다운로드 실패: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 200));
      }

      if (saved > 0) {
        console.log(`  📁 images/${BATCH}/${store.api_place_id}/ 에 ${saved}장 저장됨\n`);
        successCount++;
      } else {
        failCount++;
      }

    } catch (e) {
      console.error(`  ❌ 오류: ${e.message}\n`);
      failCount++;
    }

    await new Promise(r => setTimeout(r, 500));
  }

  console.log('─'.repeat(50));
  console.log(`🎉 완료! ✅ ${successCount}개 성공  ❌ ${failCount}개 실패`);
  console.log(`\n📋 다음 단계:`);
  console.log(`  1. images/${BATCH}/ 폴더 열어서 사진 확인 및 선택`);
  console.log(`  2. node scripts/upload-images.mjs 실행`);
}

main().catch(console.error);
