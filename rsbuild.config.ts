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
