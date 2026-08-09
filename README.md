# biome-plugin-angular

[![npm version](https://img.shields.io/npm/v/biome-plugin-angular.svg)](https://www.npmjs.com/package/biome-plugin-angular)
[![CI](https://github.com/ksom/biome-plugin-angular/actions/workflows/ci.yml/badge.svg)](https://github.com/ksom/biome-plugin-angular/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/ksom/biome-plugin-angular/graph/badge.svg)](https://codecov.io/gh/ksom/biome-plugin-angular)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js >=18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)

> Biome 2.x plugin that ports `@angular-eslint` rules to GritQL and adds modern Angular signal-based rules.
> For Angular 17-21 projects migrating from ESLint to Biome.

---

## Features

- 19 GritQL rules for the Biome 2.x plugin system
- Ports the most-used `@angular-eslint` rules
- 6 rules for modern Angular (signals, inject, host properties)
- CLI helper: `biome-angular init|merge|remove|rules`
- Every rule verified against the real Biome binary (integration + packed-package tests)
- Zero runtime dependencies

---

## Requirements

| Tool              | Version   |
| ----------------- | --------- |
| Node.js           | >= 18     |
| `@biomejs/biome`  | >= 2.4.8  |
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

Add the plugin to your `biome.json`. Biome resolves plugin entries as **paths
relative to the config file** (not npm package names), so reference the
installed package directory:

```jsonc
{
  "plugins": ["./node_modules/biome-plugin-angular"]
}
```

Or extend the shipped preset (which contains exactly that plugins entry):

```jsonc
{
  "extends": ["biome-plugin-angular/presets/recommended.json"]
}
```

Biome loads `biome-manifest.jsonc` from the plugin directory and activates all
19 rules.

### Severities

Biome has no per-rule severity configuration for plugins — each rule's severity
is fixed inside its `.grit` file (`register_diagnostic`). Rules about correctness
(`no-input-rename`, `no-output-rename`, `no-output-on-prefix`,
`prefer-standalone`, `contextual-lifecycle`) report **errors**; convention and
migration rules report **warnings**. To change a severity or disable a rule,
copy the `.grit` files you want from the package and list them individually:

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

| Rule | ESLint equivalent | Severity | Notes |
| ---- | ----------------- | :------: | ----- |
| [`prefer-standalone`](docs/rules/prefer-standalone.md) | `@angular-eslint/prefer-standalone` | error | flags only explicit `standalone: false` |
| [`no-empty-lifecycle-method`](docs/rules/no-empty-lifecycle-method.md) | `@angular-eslint/no-empty-lifecycle-method` | warn | |

### Conventions

| Rule | ESLint equivalent | Severity | Notes |
| ---- | ----------------- | :------: | ----- |
| [`no-component-suffix`](docs/rules/no-component-suffix.md) | _(new — Angular v20+)_ | warn | decorator-gated |
| [`no-directive-suffix`](docs/rules/no-directive-suffix.md) | _(new — Angular v20+)_ | warn | decorator-gated |
| [`no-service-suffix`](docs/rules/no-service-suffix.md) | _(new — Angular v20+)_ | warn | decorator-gated |
| [`component-selector`](docs/rules/component-selector.md) | `@angular-eslint/component-selector` | warn | `app` prefix hardcoded* |
| [`no-input-rename`](docs/rules/no-input-rename.md) | `@angular-eslint/no-input-rename` | error | |
| [`no-output-rename`](docs/rules/no-output-rename.md) | `@angular-eslint/no-output-rename` | error | |
| [`no-output-on-prefix`](docs/rules/no-output-on-prefix.md) | `@angular-eslint/no-output-on-prefix` | error | |
| [`pipe-prefix`](docs/rules/pipe-prefix.md) | `@angular-eslint/pipe-prefix` | warn | `app` prefix hardcoded* |

### Quality

| Rule | ESLint equivalent | Severity | Notes |
| ---- | ----------------- | :------: | ----- |
| [`use-lifecycle-interface`](docs/rules/use-lifecycle-interface.md) | `@angular-eslint/use-lifecycle-interface` | warn | |
| [`use-pipe-transform-interface`](docs/rules/use-pipe-transform-interface.md) | `@angular-eslint/use-pipe-transform-interface` | warn | per-file check |
| [`contextual-lifecycle`](docs/rules/contextual-lifecycle.md) | `@angular-eslint/contextual-lifecycle` | error | |

### Modern (Angular 17+)

| Rule | ESLint equivalent | Severity | Notes |
| ---- | ----------------- | :------: | ----- |
| [`prefer-signal-inputs`](docs/rules/prefer-signal-inputs.md) | _(new)_ | warn | Angular 17.1+ |
| [`prefer-output-function`](docs/rules/prefer-output-function.md) | _(new)_ | warn | Angular 17.3+ |
| [`prefer-signal-queries`](docs/rules/prefer-signal-queries.md) | _(new)_ | warn | Angular 17.2+ |
| [`prefer-model-signal`](docs/rules/prefer-model-signal.md) | _(new)_ | warn | Angular 17.2+, requires paired `@Input()` |
| [`prefer-host-property`](docs/rules/prefer-host-property.md) | _(new)_ | warn | |
| [`prefer-inject-function`](docs/rules/prefer-inject-function.md) | _(new)_ | warn | decorator-gated |

\* Biome plugins take no options, so the selector/pipe prefix cannot be
configured. Projects not using the Angular CLI default `app` prefix should copy
and adapt the `.grit` file.

### Known engine limitations

Biome's GritQL engine cannot match certain TypeScript constructs, which causes
**false negatives** (never false positives) in specific shapes:

- **`implements` clauses**: decorated classes with an `implements` clause are
  invisible to decorator+class patterns. Affects the suffix rules,
  `contextual-lifecycle`, and `prefer-inject-function`.
- **`readonly` properties**: `@Output() readonly x = …` cannot be matched.
  Affects `no-output-on-prefix` and `prefer-model-signal`.

Each limitation is pinned by an `it.fails` integration test, so the suite will
flag the day a Biome release lifts it.

---

## CLI Reference

```
biome-angular init [--force]
  Create a new biome.json preconfigured with this plugin.
  --force    Overwrite existing biome.json

biome-angular merge
  Add this plugin to your existing biome.json without overwriting.

biome-angular remove
  Remove the plugin reference from biome.json (also cleans config
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
(HTML template) rules have no Biome equivalent yet.

See [`rules-to-migrate.json`](rules-to-migrate.json) for the full migration tracking list.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

[MIT](LICENSE)
