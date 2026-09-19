import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/no-input-rename [integration]', () => {
  describe('violations', () => {
    it('flags @Input with a string alias', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-input-rename',
        `
        import { Component, Input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Input('myAlias') value: string = '';
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Avoid renaming @Input()');
    });

    it('flags @Input with alias in options object', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-input-rename',
        `
        import { Component, Input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Input({ alias: 'externalName' }) internalProp: string = '';
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Avoid renaming @Input()');
    });

    it('flags alias even when combined with other options (alias + required)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-input-rename',
        `
        import { Component, Input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Input({ alias: 'x', required: true }) value!: string;
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Avoid renaming @Input()');
    });
  });

  describe('valid', () => {
    it('accepts @Input() without alias', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-input-rename',
        `
        import { Component, Input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Input() value: string = '';
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts @Input({ required: true }) without alias', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-input-rename',
        `
        import { Component, Input } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Input({ required: true }) label!: string;
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts @Input({ transform: booleanAttribute }) without alias', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-input-rename',
        `
        import { Component, Input, booleanAttribute } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @Input({ transform: booleanAttribute }) disabled = false;
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
