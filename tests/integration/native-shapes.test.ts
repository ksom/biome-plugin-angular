import { describe, expect, it } from 'vitest';
import { runBiomeCheck, runBiomeFix } from '../helpers/biome-runner.js';

/**
 * Shapes that the original snippet-based rules could not match and that the
 * native-AST-node rewrite covers: `implements` clauses, `export default`,
 * generics, `readonly` members, modifiers, and constructor parameters without
 * access modifiers. Each case is the real-world form produced by the Angular
 * CLI or found in typical codebases.
 */
describe('native AST node coverage [integration]', () => {
  describe('classes with implements clauses', () => {
    it('no-component-suffix flags a CLI-style component (implements OnInit)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-component-suffix',
        `
        import { Component, OnInit } from '@angular/core';
        @Component({ selector: 'app-user', templateUrl: './user.component.html' })
        export class UserComponent implements OnInit {
          ngOnInit(): void { this.load(); }
          load() {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('no-service-suffix flags a service with implements + extends + generics', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-service-suffix',
        `
        import { Injectable, OnDestroy } from '@angular/core';
        @Injectable({ providedIn: 'root' })
        export class UserService<T> extends BaseStore<T> implements OnDestroy {
          ngOnDestroy() { this.teardown(); }
          teardown() {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('no-directive-suffix flags an export default directive', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-directive-suffix',
        `
        import { Directive, OnInit } from '@angular/core';
        @Directive({ selector: '[appHighlight]' })
        export default class HighlightDirective implements OnInit {
          ngOnInit() { this.paint(); }
          paint() {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('prefer-inject-function flags constructor DI in a class with implements', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-inject-function',
        `
        import { Component, OnInit } from '@angular/core';
        import { HttpClient } from '@angular/common/http';
        @Component({ selector: 'app-user', template: '' })
        export class User implements OnInit {
          constructor(private readonly http: HttpClient) {}
          ngOnInit() { this.http.get('/'); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('prefer-inject-function flags a parameter without access modifier', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-inject-function',
        `
        import { Injectable } from '@angular/core';
        import { HttpClient } from '@angular/common/http';
        @Injectable({ providedIn: 'root' })
        export class Api {
          private http: HttpClient;
          constructor(http: HttpClient) { this.http = http; }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('prefer-inject-function flags parameter-decorated DI (@Inject, @Optional)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-inject-function',
        `
        import { Component, Inject, Optional } from '@angular/core';
        import { DOCUMENT } from '@angular/common';
        @Component({ selector: 'app-user', template: '' })
        export class User {
          constructor(@Inject(DOCUMENT) private doc: Document, @Optional() private logger?: Logger) {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('readonly members', () => {
    it('no-output-on-prefix flags @Output() readonly onSubmit', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-output-on-prefix',
        `
        import { Component, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-form', template: '' })
        export class Form {
          @Output() readonly onSubmit = new EventEmitter<void>();
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('no-output-on-prefix flags signal outputs (output, outputFromObservable)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-output-on-prefix',
        `
        import { Component, output } from '@angular/core';
        import { outputFromObservable } from '@angular/core/rxjs-interop';
        @Component({ selector: 'app-form', template: '' })
        export class Form {
          readonly onSave = output<void>();
          readonly onLoad = outputFromObservable(this.load$);
          readonly saved = output<void>();
          private readonly load$ = new Subject<void>();
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(2);
    });

    it('prefer-model-signal flags a readonly @Input()/@Output() pair', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-model-signal',
        `
        import { Component, Input, Output, EventEmitter } from '@angular/core';
        @Component({ selector: 'app-counter', template: '' })
        export class Counter {
          @Input() readonly value = 0;
          @Output() readonly valueChange = new EventEmitter<number>();
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('signal input/output aliases', () => {
    it('no-input-rename flags aliased input(), input.required() and model()', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-input-rename',
        `
        import { Component, input, model } from '@angular/core';
        @Component({ selector: 'app-user', template: '' })
        export class User {
          readonly name = input('', { alias: 'userName' });
          readonly age = input.required<number>({ alias: 'userAge' });
          readonly value = model<string>('', { alias: 'val' });
          readonly plain = input('');
          readonly required = input.required<number>();
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(3);
      expect(diagnostics[0].message).toContain('signal inputs');
    });

    it('no-output-rename flags aliased output() and outputFromObservable()', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-output-rename',
        `
        import { Component, output } from '@angular/core';
        import { outputFromObservable } from '@angular/core/rxjs-interop';
        @Component({ selector: 'app-user', template: '' })
        export class User {
          readonly saved = output<void>({ alias: 'onSaved' });
          readonly loaded = outputFromObservable(this.load$, { alias: 'ld' });
          readonly plain = output<void>();
          private readonly load$ = new Subject<void>();
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(2);
      expect(diagnostics[0].message).toContain('signal outputs');
    });
  });

  describe('lifecycle methods with modifiers', () => {
    it('no-empty-lifecycle-method flags protected override / async / comment-only bodies', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-empty-lifecycle-method',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class App extends Base {
          protected override ngAfterViewInit(): void {}
          async ngOnDestroy() {}
          ngOnInit() {
            // TODO
          }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(3);
    });

    it('no-empty-lifecycle-method safe fix removes the hook when its interface is not implemented', async () => {
      const fixed = await runBiomeFix(
        'no-empty-lifecycle-method',
        [
          "import { Component, OnDestroy } from '@angular/core';",
          "@Component({ selector: 'app-root', template: '' })",
          'export class App implements OnDestroy {',
          '  ngOnInit(): void {}',
          '  ngOnDestroy(): void { this.sub.unsubscribe(); }',
          '}',
          '',
        ].join('\n'),
      );
      expect(fixed).not.toContain('ngOnInit');
      expect(fixed).toContain('ngOnDestroy(): void { this.sub.unsubscribe(); }');
    });

    it('no-empty-lifecycle-method offers no fix when the interface is implemented (TS2420 otherwise)', async () => {
      const source = [
        "import { Component, OnInit } from '@angular/core';",
        "@Component({ selector: 'app-root', template: '' })",
        'export class App implements OnInit {',
        '  ngOnInit(): void {}',
        '}',
        '',
      ].join('\n');
      const { diagnostics } = await runBiomeCheck('no-empty-lifecycle-method', source);
      expect(diagnostics).toHaveLength(1);
      expect(diagnostics[0].message).toContain('together with OnInit in the implements clause');
      const fixed = await runBiomeFix('no-empty-lifecycle-method', source);
      expect(fixed).toBe(source);
    });

    it('use-lifecycle-interface flags a protected override hook missing its interface', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'use-lifecycle-interface',
        `
        import { Component, OnInit } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class App extends Base implements OnInit {
          override ngOnInit() { super.ngOnInit(); }
          protected override ngAfterViewInit(): void { this.x(); }
          x() {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('AfterViewInit');
    });

    it('contextual-lifecycle flags a hook in an @Injectable with implements and modifiers', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'contextual-lifecycle',
        `
        import { Injectable, OnInit, OnDestroy } from '@angular/core';
        @Injectable({ providedIn: 'root' })
        export class Store implements OnInit, OnDestroy {
          async ngOnInit(): Promise<void> { await this.load(); }
          ngOnDestroy() { this.stop(); }
          load() { return Promise.resolve(); }
          stop() {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });
});
