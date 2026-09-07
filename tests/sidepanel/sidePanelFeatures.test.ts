import { describe, it, expect } from 'vitest';
import {
  SHOTUNO_DRAG_MIME,
  setShotunoDragData,
  parseShotunoDragIds,
  ShotunoDragPayload,
} from '@/lib/shotunoDrag';

describe('Side Panel - Gallery, Pins & Drag-and-Drop Operations', () => {
  describe('setShotunoDragData serialization', () => {
    it('sets custom JSON MIME type and typed fallback string on DataTransfer', () => {
      const storageMap = new Map<string, string>();
      const dt = {
        effectAllowed: 'none',
        setData: (mime: string, val: string) => storageMap.set(mime, val),
      } as unknown as DataTransfer;

      const payload: ShotunoDragPayload = {
        kind: 'pin',
        ids: ['pin-123', 'pin-456'],
      };

      setShotunoDragData(dt, payload);

      expect(dt.effectAllowed).toBe('copyMove');
      expect(storageMap.get(SHOTUNO_DRAG_MIME)).toBe(JSON.stringify(payload));
      expect(storageMap.get('text/plain')).toBe('shotuno:pin:pin-123,shotuno:pin:pin-456');
    });
  });

  describe('parseShotunoDragIds deserialization', () => {
    it('parses valid JSON drag payloads directly', () => {
      const raw = JSON.stringify({ kind: 'gallery', ids: ['img-1'] });
      const parsed = parseShotunoDragIds(raw);
      expect(parsed).toEqual({ kind: 'gallery', ids: ['img-1'] });
    });

    it('parses formatted plain text fallbacks', () => {
      const raw = 'shotuno:pin:p1, shotuno:pin:p2';
      const parsed = parseShotunoDragIds(raw);
      expect(parsed).toEqual({ kind: 'pin', ids: ['p1', 'p2'] });
    });

    it('recovers legacy bare ID strings as gallery kind', () => {
      const raw = 'img-abc-123';
      const parsed = parseShotunoDragIds(raw);
      expect(parsed).toEqual({ kind: 'gallery', ids: ['img-abc-123'] });
    });

    it('returns null on null, undefined, or unparseable empty inputs', () => {
      expect(parseShotunoDragIds(null)).toBeNull();
      expect(parseShotunoDragIds(undefined)).toBeNull();
      expect(parseShotunoDragIds('')).toBeNull();
      expect(parseShotunoDragIds('   ')).toBeNull();
    });
  });
});
