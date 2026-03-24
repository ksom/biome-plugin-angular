# angular/no-input-rename

**Category:** conventions
**ESLint equivalent:** `@angular-eslint/no-input-rename`
**Severity (recommended):** error

## Overview

Disallows renaming `@Input()` properties via the decorator argument. Providing an alias
creates a disconnect between the component's internal property name and its public API,
making the component harder to use and the codebase harder to search.

**Two alias forms are detected:**
- `@Input('alias')` — string argument
- `@Input({ alias: 'name' })` — alias key in options object

## Examples

### Incorrect

```typescript
import { Component, Input } from '@angular/core';

@Component({ selector: 'app-user', standalone: true, template: '' })
export class UserComponent {
  @Input('userName') name: string = '';            // ❌ string alias
  @Input({ alias: 'isActive' }) active: boolean = false;  // ❌ alias in options
}
```

### Correct

```typescript
import { Component, Input } from '@angular/core';

@Component({ selector: 'app-user', standalone: true, template: '' })
export class UserComponent {
  @Input() name: string = '';

  @Input({ required: true }) active: boolean = false;   // ✅ options without alias

  @Input({ transform: booleanAttribute }) disabled = false;  // ✅ transform, no alias
}
```

## Signal-based inputs

The rule applies to `@Input()` decorator only. Signal-based inputs using the `input()`
function are not covered by this rule.

```typescript
// Not covered by this rule
value = input<string>('', { alias: 'externalValue' });
```

## Why avoid renaming?

- Property names become searchable across the codebase
- Template bindings like `[name]="user"` are self-documenting
- Refactoring is simpler when the binding name matches the property name
- Avoids confusion when reading component API documentation

## Migration from @angular-eslint

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/no-input-rename": "error"
      }
    }
  }
}
```

## Further Reading

- [Angular Input properties](https://angular.dev/guide/components/inputs)
- [@angular-eslint/no-input-rename](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-input-rename.md)
