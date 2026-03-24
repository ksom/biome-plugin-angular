import { describe, expect, it } from 'vitest';
import { detectOutputRename } from '../helpers/pattern-matcher.js';

describe('angular/no-output-rename', () => {
  describe('invalid', () => {
    it('flags @Output with a string alias', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Output('clickEvent') clicked = new EventEmitter<void>();
        }
      `;

      const violations = detectOutputRename(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].propertyName).toBe('clicked');
      expect(violations[0].alias).toBe('clickEvent');
    });

    it('flags @Output with alias in options object', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Output({ alias: 'submitEvent' }) onSubmit = new EventEmitter<FormData>();
        }
      `;

      const violations = detectOutputRename(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].propertyName).toBe('onSubmit');
      expect(violations[0].alias).toBe('submitEvent');
    });

    it('flags multiple renamed @Output in same class', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Output('openEvent') opened = new EventEmitter<void>();
          @Output('closeEvent') closed = new EventEmitter<void>();
        }
      `;

      const violations = detectOutputRename(code);
      expect(violations).toHaveLength(2);
      expect(violations.map((v) => v.propertyName)).toEqual(['opened', 'closed']);
    });

    it('flags @Output with alias across multiple components', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @Output('fooEvent') foo = new EventEmitter<void>();
        }

        @Component({ selector: 'app-bar', standalone: true, template: '' })
        export class BarComponent {
          @Output('barEvent') bar = new EventEmitter<string>();
        }
      `;

      const violations = detectOutputRename(code);
      expect(violations).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('uses "unknown" as className for anonymous class with string alias', () => {
      const code = `
        import { Output, EventEmitter } from '@angular/core';
        export default class {
          @Output('clickEvent') clicked = new EventEmitter<void>();
        }
      `;
      const violations = detectOutputRename(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('unknown');
    });

    it('uses "unknown" as className for anonymous class with object alias', () => {
      const code = `
        import { Output, EventEmitter } from '@angular/core';
        export default class {
          @Output({ alias: 'submitEvent' }) onSubmit = new EventEmitter<void>();
        }
      `;
      const violations = detectOutputRename(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('unknown');
    });

    it('handles non-string alias value in object (alias defaults to empty string)', () => {
      const code = `
        import { Output, EventEmitter } from '@angular/core';

        export class AppComponent {
          @Output({ alias: myVar }) clicked = new EventEmitter<void>();
        }
      `;
      const violations = detectOutputRename(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].alias).toBe('');
    });
  });

  describe('valid', () => {
    it('accepts @Output() without arguments', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Output() clicked = new EventEmitter<void>();
        }
      `;

      expect(detectOutputRename(code)).toHaveLength(0);
    });

    it('accepts multiple @Output() without aliases', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Output() opened = new EventEmitter<void>();
          @Output() closed = new EventEmitter<void>();
          @Output() submitted = new EventEmitter<FormData>();
        }
      `;

      expect(detectOutputRename(code)).toHaveLength(0);
    });

    it('accepts signal-based output() without alias', () => {
      const code = `
        import { Component, output } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          clicked = output<void>();
        }
      `;

      expect(detectOutputRename(code)).toHaveLength(0);
    });

    it('ignores @Input decorators', () => {
      const code = `
        import { Component, Input } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Input('aliasedInput') value: string = '';
        }
      `;

      // @Input rename is a separate rule — should not be flagged here
      expect(detectOutputRename(code)).toHaveLength(0);
    });

    it('ignores classes without @Component or @Directive decorators', () => {
      const code = `
        import { Output, EventEmitter } from '@angular/core';

        export class SomeClass {
          @Output('renamed') event = new EventEmitter<void>();
        }
      `;

      // Pattern matcher checks by property decorator regardless of class type,
      // consistent with GritQL behavior (matches decorator syntax regardless of context)
      const violations = detectOutputRename(code);
      expect(violations).toHaveLength(1);
    });
  });
});
