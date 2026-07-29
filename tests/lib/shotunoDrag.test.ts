import { describe, expect, it, vi } from 'vitest';
import {
  SHOTUNO_DRAG_MIME,
  fetchLibraryDataUrl,
  parseShotunoDragIds,
  setShotunoDragData,
} from '@/lib/shotunoDrag';

function mockDataTransfer() {
  const store = new Map<string, string>();
  return {
    effectAllowed: 'none' as string,
    setData: vi.fn((type: string, data: string) => {
      store.set(type, data);
    }),
    getData: (type: string) => store.get(type) ?? '',
    _store: store,
  };
}

describe('parseShotunoDragIds', () => {
  it('parses JSON gallery payload', () => {
    expect(
      parseShotunoDragIds(JSON.stringify({ kind: 'gallery', ids: ['a', 'b'] })),
    ).toEqual({ kind: 'gallery', ids: ['a', 'b'] });
  });

  it('parses JSON pin payload', () => {
    expect(
      parseShotunoDragIds(JSON.stringify({ kind: 'pin', ids: ['p1'] })),
    ).toEqual({ kind: 'pin', ids: ['p1'] });
  });

  it('rejects empty ids or unknown kind', () => {
    expect(parseShotunoDragIds(JSON.stringify({ kind: 'gallery', ids: [] }))).toBeNull();
    expect(parseShotunoDragIds(JSON.stringify({ kind: 'other', ids: ['x'] }))).toBeNull();
    expect(parseShotunoDragIds(null)).toBeNull();
    expect(parseShotunoDragIds('')).toBeNull();
  });

  it('parses shotuno: plain-text fallback', () => {
    expect(parseShotunoDragIds('shotuno:pin:abc,shotuno:pin:def')).toEqual({
      kind: 'pin',
      ids: ['abc', 'def'],
    });
    expect(parseShotunoDragIds('shotuno:gallery:g1')).toEqual({
      kind: 'gallery',
      ids: ['g1'],
    });
  });

  it('parses legacy bare ids as gallery', () => {
    expect(parseShotunoDragIds('id-one,id-two')).toEqual({
      kind: 'gallery',
      ids: ['id-one', 'id-two'],
    });
  });
});

describe('setShotunoDragData', () => {
  it('writes MIME + text/plain fallback', () => {
    const dt = mockDataTransfer();
    setShotunoDragData(dt as unknown as DataTransfer, {
      kind: 'pin',
      ids: ['p1', 'p2'],
    });
    expect(dt.effectAllowed).toBe('copyMove');
    expect(dt.setData).toHaveBeenCalledWith(
      SHOTUNO_DRAG_MIME,
      JSON.stringify({ kind: 'pin', ids: ['p1', 'p2'] }),
    );
    expect(dt.setData).toHaveBeenCalledWith(
      'text/plain',
      'shotuno:pin:p1,shotuno:pin:p2',
    );
  });
});

describe('fetchLibraryDataUrl', () => {
  it('returns null without chrome.runtime', async () => {
    expect(await fetchLibraryDataUrl('gallery', 'x')).toBeNull();
  });

  it('requests GET_FULL_IMAGE for gallery and GET_PIN_FULL for pin', async () => {
    const sendMessage = vi.fn((_msg: unknown, cb: (r: { dataUrl?: string }) => void) => {
      cb({ dataUrl: 'data:image/png;base64,abc' });
    });
    vi.stubGlobal('chrome', {
      runtime: { sendMessage, lastError: undefined },
    });

    await expect(fetchLibraryDataUrl('gallery', 'g1')).resolves.toBe(
      'data:image/png;base64,abc',
    );
    expect(sendMessage).toHaveBeenCalledWith(
      { type: 'GET_FULL_IMAGE', payload: { id: 'g1' } },
      expect.any(Function),
    );

    await expect(fetchLibraryDataUrl('pin', 'p1')).resolves.toBe(
      'data:image/png;base64,abc',
    );
    expect(sendMessage).toHaveBeenCalledWith(
      { type: 'GET_PIN_FULL', payload: { id: 'p1' } },
      expect.any(Function),
    );

    vi.unstubAllGlobals();
  });
});

