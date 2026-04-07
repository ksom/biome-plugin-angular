import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/prefer-signal-queries [integration]', () => {
  describe('violations', () => {
    it('flags @ViewChild decorator', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-signal-queries', `
        import { Component, ViewChild, ElementRef } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @ViewChild('canvas') canvas!: ElementRef;
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags @ContentChild decorator', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-signal-queries', `
        import { Component, ContentChild, TemplateRef } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @ContentChild(TemplateRef) tpl?: TemplateRef<unknown>;
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags @ViewChildren decorator', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-signal-queries', `
        import { Component, ViewChildren, QueryList } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @ViewChildren('item') items!: QueryList<unknown>;
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts viewChild() signal', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-signal-queries', `
        import { Component, viewChild, ElementRef } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          canvas = viewChild.required<ElementRef>('canvas');
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
