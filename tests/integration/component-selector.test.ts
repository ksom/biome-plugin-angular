import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/component-selector [integration]', () => {
  describe('violations', () => {
    it('flags PascalCase selector (no prefix)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'component-selector',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'Root', standalone: true, template: '' })
        export class App {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain("kebab-case with the 'app-' prefix");
    });

    it('flags camelCase selector without prefix', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'component-selector',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'appRoot', standalone: true, template: '' })
        export class App {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain("kebab-case with the 'app-' prefix");
    });

    it('flags kebab-case selector without app- prefix', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'component-selector',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'my-root', standalone: true, template: '' })
        export class App {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain("kebab-case with the 'app-' prefix");
    });

    // Actual behavior: the regex only accepts bare `app-` element selectors,
    // so an attribute-selector component (a legitimate Angular pattern, e.g.
    // button components) is flagged. Consistent with an element-only selector
    // policy, but stricter than @angular-eslint's configurable "type" option.
    it('flags attribute-selector component (button[appButton]) — element-only policy', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'component-selector',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'button[appButton]', standalone: true, template: '<ng-content />' })
        export class Button {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain("kebab-case with the 'app-' prefix");
    });

    // Known false positive: each selector in the list is valid kebab-case with
    // the app- prefix, but the regex validates the whole string instead of each
    // comma-separated selector. Should eventually be fixed.
    it.fails('accepts multi-selector list of valid app- selectors (known FP)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'component-selector',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-a, app-b', standalone: true, template: '' })
        export class AB {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });

  describe('valid', () => {
    it('accepts app- prefixed kebab-case selector', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'component-selector',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts multi-segment app- selector', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'component-selector',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-user-profile', standalone: true, template: '' })
        export class UserProfile {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
