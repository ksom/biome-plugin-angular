import { execFile } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '../..');
const BIOME_BIN = resolve(ROOT, 'node_modules/.bin/biome');

/**
 * End-to-end consumer test: packs the plugin exactly as npm would publish it,
 * installs it into a fresh project, and lints through the documented
 * onboarding path (`plugins: ["./node_modules/biome-plugin-angular"]`).
 * This is the only test that exercises the biome-manifest.jsonc resolution
 * and the `files` whitelist of package.json — unit and per-rule integration
 * tests bypass both by loading .grit files directly.
 */
describe('consumer smoke test [integration]', () => {
  let consumerDir: string;

  beforeAll(async () => {
    consumerDir = mkdtempSync(join(tmpdir(), 'biome-angular-consumer-'));

    const { stdout } = await execFileAsync(
      'npm',
      ['pack', '--pack-destination', consumerDir, '--json'],
      { cwd: ROOT, maxBuffer: 16 * 1024 * 1024 },
    );
    const [{ filename }] = JSON.parse(stdout) as [{ filename: string }];

    await execFileAsync(
      'npm',
      ['install', '--no-audit', '--no-fund', join(consumerDir, filename)],
      {
        cwd: consumerDir,
        maxBuffer: 16 * 1024 * 1024,
      },
    );
  }, 120_000);

  afterAll(() => {
    try {
      rmSync(consumerDir, { recursive: true, force: true });
    } catch {
      // ignore
    }
  });

  async function lint(
    file: string,
  ): Promise<{ diagnostics: Array<{ category: string; message: string }> }> {
    let stdout = '';
    let stderr = '';
    try {
      ({ stdout, stderr } = await execFileAsync(BIOME_BIN, ['lint', '--reporter=json', file], {
        cwd: consumerDir,
        maxBuffer: 4 * 1024 * 1024,
        timeout: 30_000,
      }));
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string };
      stdout = err.stdout ?? '';
      stderr = err.stderr ?? '';
    }
    const raw = stdout || stderr;
    const parsed = JSON.parse(raw) as {
      diagnostics?: Array<{ category: string; message: string }>;
    };
    return { diagnostics: parsed.diagnostics ?? [] };
  }

  it('lints through the installed package and fires plugin rules', async () => {
    writeFileSync(
      join(consumerDir, 'biome.json'),
      JSON.stringify(
        {
          plugins: ['./node_modules/biome-plugin-angular'],
          formatter: { enabled: false },
          linter: { enabled: true, rules: { recommended: false } },
        },
        null,
        2,
      ),
    );
    writeFileSync(
      join(consumerDir, 'violation.ts'),
      [
        "import { Component } from '@angular/core';",
        "@Component({ selector: 'app-user', standalone: false, template: '' })",
        'export class UserComponent {}',
        '',
      ].join('\n'),
    );

    const { diagnostics } = await lint('violation.ts');
    const messages = diagnostics.map((d) => d.message).join('\n');

    expect(diagnostics.length, messages).toBeGreaterThanOrEqual(2);
    for (const d of diagnostics) {
      expect(d.category).toBe('plugin');
    }
    expect(messages).toContain('standalone: false');
    expect(messages).toContain("'Component' suffix");
  });

  it('cli init generates a config biome accepts', async () => {
    rmSync(join(consumerDir, 'biome.json'), { force: true });
    await execFileAsync('node', ['node_modules/biome-plugin-angular/cli.js', 'init'], {
      cwd: consumerDir,
    });

    const { diagnostics } = await lint('violation.ts');
    // Same violations as above — proves the generated config both loads and
    // activates the plugin. A config error would surface as a non-plugin
    // diagnostic or an unparseable run.
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
    for (const d of diagnostics) {
      expect(d.category).toBe('plugin');
    }
  });

  it('preset works via extends from the package', async () => {
    writeFileSync(
      join(consumerDir, 'biome.json'),
      JSON.stringify(
        {
          extends: ['biome-plugin-angular/presets/recommended.json'],
          formatter: { enabled: false },
          linter: { enabled: true, rules: { recommended: false } },
        },
        null,
        2,
      ),
    );

    const { diagnostics } = await lint('violation.ts');
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
    for (const d of diagnostics) {
      expect(d.category).toBe('plugin');
    }
  });

  it('cli rules lists rules from the installed package without crashing', async () => {
    const { stdout } = await execFileAsync(
      'node',
      ['node_modules/biome-plugin-angular/cli.js', 'rules'],
      { cwd: consumerDir },
    );
    expect(stdout).toContain('angular/prefer-standalone');
    expect(stdout).toContain('rules migrated');
  });
});
