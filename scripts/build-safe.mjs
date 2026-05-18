/**
 * build-safe.mjs
 * .ait 빌드 전 일관성 보장 — 누가 빌드해도 같은 결과물이 나오도록 자동 점검
 *
 * 실행: npm run build:safe
 *
 * 자동으로 수행:
 *   1. git 상태 점검 — 미커밋 변경 있으면 진행 여부 확인
 *   2. git pull origin develop — develop 최신 상태로 동기화
 *   3. npm install — 의존성 동기화 (package-lock.json 변경 시)
 *   4. ait build — 실제 빌드
 */

import { execSync, spawnSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import readline from 'readline';

const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  red:    '\x1b[31m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  blue:   '\x1b[34m',
  gray:   '\x1b[90m',
};

function log(msg)   { console.log(msg); }
function step(n, total, title) { log(`\n${C.bold}${C.blue}[${n}/${total}] ${title}${C.reset}`); }
function ok(msg)    { log(`${C.green}  ✅ ${msg}${C.reset}`); }
function warn(msg)  { log(`${C.yellow}  ⚠️  ${msg}${C.reset}`); }
function err(msg)   { log(`${C.red}  ❌ ${msg}${C.reset}`); }
function info(msg)  { log(`${C.gray}  ${msg}${C.reset}`); }

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => { rl.close(); resolve(answer.trim().toLowerCase()); });
  });
}

function run(cmd, opts = {}) {
  return spawnSync(cmd, { shell: true, stdio: 'inherit', ...opts });
}

function runCapture(cmd) {
  try { return execSync(cmd, { encoding: 'utf-8' }).trim(); }
  catch { return ''; }
}

// ─── Main ──────────────────────────────────────────────────────────
async function main() {
  log(`${C.bold}🚀 카공지도 .ait 안전 빌드 시작${C.reset}\n`);

  // 1단계 — git 상태 점검
  step(1, 4, 'git 상태 점검');
  const dirty = runCapture('git status --porcelain');
  if (dirty) {
    warn('커밋되지 않은 변경사항이 있어요:');
    info(dirty.split('\n').map(l => '    ' + l).join('\n'));
    const ans = await ask(`${C.yellow}  이 상태로 진행할까요? (y/N) ${C.reset}`);
    if (ans !== 'y' && ans !== 'yes') {
      err('취소됨. git add + commit 후 다시 실행해주세요.');
      process.exit(1);
    }
    warn('미커밋 변경 포함된 채로 진행합니다.');
  } else {
    ok('working tree 깨끗함');
  }

  // 2단계 — git pull
  step(2, 4, 'git pull origin develop');
  const beforeHead = runCapture('git rev-parse HEAD');
  const beforeLock = existsSync('package-lock.json') ? readFileSync('package-lock.json', 'utf-8') : '';
  const pullResult = run('git pull origin develop');
  if (pullResult.status !== 0) {
    err('git pull 실패. 충돌이 있다면 직접 해결 후 다시 실행해주세요.');
    process.exit(1);
  }
  const afterHead = runCapture('git rev-parse HEAD');
  if (beforeHead === afterHead) ok('이미 최신 상태');
  else ok(`최신 받음 (${beforeHead.slice(0,7)} → ${afterHead.slice(0,7)})`);

  // 3단계 — npm install (package-lock 변경 시에만)
  step(3, 4, 'npm install');
  const afterLock = existsSync('package-lock.json') ? readFileSync('package-lock.json', 'utf-8') : '';
  const lockChanged = beforeLock !== afterLock;
  if (lockChanged) {
    info('package-lock.json이 바뀌었어요. 의존성 동기화 진행...');
    const installResult = run('npm install');
    if (installResult.status !== 0) {
      err('npm install 실패. 위 에러 확인 후 다시 실행해주세요.');
      process.exit(1);
    }
    ok('의존성 설치 완료');
  } else {
    ok('package-lock.json 변경 없음 — 설치 스킵');
  }

  // .env 존재 체크 (값은 검증 안 함 — 사람마다 다를 수 있음)
  if (!existsSync('.env')) {
    warn('.env 파일이 없어요. Supabase 등 환경변수가 빌드에 박히지 않을 거예요.');
    const ans = await ask(`${C.yellow}  그래도 진행할까요? (y/N) ${C.reset}`);
    if (ans !== 'y' && ans !== 'yes') {
      err('취소됨. .env 파일 준비 후 다시 실행해주세요.');
      process.exit(1);
    }
  }

  // 4단계 — ait build
  step(4, 4, 'ait build');
  const buildResult = run('ait build');
  if (buildResult.status !== 0) {
    err('ait build 실패. 위 에러 확인.');
    process.exit(1);
  }

  log(`\n${C.bold}${C.green}🎉 빌드 성공!${C.reset}`);
  log(`${C.gray}  생성된 .ait 파일을 토스 콘솔에 업로드해 주세요.${C.reset}\n`);
}

main().catch((e) => {
  err('예상치 못한 오류: ' + (e?.message ?? e));
  process.exit(1);
});
