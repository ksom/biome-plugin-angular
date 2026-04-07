import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/prefer-output-function [integration]', () => {
  describe('violations', () => {
    it('flags @Output() EventEmitter', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-output-function', `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Output() clicked = new EventEmitter<void>();
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags multiple @Output() decorators', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-output-function', `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Output() clicked = new EventEmitter<void>();
          @Output() changed = new EventEmitter<string>();
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(2);
    });
  });

  describe('valid', () => {
    it('accepts output() function', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-output-function', `
        import { Component, output } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          clicked = output<void>();
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
