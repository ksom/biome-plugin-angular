# angular/no-output-rename

**Category:** conventions
**ESLint equivalent:** `@angular-eslint/no-output-rename`
**Severity (recommended):** error

## Overview

Disallows renaming `@Output()` properties via the decorator argument. Providing an alias
for an output creates a mismatch between the EventEmitter property name and the event
name used in parent template bindings, making event flows harder to trace.

**Two alias forms are detected:**
- `@Output('alias')` — string argument
- `@Output({ alias: 'name' })` — alias key in options object

## Examples

### Incorrect

```typescript
import { Component, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'app-button', standalone: true, template: '' })
export class ButtonComponent {
  @Output('clickEvent') clicked = new EventEmitter<void>();   // ❌ string alias

  @Output({ alias: 'submitEvent' })                           // ❌ alias in options
  onSubmit = new EventEmitter<FormData>();
}
```

In the parent template, the binding uses the alias (`clickEvent`, `submitEvent`)
but the property is named differently — this disconnect creates confusion:

```html
<!-- parent uses the alias, not the property name -->
<app-button (clickEvent)="handleClick()"></app-button>
```

### Correct

```typescript
import { Component, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'app-button', standalone: true, template: '' })
export class ButtonComponent {
  @Output() clicked = new EventEmitter<void>();

  @Output() onSubmit = new EventEmitter<FormData>();
}
```

```html
<!-- parent binding matches the property name -->
<app-button (clicked)="handleClick()"></app-button>
```

## Signal-based outputs

The rule applies to `@Output()` decorator only. Signal-based outputs using the
`output()` function are not covered by this rule.

```typescript
// Not covered by this rule
clicked = output<void>({ alias: 'clickEvent' });
```

## Migration from @angular-eslint

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/no-output-rename": "error"
      }
    }
  }
}
```

## Further Reading

- [Angular Output properties](https://angular.dev/guide/components/outputs)
- [@angular-eslint/no-output-rename](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-output-rename.md)
