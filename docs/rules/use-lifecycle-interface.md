# angular/use-lifecycle-interface

**Category:** quality
**ESLint equivalent:** `@angular-eslint/use-lifecycle-interface`
**Severity (recommended):** warn

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

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/use-lifecycle-interface": "warn"
      }
    }
  }
}
```

## Further Reading

- [Angular lifecycle hooks docs](https://angular.dev/guide/components/lifecycle)
- [@angular-eslint/use-lifecycle-interface](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/use-lifecycle-interface.md)
