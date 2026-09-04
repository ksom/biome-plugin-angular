import {
  Block,
  Node,
  Project,
  type PropertyDeclaration,
  type SourceFile,
  SyntaxKind,
} from 'ts-morph';

/**
 * Reference-semantics layer for the plugin's Angular rules.
 *
 * Each matcher re-implements a rule with ts-morph and documents the INTENDED
 * semantics (equivalent to the upstream @angular-eslint rule), serving as a
 * fast, engine-independent spec. The shipped behavior lives in the GritQL
 * rules under rules/ and is verified by tests/integration/ — those
 * integration tests are the authority on shipped behavior whenever the two
 * layers disagree.
 *
 * The shipped rules match classes and members through Biome's native AST
 * nodes, so `implements` clauses, `readonly` members and modifiers are
 * covered on both layers. Get/set accessors remain a deliberate divergence:
 * the reference implementations follow the intended semantics there.
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
 * Detects Angular @Component, @Directive, or @Pipe decorators that explicitly
 * set `standalone: false`. Since Angular 19 standalone is the default, so
 * omitting the property (or setting `standalone: true`) is valid — only the
 * explicit opt-out is flagged.
 */
export function detectMissingStandalone(code: string): StandaloneViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: StandaloneViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    for (const decoratorName of ['Component', 'Directive', 'Pipe']) {
      const decorator = cls.getDecorator(decoratorName);
      if (!decorator) continue;

      const args = decorator.getArguments();
      if (args.length === 0) continue;

      const argsText = args[0].getText();
      if (/standalone\s*:\s*false/.test(argsText)) {
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
    // The prefix must be followed by an uppercase letter (lowerCamelCase pipe
    // name): "appUpper" is valid, "apple" is a violation.
    const prefixPattern = new RegExp(`^${prefix}[A-Z]`);
    if (!prefixPattern.test(pipeName)) {
      violations.push({ className: cls.getName() ?? 'unknown', pipeName, expectedPrefix: prefix });
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

export interface ContextualLifecycleViolation {
  className: string;
  methodName: string;
  decoratorName: string;
  reason: string;
}

/**
 * Detects lifecycle methods used in wrong Angular class contexts.
 *
 * Upstream @angular-eslint semantics: @Injectable and @Pipe classes may only
 * declare ngOnDestroy — Angular never calls any other hook on them. Any other
 * hook (ngOnChanges, ngOnInit, ngDoCheck, ngAfterContentInit/Checked,
 * ngAfterViewInit/Checked) is a violation. @Component and @Directive allow
 * ALL hooks — directives DO receive view and content hooks.
 */
export function detectContextualLifecycleViolations(code: string): ContextualLifecycleViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: ContextualLifecycleViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    const decoratorName = cls.getDecorator('Injectable')
      ? 'Injectable'
      : cls.getDecorator('Pipe')
        ? 'Pipe'
        : null;

    // @Component and @Directive (and undecorated classes) allow all hooks.
    if (!decoratorName) continue;

    for (const method of cls.getMethods()) {
      const name = method.getName();

      if (!LIFECYCLE_INTERFACE_MAP[name]) continue; // not a lifecycle hook
      if (name === 'ngOnDestroy') continue; // the only hook allowed here

      violations.push({
        className: cls.getName() ?? 'unknown',
        methodName: name,
        decoratorName,
        reason: `@${decoratorName} classes may only declare ngOnDestroy — ${name} is never called`,
      });
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

const DI_DECORATORS = ['Component', 'Directive', 'Injectable', 'Pipe'];

/**
 * Detects constructor parameters in Angular DI classes (@Component, @Directive,
 * @Injectable, @Pipe). Angular injects every constructor parameter of those
 * classes, with or without an access modifier, so each one is a violation.
 * Undecorated classes are not Angular DI and are ignored.
 */
export function detectConstructorInjection(code: string): ConstructorInjectionViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: ConstructorInjectionViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    if (!DI_DECORATORS.some((d) => cls.getDecorator(d))) continue;

    for (const ctor of cls.getConstructors()) {
      for (const param of ctor.getParameters()) {
        const typeNode = param.getTypeNode();
        violations.push({
          className: cls.getName() ?? 'unknown',
          parameterName: param.getName(),
          parameterType: typeNode?.getText() ?? 'unknown',
        });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// directive-selector
// ---------------------------------------------------------------------------

const DIRECTIVE_SELECTOR_ENTRY = /^\[app[A-Z][A-Za-z0-9]*\]$/;

/**
 * Detects @Directive selectors that are not camelCase attribute selectors with
 * the `app` prefix. Comma-separated lists are valid when every entry is.
 */
export function detectInvalidDirectiveSelector(code: string): SelectorViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: SelectorViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    const decorator = cls.getDecorator('Directive');
    const arg = decorator?.getArguments()[0];
    if (!arg || !Node.isObjectLiteralExpression(arg)) continue;
    const prop = arg.getProperty('selector');
    if (!prop || !Node.isPropertyAssignment(prop)) continue;
    const init = prop.getInitializer();
    if (!init || !Node.isStringLiteral(init)) continue;

    const selector = init.getLiteralText();
    const valid = selector.split(',').every((s) => DIRECTIVE_SELECTOR_ENTRY.test(s.trim()));
    if (!valid) {
      violations.push({
        className: cls.getName() ?? 'unknown',
        selector,
        reason: 'not [appCamelCase]',
      });
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// no-output-native
// ---------------------------------------------------------------------------

const NATIVE_EVENT_NAMES = new Set([
  'abort',
  'blur',
  'change',
  'click',
  'close',
  'contextmenu',
  'copy',
  'cut',
  'dblclick',
  'drag',
  'dragend',
  'dragenter',
  'dragleave',
  'dragover',
  'dragstart',
  'drop',
  'error',
  'focus',
  'focusin',
  'focusout',
  'input',
  'invalid',
  'keydown',
  'keypress',
  'keyup',
  'load',
  'message',
  'mousedown',
  'mouseenter',
  'mouseleave',
  'mousemove',
  'mouseout',
  'mouseover',
  'mouseup',
  'open',
  'paste',
  'pause',
  'play',
  'progress',
  'reset',
  'resize',
  'scroll',
  'select',
  'submit',
  'toggle',
  'touchcancel',
  'touchend',
  'touchmove',
  'touchstart',
  'transitionend',
  'wheel',
]);

const OUTPUT_FUNCTIONS = new Set(['output', 'outputFromObservable']);

/** True when a class property is an output: @Output() or output()/outputFromObservable(). */
function isOutputProperty(prop: PropertyDeclaration): boolean {
  if (prop.getDecorator('Output')) return true;
  const init = prop.getInitializer();
  if (!init || !Node.isCallExpression(init)) return false;
  return OUTPUT_FUNCTIONS.has(init.getExpression().getText());
}

export interface OutputNativeViolation {
  className: string;
  propertyName: string;
}

/**
 * Detects outputs (decorator or signal-based) named after a native DOM event.
 */
export function detectNativeOutputNames(code: string): OutputNativeViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: OutputNativeViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    for (const prop of cls.getProperties()) {
      if (isOutputProperty(prop) && NATIVE_EVENT_NAMES.has(prop.getName())) {
        violations.push({ className: cls.getName() ?? 'unknown', propertyName: prop.getName() });
      }
    }
  }

  return violations;
}

// ---------------------------------------------------------------------------
// no-conflicting-lifecycle
// ---------------------------------------------------------------------------

export interface ConflictingLifecycleViolation {
  className: string;
}

/** Detects classes declaring both ngDoCheck and ngOnChanges. */
export function detectConflictingLifecycle(code: string): ConflictingLifecycleViolation[] {
  const sourceFile = createSourceFile(code);
  const violations: ConflictingLifecycleViolation[] = [];

  for (const cls of sourceFile.getClasses()) {
    const names = new Set(cls.getMethods().map((m) => m.getName()));
    if (names.has('ngDoCheck') && names.has('ngOnChanges')) {
      violations.push({ className: cls.getName() ?? 'unknown' });
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
    // Rules added with the native-AST rewrite
    detectInvalidDirectiveSelector,
    detectNativeOutputNames,
    detectConflictingLifecycle,
  };
}
