import { describe, expect, it } from 'vitest';
import { detectDirectiveSuffix } from '../helpers/pattern-matcher.js';

describe('angular/no-directive-suffix', () => {
  describe('invalid — class names with "Directive" suffix', () => {
    it('flags HighlightDirective', () => {
      const code = `
        import { Directive } from '@angular/core';

        @Directive({ selector: '[appHighlight]', standalone: true })
        export class HighlightDirective {}
      `;

      const violations = detectDirectiveSuffix(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('HighlightDirective');
      expect(violations[0].expectedSuffix).toBe('Directive');
    });

    it('flags AutoFocusDirective', () => {
      const code = `
        import { Directive } from '@angular/core';

        @Directive({ selector: '[appAutoFocus]', standalone: true })
        export class AutoFocusDirective {}
      `;

      const violations = detectDirectiveSuffix(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('AutoFocusDirective');
    });

    it('flags multiple directives with suffix in same file', () => {
      const code = `
        import { Directive } from '@angular/core';

        @Directive({ selector: '[appHighlight]', standalone: true })
        export class HighlightDirective {}

        @Directive({ selector: '[appTooltip]', standalone: true })
        export class TooltipDirective {}

        @Directive({ selector: '[appClickOutside]', standalone: true })
        export class ClickOutsideDirective {}
      `;

      const violations = detectDirectiveSuffix(code);
      expect(violations).toHaveLength(3);
      expect(violations.map((v) => v.className)).toEqual([
        'HighlightDirective',
        'TooltipDirective',
        'ClickOutsideDirective',
      ]);
    });

    it('flags a directive that extends a base class', () => {
      const code = `
        import { Directive } from '@angular/core';

        @Directive({ selector: '[appFoo]', standalone: true })
        export class FooDirective extends BaseDirective {}
      `;

      const violations = detectDirectiveSuffix(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('FooDirective');
    });
  });

  describe('edge cases', () => {
    it('handles anonymous class with @Directive (no violation, empty name)', () => {
      const code = `
        import { Directive } from '@angular/core';
        @Directive({ selector: '[appFoo]', standalone: true })
        export default class {}
      `;
      expect(detectDirectiveSuffix(code)).toHaveLength(0);
    });
  });

  describe('valid — class names without "Directive" suffix', () => {
    it('accepts Highlight (no suffix)', () => {
      const code = `
        import { Directive } from '@angular/core';

        @Directive({ selector: '[appHighlight]', standalone: true })
        export class Highlight {}
      `;

      expect(detectDirectiveSuffix(code)).toHaveLength(0);
    });

    it('accepts AutoFocus', () => {
      const code = `
        import { Directive } from '@angular/core';

        @Directive({ selector: '[appAutoFocus]', standalone: true })
        export class AutoFocus {}
      `;

      expect(detectDirectiveSuffix(code)).toHaveLength(0);
    });

    it('accepts multiple directives without suffix', () => {
      const code = `
        import { Directive } from '@angular/core';

        @Directive({ selector: '[appHighlight]', standalone: true })
        export class Highlight {}

        @Directive({ selector: '[appTooltip]', standalone: true })
        export class Tooltip {}
      `;

      expect(detectDirectiveSuffix(code)).toHaveLength(0);
    });

    it('ignores @Component classes', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppDirective {}
      `;

      // @Component is not @Directive — not flagged by this rule
      expect(detectDirectiveSuffix(code)).toHaveLength(0);
    });

    it('ignores plain classes without decorators', () => {
      const code = `
        export class HighlightDirective {
          color = 'yellow';
        }
      `;

      expect(detectDirectiveSuffix(code)).toHaveLength(0);
    });

    it('ignores @Injectable classes', () => {
      const code = `
        import { Injectable } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class UserDirective {}
      `;

      expect(detectDirectiveSuffix(code)).toHaveLength(0);
    });
  });
});
