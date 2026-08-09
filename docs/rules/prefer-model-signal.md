# angular/prefer-model-signal

**Category:** modern (signal-based APIs)
**ESLint equivalent:** _(new rule — no direct ESLint equivalent)_
**Severity:** warn

## Overview

Prefer `model()` for two-way binding over the `@Input()` + `@Output() xyzChange` pattern. The `model()` signal function (stable since Angular 17.2) reduces boilerplate for the two-way binding convention.

**Detection:** this rule flags an `@Output()` property whose name ends with `Change` only when a matching `@Input()` property with the base name (e.g. `value` for `valueChange`) exists in the **same file**. Unpaired `*Change` outputs — such as Material-style `selectionChange` events with no corresponding input — are **not** flagged. Initialized (`= ...`), typed (`: T`), and definite-assignment (`!: T`) properties are all matched.

**Known false negative:** `readonly` properties (e.g. `@Output() readonly valueChange = ...`) cannot be matched by GritQL and are not flagged.

## Examples

### Flagged

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'app-counter', standalone: true, template: '' })
export class CounterComponent {
  @Input() value = 0;                                    // paired input
  @Output() valueChange = new EventEmitter<number>();    // ⚠️ flagged — use model() instead
}
```

### Not flagged

```typescript
import { Component, Output, EventEmitter } from '@angular/core';

@Component({ selector: 'app-list', standalone: true, template: '' })
export class ListComponent {
  // No matching @Input() named `selection` — this is a plain event, not two-way binding
  @Output() selectionChange = new EventEmitter<string[]>();
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

Enable the plugin in `biome.json` (Biome plugins cannot be enabled per rule):

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

Biome plugins take no per-rule options; this rule's severity is fixed to `warn` inside
the rule itself.

## Further Reading

- [Angular model() signal docs](https://angular.dev/guide/signals/model)
- [Angular 17.2 release notes](https://blog.angular.dev/angular-v17-2-is-now-available-596cbe96242d)
