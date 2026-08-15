import { Globe } from 'lucide-react';
import { useTranslation, SUPPORTED_LANGUAGES, type Language } from '../lib/i18n';

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Globe size={14} className="shrink-0" />
      <select
        aria-label="Language"
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-transparent border-none text-xs font-medium text-foreground cursor-pointer focus:outline-none focus:ring-0"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-background text-foreground">
            {lang.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
