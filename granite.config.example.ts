/**
 * granite.config.ts 템플릿
 *
 * 실제 `granite.config.ts` 는 각자 PC의 dev host IP 가 달라 .gitignore 처리되어 있어요.
 * 본인 PC 의 `granite.config.ts` 를 아래 내용 기준으로 맞춰 주세요.
 * (운영 빌드 설정 — appName / navigationBar / brand / webViewProps 일치 필수)
 *
 * 본인 dev host IP 만 다르게 두시면 돼요.
 */
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // ⚠️ 운영용 — 출시 콘솔에 등록한 미니앱 이름과 일치해야 함
  appName: 'Kagongzido',

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
    displayName: '카페인덱스',
    primaryColor: '#252525',
    icon: './src/assets/LOGO/logo.png',
  },

  // 토스 공통 내비게이션 바 — 자체 헤더/백버튼 미사용
  navigationBar: {
    withBackButton: true,
    withHomeButton: true,
  },

  webViewProps: {
    type: 'partner',
  },
});
