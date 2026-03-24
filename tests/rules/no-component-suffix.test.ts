import { describe, expect, it } from 'vitest';
import { detectComponentSuffix } from '../helpers/pattern-matcher.js';

describe('angular/no-component-suffix', () => {
  describe('invalid — class names with "Component" suffix', () => {
    it('flags AppComponent', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {}
      `;

      const violations = detectComponentSuffix(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('AppComponent');
    });

    it('flags HeaderComponent', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-header', standalone: true, template: '' })
        export class HeaderComponent {}
      `;

      const violations = detectComponentSuffix(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('HeaderComponent');
    });

    it('flags multiple suffixed components in the same file', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-header', standalone: true, template: '' })
        export class HeaderComponent {}

        @Component({ selector: 'app-footer', standalone: true, template: '' })
        export class FooterComponent {}

        @Component({ selector: 'app-nav', standalone: true, template: '' })
        export class NavComponent {}
      `;

      const violations = detectComponentSuffix(code);
      expect(violations).toHaveLength(3);
      expect(violations.map((v) => v.className)).toEqual([
        'HeaderComponent',
        'FooterComponent',
        'NavComponent',
      ]);
    });

    it('flags a class that extends a base class', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-list', standalone: true, template: '' })
        export class UserListComponent extends BaseListComponent {}
      `;

      const violations = detectComponentSuffix(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('UserListComponent');
    });
  });

  describe('valid — class names without "Component" suffix', () => {
    it('accepts App (no suffix)', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {}
      `;

      expect(detectComponentSuffix(code)).toHaveLength(0);
    });

    it('accepts Header', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-header', standalone: true, template: '' })
        export class Header {}
      `;

      expect(detectComponentSuffix(code)).toHaveLength(0);
    });

    it('accepts UserProfile (descriptive name, no suffix)', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-user-profile', standalone: true, template: '' })
        export class UserProfile {}
      `;

      expect(detectComponentSuffix(code)).toHaveLength(0);
    });

    it('accepts DashboardPage (custom suffix, not "Component")', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-dashboard', standalone: true, template: '' })
        export class DashboardPage {}
      `;

      expect(detectComponentSuffix(code)).toHaveLength(0);
    });

    it('ignores @Directive classes', () => {
      const code = `
        import { Directive } from '@angular/core';

        @Directive({ selector: '[appHighlight]', standalone: true })
        export class HighlightComponent {}
      `;

      // @Directive is not @Component — not flagged by this rule
      expect(detectComponentSuffix(code)).toHaveLength(0);
    });

    it('ignores plain classes without decorators', () => {
      const code = `
        export class UserComponent {
          name = '';
        }
      `;

      // No @Component decorator — not flagged
      expect(detectComponentSuffix(code)).toHaveLength(0);
    });
  });
});
