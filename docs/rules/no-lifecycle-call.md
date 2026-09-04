# angular/no-lifecycle-call

**Category:** quality
**ESLint equivalent:** `@angular-eslint/no-lifecycle-call`
**Severity:** error

## Overview

Lifecycle hooks (`ngOnInit`, `ngOnDestroy`, `ngOnChanges`…) are called by Angular.
Calling one by hand runs it a second time, out of order, or before the class is fully
initialized. Move the shared logic into a regular method and call that instead.

Calls through `super` (`super.ngOnInit()`) are allowed: that is how a derived hook chains
to its parent implementation.

The rule matches any `object.ngXxx(...)` call, including calls on other instances such as
`fixture.componentInstance.ngOnDestroy()` in tests. The shipped preset excludes
`*.spec.ts` files from the plugin; add a `biome-ignore` comment or copy the preset without
the exclusion if you want tests linted too.

## Examples

### Incorrect

```typescript
import { Component, OnInit } from '@angular/core';

@Component({ selector: 'app-root', template: '' })
export class App implements OnInit {
  ngOnInit() { this.load(); }

  reload() {
    this.ngOnInit();          // ❌ runs the hook by hand
  }
}
```

### Correct

```typescript
import { Component, OnInit } from '@angular/core';

@Component({ selector: 'app-root', template: '' })
export class App implements OnInit {
  ngOnInit() { this.load(); }

  reload() {
    this.load();              // ✅ shared logic in a regular method
  }
}

export class Child extends App {
  override ngOnInit() {
    super.ngOnInit();         // ✅ chaining to the parent hook is fine
    this.extra();
  }
}
```

## Configuration

Suppress a single occurrence with `// biome-ignore lint/plugin/no-lifecycle-call: reason` placed on
the line directly above the flagged code.
The severity is fixed to `error` inside the rule itself.

## Migration from @angular-eslint

Remove `"@angular-eslint/no-lifecycle-call"` from your ESLint config and enable the
plugin in `biome.json`:

```json
{
  "extends": ["biome-plugin-angular/presets/recommended.json"]
}
```

## Further Reading

- [Angular Lifecycle hooks](https://angular.dev/guide/components/lifecycle)
- [@angular-eslint/no-lifecycle-call](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-lifecycle-call.md)
