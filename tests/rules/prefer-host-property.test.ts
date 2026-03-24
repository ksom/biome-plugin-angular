import { describe, expect, it } from 'vitest';
import { detectHostDecorators } from '../helpers/pattern-matcher.js';

describe('angular/prefer-host-property', () => {
  describe('invalid — @HostBinding / @HostListener decorator usage', () => {
    it('flags @HostBinding on a property', () => {
      const code = `
        import { Component, HostBinding } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @HostBinding('class.active') isActive = false;
        }
      `;

      const violations = detectHostDecorators(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('FooComponent');
      expect(violations[0].decoratorName).toBe('HostBinding');
      expect(violations[0].memberName).toBe('isActive');
    });

    it('flags @HostListener on a method', () => {
      const code = `
        import { Component, HostListener } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @HostListener('click') onClick() {
            this.isActive = true;
          }
        }
      `;

      const violations = detectHostDecorators(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].decoratorName).toBe('HostListener');
      expect(violations[0].memberName).toBe('onClick');
    });

    it('flags both @HostBinding and @HostListener in the same class', () => {
      const code = `
        import { Component, HostBinding, HostListener } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @HostBinding('class.active') isActive = false;
          @HostBinding('attr.role') role = 'button';
          @HostListener('click') onClick() { this.isActive = !this.isActive; }
          @HostListener('keydown.enter') onEnter() { this.onClick(); }
        }
      `;

      const violations = detectHostDecorators(code);
      expect(violations).toHaveLength(4);
    });

    it('flags @HostBinding in a @Directive', () => {
      const code = `
        import { Directive, HostBinding } from '@angular/core';

        @Directive({ selector: '[appHighlight]', standalone: true })
        export class HighlightDirective {
          @HostBinding('style.backgroundColor') color = 'yellow';
        }
      `;

      const violations = detectHostDecorators(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].decoratorName).toBe('HostBinding');
    });
  });

  describe('valid — host: {} metadata', () => {
    it('accepts host: {} in @Component', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({
          selector: 'app-foo',
          standalone: true,
          template: '',
          host: {
            '[class.active]': 'isActive',
            '(click)': 'onClick()',
          },
        })
        export class FooComponent {
          isActive = false;
          onClick() { this.isActive = !this.isActive; }
        }
      `;

      expect(detectHostDecorators(code)).toHaveLength(0);
    });

    it('uses "unknown" as className for anonymous class (@HostListener)', () => {
      const code = `
        import { HostListener } from '@angular/core';
        export default class {
          @HostListener('click') onClick() {}
        }
      `;
      const violations = detectHostDecorators(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('unknown');
    });

    it('uses "unknown" as className for anonymous class (@HostBinding)', () => {
      const code = `
        import { HostBinding } from '@angular/core';
        export default class {
          @HostBinding('class.active') isActive = false;
        }
      `;
      const violations = detectHostDecorators(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('unknown');
    });

    it('accepts host: {} in @Directive', () => {
      const code = `
        import { Directive } from '@angular/core';

        @Directive({
          selector: '[appHighlight]',
          standalone: true,
          host: { '[style.backgroundColor]': 'color' },
        })
        export class HighlightDirective {
          color = 'yellow';
        }
      `;

      expect(detectHostDecorators(code)).toHaveLength(0);
    });
  });
});
