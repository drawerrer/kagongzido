/**
 * granite.config.ts 템플릿
 *
 * 실제 `granite.config.ts` 는 각자 PC의 dev host IP 가 달라 .gitignore 처리되어 있어요.
 * 본인 PC 의 `granite.config.ts` 를 아래 내용 기준으로 맞춰 주세요.
 *
 * ─── appName 안내 ──────────────────────────────────────────
 *   appName 은 "이 번들이 어느 앱 것인지" 알려주는 꼬리표예요.
 *   콘솔에 등록된 앱 이름과 다르면 업로드가 거부됩니다.
 *   기본값 'kagongzido'(배포용) 를 그대로 두세요.
 *
 * ─── 콘솔에 앱이 두 개인 이유 ───────────────────────────────
 *   1) 'cafeindex-test' ("카페인덱스")  — 최초 등록본. 미출시
 *   2) 'kagongzido'     ("카공지도")    — 실제 배포용
 *   최초 등록 때 이름에 test 가 붙었는데 appName 은 등록 후 변경이 안 돼서
 *   배포용을 새로 등록했어요. 그래서 콘솔에는 앱이 두 개로 보입니다.
 *
 * ─── 실기기 확인 (관측된 동작) ─────────────────────────────
 *   개발 서버를 켜고 토스 테스트앱에서 열 때,
 *     'cafeindex-test' 슬롯 → 로컬 개발 서버에 연결됨 (정상)
 *     'kagongzido'     슬롯 → 오류
 *   이 동작은 appName 값과 무관했어요 (appName 을 kagongzido 로 둔 상태에서도
 *   테스트 슬롯만 연결됨). 즉 개발 중 실기기 확인은 카페인덱스 테스트 슬롯으로 합니다.
 *
 *   ⚠️ 왜 그런지는 공식 문서에 설명이 없습니다. 출시 여부와 관계있어 보이지만
 *      확인된 바 없으니, 이 슬롯을 지우거나 정리하기 전에 토스에 문의할 것.
 *
 *   업로드한 번들을 실기기로 볼 때는 콘솔 "테스트하기" → QR 스캔을 씁니다.
 *   (심사 전에도 가능. https://developers-apps-in-toss.toss.im/development/test/sandbox.md)
 *
 * dev host IP / port 는 본인 PC 환경에 맞게 두시면 됩니다.
 */
import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  // 업로드 대상 앱 이름. 배포용 그대로 두면 됩니다
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
