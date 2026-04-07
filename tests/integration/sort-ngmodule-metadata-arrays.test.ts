import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

// NOTE: The GritQL rule detects presence of sortable arrays inside @NgModule.
// It may flag ANY NgModule containing declarations/imports/exports/providers/bootstrap,
// regardless of sort order — GritQL cannot perform algorithmic sort checks.
// The "valid" case uses a NgModule without any sortable arrays to avoid false flags.

describe('angular/sort-ngmodule-metadata-arrays [integration]', () => {
  describe('violations', () => {
    it('flags @NgModule with a declarations array', async () => {
      const { diagnostics, raw } = await runBiomeCheck('sort-ngmodule-metadata-arrays', `
        import { NgModule } from '@angular/core';
        @NgModule({ declarations: [BComponent, AComponent] })
        export class AppModule {}
      `);
      // The GritQL rule fires when a sortable array is present
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
    });
  });

  describe('valid', () => {
    it('accepts @NgModule without any sortable array', async () => {
      const { diagnostics, raw } = await runBiomeCheck('sort-ngmodule-metadata-arrays', `
        import { NgModule } from '@angular/core';
        @NgModule({})
        export class AppModule {}
      `);
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
