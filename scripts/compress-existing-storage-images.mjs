/**
 * compress-existing-storage-images.mjs
 * Supabase Storage 버킷에 이미 올라간 이미지를 같은 경로/포맷으로
 * 압축해서 덮어씁니다. 파일명·URL은 그대로 유지되므로 DB(photo_urls, thumbnail_url)는
 * 수정할 필요가 없습니다.
 *
 * 사용법:
 *   node scripts/compress-existing-storage-images.mjs                          ← cafe-images 전체 실행
 *   node scripts/compress-existing-storage-images.mjs --bucket review-photos   ← 버킷 지정
 *   node scripts/compress-existing-storage-images.mjs --dry-run                ← 용량만 계산, 업로드 안 함
 */

import { readFileSync } from 'fs';
import { extname } from 'path';
import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

const DRY_RUN = process.argv.includes('--dry-run');
const bucketIdx = process.argv.indexOf('--bucket');
const BUCKET = bucketIdx !== -1 ? process.argv[bucketIdx + 1] : 'cafe-images';

function loadEnv() {
  const raw = readFileSync('.env', 'utf-8');
  const env = {};
  raw.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) env[key.trim()] = rest.join('=').trim();
  });
  return env;
}

const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const CONCURRENCY = 6;

function getMimeType(ext) {
  const map = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
  return map[ext.toLowerCase()] ?? 'image/jpeg';
}

async function compressBuffer(buffer, ext) {
  const img = sharp(buffer).resize({ width: 1600, withoutEnlargement: true });
  const e = ext.toLowerCase();
  if (e === '.png')  return img.png({ compressionLevel: 9 }).toBuffer();
  if (e === '.webp') return img.webp({ quality: 78 }).toBuffer();
  return img.jpeg({ quality: 78, mozjpeg: true }).toBuffer();
}

async function listAll(prefix = '') {
  let all = [];
  let offset = 0;
  const limit = 1000;
  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list(prefix, { limit, offset });
    if (error) { console.error('list error', prefix, error.message); return all; }
    if (!data || data.length === 0) break;
    for (const item of data) {
      if (item.id === null) {
        const sub = await listAll(prefix ? `${prefix}/${item.name}` : item.name);
        all = all.concat(sub);
      } else {
        all.push({ path: prefix ? `${prefix}/${item.name}` : item.name, size: item.metadata?.size ?? 0 });
      }
    }
    if (data.length < limit) break;
    offset += limit;
  }
  return all;
}

async function processFile(file, stats) {
  const ext = extname(file.path);
  if (!IMG_EXTS.includes(ext.toLowerCase())) { stats.skippedNotImage++; return; }

  const { data, error } = await supabase.storage.from(BUCKET).download(file.path);
  if (error) { console.error(`  ❌ 다운로드 실패 [${file.path}]: ${error.message}`); stats.failed++; return; }

  const original = Buffer.from(await data.arrayBuffer());
  let compressed;
  try {
    compressed = await compressBuffer(original, ext);
  } catch (e) {
    console.error(`  ❌ 압축 실패 [${file.path}]: ${e.message}`); stats.failed++; return;
  }

  // 이미 충분히 작거나 압축해도 안 줄어들면 건너뜀 (안전장치)
  if (compressed.length >= original.length) {
    stats.skippedAlreadySmall++;
    stats.totalBefore += original.length;
    stats.totalAfter  += original.length;
    return;
  }

  stats.totalBefore += original.length;
  stats.totalAfter  += compressed.length;
  stats.processed++;

  if (DRY_RUN) {
    console.log(`  [dry-run] ${file.path}: ${(original.length/1024).toFixed(0)}KB → ${(compressed.length/1024).toFixed(0)}KB`);
    return;
  }

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(file.path, compressed, { contentType: getMimeType(ext), upsert: true });

  if (upErr) {
    console.error(`  ❌ 재업로드 실패 [${file.path}]: ${upErr.message}`);
    stats.failed++;
  } else {
    console.log(`  ✅ ${file.path}: ${(original.length/1024).toFixed(0)}KB → ${(compressed.length/1024).toFixed(0)}KB`);
  }
}

async function runWithConcurrency(items, limit, worker) {
  let idx = 0;
  async function next() {
    while (idx < items.length) {
      const i = idx++;
      await worker(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: limit }, next));
}

async function main() {
  console.log(`📦 버킷: ${BUCKET}`);
  console.log(DRY_RUN ? '🔍 DRY RUN — 업로드 없이 예상 용량만 계산합니다.\n' : '🚀 기존 이미지 재압축을 시작합니다.\n');

  const files = await listAll();
  console.log(`총 ${files.length}개 파일 발견\n`);

  const stats = {
    processed: 0, failed: 0,
    skippedNotImage: 0, skippedAlreadySmall: 0,
    totalBefore: 0, totalAfter: 0,
  };

  let done = 0;
  await runWithConcurrency(files, CONCURRENCY, async (file) => {
    await processFile(file, stats);
    done++;
    if (done % 100 === 0) console.log(`… 진행 ${done}/${files.length}`);
  });

  console.log('\n' + '─'.repeat(50));
  console.log(`🎉 완료!`);
  console.log(`  처리(압축+덮어쓰기): ${stats.processed}개`);
  console.log(`  건너뜀(이미 최적): ${stats.skippedAlreadySmall}개`);
  console.log(`  건너뜀(이미지 아님): ${stats.skippedNotImage}개`);
  console.log(`  실패: ${stats.failed}개`);
  console.log(`  총 용량: ${(stats.totalBefore/1024/1024).toFixed(2)}MB → ${(stats.totalAfter/1024/1024).toFixed(2)}MB`);
  console.log(`  절감: ${((1 - stats.totalAfter/stats.totalBefore) * 100).toFixed(1)}%`);
}

main().catch(console.error);
