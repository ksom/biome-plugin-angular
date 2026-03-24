# biome-plugin-angular

[![npm version](https://img.shields.io/npm/v/biome-plugin-angular.svg)](https://www.npmjs.com/package/biome-plugin-angular)
[![CI](https://github.com/ksom/biome-plugin-angular/actions/workflows/ci.yml/badge.svg)](https://github.com/ksom/biome-plugin-angular/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js >=18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)

> Biome 2.x plugin that ports the most important `@angular-eslint` rules to GritQL.
> Drop-in replacement for teams migrating from ESLint to Biome on Angular 17–21 projects.

---

## Features

- GritQL rules fully compatible with Biome 2.x plugin system
- Covers the most-used `@angular-eslint` rules (17 rules planned)
- CLI helper: `biome-angular init|merge|remove|rules`
- `recommended` and `strict` presets
- Zero runtime dependencies

---

## Requirements

| Tool              | Version   |
| ----------------- | --------- |
| Node.js           | >= 18     |
| `@biomejs/biome`  | >= 2.0.0  |
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

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "plugins": ["biome-plugin-angular"],
  "linter": {
    "enabled": true,
    "rules": {
      "plugins": {
        "angular/prefer-standalone": "error",
        "angular/no-empty-lifecycle-method": "warn",
        "angular/component-class-suffix": "error"
      }
    }
  }
}
```

### Option C — Extend a preset

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "extends": ["biome-plugin-angular/presets/recommended"]
}
```

---

## Rules

### High Priority

| Rule | ESLint equivalent | Recommended | Auto-fix |
| ---- | ----------------- | :---------: | :------: |
| [`angular/prefer-standalone`](docs/rules/prefer-standalone.md) | `@angular-eslint/prefer-standalone` | error | — |
| [`angular/no-empty-lifecycle-method`](docs/rules/no-empty-lifecycle-method.md) | `@angular-eslint/no-empty-lifecycle-method` | warn | — |

### Conventions

| Rule | ESLint equivalent | Recommended | Auto-fix |
| ---- | ----------------- | :---------: | :------: |
| [`angular/no-component-suffix`](docs/rules/no-component-suffix.md) | _(new — Angular v20+)_ | warn | — |
| [`angular/component-selector`](docs/rules/component-selector.md) | `@angular-eslint/component-selector` | warn | — |
| [`angular/no-input-rename`](docs/rules/no-input-rename.md) | `@angular-eslint/no-input-rename` | error | — |
| [`angular/no-output-rename`](docs/rules/no-output-rename.md) | `@angular-eslint/no-output-rename` | error | — |
| [`angular/no-output-on-prefix`](docs/rules/no-output-on-prefix.md) | `@angular-eslint/no-output-on-prefix` | error | — |
| [`angular/pipe-prefix`](docs/rules/pipe-prefix.md) | `@angular-eslint/pipe-prefix` | warn | — |
| [`angular/sort-ngmodule-metadata-arrays`](docs/rules/sort-ngmodule-metadata-arrays.md) | `@angular-eslint/sort-ngmodule-metadata-arrays` | warn | — |

### Conventions _(coming soon)_

| Rule | ESLint equivalent | Status |
| ---- | ----------------- | ------ |
| `angular/directive-selector` | `@angular-eslint/directive-selector` | planned |

### Quality _(coming soon)_

| Rule | ESLint equivalent | Status |
| ---- | ----------------- | ------ |
| `angular/use-lifecycle-interface` | `@angular-eslint/use-lifecycle-interface` | planned |
| `angular/no-host-metadata-property` | `@angular-eslint/no-host-metadata-property` | planned |
| `angular/use-pipe-transform-interface` | `@angular-eslint/use-pipe-transform-interface` | planned |
| `angular/contextual-lifecycle` | `@angular-eslint/contextual-lifecycle` | planned |
| `angular/no-inputs-metadata-property` | `@angular-eslint/no-inputs-metadata-property` | planned |
| `angular/no-outputs-metadata-property` | `@angular-eslint/no-outputs-metadata-property` | planned |

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
