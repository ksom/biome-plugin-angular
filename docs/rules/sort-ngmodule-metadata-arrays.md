# angular/sort-ngmodule-metadata-arrays

**Category:** conventions
**ESLint equivalent:** `@angular-eslint/sort-ngmodule-metadata-arrays`
**Severity (recommended):** warn

## Overview

Enforces alphabetical (case-insensitive) ordering of entries in NgModule metadata arrays:
`declarations`, `imports`, `exports`, `providers`, and `bootstrap`.

Sorted arrays:
- Make entries easy to locate at a glance
- Make duplicate entries easier to spot
- Reduce git merge conflicts when multiple developers add entries

## Examples

### Incorrect

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header.component';

@NgModule({
  declarations: [HeaderComponent, AppComponent],  // ❌ H before A
  imports: [RouterModule, BrowserModule],          // ❌ R before B
  bootstrap: [AppComponent],
})
export class AppModule {}
```

### Correct

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header.component';

@NgModule({
  declarations: [AppComponent, HeaderComponent],  // ✅ A before H
  imports: [BrowserModule, RouterModule],          // ✅ B before R
  bootstrap: [AppComponent],
})
export class AppModule {}
```

## Sorting semantics

- **Case-insensitive**: `aComponent` sorts before `BComponent`
- **Applies to**: `declarations`, `imports`, `exports`, `providers`, `bootstrap`
- **Single-element arrays** are always valid (nothing to sort)
- **Complex expressions** (e.g. `forwardRef(() => Foo)`) are sorted by their full source text

## Note on standalone components

This rule is primarily relevant for NgModule-based codebases. If your project uses
100% standalone components (Angular 17+), you will rarely encounter `@NgModule`.

## Migration from @angular-eslint

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/sort-ngmodule-metadata-arrays": "warn"
      }
    }
  }
}
```

## Further Reading

- [Angular NgModule](https://angular.dev/guide/ngmodules)
- [@angular-eslint/sort-ngmodule-metadata-arrays](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/sort-ngmodule-metadata-arrays.md)
