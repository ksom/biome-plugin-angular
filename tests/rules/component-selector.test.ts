import { describe, expect, it } from 'vitest';
import { detectInvalidComponentSelector } from '../helpers/pattern-matcher.js';

describe('angular/component-selector', () => {
  describe('invalid', () => {
    it('flags PascalCase selector without prefix', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'Root', standalone: true, template: '' })
        export class AppComponent {}
      `;

      const violations = detectInvalidComponentSelector(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].selector).toBe('Root');
    });

    it('flags camelCase selector without prefix', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'appRoot', standalone: true, template: '' })
        export class AppComponent {}
      `;

      const violations = detectInvalidComponentSelector(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].selector).toBe('appRoot');
    });

    it('flags kebab-case selector with wrong prefix', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'my-root', standalone: true, template: '' })
        export class AppComponent {}
      `;

      const violations = detectInvalidComponentSelector(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].selector).toBe('my-root');
    });

    it('flags selector missing prefix entirely', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'user-profile', standalone: true, template: '' })
        export class UserProfileComponent {}
      `;

      const violations = detectInvalidComponentSelector(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].reason).toContain('app-');
    });

    it('flags selector with uppercase letters', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-UserProfile', standalone: true, template: '' })
        export class UserProfileComponent {}
      `;

      const violations = detectInvalidComponentSelector(code);
      expect(violations).toHaveLength(1);
    });

    it('flags multiple components with invalid selectors', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'Root', standalone: true, template: '' })
        export class RootComponent {}

        @Component({ selector: 'my-header', standalone: true, template: '' })
        export class HeaderComponent {}
      `;

      const violations = detectInvalidComponentSelector(code);
      expect(violations).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('ignores @Component() with no arguments', () => {
      const code = `
        import { Component } from '@angular/core';
        @Component()
        export class AppComponent {}
      `;
      expect(detectInvalidComponentSelector(code)).toHaveLength(0);
    });

    it('uses "unknown" as className for anonymous class with bad selector', () => {
      const code = `
        import { Component } from '@angular/core';
        @Component({ selector: 'badSelector', standalone: true, template: '' })
        export default class {}
      `;
      const violations = detectInvalidComponentSelector(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('unknown');
    });
  });

  describe('valid', () => {
    it('accepts app- prefixed kebab-case selector', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {}
      `;

      expect(detectInvalidComponentSelector(code)).toHaveLength(0);
    });

    it('accepts multi-word kebab-case selector with app- prefix', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-user-profile', standalone: true, template: '' })
        export class UserProfileComponent {}
      `;

      expect(detectInvalidComponentSelector(code)).toHaveLength(0);
    });

    it('accepts selector with numbers in kebab segments', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-step2-form', standalone: true, template: '' })
        export class Step2FormComponent {}
      `;

      expect(detectInvalidComponentSelector(code)).toHaveLength(0);
    });

    it('accepts custom prefix (e.g. admin-)', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'admin-dashboard', standalone: true, template: '' })
        export class AdminDashboardComponent {}
      `;

      // With default prefix "app" this is a violation
      const withDefault = detectInvalidComponentSelector(code);
      expect(withDefault).toHaveLength(1);

      // With custom prefix "admin" it should pass
      const withCustom = detectInvalidComponentSelector(code, 'admin');
      expect(withCustom).toHaveLength(0);
    });

    it('ignores @Directive classes', () => {
      const code = `
        import { Directive } from '@angular/core';

        @Directive({ selector: '[appHighlight]', standalone: true })
        export class HighlightDirective {}
      `;

      expect(detectInvalidComponentSelector(code)).toHaveLength(0);
    });

    it('ignores components without a selector property', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ standalone: true, template: '' })
        export class AppComponent {}
      `;

      expect(detectInvalidComponentSelector(code)).toHaveLength(0);
    });
  });
});
