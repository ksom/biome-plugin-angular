# angular/contextual-lifecycle

**Category:** quality
**ESLint equivalent:** `@angular-eslint/contextual-lifecycle`
**Severity:** error

## Overview

Angular lifecycle hooks are only invoked for the class types that support them. Using a hook in the wrong context is a silent bug — Angular won't call it, and no error will be thrown.

`@Injectable` and `@Pipe` classes may only declare `ngOnDestroy` — Angular never calls any other lifecycle hook on them. `@Component` and `@Directive` classes support **all** hooks (directives do receive view and content hooks), so they are not checked by this rule.

### Context rules

| Hook | `@Component` | `@Directive` | `@Injectable` | `@Pipe` |
|------|:-----------:|:------------:|:-------------:|:-------:|
| `ngOnDestroy` | ✅ | ✅ | ✅ | ✅ |
| `ngOnInit` | ✅ | ✅ | ❌ | ❌ |
| `ngOnChanges` | ✅ | ✅ | ❌ | ❌ |
| `ngDoCheck` | ✅ | ✅ | ❌ | ❌ |
| `ngAfterContentInit` | ✅ | ✅ | ❌ | ❌ |
| `ngAfterContentChecked` | ✅ | ✅ | ❌ | ❌ |
| `ngAfterViewInit` | ✅ | ✅ | ❌ | ❌ |
| `ngAfterViewChecked` | ✅ | ✅ | ❌ | ❌ |

## Examples

### Flagged

```typescript
// ❌ view hook in an @Injectable — will never be called
@Injectable({ providedIn: 'root' })
export class UserStore {
  ngAfterViewInit() { ... }
}

// ❌ ngOnInit in a @Pipe — only ngOnDestroy is supported
@Pipe({ name: 'appTruncate' })
export class TruncatePipe {
  ngOnInit() { ... }
}
```

### Preferred

```typescript
// ✅ ngOnDestroy is the one hook Angular calls on @Injectable and @Pipe
@Injectable({ providedIn: 'root' })
export class UserStore {
  ngOnDestroy() { this.cleanup(); }
}

// ✅ all hooks are fine in @Component and @Directive
@Directive({ selector: '[appFoo]' })
export class FooDirective {
  ngAfterViewInit() { this.init(); }
}
```

## Known limitations

- Classes with an `implements` clause are not matched (GritQL metavariables cannot bind
  heritage clauses), so a violating `@Injectable` class declared as
  `class UserStore implements OnInit { ... }` is a **false negative**.
- Hooks are detected as bare identifiers inside the class body, so any signature shape
  is caught (`: void`, `async`, parameters).

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

Biome plugins take no per-rule options; this rule's severity is fixed to `error` inside
the rule itself.

## Further Reading

- [Angular lifecycle hooks docs](https://angular.dev/guide/components/lifecycle)
- [@angular-eslint/contextual-lifecycle](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/contextual-lifecycle.md)
