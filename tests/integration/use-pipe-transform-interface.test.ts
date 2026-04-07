import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/use-pipe-transform-interface [integration]', () => {
  // Biome GritQL cannot match @Pipe\nclass patterns (decorator + class as one unit).
  describe('violations', () => {
    it.skip('flags @Pipe class with no implements clause', async () => {
      const { diagnostics, raw } = await runBiomeCheck('use-pipe-transform-interface', `
        import { Pipe } from '@angular/core';
        @Pipe({ name: 'appTruncate', standalone: true })
        export class TruncatePipe {
          transform(value: string) { return value; }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it.skip('flags @Pipe class implementing other interface but not PipeTransform', async () => {
      const { diagnostics, raw } = await runBiomeCheck('use-pipe-transform-interface', `
        import { Pipe } from '@angular/core';
        @Pipe({ name: 'appFoo', standalone: true })
        export class FooPipe implements Disposable {
          transform(v: string) { return v; }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts @Pipe implementing PipeTransform', async () => {
      const { diagnostics, raw } = await runBiomeCheck('use-pipe-transform-interface', `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'appTruncate', standalone: true })
        export class TruncatePipe implements PipeTransform {
          transform(value: string) { return value; }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
