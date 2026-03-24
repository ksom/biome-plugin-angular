import { describe, expect, it } from 'vitest';
import { detectUnsortedNgModuleArrays } from '../helpers/pattern-matcher.js';

describe('angular/sort-ngmodule-metadata-arrays', () => {
  describe('invalid', () => {
    it('flags unsorted declarations array', () => {
      const code = `
        import { NgModule } from '@angular/core';
        import { AppComponent } from './app.component';
        import { HeaderComponent } from './header.component';

        @NgModule({
          declarations: [HeaderComponent, AppComponent],
        })
        export class AppModule {}
      `;

      const violations = detectUnsortedNgModuleArrays(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].arrayName).toBe('declarations');
      expect(violations[0].className).toBe('AppModule');
      expect(violations[0].sortedElements).toEqual(['AppComponent', 'HeaderComponent']);
    });

    it('flags unsorted imports array', () => {
      const code = `
        import { NgModule } from '@angular/core';
        import { BrowserModule } from '@angular/platform-browser';
        import { RouterModule } from '@angular/router';

        @NgModule({
          imports: [RouterModule, BrowserModule],
        })
        export class AppModule {}
      `;

      const violations = detectUnsortedNgModuleArrays(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].arrayName).toBe('imports');
      expect(violations[0].sortedElements).toEqual(['BrowserModule', 'RouterModule']);
    });

    it('flags unsorted exports array', () => {
      const code = `
        import { NgModule } from '@angular/core';

        @NgModule({
          exports: [UserComponent, ButtonComponent, AlertComponent],
        })
        export class SharedModule {}
      `;

      const violations = detectUnsortedNgModuleArrays(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].arrayName).toBe('exports');
      expect(violations[0].sortedElements).toEqual([
        'AlertComponent',
        'ButtonComponent',
        'UserComponent',
      ]);
    });

    it('flags unsorted providers array', () => {
      const code = `
        import { NgModule } from '@angular/core';

        @NgModule({
          providers: [UserService, AuthService, LoggerService],
        })
        export class AppModule {}
      `;

      const violations = detectUnsortedNgModuleArrays(code);
      expect(violations).toHaveLength(1);
      expect(violations[0].arrayName).toBe('providers');
    });

    it('flags multiple unsorted arrays in the same NgModule', () => {
      const code = `
        import { NgModule } from '@angular/core';

        @NgModule({
          declarations: [HeaderComponent, AppComponent],
          imports: [RouterModule, BrowserModule],
        })
        export class AppModule {}
      `;

      const violations = detectUnsortedNgModuleArrays(code);
      expect(violations).toHaveLength(2);
      const arrayNames = violations.map((v) => v.arrayName);
      expect(arrayNames).toContain('declarations');
      expect(arrayNames).toContain('imports');
    });
  });

  describe('valid', () => {
    it('accepts alphabetically sorted declarations', () => {
      const code = `
        import { NgModule } from '@angular/core';

        @NgModule({
          declarations: [AppComponent, HeaderComponent],
        })
        export class AppModule {}
      `;

      expect(detectUnsortedNgModuleArrays(code)).toHaveLength(0);
    });

    it('accepts alphabetically sorted imports', () => {
      const code = `
        import { NgModule } from '@angular/core';

        @NgModule({
          imports: [BrowserModule, RouterModule],
        })
        export class AppModule {}
      `;

      expect(detectUnsortedNgModuleArrays(code)).toHaveLength(0);
    });

    it('accepts NgModule with all arrays sorted', () => {
      const code = `
        import { NgModule } from '@angular/core';

        @NgModule({
          declarations: [AppComponent, HeaderComponent, UserComponent],
          exports: [AppComponent, HeaderComponent],
          imports: [BrowserModule, HttpClientModule, RouterModule],
          providers: [AuthService, UserService],
        })
        export class AppModule {}
      `;

      expect(detectUnsortedNgModuleArrays(code)).toHaveLength(0);
    });

    it('accepts single-element arrays (nothing to sort)', () => {
      const code = `
        import { NgModule } from '@angular/core';

        @NgModule({
          declarations: [AppComponent],
          imports: [BrowserModule],
          bootstrap: [AppComponent],
        })
        export class AppModule {}
      `;

      expect(detectUnsortedNgModuleArrays(code)).toHaveLength(0);
    });

    it('accepts empty arrays', () => {
      const code = `
        import { NgModule } from '@angular/core';

        @NgModule({
          declarations: [],
          imports: [],
        })
        export class AppModule {}
      `;

      expect(detectUnsortedNgModuleArrays(code)).toHaveLength(0);
    });

    it('accepts case-insensitive alphabetical order (a < B)', () => {
      const code = `
        import { NgModule } from '@angular/core';

        @NgModule({
          declarations: [aComponent, BComponent],
        })
        export class AppModule {}
      `;

      expect(detectUnsortedNgModuleArrays(code)).toHaveLength(0);
    });

    it('ignores @Component and @Directive decorators', () => {
      const code = `
        import { Component } from '@angular/core';

        @Component({ selector: 'app-root', standalone: true, template: '' })
        export class AppComponent {}
      `;

      expect(detectUnsortedNgModuleArrays(code)).toHaveLength(0);
    });
  });
});
