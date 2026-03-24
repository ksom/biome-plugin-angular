# angular/no-component-suffix

**Category:** conventions
**ESLint equivalent:** _(new rule — no ESLint equivalent, aligns with Angular v20+ style guide)_
**Severity (recommended):** warn

## Overview

Detects `@Component`-decorated classes whose name ends with `Component` and suggests
removing the suffix. This rule reflects the **Angular v20+ style guide** update that
recommends naming classes after the concept they represent rather than their Angular role.

> "We're updating our style guide to no longer recommend adding suffixes like `Component`,
> `Directive`, `Service`, or `Pipe` to class names."
>
> — Angular team, [RFC #59522](https://github.com/angular/angular/discussions/59522)

## Examples

### Flagged (old style)

```typescript
import { Component } from '@angular/core';

@Component({ selector: 'app-root', standalone: true, template: '' })
export class AppComponent {}        // ⚠️ suffix is redundant

@Component({ selector: 'app-header', standalone: true, template: '' })
export class HeaderComponent {}     // ⚠️ suffix is redundant
```

### Preferred (Angular v20+ style)

```typescript
import { Component } from '@angular/core';

@Component({ selector: 'app-root', standalone: true, template: '' })
export class App {}

@Component({ selector: 'app-header', standalone: true, template: '' })
export class Header {}

@Component({ selector: 'app-user-profile', standalone: true, template: '' })
export class UserProfile {}
```

## Migration strategy

Run an automated rename across the project:

```bash
# Example using sed (adjust for your project structure)
find src -name '*.ts' | xargs sed -i 's/class \([A-Z][A-Za-z]*\)Component/class \1/g'
```

Or use the Angular DevKit schematic when available:

```bash
ng generate @angular/core:remove-class-suffixes
```

## Severity rationale

This rule ships as `warn` (not `error`) in the `recommended` preset because many
existing Angular projects use the old naming convention. The goal is to nudge teams
during migration, not to block builds.

Set it to `error` in the `strict` preset or when starting a new Angular v20+ project:

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/no-component-suffix": "error"
      }
    }
  }
}
```

## Relationship with removed rules

This rule **replaces** `angular/component-class-suffix` and
`angular/directive-class-suffix`, which enforced the *opposite* convention.
Those rules have been removed from this plugin as of Angular v20+.

## Further Reading

- [Angular Style Guide (v20+)](https://angular.dev/style-guide)
- [Angular RFC #59522 — Class naming](https://github.com/angular/angular/discussions/59522)
