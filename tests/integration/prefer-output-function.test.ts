import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/prefer-output-function [integration]', () => {
  describe('violations', () => {
    it('flags @Output() EventEmitter', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-output-function',
        `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Output() clicked = new EventEmitter<void>();
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Prefer the output() function');
    });

    it('flags multiple @Output() decorators', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-output-function',
        `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Output() clicked = new EventEmitter<void>();
          @Output() changed = new EventEmitter<string>();
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(2);
    });

    // Verified: the rule matches the bare decorator, so a readonly property
    // (the common style for EventEmitter outputs) is still caught.
    it('flags @Output() on a readonly property', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-output-function',
        `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Output() readonly clicked = new EventEmitter<void>();
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Prefer the output() function');
    });
  });

  describe('valid', () => {
    it('accepts output() function', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-output-function',
        `
        import { Component, output } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          clicked = output<void>();
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
