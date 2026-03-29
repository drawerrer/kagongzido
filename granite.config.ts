import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  appName: 'kagongzido',
  plugins: [
    appsInToss({
      brand: {
        displayName: '취향맞춤 카페지도',
        primaryColor: '#3182F6',
        icon: null,
      },
      permissions: ['location'],
    }),
  ],
});
