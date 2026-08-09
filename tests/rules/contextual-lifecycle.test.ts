import { describe, expect, it } from 'vitest';
import { detectContextualLifecycleViolations } from '../helpers/pattern-matcher.js';

// Upstream semantics: @Injectable and @Pipe classes may only declare
// ngOnDestroy — any other hook is a violation. @Component and @Directive
// allow ALL hooks (directives DO receive view and content hooks).
describe('angular/contextual-lifecycle', () => {
  describe('invalid — hooks other than ngOnDestroy in @Injectable / @Pipe', () => {
    it('flags ngAfterViewInit in @Injectable', () => {
      const code = `
        import { Injectable } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class UserStore {
          ngAfterViewInit() {
            this.render();
          }
        }
      `;

      const violations = detectContextualLifecycleViolations(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].methodName).toBe('ngAfterViewInit');
      expect(violations[0].decoratorName).toBe('Injectable');
    });

    it('flags ngAfterContentInit in @Injectable', () => {
      const code = `
        import { Injectable } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class SomeStore {
          ngAfterContentInit() { this.init(); }
        }
      `;

      const violations = detectContextualLifecycleViolations(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].methodName).toBe('ngAfterContentInit');
    });

    it('flags ngOnInit in @Injectable (only ngOnDestroy is ever called)', () => {
      const code = `
        import { Injectable } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class UserStore {
          ngOnInit() { this.load(); }
        }
      `;

      const violations = detectContextualLifecycleViolations(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].methodName).toBe('ngOnInit');
      expect(violations[0].decoratorName).toBe('Injectable');
    });

    it('flags ngOnChanges and ngDoCheck in @Injectable', () => {
      const code = `
        import { Injectable } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class SomeStore {
          ngOnChanges() { this.update(); }
          ngDoCheck() { this.check(); }
        }
      `;

      const violations = detectContextualLifecycleViolations(code);
      expect(violations).toHaveLength(2);
      expect(violations.map((v) => v.methodName)).toEqual(['ngOnChanges', 'ngDoCheck']);
    });

    it('flags ngAfterViewInit in @Pipe', () => {
      const code = `
        import { Pipe, PipeTransform } from '@angular/core';

        @Pipe({ name: 'appFoo', standalone: true })
        export class FooPipe implements PipeTransform {
          transform(v: string) { return v; }
          ngAfterViewInit() { this.init(); }
        }
      `;

      const violations = detectContextualLifecycleViolations(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].decoratorName).toBe('Pipe');
    });

    it('flags ngOnChanges in @Pipe', () => {
      const code = `
        import { Pipe, PipeTransform } from '@angular/core';

        @Pipe({ name: 'appFoo', standalone: true })
        export class FooPipe implements PipeTransform {
          transform(v: string) { return v; }
          ngOnChanges() { this.update(); }
        }
      `;

      const violations = detectContextualLifecycleViolations(code);
      expect(violations).toHaveLength(1);
    });

    it('flags ngOnInit in @Pipe', () => {
      const code = `
        import { Pipe, PipeTransform } from '@angular/core';

        @Pipe({ name: 'appFoo', standalone: true })
        export class FooPipe implements PipeTransform {
          transform(v: string) { return v; }
          ngOnInit() { this.init(); }
        }
      `;

      const violations = detectContextualLifecycleViolations(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].methodName).toBe('ngOnInit');
      expect(violations[0].decoratorName).toBe('Pipe');
    });
  });

  describe('edge cases', () => {
    it('uses "unknown" as className for anonymous class with @Pipe violation', () => {
      const code = `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'foo', standalone: true })
        export default class implements PipeTransform {
          transform(v: string) { return v; }
          ngAfterViewInit() { this.init(); }
        }
      `;
      const violations = detectContextualLifecycleViolations(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('unknown');
    });

    it('uses "unknown" as className for anonymous class with @Injectable violation', () => {
      const code = `
        import { Injectable } from '@angular/core';
        @Injectable({ providedIn: 'root' })
        export default class {
          ngAfterViewInit() { this.render(); }
        }
      `;
      const violations = detectContextualLifecycleViolations(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('unknown');
    });
  });

  describe('valid — allowed lifecycle hooks per context', () => {
    it('accepts ngOnDestroy in @Injectable', () => {
      const code = `
        import { Injectable, OnDestroy } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class UserStore implements OnDestroy {
          ngOnDestroy() { this.sub.unsubscribe(); }
        }
      `;

      expect(detectContextualLifecycleViolations(code)).toHaveLength(0);
    });

    it('accepts ngOnDestroy in @Pipe', () => {
      const code = `
        import { Pipe, PipeTransform, OnDestroy } from '@angular/core';

        @Pipe({ name: 'appFoo', standalone: true })
        export class FooPipe implements PipeTransform, OnDestroy {
          transform(v: string) { return v; }
          ngOnDestroy() { this.cleanup(); }
        }
      `;

      expect(detectContextualLifecycleViolations(code)).toHaveLength(0);
    });

    it('accepts ngAfterViewInit in @Component', () => {
      const code = `
        import { Component, AfterViewInit } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent implements AfterViewInit {
          ngAfterViewInit() { this.chart.render(); }
        }
      `;

      expect(detectContextualLifecycleViolations(code)).toHaveLength(0);
    });

    it('accepts ngAfterContentInit in @Component', () => {
      const code = `
        import { Component, AfterContentInit } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent implements AfterContentInit {
          ngAfterContentInit() { this.init(); }
        }
      `;

      expect(detectContextualLifecycleViolations(code)).toHaveLength(0);
    });

    it('accepts ngAfterViewInit in @Directive (directives receive view hooks)', () => {
      const code = `
        import { Directive, AfterViewInit } from '@angular/core';

        @Directive({ selector: '[appFoo]', standalone: true })
        export class FooDirective implements AfterViewInit {
          ngAfterViewInit() { this.init(); }
        }
      `;

      expect(detectContextualLifecycleViolations(code)).toHaveLength(0);
    });

    it('accepts ngAfterViewChecked in @Directive', () => {
      const code = `
        import { Directive, AfterViewChecked } from '@angular/core';

        @Directive({ selector: '[appFoo]', standalone: true })
        export class FooDirective implements AfterViewChecked {
          ngAfterViewChecked() { this.check(); }
        }
      `;

      expect(detectContextualLifecycleViolations(code)).toHaveLength(0);
    });

    it('accepts ngAfterContentInit in @Directive', () => {
      const code = `
        import { Directive, AfterContentInit } from '@angular/core';

        @Directive({ selector: '[appFoo]', standalone: true })
        export class FooDirective implements AfterContentInit {
          ngAfterContentInit() { this.init(); }
        }
      `;

      expect(detectContextualLifecycleViolations(code)).toHaveLength(0);
    });

    it('accepts lifecycle-named methods in undecorated classes', () => {
      const code = `
        export class PlainClass {
          ngOnInit() { this.init(); }
          ngAfterViewInit() { this.render(); }
        }
      `;

      expect(detectContextualLifecycleViolations(code)).toHaveLength(0);
    });
  });
});
