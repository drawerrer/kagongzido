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

  permissions: [{ name: 'geolocation', access: 'access' }],
  outdir: 'dist',

  brand: {
    displayName: '카공지도',
    primaryColor: '#252525',
    icon: './src/assets/LOGO/logo.png',
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
