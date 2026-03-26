import { describe, expect, it } from 'vitest';
import { detectOutputOnPrefix } from '../helpers/pattern-matcher.js';

describe('angular/no-output-on-prefix', () => {
  describe('invalid', () => {
    it('flags @Output() onSubmit', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Output() onSubmit = new EventEmitter<void>();
        }
      `;

      const violations = detectOutputOnPrefix(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].propertyName).toBe('onSubmit');
      expect(violations[0].className).toBe('AppComponent');
    });

    it('flags @Output() onChange', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Output() onChange = new EventEmitter<string>();
        }
      `;

      const violations = detectOutputOnPrefix(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].propertyName).toBe('onChange');
    });

    it('flags multiple "on" prefixed outputs', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-form', standalone: true, template: '' })
        export class FormComponent {
          @Output() onSubmit = new EventEmitter<void>();
          @Output() onReset = new EventEmitter<void>();
          @Output() onCancel = new EventEmitter<void>();
        }
      `;

      const violations = detectOutputOnPrefix(code);
      expect(violations).toHaveLength(3);
      expect(violations.map((v) => v.propertyName)).toEqual(['onSubmit', 'onReset', 'onCancel']);
    });

    it('flags across multiple components', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-a', standalone: true, template: '' })
        export class AComponent {
          @Output() onClick = new EventEmitter<void>();
        }

        @Component({ selector: 'app-b', standalone: true, template: '' })
        export class BComponent {
          @Output() onFocus = new EventEmitter<void>();
        }
      `;

      const violations = detectOutputOnPrefix(code);
      expect(violations).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('uses "unknown" as className for anonymous class', () => {
      const code = `
        import { Output, EventEmitter } from '@angular/core';
        export default class {
          @Output() onSubmit = new EventEmitter<void>();
        }
      `;
      const violations = detectOutputOnPrefix(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('unknown');
    });
  });

  describe('valid', () => {
    it('accepts output without "on" prefix', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Output() submitted = new EventEmitter<void>();
        }
      `;

      expect(detectOutputOnPrefix(code)).toHaveLength(0);
    });

    it('accepts common event names without "on" prefix', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-form', standalone: true, template: '' })
        export class FormComponent {
          @Output() submitted = new EventEmitter<void>();
          @Output() cancelled = new EventEmitter<void>();
          @Output() changed = new EventEmitter<string>();
          @Output() clicked = new EventEmitter<MouseEvent>();
        }
      `;

      expect(detectOutputOnPrefix(code)).toHaveLength(0);
    });

    it('does NOT flag "on" not followed by uppercase (e.g. "onion")', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Output() onion = new EventEmitter<void>();
        }
      `;

      // "onion" does not match ^on[A-Z] — not flagged
      expect(detectOutputOnPrefix(code)).toHaveLength(0);
    });

    it('ignores non-Output class properties', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          onSubmit() { /* this is a method, not an @Output */ }
          onChangeProp = 'value';
        }
      `;

      expect(detectOutputOnPrefix(code)).toHaveLength(0);
    });

    it('ignores @Input properties even with "on" name', () => {
      const code = `
        import { Component, Input } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Input() onSubmit: (() => void) | undefined;
        }
      `;

      expect(detectOutputOnPrefix(code)).toHaveLength(0);
    });
  });
});
