import { describe, it, expect } from 'vitest';
import { t, useI18nStore, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import en from '@/lib/i18n/locales/en.json';
import vi from '@/lib/i18n/locales/vi.json';
import ja from '@/lib/i18n/locales/ja.json';
import es from '@/lib/i18n/locales/es.json';
import fr from '@/lib/i18n/locales/fr.json';
import de from '@/lib/i18n/locales/de.json';
import ko from '@/lib/i18n/locales/ko.json';
import zh from '@/lib/i18n/locales/zh.json';

describe('Multi-Language (i18n) - Translation Lookup & Completeness', () => {
  describe('Translation Resolution & Interpolation', () => {
    it('translates known keys in current language', () => {
      useI18nStore.setState({ language: 'en' });
      expect(t('toolbar.arrow')).toBe('Arrow');

      useI18nStore.setState({ language: 'vi' });
      expect(t('toolbar.arrow')).toBe('Mũi tên');
    });

    it('falls back to English when a key is not present in target locale', () => {
      useI18nStore.setState({ language: 'fr' });
      expect(t('toolbar.select')).toBeDefined();
    });

    it('interpolates {param} placeholders dynamically', () => {
      useI18nStore.setState({ language: 'en' });
      const interpolated = t('userAccount.creditsLeft', { credits: 8 });
      expect(interpolated).toBe('8 credits left today');
    });

    it('returns the raw key string if translation is missing everywhere', () => {
      expect(t('non_existent.custom_key')).toBe('non_existent.custom_key');
    });
  });

  describe('8-Locale Key Structure Parity', () => {
    const locales = { en, vi, ja, es, fr, de, ko, zh };

    it('supports all 8 defined languages', () => {
      expect(SUPPORTED_LANGUAGES).toHaveLength(8);
      const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
      expect(codes).toEqual(['en', 'vi', 'ja', 'es', 'fr', 'de', 'ko', 'zh']);
    });

    it('ensures top-level section keys exist across all 8 locale dictionaries', () => {
      const enTopKeys = Object.keys(en);
      for (const [code, dict] of Object.entries(locales)) {
        const topKeys = Object.keys(dict);
        for (const k of enTopKeys) {
          expect(
            topKeys,
            `Locale "${code}" is missing top-level section "${k}"`,
          ).toContain(k);
        }
      }
    });
  });
});
