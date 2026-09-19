# biome-plugin-angular

[![npm version](https://img.shields.io/npm/v/biome-plugin-angular.svg)](https://www.npmjs.com/package/biome-plugin-angular)
[![CI](https://github.com/ksom/biome-plugin-angular/actions/workflows/ci.yml/badge.svg)](https://github.com/ksom/biome-plugin-angular/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/ksom/biome-plugin-angular/graph/badge.svg)](https://codecov.io/gh/ksom/biome-plugin-angular)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js >=18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)

> Biome 2.5+ plugin that ports `@angular-eslint` rules to GritQL and adds signal-era
> Angular rules. For Angular 17-22 projects migrating from ESLint to Biome.

---

## Features

- 26 GritQL rules for the Biome 2.5+ plugin system
- Ports the `@angular-eslint` recommended TypeScript rules and the most-used extras
- Signal-era rules: `input()`, `output()`, `model()`, signal queries, `inject()`, `host: {}`
- Rules cover every real-world class shape (`implements`, `extends`, `export default`,
  `readonly` members, parameter decorators, modifiers)
- An **Angular-safe preset**: enables parameter decorators, turns off the Biome rule that
  breaks Angular DI, and scopes the plugin to `.ts` files
- Safe auto-fix for empty lifecycle methods; pointers to the official Angular schematics
  for the larger migrations
- CLI helper: `biome-angular init|merge|remove|rules`
- Every rule verified against the real Biome binary (integration + packed-package tests)
- Zero runtime dependencies

---

## Requirements

| Tool              | Version   |
| ----------------- | --------- |
| Node.js           | >= 18     |
| `@biomejs/biome`  | >= 2.5.0  |
| Angular           | >= 17     |

---

## Installation

```bash
npm install --save-dev biome-plugin-angular @biomejs/biome
```

---

## Getting Started

### Option A — CLI

```bash
# Create a biome.json from scratch
npx biome-angular init

# Or add the plugin to your existing biome.json
npx biome-angular merge
```

### Option B — Manual configuration

Extend the shipped preset from your `biome.json`:

```jsonc
{
  "extends": ["biome-plugin-angular/presets/recommended.json"]
}
```

The preset is the recommended path because it also applies three settings that any
Angular project needs from Biome itself:

```jsonc
{
  "plugins": [
    // Biome resolves plugin entries as paths relative to the config file.
    // The plugin runs on TypeScript only and skips spec files.
    { "path": "./node_modules/biome-plugin-angular", "includes": ["**/*.ts", "!**/*.spec.ts"] }
  ],
  "javascript": {
    // Angular constructors use parameter decorators (@Inject, @Optional, @Attribute…).
    // Biome reports them as a parse error — and skips the file — unless this is on.
    "parser": { "unsafeParameterDecoratorsEnabled": true }
  },
  "linter": {
    "rules": {
      // Biome's recommended useImportType rewrites `import { HttpClient }` to
      // `import type { HttpClient }` when the token is only used as a constructor
      // parameter type. Angular then fails to build with NG2003 ("No suitable
      // injection token"). Biome's own docs recommend disabling it for Angular.
      "style": { "useImportType": "off" }
    }
  }
}
```

If you prefer to list the plugin yourself, copy the block above rather than only the
`plugins` entry.

### Running

```bash
npx biome lint            # report
npx biome lint --write    # also apply safe fixes (empty lifecycle methods are removed)
```

### Suppressing a diagnostic

Every message starts with its rule name in brackets. Use that name in a suppression
comment placed on the line **directly above the flagged code**. For a diagnostic on the
class name, that is between the decorator and the `class` keyword:

```typescript
@Component({ selector: 'app-legacy', template: '' })
// biome-ignore lint/plugin/no-component-suffix: legacy naming kept on purpose
export class LegacyComponent {
  // biome-ignore lint/plugin/prefer-signal-inputs: migrated in a later PR
  @Input() name = '';
}
```

A diagnostic inside the decorator (`prefer-standalone`, `component-selector`…) takes the
comment above the decorator. `// biome-ignore-all lint/plugin/<rule>: reason` at the top
of a file suppresses the rule for the whole file.

### Severities

Biome has no per-rule severity configuration for plugins — each rule's severity is fixed
inside its `.grit` file (`register_diagnostic`). Rules about correctness report
**errors**; convention and migration rules report **warnings**. To change a severity or
disable a rule, copy the `.grit` files you want from the package and list them
individually:

```jsonc
{
  "plugins": [
    "./node_modules/biome-plugin-angular/rules/high-priority/prefer-standalone.grit",
    "./node_modules/biome-plugin-angular/rules/conventions/no-input-rename.grit"
  ]
}
```

---

## Rules

### High Priority

| Rule | ESLint equivalent | Severity | Fix | Notes |
| ---- | ----------------- | :------: | :-: | ----- |
| [`prefer-standalone`](docs/rules/prefer-standalone.md) | `@angular-eslint/prefer-standalone` | error | | flags only explicit `standalone: false`; migrate with `ng generate @angular/core:standalone` |
| [`no-empty-lifecycle-method`](docs/rules/no-empty-lifecycle-method.md) | `@angular-eslint/no-empty-lifecycle-method` | warn | safe | deletes the method when its interface is not implemented; otherwise asks to remove both |

### Conventions

| Rule | ESLint equivalent | Severity | Notes |
| ---- | ----------------- | :------: | ----- |
| [`no-component-suffix`](docs/rules/no-component-suffix.md) | _(new — Angular v20+)_ | warn | decorator-gated |
| [`no-directive-suffix`](docs/rules/no-directive-suffix.md) | _(new — Angular v20+)_ | warn | decorator-gated |
| [`no-service-suffix`](docs/rules/no-service-suffix.md) | _(new — Angular v20+)_ | warn | decorator-gated |
| [`component-selector`](docs/rules/component-selector.md) | `@angular-eslint/component-selector` | warn | `app-` prefix hardcoded* |
| [`directive-selector`](docs/rules/directive-selector.md) | `@angular-eslint/directive-selector` | warn | `[appCamelCase]`, prefix hardcoded* |
| [`no-input-rename`](docs/rules/no-input-rename.md) | `@angular-eslint/no-input-rename` | error | decorator and `input()`/`model()` aliases |
| [`no-output-rename`](docs/rules/no-output-rename.md) | `@angular-eslint/no-output-rename` | error | decorator and `output()` aliases |
| [`no-output-on-prefix`](docs/rules/no-output-on-prefix.md) | `@angular-eslint/no-output-on-prefix` | error | decorator and `output()` |
| [`no-output-native`](docs/rules/no-output-native.md) | `@angular-eslint/no-output-native` | error | decorator and `output()` |
| [`pipe-prefix`](docs/rules/pipe-prefix.md) | `@angular-eslint/pipe-prefix` | warn | `app` prefix hardcoded* |

### Quality

| Rule | ESLint equivalent | Severity | Notes |
| ---- | ----------------- | :------: | ----- |
| [`use-lifecycle-interface`](docs/rules/use-lifecycle-interface.md) | `@angular-eslint/use-lifecycle-interface` | warn | per class |
| [`use-pipe-transform-interface`](docs/rules/use-pipe-transform-interface.md) | `@angular-eslint/use-pipe-transform-interface` | warn | per class |
| [`contextual-lifecycle`](docs/rules/contextual-lifecycle.md) | `@angular-eslint/contextual-lifecycle` | error | |
| [`no-conflicting-lifecycle`](docs/rules/no-conflicting-lifecycle.md) | `@angular-eslint/no-conflicting-lifecycle` | error | `ngDoCheck` + `ngOnChanges` |
| [`no-lifecycle-call`](docs/rules/no-lifecycle-call.md) | `@angular-eslint/no-lifecycle-call` | error | `super.ngXxx()` allowed |
| [`no-async-lifecycle-method`](docs/rules/no-async-lifecycle-method.md) | `@angular-eslint/no-async-lifecycle-method` | warn | |
| [`no-pipe-impure`](docs/rules/no-pipe-impure.md) | `@angular-eslint/no-pipe-impure` | warn | |
| [`no-attribute-decorator`](docs/rules/no-attribute-decorator.md) | `@angular-eslint/no-attribute-decorator` | warn | suggests `HostAttributeToken` |

### Modern (Angular 17+)

| Rule | ESLint equivalent | Severity | Notes |
| ---- | ----------------- | :------: | ----- |
| [`prefer-signal-inputs`](docs/rules/prefer-signal-inputs.md) | _(new)_ | warn | Angular 17.1+, `ng generate @angular/core:signal-input-migration` |
| [`prefer-output-function`](docs/rules/prefer-output-function.md) | _(new)_ | warn | Angular 17.3+, `ng generate @angular/core:output-migration` |
| [`prefer-signal-queries`](docs/rules/prefer-signal-queries.md) | _(new)_ | warn | Angular 17.2+, `ng generate @angular/core:signal-queries-migration` |
| [`prefer-model-signal`](docs/rules/prefer-model-signal.md) | _(new)_ | warn | Angular 17.2+, requires paired `@Input()` |
| [`prefer-host-property`](docs/rules/prefer-host-property.md) | _(new)_ | warn | |
| [`prefer-inject-function`](docs/rules/prefer-inject-function.md) | `@angular-eslint/prefer-inject` | warn | any constructor parameter, `ng generate @angular/core:inject` |

\* Biome plugins take no options, so the selector/pipe prefix cannot be configured.
Projects not using the Angular CLI default `app` prefix should copy and adapt the `.grit`
file.

### Auto-fix and migrations

Biome 2.5 plugins can rewrite code. This plugin only ships a rewrite where it is
mechanical and safe: `no-empty-lifecycle-method` deletes an empty hook when the class does
not implement the matching interface (when it does, deleting the method alone would fail
compilation with TS2420, so the diagnostic asks to remove both). The other migrations
change templates or module declarations as well, so the rules point to the official
Angular schematics instead, which handle both sides.

Biome caveat (2.5.12): plugin rewrites are applied per file. When one empty hook in a file
is fixed, a `biome-ignore` comment on another empty hook **in the same file** does not
protect it from `--write`. Prefer `biome-ignore-all` on that file, or give the hook a
statement, until Biome resolves this.

The official schematics:

```bash
ng generate @angular/core:standalone
ng generate @angular/core:inject
ng generate @angular/core:signal-input-migration
ng generate @angular/core:output-migration
ng generate @angular/core:signal-queries-migration
```

### Skipped rules

`component-class-suffix` and `directive-class-suffix` are intentionally not ported: the
Angular v20+ style guide dropped class suffixes, and the inverse rules
(`no-*-suffix`) are shipped instead. See [`rules-to-migrate.json`](rules-to-migrate.json)
for the reasoning behind every skipped rule.

---

## CLI Reference

```
biome-angular init [--force]
  Create a new biome.json that extends biome-plugin-angular/presets/recommended.json.
  --force    Overwrite existing biome.json

biome-angular merge
  Add the preset to the "extends" array of your existing biome.json.

biome-angular remove
  Remove the plugin from biome.json ("extends" and "plugins" forms, plus config
  written by pre-1.0 versions of this CLI).

biome-angular rules
  Print all available rules and their implementation status.
```

---

## Migration from @angular-eslint

If you are migrating from ESLint + `@angular-eslint`, you can remove the following packages
once the corresponding rules are available in this plugin:

```bash
npm uninstall eslint @angular-eslint/eslint-plugin @angular-eslint/template-parser
```

Note: this plugin covers TypeScript rules only. `@angular-eslint/template-*`
(HTML template) rules have no Biome equivalent yet, and Biome does not lint Angular
templates.

See [`rules-to-migrate.json`](rules-to-migrate.json) for the full migration tracking list.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

[MIT](LICENSE)
