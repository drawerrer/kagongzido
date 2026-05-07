/**
 * upload-images.mjs
 * 로컬 이미지 폴더 → Supabase Storage 업로드 + stores 테이블 URL 자동 업데이트
 *
 * 사용법:
 *   node scripts/upload-images.mjs                      ← images/ 전체 스캔
 *   node scripts/upload-images.mjs --batch "05.1차"     ← 해당 배치만 업로드
 *
 * 로컬 폴더 구조 (두 가지 모두 지원):
 *   images/
 *     └── {api_place_id}/          ← 평면 구조 (기존)
 *           ├── thumbnail.jpg
 *           └── 1.jpg
 *
 *   images/
 *     └── {배치명}/                ← 배치 폴더 구조 (신규)
 *           └── {api_place_id}/
 *                 ├── thumbnail.jpg
 *                 └── 1.jpg
 *
 *   예) images/05.1차/{id}/, images/가이드북5월1차/{id}/
 *
 * 사전 준비:
 *   1. Supabase Dashboard → Storage → New bucket
 *      이름: cafe-images / Public: ✅
 *   2. 프로젝트 루트에 images/ 폴더 만들고 위 구조로 이미지 넣기
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { createClient } from '@supabase/supabase-js';

// ── --batch 인자 파싱 ──────────────────────────────────────────
const batchIdx = process.argv.indexOf('--batch');
const BATCH    = batchIdx !== -1 ? process.argv[batchIdx + 1] : null;

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

// ── images/ 하위에서 place_id 폴더 목록 수집 ──────────────────────
// 평면 구조(images/{id}/)와 배치 구조(images/{배치명}/{id}/) 모두 지원
// 판별 기준: 해당 폴더 안에 이미지 파일이 있으면 place_id 폴더, 없으면 배치 폴더
function collectIdFolders(baseDir) {
  const result = []; // [{ placeId, folderPath }]

  const entries = readdirSync(baseDir).filter(name =>
    statSync(join(baseDir, name)).isDirectory()
  );

  for (const name of entries) {
    const dirPath = join(baseDir, name);
    const contents = readdirSync(dirPath);
    const hasImages = contents.some(f => IMG_EXTS.includes(extname(f).toLowerCase()));

    if (hasImages) {
      // 이미지 파일이 있다 → 이 폴더 자체가 place_id 폴더
      result.push({ placeId: name, folderPath: dirPath });
    } else {
      // 이미지 파일이 없다 → 배치 폴더로 판단, 한 단계 더 내려감
      const subDirs = contents.filter(f => statSync(join(dirPath, f)).isDirectory());
      for (const subName of subDirs) {
        result.push({ placeId: subName, folderPath: join(dirPath, subName) });
      }
      if (subDirs.length > 0) {
        console.log(`📁 배치 폴더 감지: ${name}/ (${subDirs.length}개 매장)`);
      }
    }
  }

  return result;
}

// ── 메인 ──────────────────────────────────────────────────────────
async function main() {
  if (!existsSync(IMAGES_DIR)) {
    console.error(`❌ images/ 폴더가 없어요. 프로젝트 루트에 만들어주세요.`);
    process.exit(1);
  }

  // --batch 지정 시 해당 배치 폴더만 스캔
  let scanDir = IMAGES_DIR;
  if (BATCH) {
    const batchDir = join(IMAGES_DIR, BATCH);
    if (!existsSync(batchDir)) {
      console.error(`❌ 배치 폴더를 찾을 수 없어요: images/${BATCH}/`);
      console.error(`   images/ 안에 있는 폴더 목록:`);
      readdirSync(IMAGES_DIR).forEach(name => console.error(`     - ${name}`));
      process.exit(1);
    }
    scanDir = batchDir;
    console.log(`📦 배치: ${BATCH}`);
  } else {
    console.log(`📦 배치 미지정 — images/ 전체 스캔`);
  }

  const idFolders = collectIdFolders(scanDir);

  if (idFolders.length === 0) {
    console.error('❌ 업로드할 폴더를 찾지 못했어요. 구조를 확인해주세요.');
    process.exit(1);
  }

  // Supabase에서 thumbnail_url이 있는 매장 목록 가져오기
  const { data: uploaded } = await supabase
    .from('stores')
    .select('api_place_id')
    .not('thumbnail_url', 'is', null)
    .neq('thumbnail_url', '');
  const thumbnailDoneIds = new Set((uploaded ?? []).map(r => r.api_place_id));

  console.log(`🚀 이미지 업로드 시작 — ${idFolders.length}개 매장\n`);
  let successCount = 0;
  let failCount    = 0;
  let skippedCount = 0;

  for (const { placeId, folderPath } of idFolders) {
    const files = readdirSync(folderPath)
      .filter(f => IMG_EXTS.includes(extname(f).toLowerCase()))
      .sort();

    if (files.length === 0) {
      console.log(`⏭️  ${placeId}: 이미지 없음 — 건너뜀`);
      continue;
    }

    // thumbnail 보호: 이미 있으면 thumbnail 파일은 건너뛰고 photo_urls만 업데이트
    const thumbnailProtected = thumbnailDoneIds.has(placeId);
    if (thumbnailProtected) {
      console.log(`📂 ${placeId} — thumbnail 보호됨, 추가 사진만 업로드`);
    } else {
      console.log(`📂 ${placeId} (${files.length}개 파일)`);
    }

    let thumbnailUrl = '';
    const photoUrls  = [];

    for (const file of files) {
      const isThumbnail = file.toLowerCase().startsWith('thumbnail');

      // thumbnail 이미 있으면 thumbnail 파일 스킵
      if (isThumbnail && thumbnailProtected) {
        console.log(`  ⏭️  thumbnail: 이미 등록됨 — 건너뜀`);
        skippedCount++;
        continue;
      }

      const localPath   = join(folderPath, file);
      const storagePath = `${placeId}/${file}`;

      try {
        const url = await uploadFile(localPath, storagePath);

        if (isThumbnail) {
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
    if (!thumbnailUrl && photoUrls.length > 0 && !thumbnailProtected) {
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
  console.log(`🎉 완료! ✅ ${successCount}개 성공  ❌ ${failCount}개 실패  ⏭️  ${skippedCount}개 건너뜀`);
  console.log(`\n📋 다음 단계:`);
  console.log(`  - 앱에서 이미지 확인 (실기기 또는 프리뷰)`);
  console.log(`  - 실패한 항목은 Supabase Dashboard에서 직접 업로드`);
}

main().catch(console.error);
