# angular/no-directive-suffix

**Category:** conventions
**ESLint equivalent:** _(new rule — aligns with Angular v20+ style guide)_
**Severity:** warn

## Overview

Detects `@Directive`-decorated classes whose name ends with `Directive` and suggests
removing the suffix. This rule is the directive counterpart of `angular/no-component-suffix`
and reflects the **Angular v20+ style guide** update.

The check is decorator-gated: only classes decorated with `@Directive` are flagged.
Plain TypeScript classes named `*Directive` are **not** flagged.

Every class shape is matched: `export`, `export default`, `extends`, generics and
`implements` clauses.

> "We're updating our style guide to no longer recommend adding suffixes like `Component`,
> `Directive`, `Service`, or `Pipe` to class names."
>
> — Angular team, [RFC #59522](https://github.com/angular/angular/discussions/59522)

**Note:** Pipes are an exception — `@Pipe` classes should keep their `Pipe` suffix because
pipe names in templates (e.g. `| appTruncate`) are separate from class names, and the
suffix prevents confusion.

## Examples

### Flagged (old style)

```typescript
import { Directive } from '@angular/core';

@Directive({ selector: '[appHighlight]', standalone: true })
export class HighlightDirective {}    // ⚠️ suffix is redundant

@Directive({ selector: '[appAutoFocus]', standalone: true })
export class AutoFocusDirective {}    // ⚠️ suffix is redundant
```

### Preferred (Angular v20+ style)

```typescript
import { Directive } from '@angular/core';

@Directive({ selector: '[appHighlight]', standalone: true })
export class Highlight {}

@Directive({ selector: '[appAutoFocus]', standalone: true })
export class AutoFocus {}

@Directive({ selector: '[appClickOutside]', standalone: true })
export class ClickOutside {}
```

## Severity rationale

Ships with a fixed `warn` severity to ease migration of existing codebases. Biome
plugins take no options, so the severity cannot be changed in `biome.json`; to enforce
it as an error, fork the `.grit` file and remove the `severity = "warn"` argument.

## Migration from @angular-eslint

If you previously used `@angular-eslint/directive-class-suffix` (which enforced the
*opposite* convention), remove it and enable the plugin in `biome.json`:

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

## Further Reading

- [Angular Style Guide (v20+)](https://angular.dev/style-guide)
- [Angular RFC #59522 — Class naming](https://github.com/angular/angular/discussions/59522)
