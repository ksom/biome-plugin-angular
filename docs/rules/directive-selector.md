# angular/directive-selector

**Category:** conventions
**ESLint equivalent:** `@angular-eslint/directive-selector`
**Severity:** warn

## Overview

Enforces that `@Directive` selectors follow the Angular CLI defaults:

- **Type:** attribute selector (`[...]`)
- **Style:** camelCase
- **Prefix:** `app` (hardcoded — see Configuration)

Comma-separated selector lists are accepted when every entry is valid.

## Examples

### Incorrect

```typescript
import { Directive } from '@angular/core';

@Directive({ selector: '[highlight]' })        // ⚠️ no prefix
export class Highlight {}

@Directive({ selector: '[app-highlight]' })    // ⚠️ kebab-case
export class Highlight {}

@Directive({ selector: 'app-highlight' })      // ⚠️ element selector
export class Highlight {}
```

### Correct

```typescript
import { Directive } from '@angular/core';

@Directive({ selector: '[appHighlight]' })
export class Highlight {}

@Directive({ selector: '[appTooltip], [appTooltipTop]' })
export class Tooltip {}
```

## Configuration

Biome plugins take no options, so the prefix is **not configurable**: it is hardcoded to
`app`. If your project uses a different prefix, copy
`rules/conventions/directive-selector.grit` into your project, adjust the regex, and
point your `plugins` array at the forked file.

Suppress a single occurrence with `// biome-ignore lint/plugin/directive-selector: reason` placed on
the line directly above the flagged code.

## Migration from @angular-eslint

Remove `"@angular-eslint/directive-selector"` from your ESLint config and enable the
plugin in `biome.json`:

```json
{
  "extends": ["biome-plugin-angular/presets/recommended.json"]
}
```

## Further Reading

- [Angular Style Guide — Directive selectors](https://angular.dev/style-guide)
- [@angular-eslint/directive-selector](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/directive-selector.md)
