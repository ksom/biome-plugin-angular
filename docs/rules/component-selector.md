# angular/component-selector

**Category:** conventions
**ESLint equivalent:** `@angular-eslint/component-selector`
**Severity (recommended):** warn

## Overview

Enforces that `@Component` selectors follow the Angular Style Guide conventions:

- **Type:** element selector (not attribute `[...]` or class `.`)
- **Style:** kebab-case
- **Prefix:** must start with a configurable prefix (default: `app-`)

These conventions ensure selectors are consistent, predictable, and avoid collisions
with native HTML elements.

## Examples

### Incorrect

```typescript
import { Component } from '@angular/core';

// PascalCase — no prefix, no dashes
@Component({ selector: 'Root', standalone: true, template: '' })
export class AppComponent {}

// camelCase — not kebab
@Component({ selector: 'appRoot', standalone: true, template: '' })
export class AppComponent {}

// wrong prefix
@Component({ selector: 'my-root', standalone: true, template: '' })
export class AppComponent {}

// attribute selector (not element)
@Component({ selector: '[appRoot]', standalone: true, template: '' })
export class AppComponent {}
```

### Correct

```typescript
import { Component } from '@angular/core';

@Component({ selector: 'app-root', standalone: true, template: '' })
export class AppComponent {}

@Component({ selector: 'app-user-profile', standalone: true, template: '' })
export class UserProfileComponent {}

@Component({ selector: 'app-step2-form', standalone: true, template: '' })
export class Step2FormComponent {}
```

## Configuration

The default prefix is `app`. Configure a custom prefix via rule options (planned):

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/component-selector": ["warn", { "prefix": "acme", "style": "kebab-case", "type": "element" }]
      }
    }
  }
}
```

For library projects, use a shorter domain-specific prefix (e.g. `mat-` for Angular Material).

## Migration from @angular-eslint

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/component-selector": "warn"
      }
    }
  }
}
```

## Further Reading

- [Angular Style Guide — Component selectors](https://angular.dev/style-guide#component-selectors)
- [@angular-eslint/component-selector](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/component-selector.md)
