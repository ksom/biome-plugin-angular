import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/no-output-rename [integration]', () => {
  describe('violations', () => {
    it('flags @Output with a string alias', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-output-rename',
        `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Output('clickEvent') clicked = new EventEmitter<void>();
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Avoid renaming @Output()');
    });

    it('flags @Output with alias in options object', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-output-rename',
        `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Output({ alias: 'submitEvent' }) onSubmit = new EventEmitter<void>();
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Avoid renaming @Output()');
    });

    it('flags aliased @Output on a property with an explicit type annotation', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-output-rename',
        `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Output('valueChange') changed: EventEmitter<string> = new EventEmitter<string>();
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Avoid renaming @Output()');
    });
  });

  describe('valid', () => {
    it('accepts @Output() without alias', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-output-rename',
        `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Output() clicked = new EventEmitter<void>();
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
