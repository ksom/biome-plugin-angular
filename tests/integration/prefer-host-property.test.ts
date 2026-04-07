import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/prefer-host-property [integration]', () => {
  describe('violations', () => {
    it('flags @HostBinding decorator', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-host-property', `
        import { Component, HostBinding } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @HostBinding('class.active') isActive = false;
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags @HostListener decorator', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-host-property', `
        import { Component, HostListener } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @HostListener('click') onClick() { console.log('clicked'); }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });

    it('flags both @HostBinding and @HostListener', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-host-property', `
        import { Component, HostBinding, HostListener } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @HostBinding('class.active') isActive = false;
          @HostListener('click') onClick() { console.log('clicked'); }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(2);
    });
  });

  describe('valid', () => {
    it('accepts host: {} metadata in @Component', async () => {
      const { diagnostics, raw } = await runBiomeCheck('prefer-host-property', `
        import { Component } from '@angular/core';
        @Component({
          selector: 'app-root',
          standalone: true,
          template: '',
          host: { '[class.active]': 'isActive', '(click)': 'onClick()' },
        })
        export class App {
          isActive = false;
          onClick() { console.log('clicked'); }
        }
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
