/**
 * watch-images.mjs
 * ./images 폴더를 계속 감시하다가 새 이미지 파일이 추가되면
 * 변경이 감지된 "그 폴더만" upload-images.mjs(카페) / upload-place-images.mjs(도서관·공유공간)로
 * 자동 실행합니다. (압축 + Storage 업로드 + DB 반영까지 전부 자동으로 처리됨)
 *
 * 사용법:
 *   node scripts/watch-images.mjs
 *   → 켜놓은 채로 images/ 폴더(또는 images/places/ 폴더)에 사진을 넣기만 하면
 *     잠시 후 자동으로 압축 + 업로드가 실행돼요.
 *   → Ctrl+C로 종료
 *
 * 라우팅 규칙:
 *   images/places/{이름}/...        → upload-place-images.mjs --only "{이름}"
 *   images/{id}/...                 → upload-images.mjs --only "{id}"
 *   images/{배치명}/{id}/...        → upload-images.mjs --only "{배치명}/{id}"
 *
 * 감지된 폴더만 --only로 넘겨서 처리하기 때문에, images/ 전체를 매번 재스캔하지 않습니다.
 */

import { watch, existsSync, mkdirSync } from 'fs';
import { spawn } from 'child_process';
import { sep, dirname } from 'path';

const IMAGES_DIR = './images';
const DEBOUNCE_MS = 4000; // 사진을 여러 장 복사하는 동안 여러 번 트리거되지 않도록 대기

if (!existsSync(IMAGES_DIR)) mkdirSync(IMAGES_DIR, { recursive: true });

const pendingStoreFolders = new Set(); // "id" 또는 "배치명/id"
const pendingPlaceFolders = new Set(); // 장소 이름

let debounceTimer = null;
let running = false;
const runQueue = []; // [scriptPath, label, args]

function runNext() {
  if (running) return;
  if (runQueue.length === 0) {
    console.log('👀 계속 images/ 폴더를 감시 중... (Ctrl+C로 종료)\n');
    return;
  }
  running = true;
  const [scriptPath, label, args] = runQueue.shift();
  console.log(`\n🚀 변경 감지 → ${label} 실행\n`);
  const child = spawn('node', [scriptPath, ...args], { stdio: 'inherit' });
  child.on('exit', (code) => {
    console.log(`\n✅ ${label} 종료 (code ${code})`);
    running = false;
    runNext();
  });
}

function flush() {
  for (const relPath of pendingStoreFolders) {
    runQueue.push([
      'scripts/upload-images.mjs',
      `upload-images.mjs (카페 · ${relPath})`,
      ['--only', relPath],
    ]);
  }
  pendingStoreFolders.clear();

  for (const name of pendingPlaceFolders) {
    runQueue.push([
      'scripts/upload-place-images.mjs',
      `upload-place-images.mjs (도서관/공유공간 · ${name})`,
      ['--only', name],
    ]);
  }
  pendingPlaceFolders.clear();

  runNext();
}

function scheduleFlush() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(flush, DEBOUNCE_MS);
}

console.log(`👀 ${IMAGES_DIR} 폴더 감시 시작...`);
console.log('   변경이 감지된 폴더만 골라서 업로드합니다 (전체 재스캔 없음)');
console.log('   images/places/{이름}/  → upload-place-images.mjs --only');
console.log('   그 외 images/...       → upload-images.mjs --only');
console.log('   (Ctrl+C로 종료)\n');

watch(IMAGES_DIR, { recursive: true }, (_eventType, filename) => {
  if (!filename) return;
  if (!/\.(jpe?g|png|webp)$/i.test(filename)) return; // 이미지 파일 추가/수정만 반응

  const parts = filename.split(sep);

  if (parts[0] === 'places') {
    const name = parts[1];
    if (!name) return;
    console.log(`  📷 감지: places/${parts.slice(1).join('/')}`);
    pendingPlaceFolders.add(name);
  } else {
    const relDir = dirname(filename).split(sep).join('/'); // "id" 또는 "배치명/id"
    console.log(`  📷 감지: ${filename}`);
    pendingStoreFolders.add(relDir);
  }

  scheduleFlush();
});
