import { describe, expect, it } from 'vitest';
import {
  PRO_FEATURE_IDS,
  PRO_FEATURE_LABELS,
  PRO_FEATURE_GROUPS,
  defaultProFeatures,
  isProFeatureEnabled,
  toolFeatureId,
  toolProFeatureId,
  type ProFeatureId,
} from '@/lib/entitlements/proFeatures';

describe('Comprehensive Feature Catalog Coverage (All 24 Features)', () => {
  it('contains exactly 24 features in the canonical catalog', () => {
    expect(PRO_FEATURE_IDS).toHaveLength(24);
  });

  it('has valid non-empty labels for every feature ID', () => {
    PRO_FEATURE_IDS.forEach((id: ProFeatureId) => {
      expect(PRO_FEATURE_LABELS[id]).toBeDefined();
      expect(PRO_FEATURE_LABELS[id].length).toBeGreaterThan(0);
    });
  });

  it('has valid group assignment for every feature ID', () => {
    const validGroups = ['Annotation', 'Edit', 'Export polish', 'Tools', 'Library', 'Export', 'Capture'];
    PRO_FEATURE_IDS.forEach((id: ProFeatureId) => {
      const group = PRO_FEATURE_GROUPS[id];
      expect(group).toBeDefined();
      expect(validGroups).toContain(group);
    });
  });

  it('enables all 24 features by default in defaultProFeatures()', () => {
    const features = defaultProFeatures();
    PRO_FEATURE_IDS.forEach((id: ProFeatureId) => {
      expect(features[id]).toBe(true);
      expect(isProFeatureEnabled(features, id)).toBe(true);
    });
  });

  it('correctly maps tool strings to UI feature IDs', () => {
    expect(toolFeatureId('arrow')).toBe('arrow');
    expect(toolFeatureId('rect')).toBe('shapes');
    expect(toolFeatureId('circle')).toBe('shapes');
    expect(toolFeatureId('triangle')).toBe('shapes');
    expect(toolFeatureId('stickers')).toBe('stickers');
    expect(toolFeatureId('text')).toBe('text');
    expect(toolFeatureId('brush')).toBe('brush');
    expect(toolFeatureId('highlight')).toBe('highlight');
    expect(toolFeatureId('counter')).toBe('counter');
    expect(toolFeatureId('blur')).toBe('blur');
    expect(toolFeatureId('magnifier')).toBe('magnifier');
    expect(toolFeatureId('measure')).toBe('measure');
    expect(toolFeatureId('crop')).toBe('crop');
    expect(toolFeatureId('ocr')).toBe('ocr');
    expect(toolFeatureId('smart_blur')).toBe('smart_blur');
    expect(toolFeatureId('send_to_ai')).toBe('send_to_ai');
    expect(toolFeatureId('watermark')).toBe('watermark');
    expect(toolFeatureId('window_border')).toBe('window_border');
    expect(toolFeatureId('resize')).toBe('resize');
    expect(toolFeatureId('export_copy')).toBe('export_copy');
    expect(toolFeatureId('export_download')).toBe('export_download');
    expect(toolFeatureId('cloudUpload')).toBe('cloudUpload');
    expect(toolFeatureId('select')).toBeNull();
  });

  it('correctly distinguishes free vs pro-gated tools via toolProFeatureId', () => {
    // Pro-gated tools (consume daily credits or require PRO subscription)
    const gatedTools = [
      'counter',
      'magnifier',
      'measure',
      'blur',
      'ocr',
      'smart_blur',
      'send_to_ai',
      'watermark',
      'window_border',
      'resize',
      'stickers',
    ];

    gatedTools.forEach((tool) => {
      expect(toolProFeatureId(tool)).not.toBeNull();
    });

    // Ungated free tools
    const freeTools = ['rect', 'arrow', 'circle', 'text', 'brush', 'select', 'highlight'];
    freeTools.forEach((tool) => {
      expect(toolProFeatureId(tool)).toBeNull();
    });
  });
});
