import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/directive-selector [integration]', () => {
  describe('violations', () => {
    it('flags attribute selector without the app prefix', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'directive-selector',
        `
        import { Directive } from '@angular/core';
        @Directive({ selector: '[highlight]' })
        export class Highlight {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain("camelCase attribute with the 'app' prefix");
    });

    it('flags kebab-case attribute selector', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'directive-selector',
        `
        import { Directive } from '@angular/core';
        @Directive({ selector: '[app-highlight]' })
        export class Highlight {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags element selector on a directive', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'directive-selector',
        `
        import { Directive } from '@angular/core';
        @Directive({ selector: 'app-highlight' })
        export class Highlight {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts camelCase attribute selector with app prefix', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'directive-selector',
        `
        import { Directive } from '@angular/core';
        @Directive({ selector: '[appHighlight]' })
        export class Highlight {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts a comma-separated list of valid selectors', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'directive-selector',
        `
        import { Directive } from '@angular/core';
        @Directive({ selector: '[appTooltip], [appTooltipTop]' })
        export class Tooltip {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('ignores @Component selectors', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'directive-selector',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class App {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
