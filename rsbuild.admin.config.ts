/**
 * rsbuild.admin.config.ts
 * 어드민 페이지 전용 빌드 설정 (Vercel 등 별도 웹 호스팅용)
 *
 * 이 빌드는 admin 엔트리만 포함하며, admin.html이 루트(index.html)로 출력됨
 * → 배포된 도메인의 루트 URL에 접속하면 바로 어드민 로그인 화면이 뜸
 *
 * 사용:
 *   npm run build:admin   → dist-admin/ 폴더에 결과 생성
 */
import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';

const { publicVars } = loadEnv({ prefixes: ['VITE_'] });

export default defineConfig({
  plugins: [pluginReact(), pluginSvgr()],
  html: {
    template: './admin.html',
  },
  source: {
    define: publicVars,
    // 'index'라는 이름이지만 admin.tsx를 가리키도록 매핑 →
    // 빌드 결과의 index.html이 어드민 화면이 됨 (루트 URL = 어드민)
    entry: {
      index: './src/admin.tsx',
    },
  },
  output: {
    distPath: {
      root: 'dist-admin',
    },
  },
});
