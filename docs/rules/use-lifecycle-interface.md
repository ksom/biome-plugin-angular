# angular/use-lifecycle-interface

**Category:** quality
**ESLint equivalent:** `@angular-eslint/use-lifecycle-interface`
**Severity:** warn

## Overview

Classes that implement Angular lifecycle methods should explicitly declare the corresponding interface. This makes intent clear and catches method signature mistakes at compile time.

| Method | Required interface |
|--------|-------------------|
| `ngOnChanges` | `OnChanges` |
| `ngOnInit` | `OnInit` |
| `ngOnDestroy` | `OnDestroy` |
| `ngDoCheck` | `DoCheck` |
| `ngAfterContentInit` | `AfterContentInit` |
| `ngAfterContentChecked` | `AfterContentChecked` |
| `ngAfterViewInit` | `AfterViewInit` |
| `ngAfterViewChecked` | `AfterViewChecked` |

## Examples

### Flagged

```typescript
@Component({ selector: 'app-root', standalone: true, template: '' })
export class AppComponent {
  ngOnInit() {         // ⚠️ missing implements OnInit
    this.loadData();
  }
  ngOnDestroy() {      // ⚠️ missing implements OnDestroy
    this.sub.unsubscribe();
  }
}
```

### Preferred

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({ selector: 'app-root', standalone: true, template: '' })
export class AppComponent implements OnInit, OnDestroy {
  ngOnInit() {
    this.loadData();
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
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

- [Angular lifecycle hooks docs](https://angular.dev/guide/components/lifecycle)
- [@angular-eslint/use-lifecycle-interface](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/use-lifecycle-interface.md)
