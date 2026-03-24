import { describe, expect, it } from 'vitest';
import { detectMissingPipePrefix } from '../helpers/pattern-matcher.js';

describe('angular/pipe-prefix', () => {
  describe('invalid', () => {
    it('flags pipe name without prefix', () => {
      const code = `
        import { Pipe, PipeTransform } from '@angular/core';

        @Pipe({ name: 'truncate', standalone: true })
        export class TruncatePipe implements PipeTransform {
          transform(value: string, limit: number): string {
            return value.substring(0, limit);
          }
        }
      `;

      const violations = detectMissingPipePrefix(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].pipeName).toBe('truncate');
      expect(violations[0].expectedPrefix).toBe('app');
    });

    it('flags camelCase pipe name without prefix', () => {
      const code = `
        import { Pipe, PipeTransform } from '@angular/core';

        @Pipe({ name: 'currencyFormat', standalone: true })
        export class CurrencyFormatPipe implements PipeTransform {
          transform(value: number): string {
            return value.toFixed(2);
          }
        }
      `;

      const violations = detectMissingPipePrefix(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].pipeName).toBe('currencyFormat');
      expect(violations[0].className).toBe('CurrencyFormatPipe');
    });

    it('flags multiple pipes without prefix in same file', () => {
      const code = `
        import { Pipe, PipeTransform } from '@angular/core';

        @Pipe({ name: 'truncate', standalone: true })
        export class TruncatePipe implements PipeTransform {
          transform(v: string): string { return v; }
        }

        @Pipe({ name: 'highlight', standalone: true })
        export class HighlightPipe implements PipeTransform {
          transform(v: string): string { return v; }
        }
      `;

      const violations = detectMissingPipePrefix(code);
      expect(violations).toHaveLength(2);
      expect(violations.map((v) => v.pipeName)).toEqual(['truncate', 'highlight']);
    });

    it('flags pipe name starting with wrong prefix', () => {
      const code = `
        import { Pipe, PipeTransform } from '@angular/core';

        @Pipe({ name: 'myTruncate', standalone: true })
        export class TruncatePipe implements PipeTransform {
          transform(v: string): string { return v; }
        }
      `;

      const violations = detectMissingPipePrefix(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].pipeName).toBe('myTruncate');
    });
  });

  describe('valid', () => {
    it('accepts pipe name starting with "app" prefix', () => {
      const code = `
        import { Pipe, PipeTransform } from '@angular/core';

        @Pipe({ name: 'appTruncate', standalone: true })
        export class TruncatePipe implements PipeTransform {
          transform(value: string, limit: number): string {
            return value.substring(0, limit);
          }
        }
      `;

      expect(detectMissingPipePrefix(code)).toHaveLength(0);
    });

    it('accepts multiple valid pipe names', () => {
      const code = `
        import { Pipe, PipeTransform } from '@angular/core';

        @Pipe({ name: 'appTruncate', standalone: true })
        export class TruncatePipe implements PipeTransform {
          transform(v: string): string { return v; }
        }

        @Pipe({ name: 'appCurrencyFormat', standalone: true })
        export class CurrencyFormatPipe implements PipeTransform {
          transform(v: number): string { return String(v); }
        }
      `;

      expect(detectMissingPipePrefix(code)).toHaveLength(0);
    });

    it('accepts custom prefix (e.g. "acme")', () => {
      const code = `
        import { Pipe, PipeTransform } from '@angular/core';

        @Pipe({ name: 'acmeTruncate', standalone: true })
        export class TruncatePipe implements PipeTransform {
          transform(v: string): string { return v; }
        }
      `;

      // With default prefix "app" — violation
      const withDefault = detectMissingPipePrefix(code);
      expect(withDefault).toHaveLength(1);

      // With custom prefix "acme" — passes
      const withCustom = detectMissingPipePrefix(code, 'acme');
      expect(withCustom).toHaveLength(0);
    });

    it('ignores @Component and @Directive decorators', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {}
      `;

      expect(detectMissingPipePrefix(code)).toHaveLength(0);
    });

    it('ignores @Pipe without a name property', () => {
      const code = `
        import { Pipe } from '@angular/core';

        @Pipe({ standalone: true })
        export class SomePipe {}
      `;

      expect(detectMissingPipePrefix(code)).toHaveLength(0);
    });
  });
});
