import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/use-lifecycle-interface [integration]', () => {
  describe('violations', () => {
    it('flags ngOnInit without OnInit interface', async () => {
      const { diagnostics, raw } = await runBiomeCheck('use-lifecycle-interface', `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          ngOnInit() { console.log('init'); }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags ngOnDestroy without OnDestroy interface', async () => {
      const { diagnostics, raw } = await runBiomeCheck('use-lifecycle-interface', `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          ngOnDestroy() { console.log('destroy'); }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts ngOnInit when OnInit is declared', async () => {
      const { diagnostics, raw } = await runBiomeCheck('use-lifecycle-interface', `
        import { Component, OnInit } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent implements OnInit {
          ngOnInit() { console.log('init'); }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts class with no lifecycle methods', async () => {
      const { diagnostics, raw } = await runBiomeCheck('use-lifecycle-interface', `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          title = 'hello';
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
