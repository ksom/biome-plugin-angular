# angular/no-input-rename

**Category:** conventions
**ESLint equivalent:** `@angular-eslint/no-input-rename`
**Severity:** error

## Overview

Disallows renaming `@Input()` properties via the decorator argument. Providing an alias
creates a disconnect between the component's internal property name and its public API,
making the component harder to use and the codebase harder to search.

**Detected forms:**
- `@Input('alias')` — string argument
- `@Input({ alias: 'name' })` — alias key in options object
- `input(default, { alias })`, `input.required({ alias })`, `model(default, { alias })`,
  `model.required({ alias })` — signal inputs, with or without type arguments

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

```typescript
value = input<string>('', { alias: 'externalValue' });   // ❌ aliased signal input
count = input.required<number>({ alias: 'cnt' });        // ❌
name = model('', { alias: 'nm' });                        // ❌

value = input('');                                        // ✅
count = input.required<number>();                         // ✅
```

## Why avoid renaming?

- Property names become searchable across the codebase
- Template bindings like `[name]="user"` are self-documenting
- Refactoring is simpler when the binding name matches the property name
- Avoids confusion when reading component API documentation

## Migration from @angular-eslint

Remove `"@angular-eslint/no-input-rename"` from your ESLint config and enable the
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

- [Angular Input properties](https://angular.dev/guide/components/inputs)
- [@angular-eslint/no-input-rename](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-input-rename.md)
