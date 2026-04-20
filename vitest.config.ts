import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    environment: 'node',
    server: {
      deps: {
        inline: ['next-auth'],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
