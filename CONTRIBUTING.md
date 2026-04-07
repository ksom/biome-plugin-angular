# Contributing to biome-plugin-angular

Thank you for your interest in contributing! This document explains how to
get the project running locally and how to add new rules.

---

## Prerequisites

- Node.js >= 18
- npm >= 9
- Familiarity with [GritQL](https://docs.grit.io/language/overview) and TypeScript

---

## Setup

```bash
git clone https://github.com/ksom/biome-plugin-angular.git
cd biome-plugin-angular
npm install
npm test
```

---

## Project structure

```
rules/
  high-priority/    # Critical rules (GritQL .grit files)
  conventions/      # Naming and style conventions
  quality/          # Code quality rules
  modern/           # Angular 17+ signal-based rules
tests/
  helpers/
    pattern-matcher.ts   # ts-morph based pattern tester (unit tests)
    biome-runner.ts      # Biome CLI integration test runner
  rules/                 # One unit test per rule
  integration/           # One integration test per rule (real biome binary)
docs/rules/              # One .md file per rule
presets/                 # recommended.json, strict.json
biome-manifest.jsonc     # Biome 2.4.8+ plugin manifest
cli.js                   # CLI entrypoint
```

---

## Adding a new rule

1. **Pick a rule** from [`rules-to-migrate.json`](rules-to-migrate.json) with `"status": "todo"`.

2. **Create the GritQL file**

   ```
   rules/<category>/<rule-name>.grit
   ```

   Use an existing rule as template. Every rule must call `register_diagnostic`:

   ```grit
   language js

   `@SomeDecorator($args)` where {
     register_diagnostic(span = $args, message = "Description of the problem.", severity = "warn")
   }
   ```

   **GritQL constraints** (Biome 2.4.8):
   - No `/* */` block comments (causes compilation failure)
   - No `//` inline comments inside `or {}` / `where {}` blocks
   - Use non-capturing regex groups `(?:...)` instead of `(...)`
   - Regex must match full node text (e.g. `r"^on[A-Z].*"` not `r"^on[A-Z]"`)
   - `@Decorator\nclass` patterns do not match at runtime

3. **Register the rule** in `biome-manifest.jsonc`.

4. **Add the detection function** in `tests/helpers/pattern-matcher.ts`
   using `ts-morph` to mirror the GritQL pattern for unit testing.

5. **Write unit tests** in `tests/rules/<rule-name>.test.ts`
   — cover at least 3 invalid cases and 3 valid cases.

6. **Write integration tests** in `tests/integration/<rule-name>.test.ts`
   — test against the real Biome binary using `biome-runner.ts`.

7. **Write the doc** in `docs/rules/<rule-name>.md`
   — use the existing docs as a template.

8. **Update `rules-to-migrate.json`** — set `"status": "done"`.

9. **Update `README.md`** — add the rule to the appropriate table.

---

## Commit conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

| Type | When to use |
| ---- | ----------- |
| `feat` | New rule or CLI command |
| `fix` | Bug fix in a rule or helper |
| `docs` | Documentation only |
| `test` | Tests only |
| `chore` | Tooling, dependencies |
| `refactor` | Code change with no behavior change |

Examples:

```
feat(rules): add angular/directive-selector
fix(rules): prefer-standalone now handles empty @Pipe({}) decorators
```

---

## Running tests

```bash
npm test                # unit tests (Vitest)
npm run test:integration # integration tests (real biome binary)
npm run test:all         # both suites
npm run test:watch       # watch mode (unit tests)
npm run test:coverage    # with coverage report
npm run typecheck        # TypeScript type check only
```

---

## Pull request checklist

- [ ] `npm run test:all` passes
- [ ] `npm run typecheck` passes
- [ ] New rule has unit tests (>= 3 invalid + 3 valid cases)
- [ ] New rule has integration tests
- [ ] New rule has docs in `docs/rules/`
- [ ] `biome-manifest.jsonc` updated
- [ ] `rules-to-migrate.json` updated
- [ ] `README.md` updated
- [ ] Commit message follows Conventional Commits

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
