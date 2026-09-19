# angular/no-async-lifecycle-method

**Category:** quality
**ESLint equivalent:** `@angular-eslint/no-async-lifecycle-method`
**Severity:** warn

## Overview

Angular never awaits a lifecycle hook. An `async ngOnInit()` returns a promise nobody
observes: a rejection is silently lost, and change detection runs before the awaited work
completes, so the view renders with stale data. Keep the hook synchronous and start the
asynchronous work from it.

Any modifier combination is matched (`protected async`, `public override async`…), with or
without a return type or parameters.

## Examples

### Incorrect

```typescript
import { Component, OnInit } from '@angular/core';

@Component({ selector: 'app-root', template: '' })
export class App implements OnInit {
  async ngOnInit() {                       // ⚠️ nobody awaits this
    this.user = await this.api.load();
  }
}
```

### Correct

```typescript
import { Component, OnInit } from '@angular/core';

@Component({ selector: 'app-root', template: '' })
export class App implements OnInit {
  ngOnInit(): void {
    void this.load();                      // ✅ hook stays synchronous
  }

  private async load() {
    this.user = await this.api.load();
  }
}
```

Or lean on signals and `resource()` / `toSignal()` so the template reacts when the data
arrives, with no lifecycle hook at all.

## Configuration

Suppress a single occurrence with `// biome-ignore lint/plugin/no-async-lifecycle-method: reason` placed on
the line directly above the flagged code.
The severity is fixed to `warn` inside the rule itself.

## Migration from @angular-eslint

Remove `"@angular-eslint/no-async-lifecycle-method"` from your ESLint config and enable
the plugin in `biome.json`:

```json
{
  "extends": ["biome-plugin-angular/presets/recommended.json"]
}
```

## Further Reading

- [Angular Lifecycle hooks](https://angular.dev/guide/components/lifecycle)
- [@angular-eslint/no-async-lifecycle-method](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-async-lifecycle-method.md)
