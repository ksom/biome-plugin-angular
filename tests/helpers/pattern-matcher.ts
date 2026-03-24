import { Block, Project, type SourceFile } from 'ts-morph';

/**
 * Lightweight Angular pattern matcher using the TypeScript compiler API.
 * Mirrors the logic expressed in the GritQL rules for unit testing purposes.
 *
 * Each matcher returns an array of violation objects (empty = no violations).
 */

const project = new Project({ useInMemoryFileSystem: true });

function createSourceFile(code: string): SourceFile {
  const fileName = `test-${Date.now()}.ts`;
  return project.createSourceFile(fileName, code, { overwrite: true });
}

// ---------------------------------------------------------------------------
// prefer-standalone
// ---------------------------------------------------------------------------

export interface StandaloneViolation {
  decorator: string;
  className: string;
}

/**
 * Detects Angular @Component, @Directive, or @Pipe decorators that either:
 *   - omit the `standalone` property entirely, or
 *   - set `standalone: false`
 */
export function detectMissingStandalone(code: string): StandaloneViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: StandaloneViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    for (const decoratorName of ['Component', 'Directive', 'Pipe']) {
      const decorator = cls.getDecorator(decoratorName);
      if (!decorator) continue;

      const args = decorator.getArguments();
      if (args.length === 0) {
        violations.push({ decorator: decoratorName, className: cls.getName() ?? 'unknown' });
        continue;
      }

      const argsText = args[0].getText();
      const hasStandaloneTrue = /standalone\s*:\s*true/.test(argsText);
      if (!hasStandaloneTrue) {
        violations.push({ decorator: decoratorName, className: cls.getName() ?? 'unknown' });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// no-empty-lifecycle-method
// ---------------------------------------------------------------------------

const LIFECYCLE_HOOKS = new Set([
  'ngOnInit',
  'ngOnDestroy',
  'ngOnChanges',
  'ngDoCheck',
  'ngAfterContentInit',
  'ngAfterContentChecked',
  'ngAfterViewInit',
  'ngAfterViewChecked',
]);

export interface EmptyLifecycleViolation {
  className: string;
  methodName: string;
}

/**
 * Detects Angular lifecycle methods whose body is empty (no statements).
 */
export function detectEmptyLifecycleMethods(code: string): EmptyLifecycleViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: EmptyLifecycleViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    for (const method of cls.getMethods()) {
      const name = method.getName();
      if (!LIFECYCLE_HOOKS.has(name)) continue;

      const body = method.getBody();
      if (!(body instanceof Block)) continue;

      // A method body is considered empty when it has no statements
      const statements = body.getStatements();
      if (statements.length === 0) {
        violations.push({ className: cls.getName() ?? 'unknown', methodName: name });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// no-component-suffix
// ---------------------------------------------------------------------------

export interface SuffixViolation {
  className: string;
  expectedSuffix: string;
}

/**
 * Detects @Component-decorated classes whose name ends with "Component".
 * Angular v20+ style guide recommends dropping the suffix.
 * See: https://github.com/angular/angular/discussions/59522
 */
export function detectComponentSuffix(code: string): SuffixViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: SuffixViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    if (!cls.getDecorator('Component')) continue;

    const name = cls.getName() ?? '';
    if (name.endsWith('Component')) {
      violations.push({ className: name, expectedSuffix: 'Component' });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// component-selector
// ---------------------------------------------------------------------------

export interface SelectorViolation {
  className: string;
  selector: string;
  reason: string;
}

/**
 * Detects @Component selectors that are not in kebab-case or missing the
 * expected prefix.
 */
export function detectInvalidComponentSelector(code: string, prefix = 'app'): SelectorViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: SelectorViolation[] = [];

  const kebabCaseWithPrefix = new RegExp(`^${prefix}-[a-z][a-z0-9]*(-[a-z0-9]+)*$`);

  for (const cls of sourceFile.getClasses()) {
    const decorator = cls.getDecorator('Component');
    if (!decorator) continue;

    const args = decorator.getArguments();
    if (args.length === 0) continue;

    const argsText = args[0].getText();
    const match = argsText.match(/selector\s*:\s*['"]([^'"]+)['"]/);
    if (!match) continue;

    const selector = match[1];

    if (!kebabCaseWithPrefix.test(selector)) {
      const reason = !selector.startsWith(`${prefix}-`)
        ? `selector must start with "${prefix}-"`
        : `selector must be kebab-case`;
      violations.push({ className: cls.getName() ?? 'unknown', selector, reason });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// no-input-rename
// ---------------------------------------------------------------------------

export interface RenameViolation {
  className: string;
  propertyName: string;
  alias: string;
}

/**
 * Detects @Input() properties that specify an alias via the decorator argument.
 * Both `@Input('alias')` and `@Input({ alias: '...' })` are violations.
 */
export function detectInputRename(code: string): RenameViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: RenameViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    for (const prop of cls.getProperties()) {
      const decorator = prop.getDecorator('Input');
      if (!decorator) continue;

      const args = decorator.getArguments();
      if (args.length === 0) continue;

      const firstArg = args[0];
      const argText = firstArg.getText().trim();
      const kindName = firstArg.getKindName();

      // @Input('alias') — string literal alias
      if (kindName === 'StringLiteral' || kindName === 'NoSubstitutionTemplateLiteral') {
        violations.push({
          className: cls.getName() ?? 'unknown',
          propertyName: prop.getName(),
          alias: argText.replace(/['"]/g, ''),
        });
        continue;
      }

      // @Input({ alias: 'name', ... }) — object with alias key
      if (kindName === 'ObjectLiteralExpression' && /\balias\s*:/.test(argText)) {
        const aliasMatch = argText.match(/alias\s*:\s*['"]([^'"]+)['"]/);
        violations.push({
          className: cls.getName() ?? 'unknown',
          propertyName: prop.getName(),
          alias: aliasMatch?.[1] ?? '',
        });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// no-output-rename
// ---------------------------------------------------------------------------

/**
 * Detects @Output() properties that specify an alias via the decorator argument.
 * Both `@Output('alias')` and `@Output({ alias: '...' })` are violations.
 */
export function detectOutputRename(code: string): RenameViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: RenameViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    for (const prop of cls.getProperties()) {
      const decorator = prop.getDecorator('Output');
      if (!decorator) continue;

      const args = decorator.getArguments();
      if (args.length === 0) continue;

      const firstArg = args[0];
      const argText = firstArg.getText().trim();
      const kindName = firstArg.getKindName();

      // @Output('alias') — string literal alias
      if (kindName === 'StringLiteral' || kindName === 'NoSubstitutionTemplateLiteral') {
        violations.push({
          className: cls.getName() ?? 'unknown',
          propertyName: prop.getName(),
          alias: argText.replace(/['"]/g, ''),
        });
        continue;
      }

      // @Output({ alias: 'name', ... }) — object with alias key
      if (kindName === 'ObjectLiteralExpression' && /\balias\s*:/.test(argText)) {
        const aliasMatch = argText.match(/alias\s*:\s*['"]([^'"]+)['"]/);
        violations.push({
          className: cls.getName() ?? 'unknown',
          propertyName: prop.getName(),
          alias: aliasMatch?.[1] ?? '',
        });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// no-output-on-prefix
// ---------------------------------------------------------------------------

export interface OutputOnPrefixViolation {
  className: string;
  propertyName: string;
}

/**
 * Detects @Output() properties whose name starts with "on" followed by an
 * uppercase letter (e.g. onSubmit, onChange).
 */
export function detectOutputOnPrefix(code: string): OutputOnPrefixViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: OutputOnPrefixViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    for (const prop of cls.getProperties()) {
      if (!prop.getDecorator('Output')) continue;

      const name = prop.getName();
      if (/^on[A-Z]/.test(name)) {
        violations.push({ className: cls.getName() ?? 'unknown', propertyName: name });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// pipe-prefix
// ---------------------------------------------------------------------------

export interface PipePrefixViolation {
  className: string;
  pipeName: string;
  expectedPrefix: string;
}

/**
 * Detects @Pipe decorators whose `name` field does not start with the
 * expected prefix (default: "app").
 */
export function detectMissingPipePrefix(code: string, prefix = 'app'): PipePrefixViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: PipePrefixViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    const decorator = cls.getDecorator('Pipe');
    if (!decorator) continue;

    const args = decorator.getArguments();
    if (args.length === 0) continue;

    const argsText = args[0].getText();
    const nameMatch = argsText.match(/\bname\s*:\s*['"]([^'"]+)['"]/);
    if (!nameMatch) continue;

    const pipeName = nameMatch[1];
    if (!pipeName.startsWith(prefix)) {
      violations.push({ className: cls.getName() ?? 'unknown', pipeName, expectedPrefix: prefix });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// sort-ngmodule-metadata-arrays
// ---------------------------------------------------------------------------

export interface UnsortedArrayViolation {
  className: string;
  arrayName: string;
  elements: string[];
  sortedElements: string[];
}

const NGMODULE_ARRAY_PROPS = ['declarations', 'imports', 'exports', 'providers', 'bootstrap'];

/**
 * Detects NgModule metadata arrays that are not sorted alphabetically
 * (case-insensitive). Checks: declarations, imports, exports, providers, bootstrap.
 */
export function detectUnsortedNgModuleArrays(code: string): UnsortedArrayViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: UnsortedArrayViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    const decorator = cls.getDecorator('NgModule');
    if (!decorator) continue;

    const args = decorator.getArguments();
    if (args.length === 0) continue;

    const argsText = args[0].getText();

    for (const arrayProp of NGMODULE_ARRAY_PROPS) {
      // Extract the flat array content (handles simple identifier lists)
      const arrayMatch = argsText.match(new RegExp(`\\b${arrayProp}\\s*:\\s*\\[([^\\]]+)\\]`));
      if (!arrayMatch) continue;

      const elements = arrayMatch[1]
        .split(',')
        .map((e) => e.trim())
        .filter((e) => e.length > 0);

      if (elements.length < 2) continue;

      const sorted = [...elements].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

      const isSorted = elements.every((el, i) => el === sorted[i]);
      if (!isSorted) {
        violations.push({
          className: cls.getName() ?? 'unknown',
          arrayName: arrayProp,
          elements,
          sortedElements: sorted,
        });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// no-directive-suffix
// ---------------------------------------------------------------------------

/**
 * Detects @Directive-decorated classes whose name ends with "Directive".
 * Angular v20+ style guide recommends dropping the suffix.
 * See: https://github.com/angular/angular/discussions/59522
 */
export function detectDirectiveSuffix(code: string): SuffixViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: SuffixViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    if (!cls.getDecorator('Directive')) continue;

    const name = cls.getName() ?? '';
    if (name.endsWith('Directive')) {
      violations.push({ className: name, expectedSuffix: 'Directive' });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// no-service-suffix
// ---------------------------------------------------------------------------

/**
 * Detects @Injectable-decorated classes whose name ends with "Service".
 * Angular v20+ style guide recommends descriptive names instead.
 * See: https://github.com/angular/angular/discussions/59522
 */
export function detectServiceSuffix(code: string): SuffixViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: SuffixViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    if (!cls.getDecorator('Injectable')) continue;

    const name = cls.getName() ?? '';
    if (name.endsWith('Service')) {
      violations.push({ className: name, expectedSuffix: 'Service' });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// use-lifecycle-interface
// ---------------------------------------------------------------------------

const LIFECYCLE_INTERFACE_MAP: Record<string, string> = {
  ngOnChanges: 'OnChanges',
  ngOnInit: 'OnInit',
  ngOnDestroy: 'OnDestroy',
  ngDoCheck: 'DoCheck',
  ngAfterContentInit: 'AfterContentInit',
  ngAfterContentChecked: 'AfterContentChecked',
  ngAfterViewInit: 'AfterViewInit',
  ngAfterViewChecked: 'AfterViewChecked',
};

export interface LifecycleInterfaceViolation {
  className: string;
  missingInterface: string;
  methodName: string;
}

/**
 * Detects classes that have Angular lifecycle methods but don't implement
 * the corresponding interface.
 */
export function detectMissingLifecycleInterface(code: string): LifecycleInterfaceViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: LifecycleInterfaceViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    const implementedNames = new Set(
      cls.getImplements().map((impl) => impl.getExpression().getText()),
    );

    for (const method of cls.getMethods()) {
      const name = method.getName();
      const requiredInterface = LIFECYCLE_INTERFACE_MAP[name];
      if (!requiredInterface) continue;

      if (!implementedNames.has(requiredInterface)) {
        violations.push({
          className: cls.getName() ?? 'unknown',
          methodName: name,
          missingInterface: requiredInterface,
        });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// use-pipe-transform-interface
// ---------------------------------------------------------------------------

export interface PipeTransformViolation {
  className: string;
}

/**
 * Detects @Pipe-decorated classes that don't implement PipeTransform.
 */
export function detectMissingPipeTransform(code: string): PipeTransformViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: PipeTransformViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    if (!cls.getDecorator('Pipe')) continue;

    const implementedNames = cls.getImplements().map((i) => i.getExpression().getText());
    // Handle generics: PipeTransform or PipeTransform<T>
    const implementsPipeTransform = implementedNames.some((n) => n.startsWith('PipeTransform'));

    if (!implementsPipeTransform) {
      violations.push({ className: cls.getName() ?? 'unknown' });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// contextual-lifecycle
// ---------------------------------------------------------------------------

// View hooks only allowed in @Component
const VIEW_ONLY_HOOKS = new Set(['ngAfterViewInit', 'ngAfterViewChecked']);
// Content hooks allowed in @Component and @Directive
const CONTENT_HOOKS = new Set(['ngAfterContentInit', 'ngAfterContentChecked']);
// Hooks not allowed in @Pipe
const INVALID_PIPE_HOOKS = new Set([
  'ngAfterViewInit',
  'ngAfterViewChecked',
  'ngAfterContentInit',
  'ngAfterContentChecked',
  'ngOnChanges',
]);

export interface ContextualLifecycleViolation {
  className: string;
  methodName: string;
  decoratorName: string;
  reason: string;
}

/**
 * Detects lifecycle methods used in wrong Angular class contexts.
 */
export function detectContextualLifecycleViolations(code: string): ContextualLifecycleViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: ContextualLifecycleViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    const _isComponent = !!cls.getDecorator('Component');
    const isDirective = !!cls.getDecorator('Directive');
    const isPipe = !!cls.getDecorator('Pipe');
    const isInjectable = !!cls.getDecorator('Injectable');

    for (const method of cls.getMethods()) {
      const name = method.getName();

      if (!LIFECYCLE_INTERFACE_MAP[name]) continue; // not a lifecycle hook

      if (isPipe && INVALID_PIPE_HOOKS.has(name)) {
        violations.push({
          className: cls.getName() ?? 'unknown',
          methodName: name,
          decoratorName: 'Pipe',
          reason: `@Pipe classes cannot use ${name}`,
        });
      } else if (isInjectable && (VIEW_ONLY_HOOKS.has(name) || CONTENT_HOOKS.has(name))) {
        violations.push({
          className: cls.getName() ?? 'unknown',
          methodName: name,
          decoratorName: 'Injectable',
          reason: `@Injectable classes cannot use view/content lifecycle hook ${name}`,
        });
      } else if (isDirective && VIEW_ONLY_HOOKS.has(name)) {
        violations.push({
          className: cls.getName() ?? 'unknown',
          methodName: name,
          decoratorName: 'Directive',
          reason: `@Directive cannot use view lifecycle hook ${name} (only @Component can)`,
        });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// prefer-signal-inputs
// ---------------------------------------------------------------------------

export interface SignalInputViolation {
  className: string;
  propertyName: string;
  isRequired: boolean;
}

/**
 * Detects @Input() decorator usage on class properties.
 * Suggests replacing with input() or input.required().
 */
export function detectDecoratorInputs(code: string): SignalInputViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: SignalInputViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    for (const prop of cls.getProperties()) {
      const decorator = prop.getDecorator('Input');
      if (!decorator) continue;

      const args = decorator.getArguments();
      const argsText = args[0]?.getText() ?? '';
      const isRequired = /required\s*:\s*true/.test(argsText) || prop.hasExclamationToken();

      violations.push({
        className: cls.getName() ?? 'unknown',
        propertyName: prop.getName(),
        isRequired,
      });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// prefer-output-function
// ---------------------------------------------------------------------------

export interface DecoratorOutputViolation {
  className: string;
  propertyName: string;
}

/**
 * Detects @Output() decorator usage. Suggests replacing with output().
 */
export function detectDecoratorOutputs(code: string): DecoratorOutputViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: DecoratorOutputViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    for (const prop of cls.getProperties()) {
      if (!prop.getDecorator('Output')) continue;
      violations.push({
        className: cls.getName() ?? 'unknown',
        propertyName: prop.getName(),
      });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// prefer-signal-queries
// ---------------------------------------------------------------------------

const QUERY_DECORATORS = ['ViewChild', 'ViewChildren', 'ContentChild', 'ContentChildren'];
const SIGNAL_QUERY_MAP: Record<string, string> = {
  ViewChild: 'viewChild',
  ViewChildren: 'viewChildren',
  ContentChild: 'contentChild',
  ContentChildren: 'contentChildren',
};

export interface SignalQueryViolation {
  className: string;
  propertyName: string;
  decoratorName: string;
  signalEquivalent: string;
}

/**
 * Detects decorator-based query usage (@ViewChild, @ViewChildren, etc.).
 * Suggests replacing with signal-based query functions.
 */
export function detectDecoratorQueries(code: string): SignalQueryViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: SignalQueryViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    for (const prop of cls.getProperties()) {
      for (const decoratorName of QUERY_DECORATORS) {
        if (!prop.getDecorator(decoratorName)) continue;
        violations.push({
          className: cls.getName() ?? 'unknown',
          propertyName: prop.getName(),
          decoratorName,
          signalEquivalent: SIGNAL_QUERY_MAP[decoratorName],
        });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// prefer-model-signal
// ---------------------------------------------------------------------------

export interface ModelSignalViolation {
  className: string;
  inputProperty: string;
  outputProperty: string;
}

/**
 * Detects @Input() + @Output() xyzChange pairs — the Angular two-way binding
 * convention — which can be replaced with model().
 */
export function detectTwoWayBindingPairs(code: string): ModelSignalViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: ModelSignalViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    const inputProps = new Set<string>();
    const outputProps = new Set<string>();

    for (const prop of cls.getProperties()) {
      if (prop.getDecorator('Input')) inputProps.add(prop.getName());
      if (prop.getDecorator('Output')) outputProps.add(prop.getName());
    }

    for (const inputName of inputProps) {
      const outputName = `${inputName}Change`;
      if (outputProps.has(outputName)) {
        violations.push({
          className: cls.getName() ?? 'unknown',
          inputProperty: inputName,
          outputProperty: outputName,
        });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// prefer-host-property
// ---------------------------------------------------------------------------

export interface HostDecoratorViolation {
  className: string;
  decoratorName: string;
  memberName: string;
}

/**
 * Detects @HostBinding and @HostListener usage. Suggests using host: {} in
 * the @Component/@Directive decorator instead.
 */
export function detectHostDecorators(code: string): HostDecoratorViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: HostDecoratorViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    // Check properties for @HostBinding
    for (const prop of cls.getProperties()) {
      if (prop.getDecorator('HostBinding')) {
        violations.push({
          className: cls.getName() ?? 'unknown',
          decoratorName: 'HostBinding',
          memberName: prop.getName(),
        });
      }
    }
    // Check methods for @HostListener
    for (const method of cls.getMethods()) {
      if (method.getDecorator('HostListener')) {
        violations.push({
          className: cls.getName() ?? 'unknown',
          decoratorName: 'HostListener',
          memberName: method.getName(),
        });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// prefer-inject-function
// ---------------------------------------------------------------------------

export interface ConstructorInjectionViolation {
  className: string;
  parameterName: string;
  parameterType: string;
}

/**
 * Detects constructor parameters with access modifiers (the Angular DI pattern).
 * Suggests replacing with inject() function calls.
 */
export function detectConstructorInjection(code: string): ConstructorInjectionViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: ConstructorInjectionViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    for (const ctor of cls.getConstructors()) {
      for (const param of ctor.getParameters()) {
        const modifiers = param.getModifiers().map((m) => m.getText());
        const hasAccessModifier = modifiers.some((m) =>
          ['private', 'protected', 'public', 'readonly'].includes(m),
        );

        if (hasAccessModifier) {
          const typeNode = param.getTypeNode();
          violations.push({
            className: cls.getName() ?? 'unknown',
            parameterName: param.getName(),
            parameterType: typeNode?.getText() ?? 'unknown',
          });
        }
      }
    }
  }

  return violations;
}

/** Convenience factory so tests can destructure a single import. */
export function createPatternMatcher() {
  return {
    detectMissingStandalone,
    detectEmptyLifecycleMethods,
    detectComponentSuffix,
    detectDirectiveSuffix,
    detectServiceSuffix,
    detectInvalidComponentSelector,
    detectInputRename,
    detectOutputRename,
    detectOutputOnPrefix,
    detectMissingPipePrefix,
    detectUnsortedNgModuleArrays,
    // Quality rules
    detectMissingLifecycleInterface,
    detectMissingPipeTransform,
    detectContextualLifecycleViolations,
    // Modern / signal-based rules
    detectDecoratorInputs,
    detectDecoratorOutputs,
    detectDecoratorQueries,
    detectTwoWayBindingPairs,
    detectHostDecorators,
    detectConstructorInjection,
  };
}
