# angular/prefer-standalone

**Category:** high-priority
**ESLint equivalent:** `@angular-eslint/prefer-standalone`
**Severity:** error

## Overview

Flags explicit `standalone: false` in `@Component`, `@Directive`, and `@Pipe` decorator
metadata. Since Angular 19, standalone is the **default** — declaring `standalone: false`
opts back into the NgModule system, and the v20 style guide recommends omitting the
property entirely.

This rule only flags the explicit opt-out. Omitting the property (idiomatic Angular 19+)
and the redundant `standalone: true` are both accepted.

Diagnostic message: *"Avoid standalone: false. Standalone is the default since Angular 19 —
migrate this declarable off NgModules and remove the property."*

## Examples

### Incorrect

```typescript
import { Component } from '@angular/core';

// Explicitly opting out of standalone
@Component({
  selector: 'app-root',
  standalone: false,
  template: '<h1>Hello</h1>',
})
export class AppComponent {}
```

```typescript
import { Directive } from '@angular/core';

@Directive({ selector: '[appHighlight]', standalone: false })
export class HighlightDirective {}
```

### Correct

```typescript
import { Component } from '@angular/core';

// Omitting standalone is idiomatic since Angular 19 (standalone by default)
@Component({
  selector: 'app-root',
  template: '<h1>Hello</h1>',
})
export class AppComponent {}
```

```typescript
import { Directive } from '@angular/core';

// Explicit standalone: true is redundant but not flagged
@Directive({ selector: '[appHighlight]', standalone: true })
export class HighlightDirective {}
```

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number): string {
    return value.substring(0, limit);
  }
}
```

## Migration from @angular-eslint

Remove `"@angular-eslint/prefer-standalone"` from your ESLint config and enable the
plugin in `biome.json`:

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

Biome plugins take no per-rule options; this rule's severity is fixed to `error` inside
the rule itself.

## Further Reading

- [Angular Standalone Components Guide](https://angular.dev/guide/components/importing)
- [@angular-eslint/prefer-standalone](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-standalone.md)
