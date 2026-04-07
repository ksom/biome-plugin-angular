import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/contextual-lifecycle [integration]', () => {
  // Biome GritQL cannot match @Decorator\nclass patterns (decorator + class as one unit).
  // This rule requires knowing the decorator type to determine context, which is not possible.
  describe('violations', () => {
    it.skip('flags ngAfterViewInit in @Injectable', async () => {
      const { diagnostics, raw } = await runBiomeCheck('contextual-lifecycle', `
        import { Injectable } from '@angular/core';
        @Injectable({ providedIn: 'root' })
        export class UserStore {
          ngAfterViewInit() { console.log('view init'); }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it.skip('flags ngAfterViewInit in @Directive', async () => {
      const { diagnostics, raw } = await runBiomeCheck('contextual-lifecycle', `
        import { Directive } from '@angular/core';
        @Directive({ selector: '[appFoo]', standalone: true })
        export class Foo {
          ngAfterViewInit() { console.log('view init'); }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it.skip('flags ngAfterViewInit in @Pipe', async () => {
      const { diagnostics, raw } = await runBiomeCheck('contextual-lifecycle', `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'appFoo', standalone: true })
        export class FooPipe implements PipeTransform {
          transform(v: string) { return v; }
          ngAfterViewInit() { console.log('view init'); }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts ngAfterViewInit in @Component', async () => {
      const { diagnostics, raw } = await runBiomeCheck('contextual-lifecycle', `
        import { Component, AfterViewInit } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App implements AfterViewInit {
          ngAfterViewInit() { console.log('view init'); }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts ngOnInit in @Injectable', async () => {
      const { diagnostics, raw } = await runBiomeCheck('contextual-lifecycle', `
        import { Injectable, OnInit } from '@angular/core';
        @Injectable({ providedIn: 'root' })
        export class UserStore implements OnInit {
          ngOnInit() { console.log('init'); }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
