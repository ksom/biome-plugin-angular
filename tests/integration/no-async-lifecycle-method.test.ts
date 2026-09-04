import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/no-async-lifecycle-method [integration]', () => {
  describe('violations', () => {
    it('flags async ngOnInit', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-async-lifecycle-method',
        `
        import { Component, OnInit } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class App implements OnInit {
          async ngOnInit() { await this.load(); }
          load() { return Promise.resolve(); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('must not be async');
    });

    it('flags async hooks with return types, parameters and modifiers', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-async-lifecycle-method',
        `
        import { Component, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class App implements OnChanges, OnDestroy {
          async ngOnChanges(changes: SimpleChanges): Promise<void> { await this.react(changes); }
          protected async ngOnDestroy(): Promise<void> { await this.flush(); }
          react(c: unknown) { return Promise.resolve(); }
          flush() { return Promise.resolve(); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(2);
    });
  });

  describe('valid', () => {
    it('accepts a synchronous hook that starts async work', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-async-lifecycle-method',
        `
        import { Component, OnInit } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class App implements OnInit {
          ngOnInit(): void { void this.load(); }
          async load() { await Promise.resolve(); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('ignores async methods that are not lifecycle hooks', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-async-lifecycle-method',
        `
        export class Loader {
          async ngLikeButNotAHook() { await Promise.resolve(); }
          async refresh(): Promise<void> { await Promise.resolve(); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
