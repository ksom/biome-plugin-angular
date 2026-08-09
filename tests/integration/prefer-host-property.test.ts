import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/prefer-host-property [integration]', () => {
  describe('violations', () => {
    it('flags @HostBinding decorator', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-host-property',
        `
        import { Component, HostBinding } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @HostBinding('class.active') isActive = false;
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Prefer host: {}');
    });

    it('flags @HostListener decorator', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-host-property',
        `
        import { Component, HostListener } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @HostListener('click') onClick() { console.log('clicked'); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Prefer host: {}');
    });

    it('flags both @HostBinding and @HostListener', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-host-property',
        `
        import { Component, HostBinding, HostListener } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @HostBinding('class.active') isActive = false;
          @HostListener('click') onClick() { console.log('clicked'); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(2);
    });

    // Verified: $args binds the full argument list, so the two-argument
    // window-scoped form is caught too.
    it('flags @HostListener with event name and args array (window:resize)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-host-property',
        `
        import { Component, HostListener } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @HostListener('window:resize', ['$event'])
          onResize(event: UIEvent) { console.log(event); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Prefer host: {}');
    });

    // Verified: the decorator pattern matches regardless of its target, so a
    // @HostBinding placed on a getter is caught as well (no false negative).
    it('flags @HostBinding on a getter', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-host-property',
        `
        import { Component, HostBinding } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class App {
          @HostBinding('class.active')
          get active() { return true; }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('Prefer host: {}');
    });
  });

  describe('valid', () => {
    it('accepts host: {} metadata in @Component', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'prefer-host-property',
        `
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
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
