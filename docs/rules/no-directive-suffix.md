# angular/no-directive-suffix

**Category:** conventions
**ESLint equivalent:** _(new rule — aligns with Angular v20+ style guide)_
**Severity (recommended):** warn

## Overview

Detects `@Directive`-decorated classes whose name ends with `Directive` and suggests
removing the suffix. This rule is the directive counterpart of `angular/no-component-suffix`
and reflects the **Angular v20+ style guide** update.

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

Ships as `warn` in `recommended` to ease migration of existing codebases.
Use `error` in `strict` or for new Angular v20+ projects.

## Migration from @angular-eslint

If you previously used `@angular-eslint/directive-class-suffix` (which enforced the
*opposite* convention), remove it and add this rule instead:

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/no-directive-suffix": "warn"
      }
    }
  }
}
```

## Further Reading

- [Angular Style Guide (v20+)](https://angular.dev/style-guide)
- [Angular RFC #59522 — Class naming](https://github.com/angular/angular/discussions/59522)
