# angular/contextual-lifecycle

**Category:** quality
**ESLint equivalent:** `@angular-eslint/contextual-lifecycle`
**Severity (recommended):** error

## Overview

Angular lifecycle hooks are only invoked for the class types that support them. Using a hook in the wrong context is a silent bug — Angular won't call it, and no error will be thrown.

### Context rules

| Hook | `@Component` | `@Directive` | `@Injectable` | `@Pipe` |
|------|:-----------:|:------------:|:-------------:|:-------:|
| `ngOnInit` | ✅ | ✅ | ✅ | ✅ |
| `ngOnDestroy` | ✅ | ✅ | ✅ | ✅ |
| `ngOnChanges` | ✅ | ✅ | ✅ | ❌ |
| `ngDoCheck` | ✅ | ✅ | ✅ | ❌ |
| `ngAfterContentInit` | ✅ | ✅ | ❌ | ❌ |
| `ngAfterContentChecked` | ✅ | ✅ | ❌ | ❌ |
| `ngAfterViewInit` | ✅ | ❌ | ❌ | ❌ |
| `ngAfterViewChecked` | ✅ | ❌ | ❌ | ❌ |

## Examples

### Flagged

```typescript
// ❌ view hooks in an Injectable
@Injectable({ providedIn: 'root' })
export class UserStore {
  ngAfterViewInit() { ... }  // will never be called
}

// ❌ view hook in a Directive
@Directive({ selector: '[appFoo]', standalone: true })
export class FooDirective {
  ngAfterViewInit() { ... }  // only @Component has a view
}
```

### Preferred

```typescript
// ✅ view hooks only in @Component
@Component({ selector: 'app-foo', standalone: true, template: '' })
export class FooComponent implements AfterViewInit {
  ngAfterViewInit() { this.chart.render(); }
}

// ✅ content hooks in @Directive are fine
@Directive({ selector: '[appFoo]', standalone: true })
export class FooDirective implements AfterContentInit {
  ngAfterContentInit() { this.init(); }
}
```

## Configuration

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/contextual-lifecycle": "error"
      }
    }
  }
}
```

## Further Reading

- [Angular lifecycle hooks docs](https://angular.dev/guide/components/lifecycle)
- [@angular-eslint/contextual-lifecycle](https://github.com/angular-eslint/angular-eslint/blob/main/packages/eslint-plugin/docs/rules/contextual-lifecycle.md)
