import { describe, expect, it } from 'vitest';
import { detectConflictingLifecycle } from '../helpers/pattern-matcher.js';

describe('angular/no-conflicting-lifecycle', () => {
  describe('invalid', () => {
    it('flags a class with ngDoCheck and ngOnChanges', () => {
      const v = detectConflictingLifecycle(`
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class App { ngDoCheck() {} ngOnChanges() {} }
      `);
      expect(v).toHaveLength(1);
      expect(v[0].className).toBe('App');
    });
    it('flags regardless of signature shape', () => {
      expect(
        detectConflictingLifecycle(`
          export class A { async ngDoCheck(): Promise<void> {} protected ngOnChanges(c: SimpleChanges): void {} }
        `),
      ).toHaveLength(1);
    });
    it('flags each conflicting class in a file', () => {
      expect(
        detectConflictingLifecycle(`
          export class A { ngDoCheck() {} ngOnChanges() {} }
          export class B { ngDoCheck() {} ngOnChanges() {} }
        `),
      ).toHaveLength(2);
    });
  });

  describe('valid', () => {
    it('accepts ngOnChanges alone', () => {
      expect(detectConflictingLifecycle('export class A { ngOnChanges() {} }')).toHaveLength(0);
    });
    it('accepts ngDoCheck alone', () => {
      expect(detectConflictingLifecycle('export class A { ngDoCheck() {} }')).toHaveLength(0);
    });
    it('accepts the hooks split across classes', () => {
      expect(
        detectConflictingLifecycle(
          'export class A { ngDoCheck() {} } export class B { ngOnChanges() {} }',
        ),
      ).toHaveLength(0);
    });
  });
});
