# biome-plugin-angular

## Projet
Plugin Biome pour Angular 17-21. Règles TypeScript en GritQL pour Biome 2.x.
Port des règles @angular-eslint + nouvelles règles signal-based (Angular moderne).

## Commandes
- npm test : tests unitaires (Vitest) — couche "reference spec" (pattern-matcher ts-morph)
- npm run test:integration : tests d'intégration avec le binaire biome réel (source de vérité)
- npm run test:all : les deux suites
- npm run lint : lint du projet

## Conventions
- Un commit par règle : "feat(rules): add {rule-name}" / "fix(rules): …"
- Chaque règle a : un .grit, un test d'intégration, un doc .md, une entrée dans rules-to-migrate.json
- Utiliser les règles existantes comme template pour les nouvelles
- Toute nouvelle règle DOIT être vérifiée contre le binaire biome réel (test d'intégration), pas seulement le pattern-matcher

## Structure des règles
- rules/high-priority/  — règles critiques (prefer-standalone, no-empty-lifecycle-method)
- rules/conventions/    — conventions Angular (no-input-rename, component-selector, etc.)
- rules/quality/        — qualité de code (use-lifecycle-interface, contextual-lifecycle, etc.)
- rules/modern/         — APIs signal-based Angular 17+ (prefer-signal-inputs, prefer-inject-function, etc.)

## État actuel
- 19 règles dans biome-manifest.jsonc, toutes fonctionnelles et décorateur-aware
- sort-ngmodule-metadata-arrays supprimée (GritQL ne peut pas comparer l'ordre d'une liste)
- prefer-standalone ne signale que standalone: false (défaut standalone depuis Angular 19)
- contextual-lifecycle aligné sur upstream : @Injectable/@Pipe n'autorisent que ngOnDestroy ;
  @Component ET @Directive autorisent tous les hooks
- Tests d'intégration : source de vérité, incluent un smoke test consommateur (npm pack → install → lint)
- Consommation : "plugins": ["./node_modules/biome-plugin-angular"] (chemin relatif au config)
  ou extends de biome-plugin-angular/presets/recommended.json
- Sévérités fixées dans les .grit (register_diagnostic) — linter.rules.plugins N'EXISTE PAS dans Biome

## GritQL (Biome 2.4.8+) — règles d'écriture de patterns (vérifiées empiriquement)
- `@Decorator($args)\nclass $name { $body }` matche — MAIS il faut une variante explicite
  `export class` pour matcher les classes exportées (l'ancien "GritQL ne matche pas
  décorateur+classe" était un mauvais diagnostic : il manquait juste `export`)
- Variantes nécessaires par forme de classe : {class, export class} × {simple, extends $ext}
- IMPOSSIBLE à matcher (limitations moteur, false negatives documentés par tests it.fails) :
  - clause `implements` avec métavariable (`class $n implements $i { $b }` ne matche JAMAIS ;
    littéral `implements Bar` OK) — ni `within`, ni `contains`, ni `$...` ne contournent
  - propriétés `readonly` (`@Output() readonly $n = $i` ne matche jamais, même en littéral avec nom)
- Les snippets méthode avec type de retour sont distincts : `ngOnInit() {}` ≠ `ngOnInit(): void {}`
  (les deux variantes sont nécessaires) ; les modificateurs (async, protected) matchent implicitement
- Identifiant nu en `contains` (ex: `ngOnInit`) matche toute occurrence, signature incluse
- Capture regex disponible : `$name <: r"(.*)Change$"($base)` puis réutiliser $base
- `$program <: contains …` permet des vérifications au niveau fichier
- Les diagnostics plugin ont category "plugin" dans le JSON (`--reporter=json`)
