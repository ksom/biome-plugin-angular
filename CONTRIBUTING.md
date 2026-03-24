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
git clone https://github.com/yourusername/biome-plugin-angular.git
cd biome-plugin-angular
npm install
npm test
```

---

## Project structure

```
rules/
  high-priority/    # Priority-1 rules (GritQL .grit files)
  conventions/      # Priority-2 rules
tests/
  helpers/
    pattern-matcher.ts   # ts-morph based pattern tester (unit tests)
    biome-runner.ts      # Biome CLI integration test runner
  rules/                 # One .test.ts file per rule
docs/rules/              # One .md file per rule
presets/                 # recommended.json, strict.json
cli.js                   # CLI entrypoint
```

---

## Adding a new rule

1. **Pick a rule** from [`rules-to-migrate.json`](rules-to-migrate.json) with `"status": "todo"`.

2. **Create the GritQL file**

   ```
   rules/<category>/<rule-name>.grit
   ```

   Start with the language pragma and a JSDoc comment:

   ```grit
   language js

   /*
    * Rule: angular/<rule-name>
    * ESLint equivalent: @angular-eslint/<rule-name>
    *
    * <description>
    *
    * Bad:  ...
    * Good: ...
    */

   // Your GritQL pattern here
   ```

3. **Register the rule** in `biome-plugin.json`.

4. **Add the detection function** in `tests/helpers/pattern-matcher.ts`
   using `ts-morph` to mirror the GritQL pattern for unit testing.

5. **Write tests** in `tests/rules/<rule-name>.test.ts`
   — cover at least 3 invalid cases and 3 valid cases.

6. **Write the doc** in `docs/rules/<rule-name>.md`
   — use the existing docs as a template.

7. **Update `rules-to-migrate.json`** — set `"status": "done"`.

8. **Update `README.md`** — move the rule from the _coming soon_ table to the active table.

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
feat(rules): add angular/directive-class-suffix
fix(rules): prefer-standalone now handles empty @Pipe({}) decorators
docs(rules): add component-class-suffix migration guide
```

---

## Running tests

```bash
npm test              # run all tests once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
npm run typecheck     # TypeScript type check only
```

---

## Pull request checklist

- [ ] `npm test` passes
- [ ] `npm run typecheck` passes
- [ ] New rule has tests (≥ 3 invalid + 3 valid cases)
- [ ] New rule has docs in `docs/rules/`
- [ ] `rules-to-migrate.json` updated
- [ ] `README.md` updated
- [ ] Commit message follows Conventional Commits

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
