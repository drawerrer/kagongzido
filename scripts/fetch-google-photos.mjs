/**
 * fetch-google-photos.mjs
 * 구글 Places API → 매장 사진 자동 수집 → Supabase Storage 업로드 + DB 업데이트
 *
 * 사용법:
 *   node scripts/fetch-google-photos.mjs
 *
 * 사전 준비:
 *   .env에 GOOGLE_PLACES_KEY 추가
 *
 * 동작:
 *   1. Supabase에서 thumbnail_url이 없는 매장 목록 가져오기
 *   2. 구글 Places API로 매장 검색 → 사진 최대 5장 다운로드
 *   3. Supabase Storage(cafe-images 버킷)에 업로드
 *   4. stores 테이블 thumbnail_url, photo_urls 자동 업데이트
 */

import { readFileSync } from 'fs';
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

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE);
const BUCKET   = 'cafe-images';
const MAX_PHOTOS = 5; // 매장당 최대 사진 수 (thumbnail 1 + photo 4)

// ── 구글 Places 텍스트 검색 → place_id + photo_references ──────
async function searchGooglePlace(name, address) {
  const query = encodeURIComponent(`${name} ${address}`);
  const url   = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`
              + `?input=${query}&inputtype=textquery&fields=place_id,photos&language=ko&key=${GOOGLE_KEY}`;

  const res  = await fetch(url);
  const json = await res.json();

  if (json.status !== 'OK' || !json.candidates?.length) return null;

  const candidate = json.candidates[0];
  return candidate.photos ?? null;
}

// ── photo_reference → 이미지 Buffer 다운로드 ───────────────────
async function downloadPhoto(photoReference) {
  const url = `https://maps.googleapis.com/maps/api/place/photo`
            + `?maxwidth=1200&photo_reference=${photoReference}&key=${GOOGLE_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// ── Supabase Storage 업로드 → public URL 반환 ──────────────────
async function uploadToStorage(buffer, storagePath) {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: 'image/jpeg', upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  return data.publicUrl;
}

// ── 메인 ──────────────────────────────────────────────────────
async function main() {
  console.log('📋 thumbnail_url 없는 매장 목록 불러오는 중...\n');

  const { data: stores, error } = await supabase
    .from('stores')
    .select('api_place_id, name, address_road, thumbnail_url')
    .or('thumbnail_url.is.null,thumbnail_url.eq.')
    .order('name');

  if (error) { console.error('❌ Supabase 오류:', error.message); process.exit(1); }
  if (!stores?.length) { console.log('✅ 모든 매장에 이미지가 있어요!'); return; }

  console.log(`🔍 ${stores.length}개 매장 사진 수집 시작\n`);

  let successCount = 0;
  let failCount    = 0;

  for (const store of stores) {
    console.log(`📍 ${store.name}`);

    try {
      // 1. 구글 Places 검색
      const photos = await searchGooglePlace(store.name, store.address_road);
      if (!photos?.length) {
        console.log(`  ⏭️  구글에서 사진을 찾지 못했어요\n`);
        failCount++;
        continue;
      }

      // 2. 사진 다운로드 & 업로드 (최대 MAX_PHOTOS장)
      const targets = photos.slice(0, MAX_PHOTOS);
      let thumbnailUrl = '';
      const photoUrls  = [];

      for (let i = 0; i < targets.length; i++) {
        const ref = targets[i].photo_reference;
        try {
          const buffer      = await downloadPhoto(ref);
          const fileName    = i === 0 ? 'thumbnail.jpg' : `${i}.jpg`;
          const storagePath = `${store.api_place_id}/${fileName}`;
          const url         = await uploadToStorage(buffer, storagePath);

          if (i === 0) {
            thumbnailUrl = url;
            console.log(`  ✅ thumbnail: ${url}`);
          } else {
            photoUrls.push(url);
            console.log(`  ✅ photo ${i}: ${url}`);
          }
        } catch (e) {
          console.error(`  ❌ 사진 ${i + 1} 업로드 실패: ${e.message}`);
        }

        // 구글 API 레이트리밋 방지
        await new Promise(r => setTimeout(r, 200));
      }

      // 3. DB 업데이트
      if (thumbnailUrl) {
        const updateData = { thumbnail_url: thumbnailUrl };
        if (photoUrls.length) updateData.photo_urls = photoUrls;

        const { error: dbErr } = await supabase
          .from('stores')
          .update(updateData)
          .eq('api_place_id', store.api_place_id);

        if (dbErr) {
          console.error(`  ❌ DB 업데이트 실패: ${dbErr.message}`);
          failCount++;
        } else {
          console.log(`  💾 DB 업데이트 완료\n`);
          successCount++;
        }
      } else {
        failCount++;
      }

    } catch (e) {
      console.error(`  ❌ 오류: ${e.message}\n`);
      failCount++;
    }

    // 매장 간 딜레이
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('─'.repeat(50));
  console.log(`🎉 완료! ✅ ${successCount}개 성공  ❌ ${failCount}개 실패`);
}

main().catch(console.error);
