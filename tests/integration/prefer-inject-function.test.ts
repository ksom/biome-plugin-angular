import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

// NOTE: The GritQL rule matches constructors with access-modifier parameters
// (private, protected, public, readonly). This is the standard Angular DI pattern.

describe('angular/prefer-inject-function [integration]', () => {
  describe('violations', () => {
    it('flags constructor with private parameter injection', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-inject-function', `
        import { Component } from '@angular/core';
        import { HttpClient } from '@angular/common/http';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          constructor(private http: HttpClient) {}
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags constructor with readonly parameter injection', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-inject-function', `
        import { Component } from '@angular/core';
        import { Router } from '@angular/router';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          constructor(private readonly router: Router) {}
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts inject() function pattern', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-inject-function', `
        import { Component, inject } from '@angular/core';
        import { HttpClient } from '@angular/common/http';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          private http = inject(HttpClient);
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts constructor without injection parameters', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-inject-function', `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          constructor() {}
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
