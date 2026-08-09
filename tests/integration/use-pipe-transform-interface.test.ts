import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/use-pipe-transform-interface [integration]', () => {
  // The rule matches the @Pipe decorator and requires the file to reference
  // PipeTransform (GritQL cannot bind `implements` clauses, so decorator+class
  // matching is impossible for implements-classes). Per-file semantics.
  describe('violations', () => {
    it('flags @Pipe class with no implements clause', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'use-pipe-transform-interface',
        `
        import { Pipe } from '@angular/core';
        @Pipe({ name: 'appTruncate', standalone: true })
        export class TruncatePipe {
          transform(value: string) { return value; }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('PipeTransform');
    });

    it('flags @Pipe class implementing other interface but not PipeTransform', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'use-pipe-transform-interface',
        `
        import { Pipe } from '@angular/core';
        @Pipe({ name: 'appFoo', standalone: true })
        export class FooPipe implements Disposable {
          transform(v: string) { return v; }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('PipeTransform');
    });

    it('flags @Pipe class that extends a base class without PipeTransform', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'use-pipe-transform-interface',
        `
        import { Pipe } from '@angular/core';
        import { BasePipe } from './base';
        @Pipe({ name: 'appDerived' })
        export class DerivedPipe extends BasePipe {
          transform(v: string) { return v; }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts @Pipe implementing PipeTransform', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'use-pipe-transform-interface',
        `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'appTruncate', standalone: true })
        export class TruncatePipe implements PipeTransform {
          transform(value: string) { return value; }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts @Pipe implementing PipeTransform alongside other interfaces', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'use-pipe-transform-interface',
        `
        import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
        @Pipe({ name: 'appMulti', standalone: true })
        export class MultiPipe implements PipeTransform, OnDestroy {
          transform(value: string) { return value; }
          ngOnDestroy() {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts a file without any @Pipe', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'use-pipe-transform-interface',
        `
        export class NotAPipe {
          transform(value: string) { return value; }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    // Per-file matching: a file that imports PipeTransform exempts every @Pipe
    // in it, even one that does not implement the interface. Documented false
    // negative of the file-level approach.
    it.fails('flags a non-implementing @Pipe when the file imports PipeTransform (known FN)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'use-pipe-transform-interface',
        `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'appBad' })
        export class BadPipe {
          transform(value: string) { return value; }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });
});
