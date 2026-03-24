# angular/prefer-model-signal

**Category:** modern (signal-based APIs)
**ESLint equivalent:** _(new rule — no direct ESLint equivalent)_
**Severity (recommended):** warn

## Overview

Prefer `model()` for two-way binding over the `@Input()` + `@Output() xyzChange` pattern. The `model()` signal function (stable since Angular 17.2) reduces boilerplate for the two-way binding convention.

**Detection:** this rule flags `@Output()` properties whose name ends with `Change` when the corresponding `@Input()` property exists in the same class.

## Examples

### Flagged

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'app-counter', standalone: true, template: '' })
export class CounterComponent {
  @Input() value = 0;                                    // ⚠️ two-way binding pair
  @Output() valueChange = new EventEmitter<number>();    // ⚠️ use model() instead
}
```

### Preferred

```typescript
import { Component, model } from '@angular/core';

@Component({ selector: 'app-counter', standalone: true, template: '' })
export class CounterComponent {
  value = model(0);
}
```

### Using model() in a template

```html
<!-- Parent template — works with [(value)] two-way binding syntax -->
<app-counter [(value)]="count" />
```

## Configuration

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/prefer-model-signal": "warn"
      }
    }
  }
}
```

## Further Reading

- [Angular model() signal docs](https://angular.dev/guide/signals/model)
- [Angular 17.2 release notes](https://blog.angular.dev/angular-v17-2-is-now-available-596cbe96242d)
