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

## Commandes de test
- npm test : tests unitaires (Vitest, 217 tests)
- npm run test:integration : tests d'intégration avec le binaire biome réel (68 tests, 5 skipped)
- npm run test:all : les deux suites

## État actuel
- 20 règles dans biome-manifest.jsonc (format Biome 2.4.8+)
- 4 règles skippées dans rules-to-migrate.json (obsolètes ou inversées)
- Tests unitaires : 21 fichiers, 217 tests, tous verts
- Tests intégration : 20 fichiers, 68 tests verts, 5 skipped (limites GritQL)
- Catégorie "modern" : prefer-signal-inputs, prefer-output-function, prefer-signal-queries,
  prefer-model-signal, prefer-host-property, prefer-inject-function

## Limitations GritQL (Biome 2.4.8)
GritQL ne supporte pas le pattern `@Decorator\nclass` comme une unité. Conséquences :

**Règles heuristiques** (fonctionnent mais sans vérification du décorateur) :
- no-component-suffix : flag toute classe `*Component` (pas seulement @Component)
- no-directive-suffix : flag toute classe `*Directive` (pas seulement @Directive)
- no-service-suffix : flag toute classe `*Service` (pas seulement @Injectable)
- prefer-inject-function : flag tout constructor avec access modifiers (pas seulement Angular)

**Règle limitée** :
- sort-ngmodule-metadata-arrays : détecte la présence d'arrays, pas leur ordre de tri

**Règles non-fonctionnelles** (compilent mais ne détectent pas les violations) :
- contextual-lifecycle : nécessite le type de décorateur pour le contexte
- use-pipe-transform-interface : nécessite @Pipe + class comme unité
