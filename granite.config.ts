import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'kagongzido',
  web: {
    host: 'localhost',
    port: 3000,
    commands: {
      dev: 'rsbuild dev',
      build: 'rsbuild build',
    },
  },
  permissions: ['geolocation'],
  outdir: 'dist',
  brand: {
    displayName: '카공지도',
    primaryColor: '#3182F6',
  },
  webViewProps: {
    type: 'partner',
  },
});
