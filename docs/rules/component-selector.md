# angular/component-selector

**Category:** conventions
**ESLint equivalent:** `@angular-eslint/component-selector`
**Severity:** warn

## Overview

Enforces that `@Component` selectors follow the Angular Style Guide conventions:

- **Type:** element selector (not attribute `[...]` or class `.`)
- **Style:** kebab-case
- **Prefix:** must start with `app-` (hardcoded — see Configuration)

These conventions ensure selectors are consistent, predictable, and avoid collisions
with native HTML elements. Comma-separated selector lists (`'app-a, app-b'`) are accepted
when every entry is valid.

## Examples

### Incorrect

```typescript
import { Component } from '@angular/core';

// PascalCase — no prefix, no dashes
@Component({ selector: 'Root', standalone: true, template: '' })
export class AppComponent {}

// camelCase — not kebab
@Component({ selector: 'appRoot', standalone: true, template: '' })
export class AppComponent {}

// wrong prefix
@Component({ selector: 'my-root', standalone: true, template: '' })
export class AppComponent {}

// attribute selector (not element)
@Component({ selector: '[appRoot]', standalone: true, template: '' })
export class AppComponent {}
```

### Correct

```typescript
import { Component } from '@angular/core';

@Component({ selector: 'app-root', standalone: true, template: '' })
export class AppComponent {}

@Component({ selector: 'app-user-profile', standalone: true, template: '' })
export class UserProfileComponent {}

@Component({ selector: 'app-step2-form', standalone: true, template: '' })
export class Step2FormComponent {}
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

Biome plugins take no options, so the prefix is **not configurable**: it is hardcoded to
`app`. If your project uses a different prefix (e.g. `acme-`, or `mat-` for a library),
copy `rules/conventions/component-selector.grit` into your project, adjust the regex, and
point your `plugins` array at the forked file.

The severity is fixed to `warn` inside the rule itself.

## Migration from @angular-eslint

Remove `"@angular-eslint/component-selector"` from your ESLint config and enable the
plugin as shown above.

## Further Reading

- [Angular Style Guide — Component selectors](https://angular.dev/style-guide#component-selectors)
- [@angular-eslint/component-selector](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/component-selector.md)
