import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'cafeindex-test',
  web: {
    host: '172.30.1.83',
    port: 3000,
    commands: {
      dev: 'rsbuild dev --host 0.0.0.0',
      build: 'rsbuild build',
    },
  },
  navigationBar: {
    withBackButton: true,
  },
  permissions: [{ name: 'geolocation', access: 'access' }],
  outdir: 'dist',
  brand: {
    displayName: '카페인덱스',
    primaryColor: '#252525',
    icon: './src/assets/LOGO/logo.png',
  },
  webViewProps: {
    type: 'partner',
  },
});
