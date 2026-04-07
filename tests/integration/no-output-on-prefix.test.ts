import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/no-output-on-prefix [integration]', () => {
  describe('violations', () => {
    it('flags @Output() onClick', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-output-on-prefix', `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Output() onClick = new EventEmitter<void>();
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags @Output() onSubmit', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-output-on-prefix', `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Output() onSubmit = new EventEmitter<void>();
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts @Output() without on prefix', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-output-on-prefix', `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Output() clicked = new EventEmitter<void>();
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('does not flag "on" not followed by uppercase (onion)', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-output-on-prefix', `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Output() onion = new EventEmitter<void>();
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
