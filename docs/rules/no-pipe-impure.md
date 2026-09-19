# angular/no-pipe-impure

**Category:** quality
**ESLint equivalent:** `@angular-eslint/no-pipe-impure`
**Severity:** warn

## Overview

Flags `@Pipe({ pure: false })`. An impure pipe runs on **every** change-detection cycle
instead of only when its inputs change, which is one of the most common Angular
performance pitfalls. Most impure pipes can be replaced by a pure pipe over an immutable
input, or by computing the value in the component (a `computed()` signal is ideal).

## Examples

### Incorrect

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'appFilter', pure: false })    // ⚠️ runs on every cycle
export class FilterPipe implements PipeTransform {
  transform(items: Item[], term: string) {
    return items.filter((i) => i.name.includes(term));
  }
}
```

### Correct

```typescript
import { Component, computed, input } from '@angular/core';

@Component({ selector: 'app-list', template: '@for (i of filtered(); track i.id) { … }' })
export class List {
  readonly items = input<Item[]>([]);
  readonly term = input('');
  readonly filtered = computed(() => this.items().filter((i) => i.name.includes(this.term())));
}
```

## Configuration

Suppress a single occurrence with `// biome-ignore lint/plugin/no-pipe-impure: reason` placed on
the line directly above the flagged code
(for example on a pipe that genuinely depends on external mutable state).
The severity is fixed to `warn` inside the rule itself.

## Migration from @angular-eslint

Remove `"@angular-eslint/no-pipe-impure"` from your ESLint config and enable the plugin
in `biome.json`:

```json
{
  "extends": ["biome-plugin-angular/presets/recommended.json"]
}
```

## Further Reading

- [Angular Pipes — pure and impure](https://angular.dev/guide/templates/pipes#change-detection-with-pipes)
- [@angular-eslint/no-pipe-impure](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-pipe-impure.md)
