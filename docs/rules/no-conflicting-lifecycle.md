# angular/no-conflicting-lifecycle

**Category:** quality
**ESLint equivalent:** `@angular-eslint/no-conflicting-lifecycle`
**Severity:** error

## Overview

A class must not declare both `ngDoCheck` and `ngOnChanges`. Angular calls `ngDoCheck`
immediately after `ngOnChanges` on every change-detection cycle, so both hooks react to
the same input changes and the class does its work twice. Pick one: `ngOnChanges` when
you only need to react to input changes, `ngDoCheck` when you need custom change
detection.

The check is per class, on any class (decorated or not), and reads the method members
directly — signature shape (`: void`, parameters, modifiers) does not matter.

## Examples

### Incorrect

```typescript
import { Component, DoCheck, OnChanges, SimpleChanges } from '@angular/core';

@Component({ selector: 'app-root', template: '' })
export class App implements DoCheck, OnChanges {   // ❌ both hooks
  ngOnChanges(changes: SimpleChanges) { this.sync(); }
  ngDoCheck() { this.sync(); }
}
```

### Correct

```typescript
import { Component, OnChanges, SimpleChanges } from '@angular/core';

@Component({ selector: 'app-root', template: '' })
export class App implements OnChanges {
  ngOnChanges(changes: SimpleChanges) { this.sync(); }
}
```

## Configuration

Suppress a single occurrence with `// biome-ignore lint/plugin/no-conflicting-lifecycle: reason` placed on
the line directly above the flagged code.
The severity is fixed to `error` inside the rule itself.

## Migration from @angular-eslint

Remove `"@angular-eslint/no-conflicting-lifecycle"` from your ESLint config and enable
the plugin in `biome.json`:

```json
{
  "extends": ["biome-plugin-angular/presets/recommended.json"]
}
```

## Further Reading

- [Angular Lifecycle hooks](https://angular.dev/guide/components/lifecycle)
- [@angular-eslint/no-conflicting-lifecycle](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-conflicting-lifecycle.md)
