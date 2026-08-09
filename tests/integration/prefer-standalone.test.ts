import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/prefer-standalone [integration]', () => {
  // Since Angular 19, standalone: true is the default and the v20 style guide
  // recommends omitting the property. Only an explicit standalone: false is a
  // violation; omission is idiomatic modern Angular.
  describe('violations', () => {
    it('flags @Component with standalone: false', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-standalone',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: false, template: '' })
        export class AppComponent {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('standalone: false');
    });

    it('flags @Directive with standalone: false', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-standalone',
        `
        import { Directive } from '@angular/core';
        @Directive({ selector: '[appFoo]', standalone: false })
        export class Foo {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags @Pipe with standalone: false', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-standalone',
        `
        import { Pipe, PipeTransform } from '@angular/core';
        @Pipe({ name: 'appFoo', standalone: false })
        export class FooPipe implements PipeTransform {
          transform(v: string) { return v; }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts @Component without standalone property (default since Angular 19)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-standalone',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class AppComponent {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts @Component with explicit standalone: true', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-standalone',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts @Directive with standalone: true', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-standalone',
        `
        import { Directive } from '@angular/core';
        @Directive({ selector: '[appFoo]', standalone: true })
        export class Foo {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
