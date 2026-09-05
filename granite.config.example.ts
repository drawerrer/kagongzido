/**
 * granite.config.ts 템플릿
 *
 * 실제 `granite.config.ts` 는 각자 PC의 dev host IP 가 달라 .gitignore 처리되어 있어요.
 * 본인 PC 의 `granite.config.ts` 를 아래 내용 기준으로 맞춰 주세요.
 *
 * ─── appName 슬롯 안내 ──────────────────────────────────────
 *   콘솔에 두 슬롯이 등록되어 있어요. 빌드 전 용도에 맞게 변경:
 *     1) 'cafeindex-test'  → 개발 테스트 슬롯 ("카페인덱스")
 *     2) 'kagongzido'      → 실제 배포 슬롯  ("카공지도")
 *   appName 이 슬롯과 다르면 콘솔 업로드 시 거부돼요.
 *
 * dev host IP / port 는 본인 PC 환경에 맞게 두시면 됩니다.
 */
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // ⚠️ 슬롯에 따라 변경:
  //   - 개발 테스트: 'cafeindex-test'  → 콘솔 1번 슬롯
  //   - 실제 배포 : 'kagongzido'       → 콘솔 2번 슬롯
  appName: 'cafeindex-test',

  web: {
    host: '0.0.0.0', // ← 본인 PC 의 IP 로 변경
    port: 3000,
    commands: {
      dev: 'rsbuild dev --host 0.0.0.0',
      build: 'rsbuild build',
    },
  },

  permissions: [
    { name: 'geolocation', access: 'access' },
    { name: 'photos', access: 'read' },    // 제보/리뷰 사진 첨부 (갤러리)
    { name: 'camera', access: 'access' },  // 제보/리뷰 사진 첨부 (카메라)
  ],
  outdir: 'dist',

  brand: {
    displayName: '카공지도',
    primaryColor: '#252525',
    // ⚠️ 로컬 파일 경로가 아니라 "이미지 주소(URL)"여야 함 — 콘솔에 등록한 아이콘과
    //    동일한 이미지의 공개 URL을 넣을 것. 로컬 경로를 넣으면 빌드 매니페스트에
    //    그 문자열이 그대로 박혀서 앱 로고가 안 보임 (2026-09 반려 원인).
    icon: 'https://static.toss.im/appsintoss/28041/ea0a9c34-064b-4632-8e7c-a06f27955f91.png',
  },

  // 토스 공통 내비게이션 바
  // - 자체 헤더/백버튼 미사용 → 공통 백버튼만 활용
  // - 홈버튼은 하단 탭바와 기능 중복이라 비활성
  navigationBar: {
    withBackButton: true,
    withHomeButton: false,
  },

  webViewProps: {
    type: 'partner',
  },
});
