import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/use-lifecycle-interface [integration]', () => {
  // The rule matches each lifecycle METHOD and reads the implements clause of
  // its enclosing class through Biome's native class node (per-class check).
  describe('violations', () => {
    it('flags ngOnInit without OnInit interface', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'use-lifecycle-interface',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          ngOnInit() { console.log('init'); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('implement the OnInit interface');
    });

    it('flags ngOnDestroy without OnDestroy interface', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'use-lifecycle-interface',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          ngOnDestroy() { console.log('destroy'); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('implement the OnDestroy interface');
    });

    it('flags ngOnDestroy when class only implements OnInit (partial implements)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'use-lifecycle-interface',
        `
        import { Component, OnInit } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent implements OnInit {
          ngOnInit() { console.log('init'); }
          ngOnDestroy() { console.log('destroy'); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('implement the OnDestroy interface');
    });

    it('flags hooks with return types and parameterized ngOnChanges', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'use-lifecycle-interface',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          ngOnChanges(changes: SimpleChanges): void { this.react(changes); }
          react(c: unknown) {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('implement the OnChanges interface');
    });
  });

  describe('valid', () => {
    it('accepts ngOnInit when OnInit is declared', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'use-lifecycle-interface',
        `
        import { Component, OnInit } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent implements OnInit {
          ngOnInit() { console.log('init'); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts class implementing both OnInit and OnDestroy', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'use-lifecycle-interface',
        `
        import { Component, OnInit, OnDestroy } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent implements OnInit, OnDestroy {
          ngOnInit() { console.log('init'); }
          ngOnDestroy() { console.log('destroy'); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts class with no lifecycle methods', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'use-lifecycle-interface',
        `
        import { Component } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          title = 'hello';
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('flags ngOnInit when OnInit is imported but not implemented', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'use-lifecycle-interface',
        `
        import { Component, OnInit } from '@angular/core';
        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          ngOnInit() { console.log('init'); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });
});
