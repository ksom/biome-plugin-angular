import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

// NOTE: The GritQL rule matches @Output() properties whose name ends with "Change"
// (regex .*Change$). The ts-morph version additionally requires a matching @Input().
// Integration tests validate the actual GritQL behavior.

describe('angular/prefer-model-signal [integration]', () => {
  describe('violations', () => {
    it('flags @Output() valueChange (ends with Change)', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-model-signal', `
        import { Component, Input, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-counter', standalone: true, template: '' })
        export class Counter {
          @Input() value = 0;
          @Output() valueChange = new EventEmitter<number>();
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
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
