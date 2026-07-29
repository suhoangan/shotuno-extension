import { describe, expect, it } from 'vitest';
import { googleAuthUrl, API_BASE } from '@/lib/api';

describe('api helpers', () => {
  it('builds google auth url from API base', () => {
    expect(googleAuthUrl()).toBe(`${API_BASE}/auth/google`);
  });
});

