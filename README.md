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

- 20 GritQL rules for Biome 2.x plugin system
- Ports the most-used `@angular-eslint` rules
- 6 new rules for modern Angular (signals, inject, host properties)
- CLI helper: `biome-angular init|merge|remove|rules`
- `recommended` and `strict` presets
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

### Option A — CLI (recommended)

```bash
# Create a biome.json from scratch
npx biome-angular init

# Or add the plugin to your existing biome.json
npx biome-angular merge
```

### Option B — Manual configuration

Add the plugin to your `biome.json`:

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.4.8/schema.json",
  "plugins": ["biome-plugin-angular"]
}
```

Biome will load `biome-manifest.jsonc` from the plugin package automatically.

---

## Rules

### High Priority

| Rule | ESLint equivalent | Severity | Notes |
| ---- | ----------------- | :------: | ----- |
| [`prefer-standalone`](docs/rules/prefer-standalone.md) | `@angular-eslint/prefer-standalone` | error | |
| [`no-empty-lifecycle-method`](docs/rules/no-empty-lifecycle-method.md) | `@angular-eslint/no-empty-lifecycle-method` | warn | |

### Conventions

| Rule | ESLint equivalent | Severity | Notes |
| ---- | ----------------- | :------: | ----- |
| [`no-component-suffix`](docs/rules/no-component-suffix.md) | _(new — Angular v20+)_ | warn | heuristic* |
| [`no-directive-suffix`](docs/rules/no-directive-suffix.md) | _(new — Angular v20+)_ | warn | heuristic* |
| [`no-service-suffix`](docs/rules/no-service-suffix.md) | _(new — Angular v20+)_ | warn | heuristic* |
| [`component-selector`](docs/rules/component-selector.md) | `@angular-eslint/component-selector` | warn | |
| [`no-input-rename`](docs/rules/no-input-rename.md) | `@angular-eslint/no-input-rename` | error | |
| [`no-output-rename`](docs/rules/no-output-rename.md) | `@angular-eslint/no-output-rename` | error | |
| [`no-output-on-prefix`](docs/rules/no-output-on-prefix.md) | `@angular-eslint/no-output-on-prefix` | error | |
| [`pipe-prefix`](docs/rules/pipe-prefix.md) | `@angular-eslint/pipe-prefix` | warn | |
| [`sort-ngmodule-metadata-arrays`](docs/rules/sort-ngmodule-metadata-arrays.md) | `@angular-eslint/sort-ngmodule-metadata-arrays` | warn | limited** |

### Quality

| Rule | ESLint equivalent | Severity | Notes |
| ---- | ----------------- | :------: | ----- |
| [`use-lifecycle-interface`](docs/rules/use-lifecycle-interface.md) | `@angular-eslint/use-lifecycle-interface` | warn | |
| [`use-pipe-transform-interface`](docs/rules/use-pipe-transform-interface.md) | `@angular-eslint/use-pipe-transform-interface` | warn | non-functional*** |
| [`contextual-lifecycle`](docs/rules/contextual-lifecycle.md) | `@angular-eslint/contextual-lifecycle` | error | non-functional*** |

### Modern (Angular 17+)

| Rule | ESLint equivalent | Severity | Notes |
| ---- | ----------------- | :------: | ----- |
| [`prefer-signal-inputs`](docs/rules/prefer-signal-inputs.md) | _(new)_ | warn | Angular 17.1+ |
| [`prefer-output-function`](docs/rules/prefer-output-function.md) | _(new)_ | warn | Angular 17.3+ |
| [`prefer-signal-queries`](docs/rules/prefer-signal-queries.md) | _(new)_ | warn | Angular 17.2+ |
| [`prefer-model-signal`](docs/rules/prefer-model-signal.md) | _(new)_ | warn | Angular 17.2+ |
| [`prefer-host-property`](docs/rules/prefer-host-property.md) | _(new)_ | warn | |
| [`prefer-inject-function`](docs/rules/prefer-inject-function.md) | _(new)_ | warn | heuristic* |

### GritQL Limitations

Biome's GritQL engine (2.4.8) cannot match `@Decorator` + `class` as a single pattern unit. This affects some rules:

- **\* heuristic**: Rules match by class name or constructor shape without verifying the Angular decorator. Accurate in Angular projects; may false-positive in non-Angular code.
- **\*\* limited**: `sort-ngmodule-metadata-arrays` detects the presence of metadata arrays but cannot verify sort order.
- **\*\*\* non-functional**: Rules compile but cannot detect violations at runtime. Kept for forward-compatibility.

---

## CLI Reference

```
biome-angular init [--strict] [--force]
  Create a new biome.json preconfigured with this plugin.
  --strict   Use the strict preset (all rules as errors)
  --force    Overwrite existing biome.json

biome-angular merge [--strict]
  Add this plugin to your existing biome.json without overwriting.

biome-angular remove
  Remove all biome-plugin-angular rules and plugin reference from biome.json.

biome-angular rules
  Print all available rules and their implementation status.
```

---

## Presets

Two presets are available:

| Preset | Description |
| ------ | ----------- |
| `recommended` | All high-priority rules; `no-empty-lifecycle-method` as warn |
| `strict` | All high-priority rules as errors |

Reference them in `biome.json`:

```json
{ "extends": ["biome-plugin-angular/presets/strict"] }
```

---

## Migration from @angular-eslint

If you are migrating from ESLint + `@angular-eslint`, you can remove the following packages
once the corresponding rules are available in this plugin:

```bash
npm uninstall eslint @angular-eslint/eslint-plugin @angular-eslint/template-parser
```

See [`rules-to-migrate.json`](rules-to-migrate.json) for the full migration tracking list.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

[MIT](LICENSE)
