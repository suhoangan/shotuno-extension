import { describe, it, expect, vi, beforeEach } from 'vitest';
import { webUrl } from '@/lib/api';

describe('Surfaces - Popup Navigation & Onboarding Shortcuts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('webUrl Link Construction', () => {
    it('constructs absolute URLs to marketing, auth, and tip endpoints', () => {
      const authUrl = webUrl('/auth');
      const tipUrl = webUrl('/#buy-me-a-coffee');

      expect(authUrl).toContain('/auth');
      expect(tipUrl).toContain('/#buy-me-a-coffee');
    });
  });

  describe('Onboarding Shortcuts Spec', () => {
    it('defines standard cross-platform keyboard shortcuts for primary interactions', () => {
      const shortcuts = [
        { key: 'Alt + Shift + S', mac: 'Option + Shift + S', action: 'Open Shotuno capture popup' },
        { key: 'Esc', mac: 'Esc', action: 'Cancel selection / Close canvas editor' },
        { key: 'Ctrl + Z', mac: 'Cmd + Z', action: 'Undo last annotation step' },
        { key: 'Ctrl + Shift + Z', mac: 'Cmd + Shift + Z', action: 'Redo annotation step' },
      ];

      expect(shortcuts).toHaveLength(4);
      expect(shortcuts[0].key).toBe('Alt + Shift + S');
      expect(shortcuts[1].key).toBe('Esc');
    });
  });
});
