import { execFile } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');

const BIOME_BIN = resolve(ROOT, 'node_modules/.bin/biome');

/**
 * Temporary directory for integration test files.
 * Generated once at module load outside the project tree.
 */
const TEMP_DIR = mkdtempSync(join(tmpdir(), 'biome-angular-integration-'));

process.on('exit', () => {
  try {
    rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch {
    // ignore
  }
});

export interface BiomeDiagnostic {
  category: string;
  severity: string;
  message: string;
}

export interface BiomeCheckResult {
  diagnostics: BiomeDiagnostic[];
  raw: string;
}

let fileCounter = 0;

/**
 * Maps a rule name to its .grit file path.
 */
const RULE_PATHS: Record<string, string | string[]> = {
  'prefer-standalone': 'rules/high-priority/prefer-standalone.grit',
  // One rule, two files with the same stem (non-fixable and fixable cases).
  'no-empty-lifecycle-method': [
    'rules/high-priority/no-empty-lifecycle-method.grit',
    'rules/high-priority/fixes/no-empty-lifecycle-method.grit',
  ],
  'no-service-suffix': 'rules/conventions/no-service-suffix.grit',
  'no-directive-suffix': 'rules/conventions/no-directive-suffix.grit',
  'no-component-suffix': 'rules/conventions/no-component-suffix.grit',
  'component-selector': 'rules/conventions/component-selector.grit',
  'no-input-rename': 'rules/conventions/no-input-rename.grit',
  'no-output-rename': 'rules/conventions/no-output-rename.grit',
  'no-output-on-prefix': 'rules/conventions/no-output-on-prefix.grit',
  'pipe-prefix': 'rules/conventions/pipe-prefix.grit',
  'directive-selector': 'rules/conventions/directive-selector.grit',
  'no-output-native': 'rules/conventions/no-output-native.grit',
  'use-lifecycle-interface': 'rules/quality/use-lifecycle-interface.grit',
  'use-pipe-transform-interface': 'rules/quality/use-pipe-transform-interface.grit',
  'contextual-lifecycle': 'rules/quality/contextual-lifecycle.grit',
  'no-conflicting-lifecycle': 'rules/quality/no-conflicting-lifecycle.grit',
  'prefer-signal-inputs': 'rules/modern/prefer-signal-inputs.grit',
  'prefer-output-function': 'rules/modern/prefer-output-function.grit',
  'prefer-signal-queries': 'rules/modern/prefer-signal-queries.grit',
  'prefer-model-signal': 'rules/modern/prefer-model-signal.grit',
  'prefer-host-property': 'rules/modern/prefer-host-property.grit',
  'prefer-inject-function': 'rules/modern/prefer-inject-function.grit',
};

/**
 * Creates a config directory that loads only the specified rule.
 */
function getConfigDir(rule: string): string {
  const ruleRelPath = RULE_PATHS[rule];
  if (!ruleRelPath) {
    throw new Error(`Unknown rule: ${rule}. Available: ${Object.keys(RULE_PATHS).join(', ')}`);
  }

  const configDir = join(TEMP_DIR, `config-${rule}`);
  mkdirSync(configDir, { recursive: true });

  const gritPaths = (Array.isArray(ruleRelPath) ? ruleRelPath : [ruleRelPath]).map((p) =>
    resolve(ROOT, p),
  );

  writeFileSync(
    join(configDir, 'biome.json'),
    JSON.stringify(
      {
        $schema: 'https://biomejs.dev/schemas/2.5.12/schema.json',
        plugins: gritPaths,
        // Angular constructors use parameter decorators (@Inject, @Optional,
        // @Attribute…), which Biome only parses with this flag — the shipped
        // preset enables it the same way.
        javascript: { parser: { unsafeParameterDecoratorsEnabled: true } },
        formatter: { enabled: false },
        assist: { enabled: false },
        linter: {
          enabled: true,
          rules: { recommended: false },
        },
      },
      null,
      2,
    ),
  );

  return configDir;
}

/**
 * Runs `biome lint` on a TypeScript code snippet for a specific rule.
 *
 * Only the specified rule is loaded, so diagnostics come exclusively
 * from that single GritQL rule.
 */
export async function runBiomeCheck(rule: string, code: string): Promise<BiomeCheckResult> {
  const inputFile = join(TEMP_DIR, `input_${fileCounter++}.ts`);
  writeFileSync(inputFile, code);

  const configDir = getConfigDir(rule);

  let stdout = '';
  let stderr = '';

  try {
    ({ stdout, stderr } = await execFileAsync(
      BIOME_BIN,
      ['lint', '--reporter=json', `--config-path=${configDir}`, inputFile],
      {
        maxBuffer: 4 * 1024 * 1024,
        timeout: 25_000,
      },
    ));
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string };
    stdout = err.stdout ?? '';
    stderr = err.stderr ?? '';
  }

  const raw = stdout || stderr;

  let parsed: { diagnostics?: BiomeDiagnostic[] };
  try {
    parsed = JSON.parse(raw) as { diagnostics?: BiomeDiagnostic[] };
  } catch {
    // Never swallow a biome failure: an unparseable output means the binary
    // crashed, the config is invalid, or the plugin failed to compile. If we
    // returned [] here, every "valid" test would pass vacuously.
    throw new Error(
      `biome produced no parseable JSON for rule "${rule}".\nstdout/stderr:\n${raw || '(empty)'}\nstderr:\n${stderr || '(empty)'}`,
    );
  }

  const diagnostics = parsed.diagnostics ?? [];

  // Fixtures must be valid TypeScript and the config must load: any non-plugin
  // diagnostic (parse error, configuration error…) is a broken test, not a
  // rule result.
  const nonPlugin = diagnostics.filter((d) => d.category !== 'plugin');
  if (nonPlugin.length > 0) {
    throw new Error(
      `biome emitted non-plugin diagnostics for rule "${rule}" (broken fixture or config?): ${JSON.stringify(nonPlugin, null, 2)}`,
    );
  }

  return { diagnostics, raw };
}

/**
 * Runs `biome lint --write` on a snippet with a single rule loaded and returns
 * the file content after Biome applied the rule's safe fixes.
 */
export async function runBiomeFix(rule: string, code: string): Promise<string> {
  const inputFile = join(TEMP_DIR, `fix_${fileCounter++}.ts`);
  writeFileSync(inputFile, code);
  const configDir = getConfigDir(rule);
  try {
    await execFileAsync(BIOME_BIN, ['lint', '--write', `--config-path=${configDir}`, inputFile], {
      maxBuffer: 4 * 1024 * 1024,
      timeout: 25_000,
    });
  } catch {
    // Non-zero exit when diagnostics remain; the file is still rewritten.
  }
  return readFileSync(inputFile, 'utf8');
}

export { createPatternMatcher } from './pattern-matcher.js';
