/**
 * create-image-folders.mjs
 * Supabase stores 테이블 → 로컬 images/ 폴더 자동 생성
 *
 * 사용법:
 *   node scripts/create-image-folders.mjs --batch "05.1차"
 *   node scripts/create-image-folders.mjs --batch "가이드북5월1차"
 *
 * 결과:
 *   images/
 *     └── 05.1차/
 *           ├── 1844967189/     ← api_place_id (thumbnail 없는 신규 매장만)
 *           │     └── _info.txt
 *           └── 2093847561/
 *                 └── _info.txt
 *
 * 폴더 생성 후:
 *   각 폴더에 이미지를 넣고 upload-images.mjs를 실행하세요.
 *   - thumbnail.jpg  → 대표 썸네일
 *   - 1.jpg, 2.jpg   → 추가 사진들
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

// ── 인자 파싱 ──────────────────────────────────────────────────
const batchIdx = process.argv.indexOf('--batch');
const BATCH    = batchIdx !== -1 ? process.argv[batchIdx + 1] : null;

if (!BATCH) {
  console.error('❌ 배치 이름을 입력해주세요.');
  console.error('   사용법: node scripts/create-image-folders.mjs --batch "05.1차"');
  process.exit(1);
}

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

const env        = loadEnv();
const SUPABASE_URL  = env.VITE_SUPABASE_URL;
const SUPABASE_ANON = env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL)  { console.error('❌ VITE_SUPABASE_URL이 .env에 없어요.');    process.exit(1); }
if (!SUPABASE_ANON) { console.error('❌ VITE_SUPABASE_ANON_KEY가 .env에 없어요.'); process.exit(1); }

const supabase   = createClient(SUPABASE_URL, SUPABASE_ANON);
const IMAGES_DIR = './images';

async function main() {
  console.log(`📦 배치: ${BATCH}`);
  console.log('📋 Supabase에서 매장 목록 불러오는 중...\n');

  // thumbnail_url이 없는 신규 매장만 대상
  const { data: stores, error } = await supabase
    .from('stores')
    .select('api_place_id, name, address_road, thumbnail_url')
    .or('thumbnail_url.is.null,thumbnail_url.eq.')
    .order('name');

  if (error) { console.error('❌ Supabase 오류:', error.message); process.exit(1); }

  if (!stores || stores.length === 0) {
    console.log('✅ 모든 매장에 이미 이미지가 있어요. 생성할 폴더가 없어요.');
    process.exit(0);
  }

  // images/ 루트 + 배치 폴더 생성
  if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR);
  const batchDir = join(IMAGES_DIR, BATCH);
  if (!existsSync(batchDir)) mkdirSync(batchDir);

  let created = 0;
  let skipped = 0;

  for (const store of stores) {
    const folderPath = join(batchDir, store.api_place_id);

    if (existsSync(folderPath)) {
      skipped++;
      continue;
    }

    mkdirSync(folderPath);

    const info = `이름: ${store.name}\n주소: ${store.address_road ?? ''}\nID: ${store.api_place_id}`;
    writeFileSync(join(folderPath, '_info.txt'), info, 'utf-8');

    console.log(`📁 ${BATCH}/${store.api_place_id}/  ←  ${store.name}`);
    created++;
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`🎉 완료!  📁 ${created}개 생성  ⏭️  ${skipped}개 이미 존재`);
  console.log(`\n📋 다음 단계:`);
  console.log(`  1. images/${BATCH}/ 폴더 열기`);
  console.log(`  2. 각 폴더(_info.txt로 카페 확인) 안에 이미지 넣기`);
  console.log(`     - thumbnail.jpg  → 대표 이미지`);
  console.log(`     - 1.jpg, 2.jpg   → 추가 사진`);
  console.log(`  3. node scripts/upload-images.mjs 실행`);
}

main().catch(console.error);
