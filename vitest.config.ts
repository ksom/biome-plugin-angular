import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Exclude integration tests from the fast unit test run
    exclude: ['tests/integration/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['tests/helpers/pattern-matcher.ts'],
      exclude: ['node_modules/**', 'coverage/**'],
    },
  },
});
