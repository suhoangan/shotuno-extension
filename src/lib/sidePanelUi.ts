import { useCallback, useEffect, useState } from 'react';
import { storage } from '../lib/chromeStorage';


export const SIDE_PANEL_OPEN_KEY = 'shotunoSidePanelOpen';

type ToggleResponse = { success?: boolean; open?: boolean; error?: string };

/** Live open/closed state for side-panel toggle controls. */
export function useToggleSidePanel(onError?: (msg: string) => void) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    storage.local.get([SIDE_PANEL_OPEN_KEY], (result) => {
      if (!chrome.runtime.lastError) {
        setOpen(Boolean(result[SIDE_PANEL_OPEN_KEY]));
      }
    });

    chrome.runtime.sendMessage({ type: 'GET_SIDE_PANEL_OPEN' }, (res) => {
      if (!chrome.runtime.lastError && typeof (res as { open?: boolean } | undefined)?.open === 'boolean') {
        setOpen(Boolean((res as { open: boolean }).open));
      }
    });

    const onStorage = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== 'local' || !changes[SIDE_PANEL_OPEN_KEY]) return;
      setOpen(Boolean(changes[SIDE_PANEL_OPEN_KEY].newValue));
    };

    const onMessage = (message: { type?: string; open?: boolean }) => {
      if (message?.type === 'SIDE_PANEL_OPEN_CHANGED' && typeof message.open === 'boolean') {
        setOpen(message.open);
      }
    };

    storage.onChanged.addListener(onStorage);
    chrome.runtime.onMessage.addListener(onMessage);
    return () => {
      storage.onChanged.removeListener(onStorage);
      chrome.runtime.onMessage.removeListener(onMessage);
    };
  }, []);

  const toggle = useCallback(() => {
    // Optimistic flip so the icon updates immediately.
    setOpen((prev) => !prev);
    chrome.runtime.sendMessage({ type: 'TOGGLE_SIDE_PANEL' }, (res) => {
      const response = res as ToggleResponse | undefined;
      if (chrome.runtime.lastError || !response?.success) {
        // Revert optimistic update
        setOpen((prev) => !prev);
        onError?.(
          response?.error
            || chrome.runtime.lastError?.message
            || 'Could not toggle side panel',
        );
        return;
      }
      if (typeof response.open === 'boolean') {
        setOpen(response.open);
      }
    });
  }, [onError]);

  return { open, toggle };
}
