# angular/no-output-native

**Category:** conventions
**ESLint equivalent:** `@angular-eslint/no-output-native`
**Severity:** error

## Overview

Disallows naming an output after a native DOM event (`click`, `change`, `focus`,
`submit`, `scroll`…). When a parent binds `(change)="..."` on the component, it receives
**both** the component's output and the browser's native `change` event bubbling from the
host element — the handler runs twice, with two different event shapes.

The rule covers every output form:

- `@Output()` decorator, on initialized, typed, definite-assignment or `readonly` properties
- `output()` and `outputFromObservable()` signal-based outputs, with or without type arguments

## Examples

### Incorrect

```typescript
import { Component, Output, EventEmitter, output } from '@angular/core';

@Component({ selector: 'app-picker', template: '' })
export class Picker {
  @Output() change = new EventEmitter<string>();   // ❌ native event name
  readonly focus = output<void>();                 // ❌ native event name
  readonly select = output<string>();              // ❌ native event name
}
```

### Correct

```typescript
import { Component, Output, EventEmitter, output } from '@angular/core';

@Component({ selector: 'app-picker', template: '' })
export class Picker {
  @Output() valueChange = new EventEmitter<string>();
  readonly focused = output<void>();
  readonly itemSelected = output<string>();
}
```

## Configuration

Suppress a single occurrence with `// biome-ignore lint/plugin/no-output-native: reason` placed on
the line directly above the flagged code.
The severity is fixed to `error` inside the rule itself.

## Migration from @angular-eslint

Remove `"@angular-eslint/no-output-native"` from your ESLint config and enable the
plugin in `biome.json`:

```json
{
  "extends": ["biome-plugin-angular/presets/recommended.json"]
}
```

## Further Reading

- [Angular Output properties](https://angular.dev/guide/components/outputs)
- [@angular-eslint/no-output-native](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-output-native.md)
