import { describe, expect, it } from 'vitest';
import { createPatternMatcher } from './pattern-matcher.js';

describe('createPatternMatcher', () => {
  it('returns all detection functions', () => {
    const matcher = createPatternMatcher();

    expect(typeof matcher.detectMissingStandalone).toBe('function');
    expect(typeof matcher.detectEmptyLifecycleMethods).toBe('function');
    expect(typeof matcher.detectComponentSuffix).toBe('function');
    expect(typeof matcher.detectDirectiveSuffix).toBe('function');
    expect(typeof matcher.detectServiceSuffix).toBe('function');
    expect(typeof matcher.detectInvalidComponentSelector).toBe('function');
    expect(typeof matcher.detectInputRename).toBe('function');
    expect(typeof matcher.detectOutputRename).toBe('function');
    expect(typeof matcher.detectOutputOnPrefix).toBe('function');
    expect(typeof matcher.detectMissingPipePrefix).toBe('function');
    expect(typeof matcher.detectUnsortedNgModuleArrays).toBe('function');
    expect(typeof matcher.detectMissingLifecycleInterface).toBe('function');
    expect(typeof matcher.detectMissingPipeTransform).toBe('function');
    expect(typeof matcher.detectContextualLifecycleViolations).toBe('function');
    expect(typeof matcher.detectDecoratorInputs).toBe('function');
    expect(typeof matcher.detectDecoratorOutputs).toBe('function');
    expect(typeof matcher.detectDecoratorQueries).toBe('function');
    expect(typeof matcher.detectTwoWayBindingPairs).toBe('function');
    expect(typeof matcher.detectHostDecorators).toBe('function');
    expect(typeof matcher.detectConstructorInjection).toBe('function');
  });

  it('returned functions work correctly via the factory', () => {
    const matcher = createPatternMatcher();

    const violations = matcher.detectMissingStandalone(`
      import { Component } from '@angular/core';
      @Component({ selector: 'app-root', template: '' })
      export class AppComponent {}
    `);

    expect(violations).toHaveLength(1);
    expect(violations[0].className).toBe('AppComponent');
  });
});
