import { describe, expect, it } from 'vitest';
import { detectAsyncLifecycleMethods } from '../helpers/pattern-matcher.js';

describe('angular/no-async-lifecycle-method', () => {
  describe('invalid', () => {
    it('flags async ngOnInit', () => {
      const v = detectAsyncLifecycleMethods('class A { async ngOnInit() { await x(); } }');
      expect(v).toHaveLength(1);
      expect(v[0].methodName).toBe('ngOnInit');
    });
    it('flags async hooks with modifiers and return types', () => {
      expect(
        detectAsyncLifecycleMethods(
          'class A { protected async ngOnDestroy(): Promise<void> {} public override async ngOnChanges(c) {} }',
        ),
      ).toHaveLength(2);
    });
    it('flags every async hook', () => {
      expect(
        detectAsyncLifecycleMethods('class A { async ngDoCheck() {} async ngAfterViewInit() {} }'),
      ).toHaveLength(2);
    });
  });

  describe('valid', () => {
    it('accepts synchronous hooks', () => {
      expect(
        detectAsyncLifecycleMethods('class A { ngOnInit(): void { void this.load(); } }'),
      ).toHaveLength(0);
    });
    it('accepts async methods that are not hooks', () => {
      expect(
        detectAsyncLifecycleMethods('class A { async load() {} async ngLike() {} }'),
      ).toHaveLength(0);
    });
    it('accepts a class without hooks', () => {
      expect(detectAsyncLifecycleMethods('class A { x = 1; }')).toHaveLength(0);
    });
  });
});
