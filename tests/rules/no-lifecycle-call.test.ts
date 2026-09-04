import { describe, expect, it } from 'vitest';
import { detectLifecycleCalls } from '../helpers/pattern-matcher.js';

describe('angular/no-lifecycle-call', () => {
  describe('invalid', () => {
    it('flags this.ngOnInit()', () => {
      const v = detectLifecycleCalls('class A { reload() { this.ngOnInit(); } }');
      expect(v).toHaveLength(1);
      expect(v[0]).toEqual({ hook: 'ngOnInit', receiver: 'this' });
    });
    it('flags calls on other instances', () => {
      expect(
        detectLifecycleCalls('fixture.componentInstance.ngOnDestroy(); cmp.ngOnChanges({});'),
      ).toHaveLength(2);
    });
    it('flags hooks called with arguments', () => {
      expect(detectLifecycleCalls('this.ngOnChanges({ value: change });')).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts super.ngOnInit()', () => {
      expect(
        detectLifecycleCalls('class A extends B { ngOnInit() { super.ngOnInit(); } }'),
      ).toHaveLength(0);
    });
    it('accepts hook declarations', () => {
      expect(
        detectLifecycleCalls('class A { ngOnInit() { this.load(); } load() {} }'),
      ).toHaveLength(0);
    });
    it('ignores methods whose name only starts like a hook', () => {
      expect(detectLifecycleCalls('this.ngOnInitLike();')).toHaveLength(0);
    });
  });
});
