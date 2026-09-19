import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/no-lifecycle-call [integration]', () => {
  describe('violations', () => {
    it('flags this.ngOnInit() called from another method', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-lifecycle-call',
        `
        import { Component, OnInit } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class App implements OnInit {
          ngOnInit() { this.load(); }
          reload() { this.ngOnInit(); }
          load() {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('lifecycle hooks explicitly');
    });

    it('flags a hook called on another instance (e.g. in a test)', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-lifecycle-call',
        `
        it('destroys', () => {
          const fixture = TestBed.createComponent(App);
          fixture.componentInstance.ngOnDestroy();
          fixture.componentInstance.ngOnChanges({});
        });
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(2);
    });
  });

  describe('valid', () => {
    it('accepts super.ngOnInit() in a derived hook', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-lifecycle-call',
        `
        import { Component, OnInit } from '@angular/core';
        import { Base } from './base';
        @Component({ selector: 'app-root', template: '' })
        export class App extends Base implements OnInit {
          override ngOnInit() {
            super.ngOnInit();
            this.load();
          }
          load() {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });

    it('accepts hook declarations and unrelated method calls', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-lifecycle-call',
        `
        import { Component, OnInit } from '@angular/core';
        @Component({ selector: 'app-root', template: '' })
        export class App implements OnInit {
          ngOnInit() { this.init(); }
          init() { this.service.ngOnInitLike(); }
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
