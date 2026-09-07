/**
 * granite.config.ts 템플릿
 *
 * 실제 `granite.config.ts` 는 각자 PC의 dev host IP 가 달라 .gitignore 처리되어 있어요.
 * 본인 PC 의 `granite.config.ts` 를 아래 내용 기준으로 맞춰 주세요.
 *
 * ─── appName 안내 ──────────────────────────────────────────
 *   appName 은 "이 번들이 어느 앱 것인지" 알려주는 꼬리표예요.
 *   콘솔에 등록된 앱 이름과 다르면 업로드가 거부됩니다.
 *   기본값 'kagongzido' 를 그대로 두세요 — 개발·배포 모두 이 값을 씁니다.
 *
 *   실기기 확인은 슬롯을 바꾸지 않고 합니다:
 *     번들 업로드 → 콘솔 "테스트하기" → QR 스캔 → 토스 앱에서 실행
 *     (심사 전에도 가능. https://developers-apps-in-toss.toss.im/development/test/sandbox.md)
 *
 *   콘솔에 'cafeindex-test'("카페인덱스") 앱도 남아 있지만 지금은 쓰지 않아요.
 *   최초 등록 때 이름에 test 가 붙었는데 appName 은 등록 후 변경이 안 돼서,
 *   배포용으로 'kagongzido' 를 새로 등록한 흔적입니다.
 *
 * dev host IP / port 는 본인 PC 환경에 맞게 두시면 됩니다.
 */
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 개발·배포 모두 이 값을 그대로 씁니다 (바꿀 일 없음)
  appName: 'kagongzido',

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
