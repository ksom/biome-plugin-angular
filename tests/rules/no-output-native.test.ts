import { describe, expect, it } from 'vitest';
import { detectNativeOutputNames } from '../helpers/pattern-matcher.js';

const component = (members: string) => `
  import { Component, Output, EventEmitter, output } from '@angular/core';
  @Component({ selector: 'app-root', template: '' })
  export class App { ${members} }
`;

describe('angular/no-output-native', () => {
  describe('invalid', () => {
    it('flags @Output() change', () => {
      const v = detectNativeOutputNames(component('@Output() change = new EventEmitter();'));
      expect(v).toHaveLength(1);
      expect(v[0].propertyName).toBe('change');
    });
    it('flags readonly @Output() click', () => {
      expect(
        detectNativeOutputNames(component('@Output() readonly click = new EventEmitter();')),
      ).toHaveLength(1);
    });
    it('flags signal output focus', () => {
      expect(detectNativeOutputNames(component('readonly focus = output<void>();'))).toHaveLength(
        1,
      );
    });
    it('flags outputFromObservable scroll', () => {
      expect(
        detectNativeOutputNames(component('readonly scroll = outputFromObservable(this.s$);')),
      ).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts specific output names', () => {
      expect(
        detectNativeOutputNames(
          component('@Output() valueChange = new EventEmitter(); readonly clicked = output();'),
        ),
      ).toHaveLength(0);
    });
    it('ignores inputs and plain properties named like events', () => {
      expect(
        detectNativeOutputNames(
          component('@Input() change = ""; click = 0; focus = input(false);'),
        ),
      ).toHaveLength(0);
    });
    it('ignores undecorated classes without output calls', () => {
      expect(detectNativeOutputNames('class X { change = 1; }')).toHaveLength(0);
    });
  });
});
