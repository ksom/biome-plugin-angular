import { describe, expect, it } from 'vitest';
import { detectDecoratorInputs } from '../helpers/pattern-matcher.js';

describe('angular/prefer-signal-inputs', () => {
  describe('invalid — @Input() decorator usage', () => {
    it('flags a simple @Input() property', () => {
      const code = `
        import { Component, Input } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @Input() title: string = '';
        }
      `;

      const violations = detectDecoratorInputs(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('FooComponent');
      expect(violations[0].propertyName).toBe('title');
    });

    it('flags @Input({ required: true }) as required', () => {
      const code = `
        import { Component, Input } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @Input({ required: true }) title!: string;
        }
      `;

      const violations = detectDecoratorInputs(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].isRequired).toBe(true);
    });

    it('flags multiple @Input() properties', () => {
      const code = `
        import { Component, Input } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @Input() title: string = '';
          @Input() count: number = 0;
          @Input({ required: true }) id!: string;
        }
      `;

      const violations = detectDecoratorInputs(code);
      expect(violations).toHaveLength(3);
      expect(violations.map((v) => v.propertyName)).toEqual(['title', 'count', 'id']);
    });

    it('flags @Input() in @Directive', () => {
      const code = `
        import { Directive, Input } from '@angular/core';

        @Directive({ selector: '[appFoo]', standalone: true })
        export class FooDirective {
          @Input() appFoo: string = '';
        }
      `;

      const violations = detectDecoratorInputs(code);
      expect(violations).toHaveLength(1);
    });
  });

  describe('edge cases', () => {
    it('uses "unknown" as className for anonymous class', () => {
      const code = `
        import { Input } from '@angular/core';
        export default class {
          @Input() title: string = '';
        }
      `;
      const violations = detectDecoratorInputs(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('unknown');
    });
  });

  describe('valid — signal-based inputs', () => {
    it('accepts input() signal', () => {
      const code = `
        import { Component, input } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          title = input('');
        }
      `;

      expect(detectDecoratorInputs(code)).toHaveLength(0);
    });

    it('accepts input.required() signal', () => {
      const code = `
        import { Component, input } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          title = input.required<string>();
        }
      `;

      expect(detectDecoratorInputs(code)).toHaveLength(0);
    });

    it('ignores regular properties without @Input', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          title: string = '';
          private data = [];
        }
      `;

      expect(detectDecoratorInputs(code)).toHaveLength(0);
    });
  });
});
