import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/no-directive-suffix [integration]', () => {
  describe('violations', () => {
    it('flags class named HighlightDirective', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-directive-suffix',
        `
        import { Directive } from '@angular/core';
        @Directive({ selector: '[appHighlight]', standalone: true })
        export class HighlightDirective {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Directive');
    });
  });

  describe('valid', () => {
    it('accepts an undecorated class ending in Directive (not Angular)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-directive-suffix',
        `
        export class ParserDirective {
          parse() {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts class named Highlight', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-directive-suffix',
        `
        import { Directive } from '@angular/core';
        @Directive({ selector: '[appHighlight]', standalone: true })
        export class Highlight {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
