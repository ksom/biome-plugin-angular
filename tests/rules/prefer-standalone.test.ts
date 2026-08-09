import { describe, expect, it } from 'vitest';
import { detectMissingStandalone } from '../helpers/pattern-matcher.js';

describe('angular/prefer-standalone', () => {
  // -------------------------------------------------------------------------
  // Invalid cases — must produce violations
  // Since Angular 19 standalone is the default: only an explicit
  // `standalone: false` opt-out is a violation.
  // -------------------------------------------------------------------------

  describe('invalid', () => {
    it('flags @Component with standalone: false', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({
          selector: 'app-root',
          standalone: false,
          template: '<h1>Hello</h1>',
        })
        export class AppComponent {}
      `;

      const violations = detectMissingStandalone(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].decorator).toBe('Component');
      expect(violations[0].className).toBe('AppComponent');
    });

    it('flags @Directive with standalone: false', () => {
      const code = `
        import { Directive } from '@angular/core';

        @Directive({ selector: '[appHighlight]', standalone: false })
        export class HighlightDirective {}
      `;

      const violations = detectMissingStandalone(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].decorator).toBe('Directive');
    });

    it('flags @Pipe with standalone: false', () => {
      const code = `
        import { Pipe, PipeTransform } from '@angular/core';

        @Pipe({ name: 'truncate', standalone: false })
        export class TruncatePipe implements PipeTransform {
          transform(value: string, limit: number): string {
            return value.substring(0, limit);
          }
        }
      `;

      const violations = detectMissingStandalone(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].decorator).toBe('Pipe');
    });

    it('flags multiple standalone: false decorators in the same file', () => {
      const code = `
        import { Component, Directive } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: false, template: '' })
        export class FooComponent {}

        @Directive({ selector: '[appBar]', standalone: false })
        export class BarDirective {}
      `;

      const violations = detectMissingStandalone(code);
      expect(violations).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('uses "unknown" as className for anonymous class with standalone: false', () => {
      const code = `
        import { Component } from '@angular/core';
        @Component({ selector: 'foo', standalone: false, template: '' })
        export default class {}
      `;
      const violations = detectMissingStandalone(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('unknown');
    });
  });

  // -------------------------------------------------------------------------
  // Valid cases — must produce zero violations
  // -------------------------------------------------------------------------

  describe('valid', () => {
    it('accepts @Component with standalone: true', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({
          selector: 'app-root',
          standalone: true,
          template: '<h1>Hello</h1>',
        })
        export class AppComponent {}
      `;

      expect(detectMissingStandalone(code)).toHaveLength(0);
    });

    it('accepts @Component without a standalone property (default is standalone)', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({
          selector: 'app-root',
          template: '<h1>Hello</h1>',
        })
        export class AppComponent {}
      `;

      expect(detectMissingStandalone(code)).toHaveLength(0);
    });

    it('accepts @Component() with no arguments at all', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component()
        export class AppComponent {}
      `;

      expect(detectMissingStandalone(code)).toHaveLength(0);
    });

    it('accepts @Directive without a standalone property', () => {
      const code = `
        import { Directive } from '@angular/core';

        @Directive({ selector: '[appHighlight]' })
        export class HighlightDirective {}
      `;

      expect(detectMissingStandalone(code)).toHaveLength(0);
    });

    it('accepts @Pipe without a standalone property', () => {
      const code = `
        import { Pipe, PipeTransform } from '@angular/core';

        @Pipe({ name: 'truncate' })
        export class TruncatePipe implements PipeTransform {
          transform(value: string, limit: number): string {
            return value.substring(0, limit);
          }
        }
      `;

      expect(detectMissingStandalone(code)).toHaveLength(0);
    });

    it('ignores non-Angular decorators', () => {
      const code = `
        import { Injectable } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class DataService {}
      `;

      expect(detectMissingStandalone(code)).toHaveLength(0);
    });

    it('ignores plain classes without decorators', () => {
      const code = `
        export class UtilityClass {
          static format(value: string): string {
            return value.trim();
          }
        }
      `;

      expect(detectMissingStandalone(code)).toHaveLength(0);
    });
  });
});
