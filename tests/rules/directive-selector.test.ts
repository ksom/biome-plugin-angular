import { describe, expect, it } from 'vitest';
import { detectInvalidDirectiveSelector } from '../helpers/pattern-matcher.js';

const directive = (selector: string) => `
  import { Directive } from '@angular/core';
  @Directive({ selector: '${selector}' })
  export class Highlight {}
`;

describe('angular/directive-selector', () => {
  describe('invalid', () => {
    it('flags attribute selector without prefix', () => {
      expect(detectInvalidDirectiveSelector(directive('[highlight]'))).toHaveLength(1);
    });
    it('flags kebab-case attribute selector', () => {
      expect(detectInvalidDirectiveSelector(directive('[app-highlight]'))).toHaveLength(1);
    });
    it('flags element selector', () => {
      expect(detectInvalidDirectiveSelector(directive('app-highlight'))).toHaveLength(1);
    });
    it('flags a list where one entry is invalid', () => {
      expect(detectInvalidDirectiveSelector(directive('[appA], [b]'))).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts [appCamelCase]', () => {
      expect(detectInvalidDirectiveSelector(directive('[appHighlight]'))).toHaveLength(0);
    });
    it('accepts a list of valid selectors', () => {
      expect(detectInvalidDirectiveSelector(directive('[appA], [appB]'))).toHaveLength(0);
    });
    it('ignores components', () => {
      expect(
        detectInvalidDirectiveSelector(`
          import { Component } from '@angular/core';
          @Component({ selector: 'app-root', template: '' })
          export class App {}
        `),
      ).toHaveLength(0);
    });
  });
});
