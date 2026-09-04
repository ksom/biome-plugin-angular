import { describe, expect, it } from 'vitest';
import { detectAttributeDecorators } from '../helpers/pattern-matcher.js';

describe('angular/no-attribute-decorator', () => {
  describe('invalid', () => {
    it('flags @Attribute() on a constructor parameter', () => {
      const v = detectAttributeDecorators(`
        import { Attribute, Directive } from '@angular/core';
        @Directive({ selector: '[appRole]' })
        export class Role { constructor(@Attribute('role') private role: string) {} }
      `);
      expect(v).toHaveLength(1);
      expect(v[0].parameterName).toBe('role');
    });
    it('flags each decorated parameter', () => {
      expect(
        detectAttributeDecorators(
          "class A { constructor(@Attribute('a') a: string, @Attribute('b') b: string) {} }",
        ),
      ).toHaveLength(2);
    });
    it('flags @Attribute() mixed with other parameter decorators', () => {
      expect(
        detectAttributeDecorators(
          "class A { constructor(@Optional() @Attribute('a') a: string, @Inject(X) x: X) {} }",
        ),
      ).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts inject(new HostAttributeToken())', () => {
      expect(
        detectAttributeDecorators("class A { role = inject(new HostAttributeToken('role')); }"),
      ).toHaveLength(0);
    });
    it('accepts other parameter decorators', () => {
      expect(detectAttributeDecorators('class A { constructor(@Inject(X) x: X) {} }')).toHaveLength(
        0,
      );
    });
    it('accepts a class without constructor', () => {
      expect(detectAttributeDecorators('class A { x = 1; }')).toHaveLength(0);
    });
  });
});
