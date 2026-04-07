/**
 * biome-plugin-angular
 *
 * Main entry point. Exports paths to presets and the plugin manifest
 * for programmatic use.
 */

import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

/** Absolute path to the biome-manifest.jsonc plugin manifest */
export const pluginManifest = join(__dirname, 'biome-manifest.jsonc');

/** Preset config paths */
export const presets = {
  recommended: join(__dirname, 'presets', 'recommended.json'),
  strict: join(__dirname, 'presets', 'strict.json'),
};

/** GritQL rule file paths keyed by rule name */
export const rules = {
  // high-priority
  'prefer-standalone': join(__dirname, 'rules', 'high-priority', 'prefer-standalone.grit'),
  'no-empty-lifecycle-method': join(__dirname, 'rules', 'high-priority', 'no-empty-lifecycle-method.grit'),
  // conventions
  'no-component-suffix': join(__dirname, 'rules', 'conventions', 'no-component-suffix.grit'),
  'no-directive-suffix': join(__dirname, 'rules', 'conventions', 'no-directive-suffix.grit'),
  'no-service-suffix': join(__dirname, 'rules', 'conventions', 'no-service-suffix.grit'),
  'component-selector': join(__dirname, 'rules', 'conventions', 'component-selector.grit'),
  'no-input-rename': join(__dirname, 'rules', 'conventions', 'no-input-rename.grit'),
  'no-output-rename': join(__dirname, 'rules', 'conventions', 'no-output-rename.grit'),
  'no-output-on-prefix': join(__dirname, 'rules', 'conventions', 'no-output-on-prefix.grit'),
  'pipe-prefix': join(__dirname, 'rules', 'conventions', 'pipe-prefix.grit'),
  'sort-ngmodule-metadata-arrays': join(__dirname, 'rules', 'conventions', 'sort-ngmodule-metadata-arrays.grit'),
  // quality
  'use-lifecycle-interface': join(__dirname, 'rules', 'quality', 'use-lifecycle-interface.grit'),
  'use-pipe-transform-interface': join(__dirname, 'rules', 'quality', 'use-pipe-transform-interface.grit'),
  'contextual-lifecycle': join(__dirname, 'rules', 'quality', 'contextual-lifecycle.grit'),
  // modern
  'prefer-signal-inputs': join(__dirname, 'rules', 'modern', 'prefer-signal-inputs.grit'),
  'prefer-output-function': join(__dirname, 'rules', 'modern', 'prefer-output-function.grit'),
  'prefer-signal-queries': join(__dirname, 'rules', 'modern', 'prefer-signal-queries.grit'),
  'prefer-model-signal': join(__dirname, 'rules', 'modern', 'prefer-model-signal.grit'),
  'prefer-host-property': join(__dirname, 'rules', 'modern', 'prefer-host-property.grit'),
  'prefer-inject-function': join(__dirname, 'rules', 'modern', 'prefer-inject-function.grit'),
};
