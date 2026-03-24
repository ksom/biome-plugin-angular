# angular/prefer-signal-inputs

**Category:** modern (signal-based APIs)
**ESLint equivalent:** _(new rule — no direct ESLint equivalent)_
**Severity (recommended):** warn

## Overview

Prefer the `input()` signal function over the `@Input()` decorator. Signal inputs (stable since Angular 17.1) are reactive, type-safe, and integrate seamlessly with computed signals and effects.

Benefits over `@Input()`:
- No need for `ngOnChanges` to react to input changes — use `effect()` or `computed()` instead
- `input.required<T>()` is properly typed without `!` or `undefined`
- Works with the Angular DevTools signal graph

## Examples

### Flagged

```typescript
import { Component, Input } from '@angular/core';

@Component({ selector: 'app-user', standalone: true, template: '' })
export class UserComponent {
  @Input() name: string = '';              // ⚠️ use input('')
  @Input({ required: true }) id!: string; // ⚠️ use input.required<string>()
}
```

### Preferred

```typescript
import { Component, input } from '@angular/core';

@Component({ selector: 'app-user', standalone: true, template: '' })
export class UserComponent {
  name = input('');
  id = input.required<string>();
}
```

### Using signals reactively

```typescript
import { Component, input, computed } from '@angular/core';

@Component({ selector: 'app-greeting', standalone: true, template: '{{ greeting() }}' })
export class GreetingComponent {
  name = input.required<string>();
  greeting = computed(() => `Hello, ${this.name()}!`);
}
```

## Configuration

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/prefer-signal-inputs": "warn"
      }
    }
  }
}
```

## Further Reading

- [Angular signal inputs docs](https://angular.dev/guide/signals/inputs)
- [Angular 17.1 release notes](https://blog.angular.dev/angular-v17-1-is-now-available-in-stable-38f65d3ab769)
