import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/no-conflicting-lifecycle [integration]', () => {
  describe('violations', () => {
    it('flags a class declaring both ngDoCheck and ngOnChanges', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-conflicting-lifecycle',
        `
        import { Component, DoCheck, OnChanges, SimpleChanges } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class App implements DoCheck, OnChanges {
          ngDoCheck(): void { this.check(); }
          ngOnChanges(changes: SimpleChanges): void { this.react(changes); }
          check() {}
          react(c: unknown) {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('ngDoCheck and ngOnChanges');
    });

    it('flags a directive with both hooks', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-conflicting-lifecycle',
        `
        import { Directive } from '@angular/core';
        @Directive({ selector: '[appWatch]' })
        export class Watch {
          ngOnChanges() { this.sync(); }
          ngDoCheck() { this.sync(); }
          sync() {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts ngOnChanges alone', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-conflicting-lifecycle',
        `
        import { Component, OnChanges } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class App implements OnChanges {
          ngOnChanges() { this.react(); }
          react() {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts ngDoCheck alone', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-conflicting-lifecycle',
        `
        import { Component, DoCheck } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class App implements DoCheck {
          ngDoCheck() { this.check(); }
          check() {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts the two hooks split across two classes', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-conflicting-lifecycle',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-a', template: '' })
        export class A { ngDoCheck() { this.x(); } x() {} }
        @Component({ selector: 'app-b', template: '' })
        export class B { ngOnChanges() { this.y(); } y() {} }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
