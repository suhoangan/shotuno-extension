/** Reusable in-memory Chrome extension API mock for Vitest */

type StorageChangeCallback = (
  changes: Record<string, { oldValue?: unknown; newValue?: unknown }>,
  areaName: string,
) => void;

export class MockStorageArea {
  private data = new Map<string, unknown>();

  async get(keys?: string | string[] | Record<string, unknown> | null) {
    if (!keys) {
      return Object.fromEntries(this.data.entries());
    }
    if (typeof keys === 'string') {
      return { [keys]: this.data.get(keys) };
    }
    if (Array.isArray(keys)) {
      const res: Record<string, unknown> = {};
      for (const k of keys) res[k] = this.data.get(k);
      return res;
    }
    const res = { ...keys };
    for (const k of Object.keys(keys)) {
      if (this.data.has(k)) res[k] = this.data.get(k);
    }
    return res;
  }

  async set(items: Record<string, unknown>) {
    for (const [k, v] of Object.entries(items)) {
      this.data.set(k, v);
    }
  }

  async remove(keys: string | string[]) {
    const list = Array.isArray(keys) ? keys : [keys];
    for (const k of list) this.data.delete(k);
  }

  async clear() {
    this.data.clear();
  }

  peek(key: string) {
    return this.data.get(key);
  }
}

export function createMockChrome() {
  const local = new MockStorageArea();
  const session = new MockStorageArea();
  const sync = new MockStorageArea();
  const listeners = new Set<StorageChangeCallback>();
  const messageListeners = new Set<Function>();
  const tabsList: Array<{ id: number; url: string; active: boolean; title?: string }> = [
    { id: 1, url: 'https://example.com/test', active: true, title: 'Example' },
  ];

  return {
    storage: {
      local,
      session,
      sync,
      onChanged: {
        addListener: (fn: StorageChangeCallback) => listeners.add(fn),
        removeListener: (fn: StorageChangeCallback) => listeners.delete(fn),
        _trigger: (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>, area: string) => {
          for (const fn of listeners) fn(changes, area);
        },
      },
    },
    runtime: {
      lastError: null as { message: string } | null,
      id: 'shotuno-test-extension-id',
      getURL: (path: string) => `chrome-extension://shotuno-test-extension-id/${path.replace(/^\//, '')}`,
      sendMessage: async (msg: unknown) => ({ success: true, payload: msg }),
      onMessage: {
        addListener: (fn: Function) => messageListeners.add(fn),
        removeListener: (fn: Function) => messageListeners.delete(fn),
        _listeners: messageListeners,
      },
      openOptionsPage: async () => {},
    },
    tabs: {
      query: async (queryInfo: Record<string, unknown>) => {
        if (queryInfo.active) return tabsList.filter((t) => t.active);
        return [...tabsList];
      },
      captureVisibleTab: async (_windowId: number | null, _options?: unknown) =>
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      create: async (props: { url: string }) => {
        const tab = { id: tabsList.length + 1, url: props.url, active: true };
        tabsList.push(tab);
        return tab;
      },
      update: async (tabId: number, props: { url?: string; active?: boolean }) => {
        const tab = tabsList.find((t) => t.id === tabId);
        if (tab) Object.assign(tab, props);
        return tab;
      },
      sendMessage: async (_tabId: number, msg: unknown) => ({ received: true, msg }),
    },
    action: {
      setIcon: async () => {},
      setTitle: async () => {},
      setBadgeText: async () => {},
      setBadgeBackgroundColor: async () => {},
    },
    sidePanel: {
      open: async () => {},
      setOptions: async () => {},
    },
  };
}
