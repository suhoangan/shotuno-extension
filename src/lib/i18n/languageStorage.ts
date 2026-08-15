import { storage } from '../chromeStorage';
import { useI18nStore, SUPPORTED_LANGUAGES, type Language, type LanguageOption } from './index';

export const LANGUAGE_STORAGE_KEY = 'shotunoLanguage';
export { SUPPORTED_LANGUAGES, type LanguageOption };

export async function getSavedLanguage(): Promise<Language | null> {
  if (!storage.isAvailable()) return null;
  return new Promise((resolve) => {
    storage.local.get([LANGUAGE_STORAGE_KEY], (res) => {
      const saved = res[LANGUAGE_STORAGE_KEY] as Language | undefined;
      if (saved && ['en', 'vi', 'ja', 'es', 'fr', 'de', 'ko', 'zh'].includes(saved)) {
        resolve(saved);
      } else {
        resolve(null);
      }
    });
  });
}

export function saveLanguage(lang: Language): void {
  useI18nStore.getState().setLanguage(lang);
}
