# angular/no-empty-lifecycle-method

**Category:** high-priority
**ESLint equivalent:** `@angular-eslint/no-empty-lifecycle-method`
**Severity (recommended):** warn

## Overview

Disallows implementing Angular lifecycle interfaces with empty method bodies.
Empty lifecycle methods add noise, mislead readers into expecting side effects,
and should simply be omitted.

## Covered lifecycle hooks

| Method                  | Interface                 |
| ----------------------- | ------------------------- |
| `ngOnInit`              | `OnInit`                  |
| `ngOnDestroy`           | `OnDestroy`               |
| `ngOnChanges`           | `OnChanges`               |
| `ngDoCheck`             | `DoCheck`                 |
| `ngAfterContentInit`    | `AfterContentInit`        |
| `ngAfterContentChecked` | `AfterContentChecked`     |
| `ngAfterViewInit`       | `AfterViewInit`           |
| `ngAfterViewChecked`    | `AfterViewChecked`        |

## Examples

### Incorrect

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({ selector: 'app-root', standalone: true, template: '' })
export class AppComponent implements OnInit, OnDestroy {
  ngOnInit() {}      // empty — remove it

  ngOnDestroy() {}   // empty — remove it
}
```

### Correct

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({ selector: 'app-root', standalone: true, template: '' })
export class AppComponent implements OnInit, OnDestroy {
  private sub!: Subscription;

  ngOnInit() {
    this.sub = interval(1000).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
```

```typescript
import { Component } from '@angular/core';

// No lifecycle method at all — perfectly fine
@Component({ selector: 'app-root', standalone: true, template: '' })
export class AppComponent {
  title = 'hello';
}
```

## Note on comments

A method body containing only comments (no statements) is treated as empty by this rule,
consistent with the original `@angular-eslint` behavior.

## Migration from @angular-eslint

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/no-empty-lifecycle-method": "warn"
      }
    }
  }
}
```

## Further Reading

- [Angular Lifecycle hooks](https://angular.dev/guide/components/lifecycle)
- [@angular-eslint/no-empty-lifecycle-method](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-empty-lifecycle-method.md)
