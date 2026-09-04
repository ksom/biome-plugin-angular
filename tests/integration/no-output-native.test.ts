import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/no-output-native [integration]', () => {
  describe('violations', () => {
    it('flags @Output() named like a native DOM event', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-output-native',
        `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class App {
          @Output() change = new EventEmitter<string>();
          @Output() readonly click = new EventEmitter<void>();
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(2);
      expect(diagnostics[0].message).toContain('native DOM event');
    });

    it('flags signal outputs named like a native DOM event', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-output-native',
        `
        import { Component, output } from '@angular/core';
        import { outputFromObservable } from '@angular/core/rxjs-interop';
        @Component({ selector: 'app-root', template: '' })
        export class App {
          readonly focus = output<void>();
          readonly submit = output();
          readonly scroll = outputFromObservable(this.scroll$);
          private readonly scroll$ = new Subject<void>();
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(3);
    });
  });

  describe('valid', () => {
    it('accepts outputs with specific names', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-output-native',
        `
        import { Component, Output, EventEmitter, output } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class App {
          @Output() valueChange = new EventEmitter<string>();
          readonly itemSelected = output<string>();
          readonly clicked = output<void>();
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('ignores plain properties and inputs named like events', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-output-native',
        `
        import { Component, Input, input } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class App {
          @Input() change = '';
          readonly focus = input(false);
          click = 0;
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
