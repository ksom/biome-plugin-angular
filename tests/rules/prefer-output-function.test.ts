import { describe, expect, it } from 'vitest';
import { detectDecoratorOutputs } from '../helpers/pattern-matcher.js';

describe('angular/prefer-output-function', () => {
  describe('invalid — @Output() decorator usage', () => {
    it('flags a simple @Output() EventEmitter', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @Output() clicked = new EventEmitter<void>();
        }
      `;

      const violations = detectDecoratorOutputs(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('FooComponent');
      expect(violations[0].propertyName).toBe('clicked');
    });

    it('flags @Output() with generic type', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @Output() valueChange = new EventEmitter<string>();
        }
      `;

      const violations = detectDecoratorOutputs(code);
      expect(violations).toHaveLength(1);
    });

    it('flags multiple @Output() properties', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @Output() clicked = new EventEmitter<void>();
          @Output() valueChange = new EventEmitter<string>();
          @Output() closed = new EventEmitter<boolean>();
        }
      `;

      const violations = detectDecoratorOutputs(code);
      expect(violations).toHaveLength(3);
      expect(violations.map((v) => v.propertyName)).toEqual(['clicked', 'valueChange', 'closed']);
    });
  });

  describe('edge cases', () => {
    it('uses "unknown" as className for anonymous class', () => {
      const code = `
        import { Output, EventEmitter } from '@angular/core';
        export default class {
          @Output() clicked = new EventEmitter<void>();
        }
      `;
      const violations = detectDecoratorOutputs(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('unknown');
    });
  });

  describe('valid — output() function usage', () => {
    it('accepts output() function', () => {
      const code = `
        import { Component, output } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          clicked = output<void>();
        }
      `;

      expect(detectDecoratorOutputs(code)).toHaveLength(0);
    });

    it('accepts output() with generic type', () => {
      const code = `
        import { Component, output } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          valueChange = output<string>();
        }
      `;

      expect(detectDecoratorOutputs(code)).toHaveLength(0);
    });

    it('ignores regular properties without @Output', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          clicked = () => {};
        }
      `;

      expect(detectDecoratorOutputs(code)).toHaveLength(0);
    });
  });
});
