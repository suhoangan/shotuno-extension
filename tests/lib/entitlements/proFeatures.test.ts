import { describe, expect, it } from 'vitest';
import {
  defaultProFeatures,
  isProFeatureEnabled,
  normalizeProFeatures,
  PRO_FEATURE_IDS,
  toolFeatureId,
  toolProFeatureId,
} from '@/lib/entitlements/proFeatures';

describe('proFeatures', () => {
  it('lists extension features in sync with the API catalog size', () => {
    expect(PRO_FEATURE_IDS.length).toBe(24);
    expect(PRO_FEATURE_IDS).toContain('window_border');
    expect(PRO_FEATURE_IDS).not.toContain('cloud_drive');
    expect(PRO_FEATURE_IDS).not.toContain('cloud_s3');
  });

  it('defaults all features enabled in the UI', () => {
    const d = defaultProFeatures();
    expect(d.ocr).toBe(true);
    expect(d.send_to_ai).toBe(true);
    expect(d.arrow).toBe(true);
    expect(d.export_download).toBe(true);
  });

  it('maps gated ToolType to ProFeatureId', () => {
    expect(toolProFeatureId('ocr')).toBe('ocr');
    expect(toolProFeatureId('smart_blur')).toBe('smart_blur');
    expect(toolProFeatureId('watermark')).toBe('watermark');
    // Free annotation tools (including stickers, shapes, select) are not credit-gated via toolProFeatureId
    expect(toolProFeatureId('stickers')).toBeNull();
    expect(toolProFeatureId('rect')).toBeNull();
    expect(toolProFeatureId('select')).toBeNull();
  });

  it('maps annotation tools to catalog ids for UI enable/disable', () => {
    expect(toolFeatureId('arrow')).toBe('arrow');
    expect(toolFeatureId('rect')).toBe('shapes');
    expect(toolFeatureId('select')).toBeNull();
  });

  it('normalizes partial updates and ignores junk', () => {
    expect(normalizeProFeatures({ ocr: false, nope: true })).toEqual({
      ...defaultProFeatures(),
      ocr: false,
    });
    expect(normalizeProFeatures(null).ocr).toBe(true);
  });

  it('treats unknown feature ids as enabled', () => {
    const map = defaultProFeatures();
    map.ocr = false;
    expect(isProFeatureEnabled(map, 'ocr')).toBe(false);
    expect(isProFeatureEnabled(map, 'future_tool')).toBe(true);
  });
});
