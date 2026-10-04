import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  PRO_FEATURE_IDS,
  defaultProFeatures,
  normalizeProFeatures,
  isProFeatureEnabled,
  isProFeatureId,
  toolFeatureId,
  toolProFeatureId,
} from '@/lib/entitlements/proFeatures';
import { loadProFeatures } from '@/lib/entitlements/fetchProFeatures';

describe('Admin & Entitlements - Pro Feature Gating & Flags', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('chrome', {
      storage: {
        local: {
          get: vi.fn().mockResolvedValue({}),
          set: vi.fn().mockResolvedValue(undefined),
        },
      },
    });
  });

  describe('defaultProFeatures', () => {
    it('enables all 24 canonical features by default', () => {
      const defaults = defaultProFeatures();
      expect(Object.keys(defaults)).toHaveLength(PRO_FEATURE_IDS.length);
      for (const id of PRO_FEATURE_IDS) {
        expect(defaults[id]).toBe(true);
      }
    });
  });

  describe('normalizeProFeatures', () => {
    it('returns default map when input is null, undefined, or primitive', () => {
      expect(normalizeProFeatures(null)).toEqual(defaultProFeatures());
      expect(normalizeProFeatures(undefined)).toEqual(defaultProFeatures());
      expect(normalizeProFeatures('invalid')).toEqual(defaultProFeatures());
    });

    it('merges partial overrides while preserving defaults for omitted keys', () => {
      const input = { ocr: false, watermark: false, randomUnknownKey: true };
      const normalized = normalizeProFeatures(input);
      expect(normalized.ocr).toBe(false);
      expect(normalized.watermark).toBe(false);
      expect(normalized.arrow).toBe(true);
      expect(normalized.blur).toBe(true);
    });
  });

  describe('isProFeatureEnabled & isProFeatureId', () => {
    it('accurately reports feature state from map', () => {
      const map = defaultProFeatures();
      map.cloudUpload = false;
      expect(isProFeatureEnabled(map, 'cloudUpload')).toBe(false);
      expect(isProFeatureEnabled(map, 'arrow')).toBe(true);
    });

    it('returns true for unknown or unlisted feature IDs', () => {
      const map = defaultProFeatures();
      expect(isProFeatureEnabled(map, 'non_existent_tool')).toBe(true);
    });

    it('validates canonical feature IDs with isProFeatureId', () => {
      expect(isProFeatureId('counter')).toBe(true);
      expect(isProFeatureId('magnifier')).toBe(true);
      expect(isProFeatureId('unknown_id')).toBe(false);
    });
  });

  describe('tool mappings (toolFeatureId & toolProFeatureId)', () => {
    it('maps annotation and edit tools to catalog feature ids', () => {
      expect(toolFeatureId('arrow')).toBe('arrow');
      expect(toolFeatureId('rect')).toBe('shapes');
      expect(toolFeatureId('circle')).toBe('shapes');
      expect(toolFeatureId('stickers')).toBe('stickers');
      expect(toolFeatureId('text')).toBe('text');
      expect(toolFeatureId('brush')).toBe('brush');
      expect(toolFeatureId('highlight-area')).toBe('highlight');
      expect(toolFeatureId('counter')).toBe('counter');
      expect(toolFeatureId('blur')).toBe('blur');
      expect(toolFeatureId('magnifier')).toBe('magnifier');
      expect(toolFeatureId('measure')).toBe('measure');
      expect(toolFeatureId('ocr')).toBe('ocr');
      expect(toolFeatureId('smart_blur')).toBe('smart_blur');
      expect(toolFeatureId('send_to_ai')).toBe('send_to_ai');
      expect(toolFeatureId('watermark')).toBe('watermark');
      expect(toolFeatureId('window_border')).toBe('window_border');
      expect(toolFeatureId('resize')).toBe('resize');
      expect(toolFeatureId('export_copy')).toBe('export_copy');
      expect(toolFeatureId('export_download')).toBe('export_download');
      expect(toolFeatureId('cloud_upload')).toBe('cloudUpload');
      expect(toolFeatureId('select')).toBeNull();
    });

    it('identifies tools requiring Pro credits or subscription gates', () => {
      expect(toolProFeatureId('counter')).toBe('counter');
      expect(toolProFeatureId('magnifier')).toBe('magnifier');
      expect(toolProFeatureId('measure')).toBe('measure');
      expect(toolProFeatureId('blur')).toBe('blur');
      expect(toolProFeatureId('ocr')).toBe('ocr');
      expect(toolProFeatureId('smart_blur')).toBe('smart_blur');
      expect(toolProFeatureId('send_to_ai')).toBe('send_to_ai');
      expect(toolProFeatureId('watermark')).toBe('watermark');
      expect(toolProFeatureId('window_border')).toBe('window_border');
      expect(toolProFeatureId('resize')).toBe('resize');
      expect(toolProFeatureId('stickers')).toBeNull();
      expect(toolProFeatureId('arrow')).toBeNull();
      expect(toolProFeatureId('brush')).toBeNull();
    });
  });

  describe('loadProFeatures offline static', () => {
    it('returns default features offline without network calls', async () => {
      const features = await loadProFeatures(true);
      expect(features).toEqual(defaultProFeatures());
    });
  });
});
