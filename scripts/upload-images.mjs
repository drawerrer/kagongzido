/**
 * upload-images.mjs
 * 로컬 이미지 폴더 → Supabase Storage 업로드 + stores 테이블 URL 자동 업데이트
 *
 * 사용법:
 *   node scripts/upload-images.mjs
 *
 * 로컬 폴더 구조:
 *   images/
 *     └── {api_place_id}/
 *           ├── thumbnail.jpg   ← thumbnail_url로 저장
 *           ├── 1.jpg
 *           ├── 2.jpg           ← photo_urls 배열로 저장
 *           └── 3.jpg
 *
 * 사전 준비:
 *   1. Supabase Dashboard → Storage → New bucket
 *      이름: cafe-images / Public: ✅
 *   2. 프로젝트 루트에 images/ 폴더 만들고 위 구조로 이미지 넣기
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';
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

if (!SUPABASE_URL)     { console.error('❌ VITE_SUPABASE_URL이 .env에 없어요.');   process.exit(1); }
if (!SUPABASE_SERVICE) { console.error('❌ SUPABASE_SERVICE_KEY가 .env에 없어요.'); process.exit(1); }

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);

const BUCKET     = 'cafe-images';
const IMAGES_DIR = './images';

// 지원 이미지 확장자
const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

function getMimeType(ext) {
  const map = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
  return map[ext.toLowerCase()] ?? 'image/jpeg';
}

// ── Supabase Storage에 파일 업로드 ─────────────────────────────
async function uploadFile(localPath, storagePath) {
  const buffer      = readFileSync(localPath);
  const contentType = getMimeType(extname(localPath));

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType, upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// ── 메인 ──────────────────────────────────────────────────────────
async function main() {
  if (!existsSync(IMAGES_DIR)) {
    console.error(`❌ images/ 폴더가 없어요. 프로젝트 루트에 만들어주세요.`);
    console.error(`   구조: images/{api_place_id}/thumbnail.jpg, 1.jpg, 2.jpg ...`);
    process.exit(1);
  }

  const folders = readdirSync(IMAGES_DIR).filter(name => {
    return statSync(join(IMAGES_DIR, name)).isDirectory();
  });

  if (folders.length === 0) {
    console.error('❌ images/ 안에 폴더가 없어요. api_place_id 이름의 폴더를 만들어주세요.');
    process.exit(1);
  }

  // Supabase에서 이미 thumbnail_url이 있는 매장 목록 가져오기
  const { data: uploaded } = await supabase
    .from('stores')
    .select('api_place_id')
    .not('thumbnail_url', 'is', null)
    .neq('thumbnail_url', '');
  const uploadedIds = new Set((uploaded ?? []).map(r => r.api_place_id));

  console.log(`🚀 이미지 업로드 시작 — ${folders.length}개 매장\n`);
  let successCount = 0;
  let failCount    = 0;
  let skippedCount = 0;

  for (const placeId of folders) {
    const folderPath = join(IMAGES_DIR, placeId);
    const files = readdirSync(folderPath)
      .filter(f => IMG_EXTS.includes(extname(f).toLowerCase()))
      .sort(); // 1.jpg, 2.jpg, thumbnail.jpg 순 정렬

    if (files.length === 0) {
      console.log(`⏭️  ${placeId}: 이미지 없음 — 건너뜀`);
      continue;
    }

    // 이미 업로드된 매장은 건너뜀
    if (uploadedIds.has(placeId)) {
      console.log(`⏭️  ${placeId}: 이미 업로드됨 — 건너뜀`);
      skippedCount++;
      continue;
    }

    console.log(`📂 ${placeId} (${files.length}개 파일)`);

    let thumbnailUrl = '';
    const photoUrls  = [];

    for (const file of files) {
      const localPath   = join(folderPath, file);
      const storagePath = `${placeId}/${file}`;

      try {
        const url = await uploadFile(localPath, storagePath);

        if (file.toLowerCase().startsWith('thumbnail')) {
          thumbnailUrl = url;
          console.log(`  ✅ thumbnail: ${url}`);
        } else {
          photoUrls.push(url);
          console.log(`  ✅ photo: ${url}`);
        }
      } catch (err) {
        console.error(`  ❌ 업로드 실패 [${file}]: ${err.message}`);
        failCount++;
      }
    }

    // thumbnail이 없으면 첫 번째 photo를 thumbnail로 사용
    if (!thumbnailUrl && photoUrls.length > 0) {
      thumbnailUrl = photoUrls[0];
    }

    // stores 테이블 업데이트
    const updateData = {};
    if (thumbnailUrl)      updateData.thumbnail_url = thumbnailUrl;
    if (photoUrls.length)  updateData.photo_urls    = photoUrls;

    if (Object.keys(updateData).length > 0) {
      const { error } = await supabase
        .from('stores')
        .update(updateData)
        .eq('api_place_id', placeId);

      if (error) {
        console.error(`  ❌ DB 업데이트 실패: ${error.message}`);
        failCount++;
      } else {
        console.log(`  💾 stores 테이블 업데이트 완료`);
        successCount++;
      }
    }

    console.log('');
  }

  console.log('─'.repeat(50));
  console.log(`🎉 완료! ✅ ${successCount}개 성공  ❌ ${failCount}개 실패  ⏭️  ${skippedCount}개 이미 업로드됨`);
  console.log(`\n📋 다음 단계:`);
  console.log(`  - 앱에서 이미지 확인 (실기기 또는 프리뷰)`);
  console.log(`  - 실패한 항목은 Supabase Dashboard에서 직접 업로드`);
}

main().catch(console.error);
