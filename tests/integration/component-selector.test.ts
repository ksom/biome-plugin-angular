import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/component-selector [integration]', () => {
  describe('violations', () => {
    it('flags PascalCase selector (no prefix)', async () => {
      const { diagnostics, raw } = await runBiomeCheck('component-selector', `
        import { Component } from '@angular/core';
        @Component({ selector: 'Root', standalone: true, template: '' })
        export class App {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags camelCase selector without prefix', async () => {
      const { diagnostics, raw } = await runBiomeCheck('component-selector', `
        import { Component } from '@angular/core';
        @Component({ selector: 'appRoot', standalone: true, template: '' })
        export class App {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags kebab-case selector without app- prefix', async () => {
      const { diagnostics, raw } = await runBiomeCheck('component-selector', `
        import { Component } from '@angular/core';
        @Component({ selector: 'my-root', standalone: true, template: '' })
        export class App {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts app- prefixed kebab-case selector', async () => {
      const { diagnostics, raw } = await runBiomeCheck('component-selector', `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts multi-segment app- selector', async () => {
      const { diagnostics, raw } = await runBiomeCheck('component-selector', `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-user-profile', standalone: true, template: '' })
        export class UserProfile {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
