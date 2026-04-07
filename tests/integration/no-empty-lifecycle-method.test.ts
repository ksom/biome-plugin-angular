import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/no-empty-lifecycle-method [integration]', () => {
  describe('violations', () => {
    it('flags empty ngOnInit', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-empty-lifecycle-method', `
        import { Component, OnInit } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent implements OnInit {
          ngOnInit() {}
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags empty ngOnDestroy', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-empty-lifecycle-method', `
        import { Component, OnDestroy } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent implements OnDestroy {
          ngOnDestroy() {}
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags multiple empty lifecycle methods', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-empty-lifecycle-method', `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          ngOnInit() {}
          ngOnDestroy() {}
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(2);
    });
  });

  describe('valid', () => {
    it('accepts ngOnInit with a statement', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-empty-lifecycle-method', `
        import { Component, OnInit } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent implements OnInit {
          ngOnInit() { console.log('init'); }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
