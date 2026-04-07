import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/no-component-suffix [integration]', () => {
  describe('violations', () => {
    it('flags class named AppComponent', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-component-suffix', `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags class named UserListComponent', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-component-suffix', `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-user-list', standalone: true, template: '' })
        export class UserListComponent {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts class named App (no suffix)', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-component-suffix', `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts class named UserList', async () => {
      const { diagnostics, raw } = await runBiomeCheck('no-component-suffix', `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-user-list', standalone: true, template: '' })
        export class UserList {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
