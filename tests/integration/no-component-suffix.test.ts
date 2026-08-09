import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/no-component-suffix [integration]', () => {
  describe('violations', () => {
    it('flags class named AppComponent', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-component-suffix',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags class named UserListComponent', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-component-suffix',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-user-list', standalone: true, template: '' })
        export class UserListComponent {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags a suffixed component that extends a base class', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-component-suffix',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-admin', standalone: true, template: '' })
        export class AdminComponent extends BaseView {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Component');
    });
  });

  describe('valid', () => {
    it('accepts an undecorated class ending in Component (not Angular)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-component-suffix',
        `
        export class WidgetComponent {
          render() {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts class named App (no suffix)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-component-suffix',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts class named UserList', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-component-suffix',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-user-list', standalone: true, template: '' })
        export class UserList {}
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
