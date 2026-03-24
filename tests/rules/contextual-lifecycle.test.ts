import { describe, expect, it } from 'vitest';
import { detectContextualLifecycleViolations } from '../helpers/pattern-matcher.js';

describe('angular/contextual-lifecycle', () => {
  describe('invalid — lifecycle hooks used in wrong contexts', () => {
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

    it('flags ngAfterViewInit in @Directive', () => {
      const code = `
        import { Directive } from '@angular/core';

        @Directive({ selector: '[appFoo]', standalone: true })
        export class FooDirective {
          ngAfterViewInit() {
            // directives don't have view children
          }
        }
      `;

      const violations = detectContextualLifecycleViolations(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].methodName).toBe('ngAfterViewInit');
      expect(violations[0].decoratorName).toBe('Directive');
    });

    it('flags ngAfterViewChecked in @Directive', () => {
      const code = `
        import { Directive } from '@angular/core';

        @Directive({ selector: '[appFoo]', standalone: true })
        export class FooDirective {
          ngAfterViewChecked() { this.check(); }
        }
      `;

      const violations = detectContextualLifecycleViolations(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].methodName).toBe('ngAfterViewChecked');
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
  });

  describe('valid — lifecycle hooks in correct contexts', () => {
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

    it('accepts ngOnInit/ngOnDestroy in @Injectable', () => {
      const code = `
        import { Injectable, OnInit, OnDestroy } from '@angular/core';

        @Injectable({ providedIn: 'root' })
        export class UserStore implements OnInit, OnDestroy {
          ngOnInit() { this.load(); }
          ngOnDestroy() { this.sub.unsubscribe(); }
        }
      `;

      expect(detectContextualLifecycleViolations(code)).toHaveLength(0);
    });
  });
});
