import { describe, expect, it } from 'vitest';
import { licenseStatusOf } from '@/lib/entitlements/license';

describe('trial license status', () => {
  it('marks admin as PRO', () => {
    expect(licenseStatusOf({ role: 'ADMIN', entitlements: {} })).toBe('PRO');
  });

  it('uses entitlements.licenseStatus when present', () => {
    expect(
      licenseStatusOf({
        entitlements: { licenseStatus: 'TRIAL' },
      }),
    ).toBe('TRIAL');
    expect(
      licenseStatusOf({
        entitlements: { licenseStatus: 'FREE' },
      }),
    ).toBe('FREE');
  });
});
