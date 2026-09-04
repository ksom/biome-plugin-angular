# angular/no-service-suffix

**Category:** conventions
**ESLint equivalent:** _(new rule — aligns with Angular v20+ style guide)_
**Severity:** warn

## Overview

Detects `@Injectable`-decorated classes whose name ends with `Service` and suggests
using a descriptive name that expresses the class's responsibility instead.

The check is decorator-gated: only classes decorated with `@Injectable` are flagged.
Plain TypeScript or NestJS classes named `*Service` are **not** flagged.

Every class shape is matched: `export`, `export default`, `extends`, generics and
`implements` clauses.

> "We're updating our style guide to no longer recommend adding suffixes like `Component`,
> `Directive`, `Service`, or `Pipe` to class names."
>
> — Angular team, [RFC #59522](https://github.com/angular/angular/discussions/59522)

The `Service` suffix is generic — it says *what the class is* in the Angular DI system
but not *what it does*. A descriptive name communicates intent immediately.

**Note:** Pipes are an exception — `@Pipe` classes keep their `Pipe` suffix because
the pipe name in templates is separate from the class name.

## Examples

### Flagged (old style)

```typescript
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {}    // ⚠️ what does it do?

@Injectable({ providedIn: 'root' })
export class AuthService {}    // ⚠️ what kind of auth?
```

### Preferred (Angular v20+ style)

Choose a name that expresses the responsibility:

```typescript
import { Injectable } from '@angular/core';

// State management
@Injectable({ providedIn: 'root' })
export class UserStore {}

// HTTP / external API
@Injectable({ providedIn: 'root' })
export class UserApi {}

@Injectable({ providedIn: 'root' })
export class UserClient {}

// Facade over a feature module
@Injectable({ providedIn: 'root' })
export class UserFacade {}

// Auth — more specific
@Injectable({ providedIn: 'root' })
export class TokenManager {}

@Injectable({ providedIn: 'root' })
export class SessionStore {}
```

## Naming guide

| Old name | Responsibility | Suggested name |
| -------- | -------------- | -------------- |
| `UserService` | HTTP calls | `UserApi`, `UserClient` |
| `UserService` | State management | `UserStore` |
| `UserService` | Business logic | `UserFacade`, `UserManager` |
| `AuthService` | Token handling | `TokenManager`, `AuthSession` |
| `LoggerService` | Logging | `Logger`, `AppLogger` |
| `RouterService` | Navigation | `Navigation`, `AppRouter` |

## Severity rationale

Ships with a fixed `warn` severity because renaming services is a significant migration
effort in large codebases. Biome plugins take no options, so the severity cannot be
changed in `biome.json`; to enforce it as an error, fork the `.grit` file and remove
the `severity = "warn"` argument.

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

## Further Reading

- [Angular Style Guide (v20+)](https://angular.dev/style-guide)
- [Angular RFC #59522 — Class naming](https://github.com/angular/angular/discussions/59522)
