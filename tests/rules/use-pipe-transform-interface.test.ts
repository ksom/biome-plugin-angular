import { describe, expect, it } from 'vitest';
import { detectMissingPipeTransform } from '../helpers/pattern-matcher.js';

describe('angular/use-pipe-transform-interface', () => {
  describe('invalid — @Pipe without PipeTransform', () => {
    it('flags @Pipe class with no implements', () => {
      const code = `
        import { Pipe } from '@angular/core';

        @Pipe({ name: 'appTruncate', standalone: true })
        export class TruncatePipe {
          transform(value: string, limit = 50): string {
            return value.length > limit ? value.slice(0, limit) + '…' : value;
          }
        }
      `;

      const violations = detectMissingPipeTransform(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('TruncatePipe');
    });

    it('flags @Pipe class implementing other interfaces but not PipeTransform', () => {
      const code = `
        import { Pipe } from '@angular/core';

        @Pipe({ name: 'appFoo', standalone: true })
        export class FooPipe implements SomeOtherInterface {
          transform(value: string): string { return value; }
        }
      `;

      const violations = detectMissingPipeTransform(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('FooPipe');
    });

    it('flags multiple pipes missing PipeTransform', () => {
      const code = `
        import { Pipe } from '@angular/core';

        @Pipe({ name: 'appFoo', standalone: true })
        export class FooPipe {
          transform(v: string) { return v; }
        }

        @Pipe({ name: 'appBar', standalone: true })
        export class BarPipe {
          transform(v: number) { return v; }
        }
      `;

      const violations = detectMissingPipeTransform(code);
      expect(violations).toHaveLength(2);
    });
  });

  describe('valid — @Pipe implementing PipeTransform', () => {
    it('accepts @Pipe with PipeTransform', () => {
      const code = `
        import { Pipe, PipeTransform } from '@angular/core';

        @Pipe({ name: 'appTruncate', standalone: true })
        export class TruncatePipe implements PipeTransform {
          transform(value: string, limit = 50): string {
            return value.length > limit ? value.slice(0, limit) + '…' : value;
          }
        }
      `;

      expect(detectMissingPipeTransform(code)).toHaveLength(0);
    });

    it('accepts @Pipe with PipeTransform alongside other interfaces', () => {
      const code = `
        import { Pipe, PipeTransform, OnDestroy } from '@angular/core';

        @Pipe({ name: 'appFoo', standalone: true })
        export class FooPipe implements PipeTransform, OnDestroy {
          transform(v: string) { return v; }
          ngOnDestroy() { this.sub.unsubscribe(); }
        }
      `;

      expect(detectMissingPipeTransform(code)).toHaveLength(0);
    });

    it('ignores non-Pipe classes', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          transform(v: string) { return v; }
        }
      `;

      expect(detectMissingPipeTransform(code)).toHaveLength(0);
    });
  });
});
