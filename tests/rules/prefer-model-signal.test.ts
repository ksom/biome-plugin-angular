import { describe, expect, it } from 'vitest';
import { detectTwoWayBindingPairs } from '../helpers/pattern-matcher.js';

describe('angular/prefer-model-signal', () => {
  describe('invalid — @Input() + @Output() xyzChange two-way binding pattern', () => {
    it('flags value + valueChange pair', () => {
      const code = `
        import { Component, Input, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-counter', standalone: true, template: '' })
        export class CounterComponent {
          @Input() value = 0;
          @Output() valueChange = new EventEmitter<number>();
        }
      `;

      const violations = detectTwoWayBindingPairs(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('CounterComponent');
      expect(violations[0].inputProperty).toBe('value');
      expect(violations[0].outputProperty).toBe('valueChange');
    });

    it('flags checked + checkedChange pair', () => {
      const code = `
        import { Component, Input, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-toggle', standalone: true, template: '' })
        export class ToggleComponent {
          @Input() checked = false;
          @Output() checkedChange = new EventEmitter<boolean>();
        }
      `;

      const violations = detectTwoWayBindingPairs(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].inputProperty).toBe('checked');
      expect(violations[0].outputProperty).toBe('checkedChange');
    });

    it('flags multiple two-way binding pairs', () => {
      const code = `
        import { Component, Input, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @Input() value = '';
          @Output() valueChange = new EventEmitter<string>();
          @Input() selected = false;
          @Output() selectedChange = new EventEmitter<boolean>();
        }
      `;

      const violations = detectTwoWayBindingPairs(code);
      expect(violations).toHaveLength(2);
    });
  });

  describe('valid — model() signal or non-paired outputs', () => {
    it('accepts model() signal', () => {
      const code = `
        import { Component, model } from '@angular/core';

        @Component({ selector: 'app-counter', standalone: true, template: '' })
        export class CounterComponent {
          value = model(0);
        }
      `;

      expect(detectTwoWayBindingPairs(code)).toHaveLength(0);
    });

    it('accepts @Output() that does not end in Change', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @Output() clicked = new EventEmitter<void>();
          @Output() closed = new EventEmitter<void>();
        }
      `;

      expect(detectTwoWayBindingPairs(code)).toHaveLength(0);
    });

    it('does not flag @Output() xyzChange when @Input() xyz is absent', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @Output() valueChange = new EventEmitter<string>();
        }
      `;

      expect(detectTwoWayBindingPairs(code)).toHaveLength(0);
    });
  });
});
