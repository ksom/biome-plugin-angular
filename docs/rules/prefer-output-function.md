# angular/prefer-output-function

**Category:** modern (signal-based APIs)
**ESLint equivalent:** _(new rule — no direct ESLint equivalent)_
**Severity (recommended):** warn

## Overview

Prefer the `output()` function over `@Output()` + `EventEmitter`. The `output()` function (stable since Angular 17.3) is the modern, lightweight alternative that avoids the `RxJS` dependency and aligns with the signal-based APIs.

Benefits over `@Output()` + `EventEmitter`:
- No need to import `EventEmitter`
- Lighter weight — not an Observable by default (use `outputFromObservable()` if needed)
- Consistent API surface with `input()`, `model()`, and other signal primitives

## Examples

### Flagged

```typescript
import { Component, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'app-button', standalone: true, template: '' })
export class ButtonComponent {
  @Output() clicked = new EventEmitter<void>();           // ⚠️ use output<void>()
  @Output() valueChange = new EventEmitter<string>();     // ⚠️ use output<string>()
}
```

### Preferred

```typescript
import { Component, output } from '@angular/core';

@Component({ selector: 'app-button', standalone: true, template: '' })
export class ButtonComponent {
  clicked = output<void>();
  valueChange = output<string>();
}
```

## Configuration

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/prefer-output-function": "warn"
      }
    }
  }
}
```

## Further Reading

- [Angular output() docs](https://angular.dev/guide/components/output-fn)
- [Angular 17.3 release notes](https://blog.angular.dev/angular-v17-3-is-now-available-29bb0b07d2b0)
