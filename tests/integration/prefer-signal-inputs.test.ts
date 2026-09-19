import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/prefer-signal-inputs [integration]', () => {
  describe('violations', () => {
    it('flags @Input() decorator', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-signal-inputs',
        `
        import { Component, Input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Input() title: string = '';
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Prefer the input() signal function');
    });

    it('flags @Input({ required: true })', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-signal-inputs',
        `
        import { Component, Input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Input({ required: true }) title!: string;
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Prefer the input() signal function');
    });

    // Verified: the rule matches the bare decorator, so readonly properties
    // are still caught.
    it('flags @Input() on a readonly property', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-signal-inputs',
        `
        import { Component, Input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Input() readonly title: string = '';
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Prefer the input() signal function');
    });

    // Verified: @Input() on a get/set accessor pair is also caught (one
    // diagnostic for the single decorated setter) — no accessor blind spot.
    it('flags @Input() on a setter accessor', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-signal-inputs',
        `
        import { Component, Input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          private _title = '';
          @Input()
          set title(value: string) { this._title = value.trim(); }
          get title(): string { return this._title; }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Prefer the input() signal function');
    });
  });

  describe('valid', () => {
    it('accepts input() signal', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-signal-inputs',
        `
        import { Component, input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          title = input('');
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts regular property without @Input', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-signal-inputs',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          title: string = '';
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
