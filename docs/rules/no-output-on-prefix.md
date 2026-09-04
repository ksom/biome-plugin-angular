# angular/no-output-on-prefix

**Category:** conventions
**ESLint equivalent:** `@angular-eslint/no-output-on-prefix`
**Severity:** error

## Overview

Disallows naming outputs with an `on` prefix followed by an uppercase
letter (e.g. `onSubmit`, `onChange`, `onClick`). In Angular templates, event bindings
already use the `(event)="onHandler()"` convention — the `on` prefix belongs to the
*handler method in the parent*, not to the output itself.

## Examples

### Incorrect

```typescript
import { Component, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'app-form', standalone: true, template: '' })
export class FormComponent {
  @Output() onSubmit = new EventEmitter<void>();    // ❌ initialized
  @Output() onChange: EventEmitter<string>;         // ❌ typed only
  @Output() onClick!: EventEmitter<void>;           // ❌ definite assignment
  @Output('click') onPress = new EventEmitter<void>(); // ❌ decorator argument
  readonly onSave = output<void>();                 // ❌ signal output
  readonly onLoad = outputFromObservable(this.load$); // ❌ observable output
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
- Signal-based outputs (`output()`, `outputFromObservable()`) are covered, with or
  without type arguments.
- Initialized (`= new EventEmitter()`), typed (`: EventEmitter<T>`), definite-assignment
  (`!: EventEmitter<T>`) and `readonly` properties are all matched, with or without a
  decorator argument.

## Migration from @angular-eslint

Remove `"@angular-eslint/no-output-on-prefix"` from your ESLint config and enable the
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

- [Angular Output properties](https://angular.dev/guide/components/outputs)
- [@angular-eslint/no-output-on-prefix](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-output-on-prefix.md)
