import { describe, it, expect, beforeEach } from 'vitest';
import { t, useI18nStore, SUPPORTED_LANGUAGES } from './index';
import en from './locales/en.json';
import vi from './locales/vi.json';
import ja from './locales/ja.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ko from './locales/ko.json';
import zh from './locales/zh.json';

describe('i18n Module', () => {
  beforeEach(() => {
    useI18nStore.setState({ language: 'en' });
  });

  it('supports 8 global extension languages', () => {
    expect(SUPPORTED_LANGUAGES.length).toBe(8);
  });

  it('translates English keys correctly', () => {
    expect(t('popup.title')).toBe('Shotuno');
    expect(t('popup.captureMode')).toBe('Capture Mode');
    expect(t('border.title')).toBe('Window Frame & Borders');
    expect(t('resize.title')).toBe('Resize Canvas');
  });

  it('translates Vietnamese keys when language is switched', () => {
    useI18nStore.getState().setLanguage('vi');
    expect(t('popup.captureMode')).toBe('Chế độ chụp');
    expect(t('border.title')).toBe('Khung trình duyệt & Viền');
  });

  it('contains consistent translation keys across all 8 dictionaries', () => {
    const allDicts = [en, vi, ja, es, fr, de, ko, zh];
    for (const dict of allDicts) {
      expect(dict.toolbar).toBeDefined();
      expect(dict.toolbar.select).toBeTruthy();
      expect(dict.border).toBeDefined();
      expect(dict.watermark).toBeDefined();
      expect(dict.resize).toBeDefined();
      expect(dict.dialogs).toBeDefined();
    }
  });

  it('interpolates parameters correctly', () => {
    expect(t('nonexistent.key', { count: 5 })).toBe('nonexistent.key');
  });
});
