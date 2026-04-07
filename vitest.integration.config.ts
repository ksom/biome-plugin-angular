import { defineConfig } from 'vitest/config';

/**
 * Vitest config for integration tests.
 *
 * These tests spawn the real `biome check` binary and verify that the GritQL
 * rules fire (or don't fire) on actual Angular TypeScript code.
 * Each test takes ~1-2 s, so a 30 s timeout per test is used.
 *
 * Run with:  npm run test:integration
 */
export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    exclude: ['node_modules/**'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    reporters: ['verbose'],
    // Use forks pool so each worker is isolated (biome spawns child processes)
    pool: 'forks',
    poolOptions: {
      forks: {
        // Limit concurrency: each test already spawns biome, don't overwhelm the CPU
        maxForks: 4,
        minForks: 1,
      },
    },
  },
});
