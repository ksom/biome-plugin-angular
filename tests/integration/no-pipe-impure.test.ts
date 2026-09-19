import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/no-pipe-impure [integration]', () => {
  describe('violations', () => {
    it('flags pure: false', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-pipe-impure',
        `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'appFilter', pure: false })
        export class FilterPipe implements PipeTransform {
          transform(items: string[]) { return items; }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Impure pipes');
    });
  });

  describe('valid', () => {
    it('accepts pure: true and the default', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-pipe-impure',
        `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'appUpper', pure: true })
        export class UpperPipe implements PipeTransform {
          transform(v: string) { return v.toUpperCase(); }
        }
        @Pipe({ name: 'appLower' })
        export class LowerPipe implements PipeTransform {
          transform(v: string) { return v.toLowerCase(); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('ignores pure: false outside @Pipe', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-pipe-impure',
        `
        const options = { pure: false };
        export function configure() { return options; }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
