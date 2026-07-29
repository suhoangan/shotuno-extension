import { useCallback, useEffect, useState } from 'react';

/** True when the active tab has Shotuno editor/capture UI open. */
export function useActiveTabEditing(): boolean {
  const [editing, setEditing] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      const tabId = tabs[0]?.id;
      if (tabId == null) {
        setEditing(false);
        return;
      }
      const res = await chrome.tabs.sendMessage(tabId, { type: 'SHOTUNO_EDITOR_STATUS' }) as
        | { editing?: boolean }
        | undefined;
      setEditing(Boolean(res?.editing));
    } catch {
      setEditing(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const onActivated = () => { void refresh(); };
    const onUpdated = (_tabId: number, info: { status?: string; url?: string }) => {
      if (info.status === 'complete' || info.url) void refresh();
    };
    const onFocus = () => { void refresh(); };

    chrome.tabs.onActivated.addListener(onActivated);
    chrome.tabs.onUpdated.addListener(onUpdated);
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    const timer = window.setInterval(() => { void refresh(); }, 1000);

    return () => {
      chrome.tabs.onActivated.removeListener(onActivated);
      chrome.tabs.onUpdated.removeListener(onUpdated);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
      window.clearInterval(timer);
    };
  }, [refresh]);

  return editing;
}
