import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/prefer-signal-inputs [integration]', () => {
  describe('violations', () => {
    it('flags @Input() decorator', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-signal-inputs', `
        import { Component, Input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Input() title: string = '';
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags @Input({ required: true })', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-signal-inputs', `
        import { Component, Input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Input({ required: true }) title!: string;
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts input() signal', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-signal-inputs', `
        import { Component, input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          title = input('');
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts regular property without @Input', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-signal-inputs', `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          title: string = '';
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
