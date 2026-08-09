import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/no-service-suffix [integration]', () => {
  describe('violations', () => {
    it('flags class named UserService', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-service-suffix', `
        import { Injectable } from '@angular/core';
        @Injectable({ providedIn: 'root' })
        export class UserService {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Service');
    });
  });

  describe('valid', () => {
    it('accepts an undecorated class ending in Service (e.g. NestJS)', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-service-suffix', `
        export class HttpClientService {
          send() {}
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts class named UserStore', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-service-suffix', `
        import { Injectable } from '@angular/core';
        @Injectable({ providedIn: 'root' })
        export class UserStore {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
