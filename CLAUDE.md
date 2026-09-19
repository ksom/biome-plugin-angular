# biome-plugin-angular

## Projet
Plugin Biome pour Angular 17-22. Règles TypeScript en GritQL pour Biome 2.5+.
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
- 26 règles dans biome-manifest.jsonc, toutes fonctionnelles et décorateur-aware
- Angular 17-22, Biome >= 2.5.0 (peerDep) — dev sur 2.5.12
- sort-ngmodule-metadata-arrays supprimée (GritQL ne peut pas comparer l'ordre d'une liste)
- prefer-standalone ne signale que standalone: false (défaut standalone depuis Angular 19)
- contextual-lifecycle aligné sur upstream : @Injectable/@Pipe n'autorisent que ngOnDestroy ;
  @Component ET @Directive autorisent tous les hooks
- prefer-inject-function signale TOUT paramètre de constructeur d'une classe décorée
  (aligné sur @angular-eslint/prefer-inject), pas seulement ceux avec modificateur
- Tests d'intégration : source de vérité, incluent un smoke test consommateur (npm pack → install → lint)
  et tests/integration/native-shapes.test.ts (implements, readonly, export default, --write)
- Consommation : "extends": ["biome-plugin-angular/presets/recommended.json"] (recommandé)
  Le preset = plugin scoped **/*.ts (hors *.spec.ts) + unsafeParameterDecoratorsEnabled
  + style/useImportType off. Sans ces deux réglages Biome : parse error sur @Inject(),
  et `biome lint --write` casse le build Angular (import type → NG2003)
- Sévérités fixées dans les .grit (register_diagnostic) — linter.rules.plugins N'EXISTE PAS dans Biome
- Messages préfixés "[rule-name] …" (les métavariables ne sont PAS interpolées dans message) ;
  suppression : // biome-ignore lint/plugin/<rule-name>: raison
- Auto-fix : seul no-empty-lifecycle-method, scindé en 2 fichiers de même stem
  (rules/high-priority/no-empty-lifecycle-method.grit = classe implémentant l'interface, pas de
  fix ; rules/high-priority/fixes/no-empty-lifecycle-method.grit = fix safe). Biome apparie
  rewrites et diagnostics par ordre d'apparition → impossible de mélanger branches fixables et
  non fixables dans un même pattern. Bug Biome : un diagnostic supprimé (biome-ignore) est
  quand même réécrit par --write si un autre match du même fichier est fixé.
  Les autres migrations pointent vers les schematics officiels (ng generate @angular/core:…)

## GritQL (Biome 2.5+) — règles d'écriture de patterns (vérifiées empiriquement)
- TOUJOURS matcher classes et membres via les nœuds AST natifs Biome (PascalCase, champs du
  js.ungram) : JsClassDeclaration(decorators, id, implements_clause, members),
  JsExport(decorators, export_clause = JsClassDeclaration(...)),
  JsExportDefaultDeclarationClause(declaration = JsClassExportDefaultDeclaration(...)),
  JsPropertyClassMember(modifiers, name, value), JsMethodClassMember(name, body),
  JsConstructorClassMember(parameters), JsFunctionBody(statements), JsCallExpression(callee)
  → couvre implements, extends, export default, readonly, override, async…
  Les décorateurs placés avant `export` sont sur JsExport, d'où 3 branches par règle
- `$x <: within JsClassDeclaration(implements_clause = $impl)` remonte à la classe englobante
- Champ optionnel absent (implements_clause) : bindé quand même, `not contains` passe
- Snippets : n'utiliser que pour décorateurs/appels simples ; un snippet méthode ne matche pas
  les modificateurs `override`/`protected` ; `async $hook() { $_ }` OK avec $hook en nom
- Regex = full match obligatoire (`r"^on[A-Z].*"`), `(?s)` pour multi-lignes ; groupes non
  capturants `(?:)` sauf capture avec variable `r"(.*)Change$"($base)`
- `pattern foo($body) {…}` : NE PAS utiliser — `$body <: contains …` échoue silencieusement
  depuis l'appelant. Inliner le `or`
- message = chaîne statique (pas d'interpolation de $var)
- Rewrite : `$m => .` supprime ; fix_kind = "safe"|"unsafe" dans register_diagnostic ;
  écrire le rewrite AVANT register_diagnostic quand le pattern utilise `within` ;
  supprimer un membre d'objet laisse une virgule orpheline (syntax error)
- Suppression : le commentaire biome-ignore doit être sur la ligne juste au-dessus du nœud
  signalé (entre le décorateur et `export class` pour un diagnostic sur le nom de classe)
- Diagnostics plugin : category "plugin" dans le JSON, nom du plugin = stem du .grit
  (suppression lint/plugin/<stem>)
- Bench rapide : dossier temp avec biome.json { plugins: [./x.grit] } + `biome lint --reporter=json`
