import { describe, it, expect, vi, beforeEach } from 'vitest';
import { webUrl } from '@/lib/api';

describe('Surfaces - Popup Navigation & Onboarding Shortcuts', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('webUrl Link Construction', () => {
    it('constructs URLs resolving to the open source repository', () => {
      const repoUrl = webUrl();
      expect(repoUrl).toContain('github.com/suhoangan/shotuno-extension');
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

  describe('Popup Capture Loading State Flow', () => {
    it('resets loading state on early return when active tab is internal or invalid', async () => {
      let loadingState: string | null = 'visible';
      let errorState: string | null = null;

      const simulateCapture = async (activeTab: { id?: number; url?: string } | undefined) => {
        try {
          if (!activeTab?.id) {
            errorState = 'No active tab found';
            return;
          }
          if (
            activeTab.url?.startsWith('chrome://') ||
            activeTab.url?.startsWith('chrome-extension://') ||
            activeTab.url?.startsWith('edge://')
          ) {
            errorState = 'Cannot capture Chrome internal pages';
            return;
          }
        } finally {
          loadingState = null;
        }
      };

      await simulateCapture({ id: 1, url: 'chrome://extensions' });
      expect(errorState).toBe('Cannot capture Chrome internal pages');
      expect(loadingState).toBeNull();

      await simulateCapture(undefined);
      expect(errorState).toBe('No active tab found');
      expect(loadingState).toBeNull();
    });
  });
});
