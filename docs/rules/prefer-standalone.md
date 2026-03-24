# angular/prefer-standalone

**Category:** high-priority
**ESLint equivalent:** `@angular-eslint/prefer-standalone`
**Severity (recommended):** error

## Overview

Enforces that Angular components, directives, and pipes declare `standalone: true` in their
decorator metadata. This rule is critical for Angular 17+ projects migrating away from
NgModule-based architecture.

In Angular 19, `standalone: true` is the default, but this rule still flags explicit
`standalone: false` declarations (which opt back into the NgModule system).

## Examples

### Incorrect

```typescript
import { Component } from '@angular/core';

// Missing standalone: true
@Component({
  selector: 'app-root',
  template: '<h1>Hello</h1>',
})
export class AppComponent {}
```

```typescript
import { Component } from '@angular/core';

// Explicitly opting out
@Component({
  selector: 'app-root',
  standalone: false,
  template: '<h1>Hello</h1>',
})
export class AppComponent {}
```

```typescript
import { Directive } from '@angular/core';

@Directive({ selector: '[appHighlight]' })
export class HighlightDirective {}
```

### Correct

```typescript
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: '<h1>Hello</h1>',
})
export class AppComponent {}
```

```typescript
import { Directive } from '@angular/core';

@Directive({ selector: '[appHighlight]', standalone: true })
export class HighlightDirective {}
```

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number): string {
    return value.substring(0, limit);
  }
}
```

## Migration from @angular-eslint

Replace `"@angular-eslint/prefer-standalone": "error"` with the Biome rule in your `biome.json`:

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/prefer-standalone": "error"
      }
    }
  }
}
```

## Further Reading

- [Angular Standalone Components Guide](https://angular.dev/guide/components/importing)
- [@angular-eslint/prefer-standalone](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/prefer-standalone.md)
