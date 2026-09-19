# angular/pipe-prefix

**Category:** conventions
**ESLint equivalent:** `@angular-eslint/pipe-prefix`
**Severity:** warn

## Overview

Enforces that the `name` field in `@Pipe` decorators starts with the `app` prefix
(hardcoded — see Configuration). Namespacing pipe names prevents collisions with
Angular's built-in pipes (`date`, `currency`, `async`, etc.) and with third-party
library pipes.

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

Biome plugins take no options, so the prefix is **not configurable**: it is hardcoded to
`app` (pipe names must match `app` followed by an uppercase letter, e.g. `appTruncate`).
For a different prefix, copy `rules/conventions/pipe-prefix.grit` into your project,
adjust the regex, and point your `plugins` array at the forked file.

The severity is fixed to `warn` inside the rule itself.

## Migration from @angular-eslint

Remove `"@angular-eslint/pipe-prefix"` from your ESLint config and enable the plugin as
shown above.

## Further Reading

- [Angular Pipes](https://angular.dev/guide/pipes)
- [Angular Style Guide — Pipe names](https://angular.dev/style-guide#pipe-names)
- [@angular-eslint/pipe-prefix](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/pipe-prefix.md)
