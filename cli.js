#!/usr/bin/env node
/**
 * biome-angular CLI
 *
 * Commands:
 *   init      — Scaffold a biome.json with biome-plugin-angular configured
 *   merge     — Merge plugin rules into an existing biome.json
 *   remove    — Remove biome-plugin-angular from an existing biome.json
 *   rules     — List all available rules and their status
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const PLUGIN_NAME = 'biome-plugin-angular';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(msg) {
  process.stdout.write(`${msg}\n`);
}

function error(msg) {
  process.stderr.write(`\x1b[31merror\x1b[0m: ${msg}\n`);
  process.exit(1);
}

function success(msg) {
  process.stdout.write(`\x1b[32m✔\x1b[0m  ${msg}\n`);
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch {
    error(`Failed to read or parse ${filePath}`);
  }
}

function writeJson(filePath, data) {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdInit(args) {
  const preset = args.includes('--strict') ? 'strict' : 'recommended';
  const targetPath = resolve(process.cwd(), 'biome.json');

  if (existsSync(targetPath) && !args.includes('--force')) {
    error(
      `biome.json already exists. Use --force to overwrite, or run 'biome-angular merge' to add the plugin to your existing config.`,
    );
  }

  const presetConfig = readJson(join(__dirname, 'presets', `${preset}.json`));
  delete presetConfig.description;
  presetConfig.$schema = 'https://biomejs.dev/schemas/2.0.0/schema.json';

  writeJson(targetPath, presetConfig);
  success(`Created biome.json with ${PLUGIN_NAME} (${preset} preset).`);
  log('');
  log('Next steps:');
  log(`  1. npx @biomejs/biome check .`);
  log(`  2. Review docs: https://github.com/yourusername/${PLUGIN_NAME}#rules`);
}

function cmdMerge(args) {
  const targetPath = resolve(process.cwd(), 'biome.json');

  if (!existsSync(targetPath)) {
    error(`biome.json not found. Run 'biome-angular init' to create one.`);
  }

  const preset = args.includes('--strict') ? 'strict' : 'recommended';
  const existing = readJson(targetPath);
  const presetConfig = readJson(join(__dirname, 'presets', `${preset}.json`));

  // Merge plugins array
  if (!existing.plugins) existing.plugins = [];
  if (!existing.plugins.includes(PLUGIN_NAME)) {
    existing.plugins.push(PLUGIN_NAME);
  }

  // Merge linter rules
  existing.linter = existing.linter ?? {};
  existing.linter.rules = existing.linter.rules ?? {};
  existing.linter.rules.plugins = {
    ...presetConfig.linter?.rules?.plugins,
    ...(existing.linter.rules.plugins ?? {}),
  };

  writeJson(targetPath, existing);
  success(`Merged ${PLUGIN_NAME} (${preset} preset) into biome.json.`);
}

function cmdRemove() {
  const targetPath = resolve(process.cwd(), 'biome.json');

  if (!existsSync(targetPath)) {
    error(`biome.json not found.`);
  }

  const config = readJson(targetPath);

  // Remove from plugins
  if (Array.isArray(config.plugins)) {
    config.plugins = config.plugins.filter((p) => p !== PLUGIN_NAME);
    if (config.plugins.length === 0) delete config.plugins;
  }

  // Remove plugin rules
  if (config.linter?.rules?.plugins) {
    for (const key of Object.keys(config.linter.rules.plugins)) {
      if (key.startsWith('angular/')) {
        delete config.linter.rules.plugins[key];
      }
    }
    if (Object.keys(config.linter.rules.plugins).length === 0) {
      delete config.linter.rules.plugins;
    }
  }

  writeJson(targetPath, config);
  success(`Removed ${PLUGIN_NAME} from biome.json.`);
}

function cmdRules() {
  const rulesPath = join(__dirname, 'rules-to-migrate.json');
  const { typescript: rules } = readJson(rulesPath);

  const statusIcon = { done: '✅', todo: '⬜', 'in-progress': '🔄', skipped: '⏭️ ' };
  const categoryOrder = { 'high-priority': 0, conventions: 1, quality: 2 };

  rules.sort((a, b) => categoryOrder[a.category] - categoryOrder[b.category]);

  let currentCategory = null;
  for (const rule of rules) {
    if (rule.category !== currentCategory) {
      currentCategory = rule.category;
      log(`\n  ${currentCategory.toUpperCase()}`);
    }
    const icon = statusIcon[rule.status] ?? '❓';
    log(`    ${icon}  angular/${rule.name.padEnd(34)} (${rule.eslintRule})`);
  }

  const done = rules.filter((r) => r.status === 'done').length;
  log(`\n  ${done}/${rules.length} rules migrated\n`);
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const [, , command, ...rest] = process.argv;

switch (command) {
  case 'init':
    cmdInit(rest);
    break;
  case 'merge':
    cmdMerge(rest);
    break;
  case 'remove':
    cmdRemove();
    break;
  case 'rules':
    cmdRules();
    break;
  default:
    log(`
  biome-angular — Biome plugin for Angular

  Usage:
    biome-angular init [--strict] [--force]
    biome-angular merge [--strict]
    biome-angular remove
    biome-angular rules

  Commands:
    init     Create a biome.json preconfigured with this plugin
    merge    Add this plugin to your existing biome.json
    remove   Remove this plugin from your biome.json
    rules    List all rules and their implementation status
`);
    if (command && command !== '--help' && command !== '-h') {
      error(`Unknown command: ${command}`);
    }
}
