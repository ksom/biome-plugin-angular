import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

// NOTE: The GritQL rule uses regex ^['\"]app[A-Z] — the letter after "app"
// must be uppercase. Valid: appTruncate. Invalid: truncate, myTruncate, apptruncat.

describe('angular/pipe-prefix [integration]', () => {
  describe('violations', () => {
    it('flags pipe name without app prefix', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'pipe-prefix',
        `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'truncate', standalone: true })
        export class TruncatePipe implements PipeTransform {
          transform(v: string) { return v; }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('start with the configured prefix');
    });

    it('flags pipe name with wrong prefix', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'pipe-prefix',
        `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'myTruncate', standalone: true })
        export class TruncatePipe implements PipeTransform {
          transform(v: string) { return v; }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('start with the configured prefix');
    });

    // Actual behavior (verified): 'apple' starts with "app" but the regex
    // requires an uppercase letter right after the prefix (app[A-Z]), so a
    // word that merely begins with the letters a-p-p is still flagged.
    it('flags name that starts with "app" but is not app-prefixed camelCase (apple)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'pipe-prefix',
        `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'apple', standalone: true })
        export class ApplePipe implements PipeTransform {
          transform(v: string) { return v; }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('start with the configured prefix');
    });
  });

  describe('valid', () => {
    it('accepts pipe name starting with appUppercase', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'pipe-prefix',
        `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'appTruncate', standalone: true })
        export class TruncatePipe implements PipeTransform {
          transform(v: string) { return v; }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts short app-prefixed name (appUpper)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'pipe-prefix',
        `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'appUpper', standalone: true })
        export class UpperPipe implements PipeTransform {
          transform(v: string) { return v.toUpperCase(); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
