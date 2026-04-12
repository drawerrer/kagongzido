import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'cafeindex',
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
    displayName: '카페인덱스',
    primaryColor: '#252525',
  },
  webViewProps: {
    type: 'partner',
  },
});
