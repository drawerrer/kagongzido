/**
 * rsbuild.config.ts — 메인(사용자) 미니앱 빌드 설정
 *
 * ⚠️ 출시 보안 정책: 이 빌드는 토스 미니앱(.ait) 용 — admin 진입점 포함 금지.
 *   어드민 페이지(AdminPage)는 LoginScreen + Supabase Auth + RLS 로 3중 가드가
 *   걸려 있지만, 출시 빌드 자체에 admin.html 을 포함하지 않는 게 정책적으로 가장 안전.
 *
 *   - 메인 미니앱: 이 설정 (npm run build / ait build) → dist/
 *   - 어드민 전용:  rsbuild.admin.config.ts (npm run build:admin) → dist-admin/ (Vercel 별도 배포)
 */
import { defineConfig, loadEnv } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';

const { publicVars } = loadEnv({ prefixes: ['VITE_'] });

export default defineConfig({
  plugins: [pluginReact(), pluginSvgr()],
  html: {
    template: './index.html',
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  source: {
    define: publicVars,
    entry: {
      index: './src/index.tsx',
    },
  },
});
