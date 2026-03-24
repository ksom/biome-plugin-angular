import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['tests/helpers/**/*.ts', 'cli.js', 'index.js'],
      exclude: ['tests/rules/**', 'node_modules/**', 'coverage/**', '**/*.d.ts'],
    },
  },
});
