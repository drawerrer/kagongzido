/**
 * upload-place-images.mjs
 * images/places/{name}/ → Supabase Storage 업로드 + libraries/shared_spaces 테이블 URL 업데이트
 *
 * 사용법:
 *   node scripts/upload-place-images.mjs
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// --only: images/places/ 기준 장소 폴더 하나만 처리
const onlyIdx = process.argv.indexOf('--only');
const ONLY    = onlyIdx !== -1 ? process.argv[onlyIdx + 1] : null;

function loadEnv() {
  const raw = readFileSync('.env', 'utf-8');
  const env = {};
  raw.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) env[key.trim()] = rest.join('=').trim();
  });
  return env;
}

const env          = loadEnv();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_SVC = env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL) { console.error('❌ VITE_SUPABASE_URL 없음'); process.exit(1); }
if (!SUPABASE_SVC) { console.error('❌ SUPABASE_SERVICE_KEY 없음'); process.exit(1); }

const supabase   = createClient(SUPABASE_URL, SUPABASE_SVC);
const BUCKET     = 'cafe-images';
const PLACES_DIR = './images/places';
const IMG_EXTS   = ['.jpg', '.jpeg', '.png', '.webp'];

function getMime(ext) {
  return { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }[ext.toLowerCase()] ?? 'image/jpeg';
}

// ── 업로드 전 압축 (최대 가로 1600px, 원본 포맷 유지) ──────────────
async function compressBuffer(buffer, ext) {
  const img = sharp(buffer).resize({ width: 1600, withoutEnlargement: true });
  const e = ext.toLowerCase();
  if (e === '.png')  return img.png({ compressionLevel: 9 }).toBuffer();
  if (e === '.webp') return img.webp({ quality: 78 }).toBuffer();
  return img.jpeg({ quality: 78, mozjpeg: true }).toBuffer();
}

async function uploadFile(localPath, storagePath) {
  const rawBuffer = readFileSync(localPath);
  const ext = extname(localPath);

  let buffer = rawBuffer;
  try {
    buffer = await compressBuffer(rawBuffer, ext);
  } catch (e) {
    console.error(`  ⚠️  압축 실패, 원본 업로드: ${e.message}`);
  }

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: getMime(ext), upsert: true });
  if (error) throw new Error(error.message);
  return supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

async function main() {
  if (!existsSync(PLACES_DIR)) { console.error('❌ images/places/ 폴더가 없어요.'); process.exit(1); }

  // libraries, shared_spaces id+name 목록 미리 조회
  const [{ data: libs }, { data: sps }] = await Promise.all([
    supabase.from('libraries').select('id, name'),
    supabase.from('shared_spaces').select('id, name'),
  ]);
  // name → { id, table } 매핑
  const nameMap = new Map();
  (libs ?? []).forEach(r => nameMap.set(r.name, { id: r.id, table: 'libraries' }));
  (sps  ?? []).forEach(r => nameMap.set(r.name, { id: r.id, table: 'shared_spaces' }));

  let folders;
  if (ONLY) {
    if (!existsSync(join(PLACES_DIR, ONLY))) {
      console.error(`❌ 폴더를 찾을 수 없어요: images/places/${ONLY}/`);
      process.exit(1);
    }
    folders = [ONLY];
    console.log(`🎯 단일 폴더: images/places/${ONLY}/`);
  } else {
    folders = readdirSync(PLACES_DIR).filter(name =>
      statSync(join(PLACES_DIR, name)).isDirectory()
    );
  }

  console.log(`🚀 이미지 업로드 시작 — ${folders.length}개 장소\n`);
  let success = 0, fail = 0;

  for (const name of folders) {
    const folderPath = join(PLACES_DIR, name);
    const files = readdirSync(folderPath)
      .filter(f => IMG_EXTS.includes(extname(f).toLowerCase()))
      .sort();

    if (files.length === 0) {
      console.log(`⏭️  ${name}: 이미지 없음 — 건너뜀`);
      continue;
    }

    const entry = nameMap.get(name);
    if (!entry) {
      console.log(`⚠️  ${name}: Supabase에 없는 장소 — 건너뜀`);
      continue;
    }

    const { id, table } = entry;
    console.log(`📂 [${table}] ${name} (${files.length}장)`);

    let thumbnailUrl = '';
    const photoUrls  = [];

    for (const file of files) {
      const isThumbnail = file.toLowerCase().startsWith('thumbnail');
      // Storage 경로에 UUID 사용 (한글 불가)
      const storagePath = `places/${id}/${file}`;
      try {
        const url = await uploadFile(join(folderPath, file), storagePath);
        if (isThumbnail) { thumbnailUrl = url; console.log(`  ✅ thumbnail`); }
        else             { photoUrls.push(url); console.log(`  ✅ ${file}`); }
      } catch (e) {
        console.error(`  ❌ ${file} 실패: ${e.message}`);
      }
    }

    // thumbnail 없으면 첫 photo로 대체
    if (!thumbnailUrl && photoUrls.length > 0) thumbnailUrl = photoUrls[0];

    const update = {};
    if (thumbnailUrl)     update.thumbnail_url = thumbnailUrl;
    if (photoUrls.length) update.photo_urls    = photoUrls;

    if (Object.keys(update).length > 0) {
      const { error } = await supabase.from(table).update(update).eq('id', id);
      if (error) { console.error(`  ❌ DB 업데이트 실패: ${error.message}`); fail++; }
      else       { console.log(`  💾 DB 업데이트 완료\n`); success++; }
    }
  }

  console.log('─'.repeat(50));
  console.log(`🎉 완료! ✅ ${success}개 성공  ❌ ${fail}개 실패`);
}

main().catch(console.error);
