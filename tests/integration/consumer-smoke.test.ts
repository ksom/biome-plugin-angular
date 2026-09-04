import { execFile } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
    const written = JSON.parse(readFileSync(join(consumerDir, 'biome.json'), 'utf8'));
    expect(written.extends).toEqual(['biome-plugin-angular/presets/recommended.json']);

    const { diagnostics } = await lint('violation.ts');
    // Same violations as above — proves the generated config both loads and
    // activates the plugin. A config error would surface as a non-plugin
    // diagnostic or an unparseable run.
    expect(diagnostics.length).toBeGreaterThanOrEqual(2);
    for (const d of diagnostics) {
      expect(d.category).toBe('plugin');
    }
  });

  it('cli merge adds the preset once and cli remove strips it', async () => {
    writeFileSync(
      join(consumerDir, 'biome.json'),
      JSON.stringify({ formatter: { enabled: false } }, null, 2),
    );
    const cli = ['node_modules/biome-plugin-angular/cli.js'];
    await execFileAsync('node', [...cli, 'merge'], { cwd: consumerDir });
    await execFileAsync('node', [...cli, 'merge'], { cwd: consumerDir });
    let cfg = JSON.parse(readFileSync(join(consumerDir, 'biome.json'), 'utf8'));
    expect(cfg.extends).toEqual(['biome-plugin-angular/presets/recommended.json']);
    expect(cfg.formatter).toEqual({ enabled: false });

    await execFileAsync('node', [...cli, 'remove'], { cwd: consumerDir });
    cfg = JSON.parse(readFileSync(join(consumerDir, 'biome.json'), 'utf8'));
    expect(cfg.extends).toBeUndefined();
    expect(cfg.formatter).toEqual({ enabled: false });
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

  it('preset keeps Angular code parseable and buildable', async () => {
    writeFileSync(
      join(consumerDir, 'biome.json'),
      JSON.stringify({ extends: ['biome-plugin-angular/presets/recommended.json'] }, null, 2),
    );
    // Real-world Angular: parameter decorators in the constructor (a parse
    // error in Biome's default configuration), a class that implements a
    // lifecycle interface, and a type-only usage of an injected token that
    // Biome's useImportType would otherwise rewrite to `import type` — which
    // breaks Angular DI at build time (NG2003).
    writeFileSync(
      join(consumerDir, 'real-world.ts'),
      [
        "import { Component, Inject, OnInit } from '@angular/core';",
        "import { DOCUMENT } from '@angular/common';",
        "import { HttpClient } from '@angular/common/http';",
        "@Component({ selector: 'app-user', template: '' })",
        'export class UserComponent implements OnInit {',
        '  constructor(@Inject(DOCUMENT) private doc: Document, private http: HttpClient) {}',
        '  ngOnInit(): void {}',
        '  ngOnDestroy(): void {}',
        '}',
        '',
      ].join('\n'),
    );

    const { diagnostics } = await lint('real-world.ts');
    const messages = diagnostics.map((d) => d.message);
    expect(
      diagnostics.every((d) => d.category !== 'parse'),
      messages.join('\n'),
    ).toBe(true);
    expect(messages.some((m) => m.includes('[no-component-suffix]'))).toBe(true);
    expect(messages.some((m) => m.includes('[prefer-inject-function]'))).toBe(true);
    expect(messages.some((m) => m.includes('[no-empty-lifecycle-method]'))).toBe(true);
    expect(diagnostics.some((d) => d.category === 'lint/style/useImportType')).toBe(false);

    // --write applies the plugin's safe fix and nothing that breaks DI.
    try {
      await execFileAsync(BIOME_BIN, ['lint', '--write', 'real-world.ts'], { cwd: consumerDir });
    } catch {
      // remaining diagnostics make biome exit non-zero; the file is written
    }
    const fixed = readFileSync(join(consumerDir, 'real-world.ts'), 'utf8');
    // ngOnInit is kept: the class implements OnInit, deleting it would break the build.
    expect(fixed).toContain('ngOnInit(): void {}');
    // ngOnDestroy is removed: OnDestroy is not implemented.
    expect(fixed).not.toContain('ngOnDestroy');
    expect(fixed).not.toContain('import type');
  });

  it('spec files are excluded by the preset', async () => {
    writeFileSync(
      join(consumerDir, 'user.spec.ts'),
      [
        "import { Component } from '@angular/core';",
        "@Component({ selector: 'host', standalone: false, template: '' })",
        'export class HostComponent {}',
        '',
      ].join('\n'),
    );
    const { diagnostics } = await lint('user.spec.ts');
    expect(diagnostics.filter((d) => d.category === 'plugin')).toHaveLength(0);
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
