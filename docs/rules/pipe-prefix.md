# angular/pipe-prefix

**Category:** conventions
**ESLint equivalent:** `@angular-eslint/pipe-prefix`
**Severity (recommended):** warn

## Overview

Enforces that the `name` field in `@Pipe` decorators starts with a configurable prefix
(default: `app`). Namespacing pipe names prevents collisions with Angular's built-in
pipes (`date`, `currency`, `async`, etc.) and with third-party library pipes.

## Examples

### Incorrect

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true })       // ❌ no prefix
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number): string {
    return value.substring(0, limit);
  }
}

@Pipe({ name: 'currencyFormat', standalone: true }) // ❌ no prefix
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number): string {
    return value.toFixed(2);
  }
}
```

### Correct

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'appTruncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number): string {
    return value.substring(0, limit);
  }
}

@Pipe({ name: 'appCurrencyFormat', standalone: true })
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number): string {
    return value.toFixed(2);
  }
}
```

Usage in templates:

```html
<p>{{ description | appTruncate:100 }}</p>
<span>{{ price | appCurrencyFormat }}</span>
```

## Configuration

The default prefix is `app`. For library or multi-team projects, configure a custom
prefix via rule options (planned):

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/pipe-prefix": ["warn", { "prefix": "acme" }]
      }
    }
  }
}
```

## Migration from @angular-eslint

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/pipe-prefix": "warn"
      }
    }
  }
}
```

## Further Reading

- [Angular Pipes](https://angular.dev/guide/pipes)
- [Angular Style Guide — Pipe names](https://angular.dev/style-guide#pipe-names)
- [@angular-eslint/pipe-prefix](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/pipe-prefix.md)
