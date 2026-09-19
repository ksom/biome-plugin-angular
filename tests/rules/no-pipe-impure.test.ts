import { describe, expect, it } from 'vitest';
import { detectImpurePipes } from '../helpers/pattern-matcher.js';

const pipe = (meta: string) => `
  import { Pipe } from '@angular/core';
  @Pipe({ ${meta} })
  export class P { transform(v: unknown) { return v; } }
`;

describe('angular/no-pipe-impure', () => {
  describe('invalid', () => {
    it('flags pure: false', () => {
      const v = detectImpurePipes(pipe("name: 'appFilter', pure: false"));
      expect(v).toHaveLength(1);
      expect(v[0].className).toBe('P');
    });
    it('flags pure: false whatever the property order', () => {
      expect(detectImpurePipes(pipe("pure: false, name: 'appFilter'"))).toHaveLength(1);
    });
    it('flags pure: false with standalone', () => {
      expect(
        detectImpurePipes(pipe("name: 'appFilter', standalone: true, pure: false")),
      ).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts pure: true', () => {
      expect(detectImpurePipes(pipe("name: 'appUpper', pure: true"))).toHaveLength(0);
    });
    it('accepts the default (no pure property)', () => {
      expect(detectImpurePipes(pipe("name: 'appUpper'"))).toHaveLength(0);
    });
    it('ignores pure: false outside @Pipe', () => {
      expect(detectImpurePipes('const options = { pure: false };')).toHaveLength(0);
    });
  });
});
