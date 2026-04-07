import { execFile } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
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
const RULE_PATHS: Record<string, string> = {
  'prefer-standalone': 'rules/high-priority/prefer-standalone.grit',
  'no-empty-lifecycle-method': 'rules/high-priority/no-empty-lifecycle-method.grit',
  'no-service-suffix': 'rules/conventions/no-service-suffix.grit',
  'no-directive-suffix': 'rules/conventions/no-directive-suffix.grit',
  'no-component-suffix': 'rules/conventions/no-component-suffix.grit',
  'component-selector': 'rules/conventions/component-selector.grit',
  'no-input-rename': 'rules/conventions/no-input-rename.grit',
  'no-output-rename': 'rules/conventions/no-output-rename.grit',
  'no-output-on-prefix': 'rules/conventions/no-output-on-prefix.grit',
  'pipe-prefix': 'rules/conventions/pipe-prefix.grit',
  'sort-ngmodule-metadata-arrays': 'rules/conventions/sort-ngmodule-metadata-arrays.grit',
  'use-lifecycle-interface': 'rules/quality/use-lifecycle-interface.grit',
  'use-pipe-transform-interface': 'rules/quality/use-pipe-transform-interface.grit',
  'contextual-lifecycle': 'rules/quality/contextual-lifecycle.grit',
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

  const gritPath = resolve(ROOT, ruleRelPath);

  writeFileSync(
    join(configDir, 'biome.json'),
    JSON.stringify(
      {
        $schema: 'https://biomejs.dev/schemas/2.4.8/schema.json',
        plugins: [gritPath],
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
export async function runBiomeCheck(
  rule: string,
  code: string,
): Promise<BiomeCheckResult> {
  const inputFile = join(TEMP_DIR, `input_${fileCounter++}.ts`);
  writeFileSync(inputFile, code);

  const configDir = getConfigDir(rule);

  let stdout = '';
  let stderr = '';

  try {
    ({ stdout, stderr } = await execFileAsync(
      BIOME_BIN,
      [
        'lint',
        '--reporter=json',
        `--config-path=${configDir}`,
        inputFile,
      ],
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

  try {
    const parsed = JSON.parse(raw) as { diagnostics?: BiomeDiagnostic[] };
    return { diagnostics: parsed.diagnostics ?? [], raw };
  } catch {
    return { diagnostics: [], raw };
  }
}

export { createPatternMatcher } from './pattern-matcher.js';
