/**
 * biome-plugin-angular
 *
 * Main entry point. Exports paths to presets and the plugin manifest
 * for programmatic use.
 */

import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/** Absolute path to the biome-plugin.json manifest */
export const pluginManifest = join(__dirname, 'biome-plugin.json');

/** Preset config paths */
export const presets = {
  recommended: join(__dirname, 'presets', 'recommended.json'),
  strict: join(__dirname, 'presets', 'strict.json'),
};

/** GritQL rule file paths keyed by rule name */
export const rules = {
  'prefer-standalone': join(__dirname, 'rules', 'high-priority', 'prefer-standalone.grit'),
  'no-empty-lifecycle-method': join(
    __dirname,
    'rules',
    'high-priority',
    'no-empty-lifecycle-method.grit',
  ),
  'component-class-suffix': join(
    __dirname,
    'rules',
    'high-priority',
    'component-class-suffix.grit',
  ),
};
