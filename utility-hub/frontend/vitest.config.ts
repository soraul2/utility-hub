import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
      plugins: [react()],
      test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: ['./src/test/setup.ts'],
            coverage: {
                  provider: 'v8',
                  reporter: ['text', 'json', 'html'],
                  exclude: [
                        'node_modules/',
                        'src/test/',
                        '**/*.d.ts',
                        '**/*.config.*',
                        '**/mockData',
                  ],
                  thresholds: {
                        // Initial thresholds set low to start, will increase as tests are added
                        statements: 0,
                        branches: 0,
                        functions: 0,
                        lines: 0,
                  },
            },
      },
      resolve: {
            alias: {
                  '@': path.resolve(__dirname, './src'),
            },
      },
});
