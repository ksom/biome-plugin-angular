# biome-plugin-angular

## Projet
Plugin Biome pour Angular 17-21. Règles TypeScript en GritQL pour Biome 2.x.
Port des règles @angular-eslint + nouvelles règles signal-based (Angular moderne).

## Commandes
- npm test : lance tous les tests (Vitest)
- npm run lint : lint du projet

## Conventions
- Un commit par règle : "feat(rules): add {rule-name}"
- Chaque règle a : un .grit, un test, un doc .md, et une entrée dans les presets
- Utiliser les règles existantes comme template pour les nouvelles

## Structure des règles
- rules/high-priority/  — règles critiques (prefer-standalone, no-empty-lifecycle-method)
- rules/conventions/    — conventions Angular (no-input-rename, component-selector, etc.)
- rules/quality/        — qualité de code (use-lifecycle-interface, contextual-lifecycle, etc.)
- rules/modern/         — APIs signal-based Angular 17+ (prefer-signal-inputs, prefer-inject-function, etc.)

## État actuel
- 20 règles actives (11 ports @angular-eslint + 3 nouvelles naming + 3 quality + 6 modern signal-based)
- 4 règles skippées dans rules-to-migrate.json (obsolètes ou inversées)
- Tests : 20 fichiers, 181 tests, tous verts
- Catégorie "modern" : prefer-signal-inputs, prefer-output-function, prefer-signal-queries,
  prefer-model-signal, prefer-host-property, prefer-inject-function
