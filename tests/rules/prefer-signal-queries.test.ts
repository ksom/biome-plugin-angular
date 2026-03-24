import { describe, expect, it } from 'vitest';
import { detectDecoratorQueries } from '../helpers/pattern-matcher.js';

describe('angular/prefer-signal-queries', () => {
  describe('invalid — decorator-based query usage', () => {
    it('flags @ViewChild', () => {
      const code = `
        import { Component, ViewChild, ElementRef } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
        }
      `;

      const violations = detectDecoratorQueries(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('FooComponent');
      expect(violations[0].propertyName).toBe('canvas');
      expect(violations[0].decoratorName).toBe('ViewChild');
      expect(violations[0].signalEquivalent).toBe('viewChild');
    });

    it('flags @ViewChildren', () => {
      const code = `
        import { Component, ViewChildren, QueryList } from '@angular/core';
        import { ItemComponent } from './item.component';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @ViewChildren(ItemComponent) items!: QueryList<ItemComponent>;
        }
      `;

      const violations = detectDecoratorQueries(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].decoratorName).toBe('ViewChildren');
      expect(violations[0].signalEquivalent).toBe('viewChildren');
    });

    it('flags @ContentChild', () => {
      const code = `
        import { Component, ContentChild, TemplateRef } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @ContentChild(TemplateRef) tpl?: TemplateRef<unknown>;
        }
      `;

      const violations = detectDecoratorQueries(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].decoratorName).toBe('ContentChild');
      expect(violations[0].signalEquivalent).toBe('contentChild');
    });

    it('flags @ContentChildren', () => {
      const code = `
        import { Component, ContentChildren, QueryList } from '@angular/core';
        import { TabComponent } from './tab.component';

        @Component({ selector: 'app-tabs', standalone: true, template: '' })
        export class TabsComponent {
          @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;
        }
      `;

      const violations = detectDecoratorQueries(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].decoratorName).toBe('ContentChildren');
      expect(violations[0].signalEquivalent).toBe('contentChildren');
    });

    it('flags multiple query decorators in one class', () => {
      const code = `
        import { Component, ViewChild, ContentChild, ElementRef, TemplateRef } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @ViewChild('canvas') canvas!: ElementRef;
          @ContentChild(TemplateRef) tpl?: TemplateRef<unknown>;
        }
      `;

      const violations = detectDecoratorQueries(code);
      expect(violations).toHaveLength(2);
    });
  });

  describe('valid — signal-based query functions', () => {
    it('accepts viewChild()', () => {
      const code = `
        import { Component, viewChild, ElementRef } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          canvas = viewChild.required<ElementRef>('canvas');
        }
      `;

      expect(detectDecoratorQueries(code)).toHaveLength(0);
    });

    it('accepts viewChildren()', () => {
      const code = `
        import { Component, viewChildren } from '@angular/core';
        import { ItemComponent } from './item.component';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          items = viewChildren(ItemComponent);
        }
      `;

      expect(detectDecoratorQueries(code)).toHaveLength(0);
    });

    it('accepts contentChild() and contentChildren()', () => {
      const code = `
        import { Component, contentChild, contentChildren, TemplateRef } from '@angular/core';
        import { TabComponent } from './tab.component';

        @Component({ selector: 'app-tabs', standalone: true, template: '' })
        export class TabsComponent {
          headerTpl = contentChild(TemplateRef);
          tabs = contentChildren(TabComponent);
        }
      `;

      expect(detectDecoratorQueries(code)).toHaveLength(0);
    });
  });
});
