/** In-memory mock for idb-keyval */

export class MockIdbStore {
  private map = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | undefined> {
    return this.map.get(key) as T | undefined;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.map.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.map.delete(key);
  }

  async clear(): Promise<void> {
    this.map.clear();
  }

  async keys(): Promise<string[]> {
    return Array.from(this.map.keys());
  }

  async values<T>(): Promise<T[]> {
    return Array.from(this.map.values()) as T[];
  }

  async entries<T>(): Promise<Array<[string, T]>> {
    return Array.from(this.map.entries()) as Array<[string, T]>;
  }

  size(): number {
    return this.map.size;
  }
}

export function createMockIdb() {
  return new MockIdbStore();
}
