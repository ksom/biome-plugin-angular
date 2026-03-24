# angular/use-pipe-transform-interface

**Category:** quality
**ESLint equivalent:** `@angular-eslint/use-pipe-transform-interface`
**Severity (recommended):** warn

## Overview

Classes decorated with `@Pipe` should implement the `PipeTransform` interface. This makes the `transform()` method type-safe and communicates intent clearly.

## Examples

### Flagged

```typescript
import { Pipe } from '@angular/core';

@Pipe({ name: 'appTruncate', standalone: true })
export class TruncatePipe {   // ⚠️ missing implements PipeTransform
  transform(value: string, limit = 50): string {
    return value.length > limit ? value.slice(0, limit) + '…' : value;
  }
}
```

### Preferred

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'appTruncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 50): string {
    return value.length > limit ? value.slice(0, limit) + '…' : value;
  }
}
```

## Configuration

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/use-pipe-transform-interface": "warn"
      }
    }
  }
}
```

## Further Reading

- [Angular pipes docs](https://angular.dev/guide/pipes)
- [@angular-eslint/use-pipe-transform-interface](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/use-pipe-transform-interface.md)
