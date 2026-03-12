/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { resolve } from 'path';

import angular from '@analogjs/vite-plugin-angular';

export default defineConfig(({ mode }) => ({
  plugins: [angular()],
  resolve: {
    alias: [
      { find: '@core/models', replacement: resolve(__dirname, 'src/app/core/models/index.ts') },
      { find: '@core/services', replacement: resolve(__dirname, 'src/app/core/services/index.ts') },
      {
        find: '@core/constants',
        replacement: resolve(__dirname, 'src/app/core/constants/index.ts'),
      },
      { find: '@shared/utils', replacement: resolve(__dirname, 'src/app/shared/utils/index.ts') },
      {
        find: /^@shared\/components\/(.+)$/,
        replacement: resolve(__dirname, 'src/app/shared/components/$1'),
      },
      { find: /^@features\/(.+)$/, replacement: resolve(__dirname, 'src/app/features/$1') },
      { find: /^@assets\/(.+)$/, replacement: resolve(__dirname, 'src/assets/$1') },
    ],
    mainFields: ['module'],
  },
  test: {
    globals: true,
    setupFiles: ['src/test-setup.ts'],
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/app/**/*.ts'],
      exclude: ['src/app/**/*.spec.ts', 'src/main.ts'],
    },
  },
}));
