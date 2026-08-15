import { describe, it, expect, beforeEach } from 'vitest';
import { t, useI18nStore, SUPPORTED_LANGUAGES } from '../../src/lib/i18n';

describe('i18n Module', () => {
  beforeEach(() => {
    useI18nStore.setState({ language: 'en' });
  });

  it('supports 8 global languages', () => {
    expect(SUPPORTED_LANGUAGES.length).toBe(8);
  });

  it('translates English keys correctly', () => {
    expect(t('popup.title')).toBe('Shotuno');
    expect(t('popup.captureMode')).toBe('Capture Mode');
  });

  it('translates Vietnamese, Japanese, and Spanish when language is switched', () => {
    useI18nStore.getState().setLanguage('vi');
    expect(t('popup.captureMode')).toBe('Chế độ chụp');

    useI18nStore.getState().setLanguage('ja');
    expect(t('popup.captureMode')).toBe('キャプチャモード');

    useI18nStore.getState().setLanguage('es');
    expect(t('popup.captureMode')).toBe('Modo de Captura');
  });

  it('falls back to English when key is missing in active locale', () => {
    useI18nStore.getState().setLanguage('ja');
    expect(t('popup.title')).toBe('Shotuno');
  });
});
