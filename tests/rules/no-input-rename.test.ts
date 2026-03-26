import { describe, expect, it } from 'vitest';
import { detectInputRename } from '../helpers/pattern-matcher.js';

describe('angular/no-input-rename', () => {
  describe('invalid', () => {
    it('flags @Input with a string alias', () => {
      const code = `
        import { Component, Input } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Input('myAlias') value: string = '';
        }
      `;

      const violations = detectInputRename(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].propertyName).toBe('value');
      expect(violations[0].alias).toBe('myAlias');
    });

    it('flags @Input with alias in options object', () => {
      const code = `
        import { Component, Input } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Input({ alias: 'externalName' }) internalProp: string = '';
        }
      `;

      const violations = detectInputRename(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].propertyName).toBe('internalProp');
      expect(violations[0].alias).toBe('externalName');
    });

    it('flags multiple renamed @Input in same class', () => {
      const code = `
        import { Component, Input } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Input('aliasA') propA: string = '';
          @Input('aliasB') propB: number = 0;
        }
      `;

      const violations = detectInputRename(code);
      expect(violations).toHaveLength(2);
      expect(violations.map((v) => v.propertyName)).toEqual(['propA', 'propB']);
    });

    it('flags @Input with alias across multiple components', () => {
      const code = `
        import { Component, Input } from '@angular/core';

        @Component({ selector: 'app-foo', standalone: true, template: '' })
        export class FooComponent {
          @Input('bar') baz: string = '';
        }

        @Component({ selector: 'app-qux', standalone: true, template: '' })
        export class QuxComponent {
          @Input('renamed') original: boolean = false;
        }
      `;

      const violations = detectInputRename(code);
      expect(violations).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('uses "unknown" as className for anonymous class with string alias', () => {
      const code = `
        import { Input } from '@angular/core';
        export default class {
          @Input('myAlias') value: string = '';
        }
      `;
      const violations = detectInputRename(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('unknown');
    });

    it('uses "unknown" as className for anonymous class with object alias', () => {
      const code = `
        import { Input } from '@angular/core';
        export default class {
          @Input({ alias: 'externalName' }) value: string = '';
        }
      `;
      const violations = detectInputRename(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].className).toBe('unknown');
    });

    it('handles non-string alias value in object (alias defaults to empty string)', () => {
      const code = `
        import { Input } from '@angular/core';

        export class AppComponent {
          @Input({ alias: myVar }) value: string = '';
        }
      `;
      const violations = detectInputRename(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].alias).toBe('');
    });
  });

  describe('valid', () => {
    it('accepts @Input() without arguments', () => {
      const code = `
        import { Component, Input } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Input() value: string = '';
        }
      `;

      expect(detectInputRename(code)).toHaveLength(0);
    });

    it('accepts @Input with required: true (no alias)', () => {
      const code = `
        import { Component, Input } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Input({ required: true }) label: string = '';
        }
      `;

      expect(detectInputRename(code)).toHaveLength(0);
    });

    it('accepts @Input with transform option (no alias)', () => {
      const code = `
        import { Component, Input, booleanAttribute } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Input({ transform: booleanAttribute }) disabled: boolean = false;
        }
      `;

      expect(detectInputRename(code)).toHaveLength(0);
    });

    it('accepts signal-based input() without alias', () => {
      const code = `
        import { Component, input } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          value = input<string>('');
        }
      `;

      expect(detectInputRename(code)).toHaveLength(0);
    });

    it('ignores @Output decorators', () => {
      const code = `
        import { Component, Output, EventEmitter } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {
          @Output('clickAlias') clicked = new EventEmitter<void>();
        }
      `;

      // @Output rename is a separate rule — should not be flagged here
      expect(detectInputRename(code)).toHaveLength(0);
    });
  });
});
