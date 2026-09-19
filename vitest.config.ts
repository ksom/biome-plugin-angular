import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Exclude integration tests from the fast unit test run
    exclude: ['tests/integration/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // Coverage measures the reference-spec layer (ts-morph re-implementation
      // of the rules) only — NOT the shipped GritQL rules under rules/, which
      // are exercised by the integration suite against the real biome binary.
      include: ['tests/helpers/pattern-matcher.ts'],
      exclude: ['node_modules/**', 'coverage/**'],
    },
  },
});
