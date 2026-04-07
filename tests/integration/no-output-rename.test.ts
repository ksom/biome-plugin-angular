import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/no-output-rename [integration]', () => {
  describe('violations', () => {
    it('flags @Output with a string alias', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-output-rename', `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Output('clickEvent') clicked = new EventEmitter<void>();
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags @Output with alias in options object', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-output-rename', `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Output({ alias: 'submitEvent' }) onSubmit = new EventEmitter<void>();
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts @Output() without alias', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-output-rename', `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Output() clicked = new EventEmitter<void>();
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
