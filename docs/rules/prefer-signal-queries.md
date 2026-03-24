# angular/prefer-signal-queries

**Category:** modern (signal-based APIs)
**ESLint equivalent:** _(new rule — no direct ESLint equivalent)_
**Severity (recommended):** warn

## Overview

Prefer signal-based query functions over decorator-based query decorators. Signal queries (stable since Angular 17.2) are reactive — they return signals that update automatically, eliminating the need for `ngAfterViewInit` / `ngAfterContentInit` in many cases.

| Decorator | Signal equivalent |
|-----------|------------------|
| `@ViewChild(ref)` | `viewChild(ref)` / `viewChild.required(ref)` |
| `@ViewChildren(ref)` | `viewChildren(ref)` |
| `@ContentChild(ref)` | `contentChild(ref)` / `contentChild.required(ref)` |
| `@ContentChildren(ref)` | `contentChildren(ref)` |

## Examples

### Flagged

```typescript
import { Component, ViewChild, ContentChild, ElementRef, TemplateRef } from '@angular/core';

@Component({ selector: 'app-foo', standalone: true, template: '' })
export class FooComponent {
  @ViewChild('canvas') canvas!: ElementRef;        // ⚠️ use viewChild
  @ContentChild(TemplateRef) tpl?: TemplateRef;    // ⚠️ use contentChild
}
```

### Preferred

```typescript
import { Component, viewChild, contentChild, ElementRef, TemplateRef } from '@angular/core';

@Component({ selector: 'app-foo', standalone: true, template: '' })
export class FooComponent {
  canvas = viewChild.required<ElementRef>('canvas');
  tpl = contentChild(TemplateRef);
}
```

### Signal queries are reactive

```typescript
// No need for ngAfterViewInit — just use the signal in a computed/effect
chartData = viewChild.required<ChartComponent>('chart');
title = computed(() => this.chartData().title);
```

## Configuration

```json
{
  "linter": {
    "rules": {
      "plugins": {
        "angular/prefer-signal-queries": "warn"
      }
    }
  }
}
```

## Further Reading

- [Angular signal queries docs](https://angular.dev/guide/signals/queries)
- [Angular 17.2 release notes](https://blog.angular.dev/angular-v17-2-is-now-available-596cbe96242d)
