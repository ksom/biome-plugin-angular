import { describe, expect, it } from 'vitest';
import { detectConstructorInjection } from '../helpers/pattern-matcher.js';

describe('angular/prefer-inject-function', () => {
  describe('invalid — constructor-based dependency injection', () => {
    it('flags private constructor parameter', () => {
      const code = `
        import { Component } from '@angular/core';
        import { UserStore } from './user.store';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          constructor(private userStore: UserStore) {}
        }
      `;

      const violations = detectConstructorInjection(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('FooComponent');
      expect(violations[0].parameterName).toBe('userStore');
      expect(violations[0].parameterType).toBe('UserStore');
    });

    it('flags multiple constructor parameters', () => {
      const code = `
        import { Component } from '@angular/core';
        import { UserStore } from './user.store';
        import { Router } from '@angular/router';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          constructor(
            private userStore: UserStore,
            private router: Router,
          ) {}
        }
      `;

      const violations = detectConstructorInjection(code);
      expect(violations).toHaveLength(2);
      expect(violations.map((v) => v.parameterName)).toEqual(['userStore', 'router']);
    });

    it('flags protected constructor parameter', () => {
      const code = `
        import { Injectable } from '@angular/core';
        import { HttpClient } from '@angular/common/http';

        @Injectable({ providedIn: 'root' })
        export class UserApi {
          constructor(protected http: HttpClient) {}
        }
      `;

      const violations = detectConstructorInjection(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].parameterType).toBe('HttpClient');
    });

    it('flags public constructor parameter', () => {
      const code = `
        import { Component } from '@angular/core';
        import { FormBuilder } from '@angular/forms';

        @Component({ selector: 'app-form', standalone: true, template: '' })
        export class FormComponent {
          constructor(public fb: FormBuilder) {}
        }
      `;

      const violations = detectConstructorInjection(code);
      expect(violations).toHaveLength(1);
    });

    it('flags private readonly constructor parameter', () => {
      const code = `
        import { Component } from '@angular/core';
        import { Router } from '@angular/router';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          constructor(private readonly router: Router) {}
        }
      `;

      const violations = detectConstructorInjection(code);
      expect(violations).toHaveLength(1);
    });
  });

  describe('valid — inject() function usage', () => {
    it('accepts inject() function', () => {
      const code = `
        import { Component, inject } from '@angular/core';
        import { UserStore } from './user.store';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          private userStore = inject(UserStore);
        }
      `;

      expect(detectConstructorInjection(code)).toHaveLength(0);
    });

    it('accepts constructor without access modifiers (non-DI parameters)', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          constructor(someValue: string) {
            this.title = someValue;
          }
          title = '';
        }
      `;

      expect(detectConstructorInjection(code)).toHaveLength(0);
    });

    it('accepts empty constructor', () => {
      const code = `
        import { Component, inject } from '@angular/core';
        import { UserStore } from './user.store';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          private store = inject(UserStore);
          constructor() {}
        }
      `;

      expect(detectConstructorInjection(code)).toHaveLength(0);
    });

    it('accepts class with no constructor', () => {
      const code = `
        import { Component, inject } from '@angular/core';
        import { Router } from '@angular/router';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          private router = inject(Router);
        }
      `;

      expect(detectConstructorInjection(code)).toHaveLength(0);
    });
  });
});
