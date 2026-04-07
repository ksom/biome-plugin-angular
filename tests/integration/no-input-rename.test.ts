import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/no-input-rename [integration]', () => {
  describe('violations', () => {
    it('flags @Input with a string alias', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-input-rename', `
        import { Component, Input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Input('myAlias') value: string = '';
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags @Input with alias in options object', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-input-rename', `
        import { Component, Input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Input({ alias: 'externalName' }) internalProp: string = '';
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts @Input() without alias', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-input-rename', `
        import { Component, Input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Input() value: string = '';
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts @Input({ required: true }) without alias', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-input-rename', `
        import { Component, Input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Input({ required: true }) label!: string;
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
