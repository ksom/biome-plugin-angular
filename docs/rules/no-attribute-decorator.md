# angular/no-attribute-decorator

**Category:** quality
**ESLint equivalent:** `@angular-eslint/no-attribute-decorator`
**Severity:** warn

## Overview

Flags the `@Attribute()` parameter decorator. It only works on constructor parameters,
which ties the class to constructor injection and blocks the move to `inject()`. Since
Angular 17.4, `HostAttributeToken` reads the same static host attribute through
`inject()`.

## Examples

### Incorrect

```typescript
import { Attribute, Directive } from '@angular/core';

@Directive({ selector: '[appRole]' })
export class Role {
  constructor(@Attribute('role') private readonly role: string) {}   // ⚠️
}
```

### Correct

```typescript
import { Directive, HostAttributeToken, inject } from '@angular/core';

@Directive({ selector: '[appRole]' })
export class Role {
  private readonly role = inject(new HostAttributeToken('role'), { optional: true });
}
```

## Configuration

Suppress a single occurrence with `// biome-ignore lint/plugin/no-attribute-decorator: reason` placed on
the line directly above the flagged code.
The severity is fixed to `warn` inside the rule itself.

## Migration from @angular-eslint

Remove `"@angular-eslint/no-attribute-decorator"` from your ESLint config and enable the
plugin in `biome.json`:

```json
{
  "extends": ["biome-plugin-angular/presets/recommended.json"]
}
```

## Further Reading

- [Angular HostAttributeToken](https://angular.dev/api/core/HostAttributeToken)
- [@angular-eslint/no-attribute-decorator](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/no-attribute-decorator.md)
