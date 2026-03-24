# angular/prefer-inject-function

**Category:** modern (signal-based APIs)
**ESLint equivalent:** _(new rule — no direct ESLint equivalent)_
**Severity (recommended):** warn

## Overview

Prefer the `inject()` function over constructor-based dependency injection. The `inject()` function (stable since Angular 14, recommended in Angular 16+) works in any injection context and avoids lengthy constructor parameter lists.

**Detection:** flags constructors with access-modifier parameters (`private`, `protected`, `public`, `readonly`) — the classic Angular DI pattern.

Benefits:
- Works in functional injection contexts (guards, resolvers, interceptors)
- Reduces constructor boilerplate
- Easier tree-shaking — unused services aren't pulled in
- Consistent with signal-based APIs (`input()`, `output()`, `inject()` all follow the same pattern)
- Enables `class { }` bodies without constructors

## Examples

### Flagged

```typescript
import { Component } from '@angular/core';
import { UserStore } from './user.store';
import { Router } from '@angular/router';

@Component({ selector: 'app-foo', standalone: true, template: '' })
export class FooComponent {
  constructor(              // ⚠️ use inject()
    private userStore: UserStore,
    private router: Router,
  ) {}
}
```

### Preferred

```typescript
import { Component, inject } from '@angular/core';
import { UserStore } from './user.store';
import { Router } from '@angular/router';

@Component({ selector: 'app-foo', standalone: true, template: '' })
export class FooComponent {
  private userStore = inject(UserStore);
  private router = inject(Router);
}
```

### inject() in functional contexts

```typescript
// Route guard — no class needed
export const authGuard = () => {
  const auth = inject(AuthStore);
  return auth.isLoggedIn() ? true : inject(Router).createUrlTree(['/login']);
};
```

## Configuration

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/prefer-inject-function": "warn"
      }
    }
  }
}
```

## Further Reading

- [Angular inject() docs](https://angular.dev/api/core/inject)
- [Angular 16 inject() in components](https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d)
