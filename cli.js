#!/usr/bin/env node
/**
 * biome-angular CLI
 *
 * Commands:
 *   init      — Scaffold a biome.json with biome-plugin-angular configured
 *   merge     — Add the plugin to an existing biome.json
 *   remove    — Remove biome-plugin-angular from an existing biome.json
 *   rules     — List all available rules and their status
 *
 * The generated configuration extends the shipped preset
 * (biome-plugin-angular/presets/recommended.json), which loads the plugin and
 * applies the Angular-safe Biome settings (parameter decorators enabled,
 * style/useImportType off). Per-rule severities are set inside each .grit
 * rule (register_diagnostic) — there is no per-rule configuration for plugins.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const PLUGIN_NAME = 'biome-plugin-angular';
const PRESET = `${PLUGIN_NAME}/presets/recommended.json`;
const BIOME_SCHEMA = 'https://biomejs.dev/schemas/2.5.12/schema.json';

/** True when a plugins/extends entry points at this package (any form). */
function referencesPlugin(entry) {
  const value = typeof entry === 'string' ? entry : entry?.path;
  return typeof value === 'string' && value.includes(PLUGIN_NAME);
}

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
  const targetPath = resolve(process.cwd(), 'biome.json');

  if (existsSync(targetPath) && !args.includes('--force')) {
    error(
      `biome.json already exists. Use --force to overwrite, or run 'biome-angular merge' to add the plugin to your existing config.`,
    );
  }

  writeJson(targetPath, {
    $schema: BIOME_SCHEMA,
    extends: [PRESET],
  });
  success(`Created biome.json extending ${PRESET}.`);
  log('');
  log('Next steps:');
  log('  1. npx @biomejs/biome lint .');
  log(`  2. Review docs: https://github.com/ksom/${PLUGIN_NAME}#rules`);
}

function cmdMerge() {
  const targetPath = resolve(process.cwd(), 'biome.json');

  if (!existsSync(targetPath)) {
    error(`biome.json not found. Run 'biome-angular init' to create one.`);
  }

  const existing = readJson(targetPath);

  const alreadyConfigured =
    (Array.isArray(existing.plugins) && existing.plugins.some(referencesPlugin)) ||
    (Array.isArray(existing.extends) && existing.extends.some(referencesPlugin));
  if (!alreadyConfigured) {
    if (!Array.isArray(existing.extends)) existing.extends = [];
    existing.extends.push(PRESET);
  }

  writeJson(targetPath, existing);
  success(
    alreadyConfigured
      ? `${PLUGIN_NAME} is already configured in biome.json.`
      : `Added ${PLUGIN_NAME} to biome.json.`,
  );
}

function cmdRemove() {
  const targetPath = resolve(process.cwd(), 'biome.json');

  if (!existsSync(targetPath)) {
    error(`biome.json not found.`);
  }

  const config = readJson(targetPath);

  for (const key of ['plugins', 'extends']) {
    if (Array.isArray(config[key])) {
      config[key] = config[key].filter((entry) => !referencesPlugin(entry));
      if (config[key].length === 0) delete config[key];
    }
  }

  // Clean up the invalid linter.rules.plugins key written by pre-1.0 versions
  // of this CLI (Biome rejects it as an unknown key).
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
  const categoryOrder = { 'high-priority': 0, conventions: 1, quality: 2, modern: 3 };

  rules.sort((a, b) => (categoryOrder[a.category] ?? 99) - (categoryOrder[b.category] ?? 99));

  let currentCategory = null;
  for (const rule of rules) {
    if (rule.category !== currentCategory) {
      currentCategory = rule.category;
      log(`\n  ${currentCategory.toUpperCase()}`);
    }
    const icon = statusIcon[rule.status] ?? '❓';
    const origin = rule.eslintRule ?? 'new signal-based rule';
    log(`    ${icon}  angular/${rule.name.padEnd(34)} (${origin})`);
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
    cmdMerge();
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
    biome-angular init [--force]
    biome-angular merge
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
