import { exec } from 'node:child_process';
import { mkdtemp, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export interface Diagnostic {
  rule?: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  location?: {
    line: number;
    column: number;
  };
}

export interface CheckResult {
  diagnostics: Diagnostic[];
  exitCode: number;
}

/**
 * Runs `biome check` on a snippet of TypeScript code using the project's
 * biome-plugin.json configuration.
 *
 * NOTE: Requires @biomejs/biome 2.x with plugin support installed.
 */
export async function checkCode(code: string, filename = 'test.ts'): Promise<CheckResult> {
  const dir = await mkdtemp(join(tmpdir(), 'biome-angular-test-'));

  const filePath = join(dir, filename);
  const configPath = join(dir, 'biome.json');

  // Minimal biome.json that loads our plugin
  const biomeConfig = {
    $schema: 'https://biomejs.dev/schemas/2.0.0/schema.json',
    plugins: [join(process.cwd(), 'biome-plugin.json')],
    linter: { enabled: true },
  };

  await Promise.all([
    writeFile(filePath, code, 'utf8'),
    writeFile(configPath, JSON.stringify(biomeConfig, null, 2), 'utf8'),
  ]);

  try {
    const { stdout, stderr } = await execAsync(
      `npx --yes @biomejs/biome check --reporter=json "${filePath}"`,
      { cwd: dir },
    );

    const output = stdout || stderr;
    try {
      const parsed = JSON.parse(output);
      return {
        diagnostics: parsed.diagnostics ?? [],
        exitCode: 0,
      };
    } catch {
      return { diagnostics: [], exitCode: 0 };
    }
  } catch (error: unknown) {
    const execError = error as { stdout?: string; stderr?: string; code?: number };
    const output = execError.stdout || execError.stderr || '';
    try {
      const parsed = JSON.parse(output);
      return {
        diagnostics: parsed.diagnostics ?? [],
        exitCode: execError.code ?? 1,
      };
    } catch {
      return { diagnostics: [], exitCode: execError.code ?? 1 };
    }
  } finally {
    await Promise.all([unlink(filePath).catch(() => {}), unlink(configPath).catch(() => {})]);
  }
}

/**
 * AST-based pattern tester using ts-morph.
 * This is the primary test mechanism — it validates Angular code patterns
 * without needing Biome installed, making unit tests fast and reliable.
 */
export { createPatternMatcher } from './pattern-matcher.js';
