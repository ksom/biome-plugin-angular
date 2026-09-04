# angular/use-pipe-transform-interface

**Category:** quality
**ESLint equivalent:** `@angular-eslint/use-pipe-transform-interface`
**Severity:** warn

## Overview

Classes decorated with `@Pipe` should implement the `PipeTransform` interface. This makes the `transform()` method type-safe and communicates intent clearly.

**How it works:** the check is per class. The rule reads the `implements` clause of every `@Pipe`-decorated class and flags the class when `PipeTransform` is missing from it, whatever else the file imports or declares.

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

Enable the plugin in `biome.json` (Biome plugins cannot be enabled per rule):

```json
{
  "plugins": ["./node_modules/biome-plugin-angular"]
}
```

Or extend the recommended preset:

```json
{
  "extends": ["biome-plugin-angular/presets/recommended.json"]
}
```

Biome plugins take no per-rule options; this rule's severity is fixed to `warn` inside
the rule itself.

## Further Reading

- [Angular pipes docs](https://angular.dev/guide/pipes)
- [@angular-eslint/use-pipe-transform-interface](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/use-pipe-transform-interface.md)
