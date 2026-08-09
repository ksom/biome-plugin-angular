import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

// The rule flags an @Output() named `xChange` only when a matching @Input()
// named `x` exists in the same file (regex capture + program contains).

describe('angular/prefer-model-signal [integration]', () => {
  describe('violations', () => {
    it('flags a paired @Input() value + @Output() valueChange', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-model-signal', `
        import { Component, Input, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-counter', standalone: true, template: '' })
        export class Counter {
          @Input() value = 0;
          @Output() valueChange = new EventEmitter<number>();
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('model()');
    });

    it('flags a pair where the input is typed without initializer', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-model-signal', `
        import { Component, Input, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-counter', standalone: true, template: '' })
        export class Counter {
          @Input() count: number;
          @Output() countChange = new EventEmitter<number>();
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts an unpaired *Change output (Material-style event)', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-model-signal', `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-list', standalone: true, template: '' })
        export class List {
          @Output() selectionChange = new EventEmitter<string>();
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts model() signal', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-model-signal', `
        import { Component, model } from '@angular/core';
        @Component({ selector: 'app-counter', standalone: true, template: '' })
        export class Counter {
          value = model(0);
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts @Output() that does not end in Change', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-model-signal', `
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
