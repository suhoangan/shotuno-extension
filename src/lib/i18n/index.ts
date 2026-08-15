import { create } from 'zustand';
import en from './locales/en.json';
import vi from './locales/vi.json';
import ja from './locales/ja.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ko from './locales/ko.json';
import zh from './locales/zh.json';
import { storage } from '../chromeStorage';

export type Language = 'en' | 'vi' | 'ja' | 'es' | 'fr' | 'de' | 'ko' | 'zh';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
];

const dictionaries: Record<Language, Record<string, any>> = {
  en, vi, ja, es, fr, de, ko, zh
};
export const LANGUAGE_STORAGE_KEY = 'shotunoLanguage';

interface I18nState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export function detectDefaultLanguage(): Language {
  if (typeof window !== 'undefined' && window.navigator?.language) {
    const navLang = window.navigator.language.toLowerCase();
    if (navLang.startsWith('vi')) return 'vi';
    if (navLang.startsWith('ja')) return 'ja';
    if (navLang.startsWith('es')) return 'es';
    if (navLang.startsWith('fr')) return 'fr';
    if (navLang.startsWith('de')) return 'de';
    if (navLang.startsWith('ko')) return 'ko';
    if (navLang.startsWith('zh')) return 'zh';
  }
  return 'en';
}

export const useI18nStore = create<I18nState>((set) => ({
  language: detectDefaultLanguage(),
  setLanguage: (language: Language) => {
    set({ language });
    if (storage.isAvailable()) {
      storage.local.set({ [LANGUAGE_STORAGE_KEY]: language });
    }
    if (typeof window !== 'undefined') {
      window.postMessage({ type: 'SHOTUNO_SET_LANGUAGE', language }, '*');
    }
  },
}));

// Hydrate and listen for storage changes across popup, sidepanel, content script
if (typeof chrome !== 'undefined' && storage.isAvailable()) {
  storage.local.get([LANGUAGE_STORAGE_KEY], (res) => {
    const saved = res[LANGUAGE_STORAGE_KEY] as Language | undefined;
    if (saved && ['en', 'vi', 'ja', 'es', 'fr', 'de', 'ko', 'zh'].includes(saved)) {
      useI18nStore.setState({ language: saved });
    }
  });

  if (chrome.storage?.onChanged) {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === 'local' && changes[LANGUAGE_STORAGE_KEY]?.newValue) {
        const nextLang = changes[LANGUAGE_STORAGE_KEY].newValue as Language;
        if (['en', 'vi', 'ja', 'es', 'fr', 'de', 'ko', 'zh'].includes(nextLang)) {
          useI18nStore.setState({ language: nextLang });
        }
      }
    });
  }
}

function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  const keys = path.split('.');
  let current: any = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export function t(key: string, params?: Record<string, string | number>): string {
  const { language } = useI18nStore.getState();
  const dict = dictionaries[language] || en;
  let text = getNestedValue(dict, key) ?? getNestedValue(en, key) ?? key;

  if (params) {
    Object.entries(params).forEach(([paramKey, value]) => {
      text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
    });
  }

  return text;
}

export function useTranslation() {
  const language = useI18nStore((s) => s.language);
  const setLanguage = useI18nStore((s) => s.setLanguage);

  const translate = (key: string, params?: Record<string, string | number>): string => {
    const dict = dictionaries[language] || en;
    let text = getNestedValue(dict, key) ?? getNestedValue(en, key) ?? key;
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
      });
    }
    return text;
  };

  return { t: translate, language, setLanguage };
}
