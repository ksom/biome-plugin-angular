# angular/prefer-inject-function

**Category:** modern (signal-based APIs)
**ESLint equivalent:** `@angular-eslint/prefer-inject`
**Severity:** warn

## Overview

Prefer the `inject()` function over constructor-based dependency injection. The `inject()` function (stable since Angular 14, recommended in Angular 16+) works in any injection context and avoids lengthy constructor parameter lists.

**Detection:** flags any constructor that takes at least one parameter inside a class decorated with `@Component`, `@Directive`, `@Injectable`, or `@Pipe` — Angular injects every constructor parameter of those classes, with or without an access modifier. Plain TypeScript or NestJS classes using parameter properties are **not** flagged. Every class shape is matched (`export`, `extends`, `implements`…).

**Migration:** Angular ships a schematic that rewrites constructor injection to `inject()` calls, including `@Inject`, `@Optional`, `@Self` and `@Attribute` parameters:

```bash
ng generate @angular/core:inject
```

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

- [Angular inject() docs](https://angular.dev/api/core/inject)
- [Angular 16 inject() in components](https://blog.angular.dev/angular-v16-is-here-4d7a28ec680d)
