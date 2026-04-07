import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/prefer-standalone [integration]', () => {
  describe('violations', () => {
    it('flags @Component without standalone property', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-standalone', `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class AppComponent {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags @Component with standalone: false', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-standalone', `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: false, template: '' })
        export class AppComponent {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags @Directive without standalone', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-standalone', `
        import { Directive } from '@angular/core';
        @Directive({ selector: '[appFoo]' })
        export class FooDirective {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags @Pipe without standalone', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-standalone', `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'appFoo' })
        export class FooPipe implements PipeTransform {
          transform(v: string) { return v; }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts @Component with standalone: true', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-standalone', `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts @Directive with standalone: true', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-standalone', `
        import { Directive } from '@angular/core';
        @Directive({ selector: '[appFoo]', standalone: true })
        export class Foo {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
