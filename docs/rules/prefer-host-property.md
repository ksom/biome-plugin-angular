# angular/prefer-host-property

**Category:** modern (signal-based APIs)
**ESLint equivalent:** INVERSE of `@angular-eslint/no-host-metadata-property`
**Severity:** warn

## Overview

Prefer the `host: {}` metadata in `@Component`/`@Directive` over `@HostBinding` and `@HostListener` decorators.

Angular now recommends co-locating host bindings with the component/directive decorator metadata. The `host: {}` object is more concise and keeps all metadata in one place. This is the **opposite** of the old `no-host-metadata-property` ESLint rule.

> **Note:** The original ESLint rule `@angular-eslint/no-host-metadata-property` said "use `@HostBinding`/`@HostListener` instead of `host: {}`". Angular has since reversed this recommendation — `host: {}` is now the preferred style.

## Examples

### Flagged

```typescript
import { Component, HostBinding, HostListener } from '@angular/core';

@Component({ selector: 'app-button', standalone: true, template: '' })
export class ButtonComponent {
  @HostBinding('class.active') isActive = false;    // ⚠️ use host: {}
  @HostListener('click') onClick() {                // ⚠️ use host: {}
    this.isActive = !this.isActive;
  }
}
```

### Preferred

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  template: '',
  host: {
    '[class.active]': 'isActive',
    '(click)': 'onClick()',
  },
})
export class ButtonComponent {
  isActive = false;
  onClick() { this.isActive = !this.isActive; }
}
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

- [Angular style guide — host property](https://angular.dev/style-guide#style-06-03)
- [Angular RFC #59522](https://github.com/angular/angular/discussions/59522)
