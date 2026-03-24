import { describe, expect, it } from 'vitest';
import { detectMissingLifecycleInterface } from '../helpers/pattern-matcher.js';

describe('angular/use-lifecycle-interface', () => {
  describe('invalid — lifecycle methods without interface declarations', () => {
    it('flags ngOnInit without OnInit', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          ngOnInit() {
            this.load();
          }
        }
      `;

      const violations = detectMissingLifecycleInterface(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('AppComponent');
      expect(violations[0].methodName).toBe('ngOnInit');
      expect(violations[0].missingInterface).toBe('OnInit');
    });

    it('flags ngOnDestroy without OnDestroy', () => {
      const code = `
        import { Directive } from '@angular/core';

        @Directive({ selector: '[appFoo]', standalone: true })
        export class FooDirective {
          ngOnDestroy() {
            this.sub.unsubscribe();
          }
        }
      `;

      const violations = detectMissingLifecycleInterface(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].missingInterface).toBe('OnDestroy');
    });

    it('flags ngOnChanges without OnChanges', () => {
      const code = `
        import { Component, SimpleChanges } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          ngOnChanges(changes: SimpleChanges) {
            console.log(changes);
          }
        }
      `;

      const violations = detectMissingLifecycleInterface(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].missingInterface).toBe('OnChanges');
    });

    it('flags multiple missing interfaces in the same class', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          ngOnInit() { this.load(); }
          ngOnDestroy() { this.sub.unsubscribe(); }
        }
      `;

      const violations = detectMissingLifecycleInterface(code);
      expect(violations).toHaveLength(2);
      const interfaces = violations.map((v) => v.missingInterface);
      expect(interfaces).toContain('OnInit');
      expect(interfaces).toContain('OnDestroy');
    });

    it('flags class that implements something else but not the lifecycle interface', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent implements SomeInterface {
          ngOnInit() { this.load(); }
        }
      `;

      const violations = detectMissingLifecycleInterface(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].missingInterface).toBe('OnInit');
    });

    it('flags ngAfterViewInit without AfterViewInit', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          ngAfterViewInit() {
            this.chart.render();
          }
        }
      `;

      const violations = detectMissingLifecycleInterface(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].missingInterface).toBe('AfterViewInit');
    });
  });

  describe('valid — lifecycle methods with correct interface declarations', () => {
    it('accepts ngOnInit with OnInit', () => {
      const code = `
        import { Component, OnInit } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent implements OnInit {
          ngOnInit() {
            this.load();
          }
        }
      `;

      expect(detectMissingLifecycleInterface(code)).toHaveLength(0);
    });

    it('accepts multiple lifecycle methods all declared', () => {
      const code = `
        import { Component, OnInit, OnDestroy } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent implements OnInit, OnDestroy {
          ngOnInit() { this.load(); }
          ngOnDestroy() { this.sub.unsubscribe(); }
        }
      `;

      expect(detectMissingLifecycleInterface(code)).toHaveLength(0);
    });

    it('accepts OnChanges with OnChanges', () => {
      const code = `
        import { Component, OnChanges, SimpleChanges } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent implements OnChanges {
          ngOnChanges(changes: SimpleChanges) {
            console.log(changes);
          }
        }
      `;

      expect(detectMissingLifecycleInterface(code)).toHaveLength(0);
    });

    it('ignores classes with no lifecycle methods', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          myCustomMethod() { return 42; }
        }
      `;

      expect(detectMissingLifecycleInterface(code)).toHaveLength(0);
    });
  });
});
