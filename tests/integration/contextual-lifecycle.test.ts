import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/contextual-lifecycle [integration]', () => {
  // Semantics follow @angular-eslint/contextual-lifecycle: @Injectable and @Pipe
  // only support ngOnDestroy. @Component and @Directive support all hooks
  // (directives DO receive view/content hooks), so they are never flagged.
  describe('violations', () => {
    it('flags ngAfterViewInit in @Injectable', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'contextual-lifecycle',
        `
        import { Injectable } from '@angular/core';
        @Injectable({ providedIn: 'root' })
        export class UserStore {
          ngAfterViewInit() { console.log('view init'); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('wrong context');
    });

    it('flags ngOnInit in @Injectable (services only support ngOnDestroy)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'contextual-lifecycle',
        `
        import { Injectable } from '@angular/core';
        @Injectable({ providedIn: 'root' })
        export class UserStore {
          ngOnInit() { console.log('init'); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('wrong context');
    });

    it('flags ngAfterViewInit in @Pipe', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'contextual-lifecycle',
        `
        import { Pipe } from '@angular/core';
        @Pipe({ name: 'appFoo', standalone: true })
        export class FooPipe {
          transform(v: string) { return v; }
          ngAfterViewInit() { console.log('view init'); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('wrong context');
    });

    it('flags hooks with return types and modifiers (ngOnChanges(changes): void)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'contextual-lifecycle',
        `
        import { Injectable } from '@angular/core';
        @Injectable()
        export class WatchService {
          ngOnChanges(changes: SimpleChanges): void { this.react(changes); }
          react(c: unknown) {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    // GritQL metavariables cannot bind an `implements` clause, so decorated
    // classes WITH `implements` are invisible to the rule. Documented false
    // negative — flips to failing the day Biome supports it.
    it.fails('flags ngOnInit in @Injectable that has an implements clause (known FN)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'contextual-lifecycle',
        `
        import { Injectable, OnInit } from '@angular/core';
        @Injectable({ providedIn: 'root' })
        export class UserStore implements OnInit {
          ngOnInit() { console.log('init'); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts ngAfterViewInit in @Component', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'contextual-lifecycle',
        `
        import { Component, AfterViewInit } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App implements AfterViewInit {
          ngAfterViewInit() { console.log('view init'); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts ngAfterViewInit in @Directive (directives receive view hooks)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'contextual-lifecycle',
        `
        import { Directive } from '@angular/core';
        @Directive({ selector: '[appFocus]' })
        export class Focus {
          ngAfterViewInit() { this.focus(); }
          focus() {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts ngOnDestroy in @Injectable', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'contextual-lifecycle',
        `
        import { Injectable } from '@angular/core';
        @Injectable({ providedIn: 'root' })
        export class CleanupService {
          ngOnDestroy() { this.teardown(); }
          teardown() {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts ngOnDestroy in @Pipe', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'contextual-lifecycle',
        `
        import { Pipe } from '@angular/core';
        @Pipe({ name: 'appAsyncish', standalone: true })
        export class Asyncish {
          transform(v: string) { return v; }
          ngOnDestroy() { this.cleanup(); }
          cleanup() {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
