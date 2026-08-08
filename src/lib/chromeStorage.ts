// A drop-in replacement for chrome.storage to make mocking and abstracting easier

const isAvailable = () => typeof chrome !== 'undefined' && !!chrome.storage;

type Callback = (result: { [key: string]: any }) => void;

const mockStorage = {
  get: async (_keys?: any, callback?: Callback) => {
    const res = {};
    if (callback) callback(res);
    return res;
  },
  set: async (_items: any, callback?: () => void) => {
    if (callback) callback();
  },
  remove: async (_keys: any, callback?: () => void) => {
    if (callback) callback();
  },
  clear: async (callback?: () => void) => {
    if (callback) callback();
  },
};

export const storage = {
  isAvailable,
  local: (isAvailable() && chrome.storage.local ? chrome.storage.local : mockStorage) as typeof chrome.storage.local,
  session: (isAvailable() && chrome.storage.session ? chrome.storage.session : mockStorage) as typeof chrome.storage.session,
  sync: (isAvailable() && chrome.storage.sync ? chrome.storage.sync : mockStorage) as typeof chrome.storage.sync,
  onChanged: (isAvailable() && chrome.storage.onChanged ? chrome.storage.onChanged : {
    addListener: (_callback: any) => {},
    removeListener: (_callback: any) => {},
  }) as typeof chrome.storage.onChanged
};
