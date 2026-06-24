/**
 * fetch_place_images.mjs
 * 도서관/공유공간 이미지를 카카오 API로 가져와 로컬에 저장
 *
 * 실행: node fetch_place_images.mjs
 * 결과: ./place_images/ 폴더에 {장소명}/thumbnail.jpg, photo_1.jpg ... 저장
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const KAKAO_REST_KEY = '1e18a8bc5e8bb3baa89e96865acd4dde';
const OUT_DIR = './place_images';

const PLACES = [
  // ── 도서관 ──────────────────────────────────────────────
  { name: '아차산숲속도서관',              id: '642173961',  type: 'library' },
  { name: '서울시립미술아카이브',           id: '1898395306', type: 'library' },
  { name: '전쟁기념관 6.25전쟁 아카이브센터', id: '2049233930', type: 'library' },
  { name: '국회도서관',                    id: '8702340',    type: 'library' },
  { name: '논현문화마루도서관',             id: '1703582456', type: 'library' },
  { name: '소진서림',                      id: null,         type: 'library' },  // 카카오 없음 → 수동

  // ── 공유공간 ─────────────────────────────────────────────
  { name: '서울창업허브',                  id: '451467895',  type: 'shared_space' },
  { name: '과천시 청년공간 비행지구',        id: null,         type: 'shared_space' }, // 수동
  { name: 'KT&G 상상플래닛',              id: '181200093',  type: 'shared_space' },
  { name: '마포청년나루 공유 라운지',        id: null,         type: 'shared_space' }, // 수동
  { name: '청년예술청',                    id: '284441052',  type: 'shared_space' },
  { name: '알파룸',                        id: '972712230',  type: 'shared_space' },
  { name: '현대카드 아트 라이브러리',        id: '2045841596', type: 'shared_space' },
  { name: '커넥트 라운지',                 id: '26469964',   type: 'shared_space' },
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function fetchKakaoPlacePhotos(placeId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'place.map.kakao.com',
      path: `/main/v/${placeId}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://map.kakao.com/',
      },
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const photos = json?.basicInfo?.photoList ?? [];
          const urls = photos.slice(0, 5).map(p => p.orgurl || p.url || p.photoUrl).filter(Boolean);
          resolve(urls);
        } catch {
          resolve([]);
        }
      });
    }).on('error', reject);
  });
}

async function fetchKakaoSearch(placeId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'dapi.kakao.com',
      path: `/v2/local/search/keyword.json?query=${placeId}&size=1`,
      method: 'GET',
      headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` },
    };
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(null); }
      });
    }).on('error', reject);
  });
}

async function processPlace(place) {
  if (!place.id) {
    console.log(`⚠️  [${place.name}] api_place_id 없음 → 수동으로 이미지를 추가하세요`);
    return;
  }

  const dir = path.join(OUT_DIR, place.name);
  fs.mkdirSync(dir, { recursive: true });

  console.log(`\n📸 [${place.name}] (id: ${place.id}) 처리 중...`);

  const photoUrls = await fetchKakaoPlacePhotos(place.id);

  if (photoUrls.length === 0) {
    console.log(`   사진 없음 (카카오 응답에 photoList 없음)`);
    return;
  }

  for (let i = 0; i < photoUrls.length; i++) {
    const url = photoUrls[i];
    const ext = url.includes('.png') ? 'png' : 'jpg';
    const filename = i === 0 ? `thumbnail.${ext}` : `photo_${i}.${ext}`;
    const dest = path.join(dir, filename);
    try {
      await downloadFile(url, dest);
      console.log(`   ✅ 저장: ${filename}`);
    } catch (e) {
      console.log(`   ❌ 실패: ${filename} — ${e.message}`);
    }
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`이미지 저장 위치: ${path.resolve(OUT_DIR)}\n`);

  for (const place of PLACES) {
    await processPlace(place);
    await new Promise(r => setTimeout(r, 300)); // rate limit
  }

  console.log('\n\n완료!');
  console.log('수동 추가 필요 (카카오 검색 실패):');
  PLACES.filter(p => !p.id).forEach(p => console.log(`  - ${p.name}`));
  console.log('\nplace_images/ 폴더 확인 후 Supabase Storage에 업로드하세요.');
}

main().catch(console.error);
