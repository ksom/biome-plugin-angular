import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

// NOTE: The GritQL rule uses regex ^['\"]app[A-Z] — the letter after "app"
// must be uppercase. Valid: appTruncate. Invalid: truncate, myTruncate, apptruncat.

describe('angular/pipe-prefix [integration]', () => {
  describe('violations', () => {
    it('flags pipe name without app prefix', async () => {
      const { diagnostics, raw } = await runBiomeCheck('pipe-prefix', `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'truncate', standalone: true })
        export class TruncatePipe implements PipeTransform {
          transform(v: string) { return v; }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags pipe name with wrong prefix', async () => {
      const { diagnostics, raw } = await runBiomeCheck('pipe-prefix', `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'myTruncate', standalone: true })
        export class TruncatePipe implements PipeTransform {
          transform(v: string) { return v; }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts pipe name starting with appUppercase', async () => {
      const { diagnostics, raw } = await runBiomeCheck('pipe-prefix', `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'appTruncate', standalone: true })
        export class TruncatePipe implements PipeTransform {
          transform(v: string) { return v; }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
