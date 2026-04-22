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
  permissions: [
    { name: 'geolocation', access: 'access' },
  ],
  outdir: 'dist',
  brand: {
    displayName: '카페인덱스',
    primaryColor: '#252525',
    icon: 'https://static.toss.im/icons/app-icon.png',
  },
  webViewProps: {
    type: 'partner',
  },
});
