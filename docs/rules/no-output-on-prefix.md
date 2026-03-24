# angular/no-output-on-prefix

**Category:** conventions
**ESLint equivalent:** `@angular-eslint/no-output-on-prefix`
**Severity (recommended):** error

## Overview

Disallows naming `@Output()` properties with an `on` prefix followed by an uppercase
letter (e.g. `onSubmit`, `onChange`, `onClick`). In Angular templates, event bindings
already use the `(event)="onHandler()"` convention — the `on` prefix belongs to the
*handler method in the parent*, not to the output itself.

## Examples

### Incorrect

```typescript
import { Component, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'app-form', standalone: true, template: '' })
export class FormComponent {
  @Output() onSubmit = new EventEmitter<void>();    // ❌
  @Output() onChange = new EventEmitter<string>();  // ❌
  @Output() onClick = new EventEmitter<void>();     // ❌
}
```

### Correct

```typescript
import { Component, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'app-form', standalone: true, template: '' })
export class FormComponent {
  @Output() submitted = new EventEmitter<void>();
  @Output() changed = new EventEmitter<string>();
  @Output() clicked = new EventEmitter<void>();
}
```

```html
<!-- Parent template: the "on" goes here, in the handler name -->
<app-form
  (submitted)="onSubmit()"
  (changed)="onChange($event)"
></app-form>
```

## Edge cases

- `onion` is **not** flagged — the `on` prefix rule only applies when followed by an uppercase letter.
- `@Input()` properties named `onSomething` are not flagged — this rule targets `@Output()` only.
- Signal-based outputs (`output()`) are not covered.

## Migration from @angular-eslint

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/no-output-on-prefix": "error"
      }
    }
  }
}
```

## Further Reading

- [Angular Output properties](https://angular.dev/guide/components/outputs)
- [@angular-eslint/no-output-on-prefix](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-output-on-prefix.md)
