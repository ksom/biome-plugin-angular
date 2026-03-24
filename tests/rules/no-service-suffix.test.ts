import { describe, expect, it } from 'vitest';
import { detectServiceSuffix } from '../helpers/pattern-matcher.js';

describe('angular/no-service-suffix', () => {
  describe('invalid — class names with "Service" suffix', () => {
    it('flags UserService', () => {
      const code = `
        import { Injectable } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class UserService {}
      `;

      const violations = detectServiceSuffix(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('UserService');
      expect(violations[0].expectedSuffix).toBe('Service');
    });

    it('flags AuthService', () => {
      const code = `
        import { Injectable } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class AuthService {}
      `;

      const violations = detectServiceSuffix(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('AuthService');
    });

    it('flags multiple services with suffix in same file', () => {
      const code = `
        import { Injectable } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class UserService {}

        @Injectable({ providedIn: 'root' })
        export class AuthService {}

        @Injectable({ providedIn: 'root' })
        export class ProductService {}
      `;

      const violations = detectServiceSuffix(code);
      expect(violations).toHaveLength(3);
      expect(violations.map((v) => v.className)).toEqual([
        'UserService',
        'AuthService',
        'ProductService',
      ]);
    });

    it('flags @Injectable without providedIn', () => {
      const code = `
        import { Injectable } from '@angular/core';

        @Injectable()
        export class LoggerService {}
      `;

      const violations = detectServiceSuffix(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('LoggerService');
    });

    it('flags a service that extends a base class', () => {
      const code = `
        import { Injectable } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class UserService extends BaseService {}
      `;

      const violations = detectServiceSuffix(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('UserService');
    });
  });

  describe('valid — descriptive names without "Service" suffix', () => {
    it('accepts UserStore (state management)', () => {
      const code = `
        import { Injectable } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class UserStore {}
      `;

      expect(detectServiceSuffix(code)).toHaveLength(0);
    });

    it('accepts UserApi (HTTP client)', () => {
      const code = `
        import { Injectable } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class UserApi {}
      `;

      expect(detectServiceSuffix(code)).toHaveLength(0);
    });

    it('accepts AuthFacade (facade pattern)', () => {
      const code = `
        import { Injectable } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class AuthFacade {}
      `;

      expect(detectServiceSuffix(code)).toHaveLength(0);
    });

    it('accepts multiple descriptive names', () => {
      const code = `
        import { Injectable } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class UserStore {}

        @Injectable({ providedIn: 'root' })
        export class ProductApi {}

        @Injectable({ providedIn: 'root' })
        export class Logger {}
      `;

      expect(detectServiceSuffix(code)).toHaveLength(0);
    });

    it('ignores @Component classes', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppService {}
      `;

      // @Component is not @Injectable — not flagged by this rule
      expect(detectServiceSuffix(code)).toHaveLength(0);
    });

    it('ignores plain classes without decorators', () => {
      const code = `
        export class UserService {
          getUser() { return null; }
        }
      `;

      expect(detectServiceSuffix(code)).toHaveLength(0);
    });

    it('ignores @Directive classes', () => {
      const code = `
        import { Directive } from '@angular/core';

        @Directive({ selector: '[appFoo]', standalone: true })
        export class FooService {}
      `;

      expect(detectServiceSuffix(code)).toHaveLength(0);
    });
  });
});
