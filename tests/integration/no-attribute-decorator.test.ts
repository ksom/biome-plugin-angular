import { describe, expect, it } from 'vitest';
import { runBiomeCheck } from '../helpers/biome-runner.js';

describe('angular/no-attribute-decorator [integration]', () => {
  describe('violations', () => {
    it('flags @Attribute() on a constructor parameter', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-attribute-decorator',
        `
        import { Attribute, Directive } from '@angular/core';
        @Directive({ selector: '[appRole]' })
        export class Role {
          constructor(@Attribute('role') private role: string) {}
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(1);
      expect(diagnostics[0].message).toContain('HostAttributeToken');
    });
  });

  describe('valid', () => {
    it('accepts inject(new HostAttributeToken())', async () => {
      const { diagnostics, raw } = await runBiomeCheck(
        'no-attribute-decorator',
        `
        import { Directive, HostAttributeToken, inject } from '@angular/core';
        @Directive({ selector: '[appRole]' })
        export class Role {
          private readonly role = inject(new HostAttributeToken('role'), { optional: true });
        }
      `,
      );
      expect(diagnostics, `raw output: ${raw}`).toHaveLength(0);
    });
  });
});
