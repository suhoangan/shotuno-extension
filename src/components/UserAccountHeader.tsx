import { BookOpen, Settings, User, ExternalLink, Globe, Check, Heart, MoreVertical } from 'lucide-react';
import { GithubIcon } from './icons/GithubIcon';
import { useTranslation, SUPPORTED_LANGUAGES } from '../lib/i18n';
import { GITHUB_REPO_URL } from '../lib/api';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from './ui/dropdown-menu';

function openTab(pathWithHash: string) {
  const url = chrome.runtime.getURL(`src/onboarding/index.html${pathWithHash}`);
  try {
    if (chrome.tabs?.create) {
      void chrome.tabs.create({ url });
      return;
    }
  } catch { /* fall through */ }
  window.open(url, '_blank');
}

export function UserAccountHeader({ compact = false }: { compact?: boolean }) {
  const { t, language, setLanguage } = useTranslation();

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className="size-7 inline-flex items-center justify-center rounded-lg border border-border/80 bg-background text-muted-foreground hover:text-foreground hover:bg-muted outline-none cursor-pointer transition-colors"
          aria-label="Navigation menu"
        >
          <MoreVertical size={14} />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={6}
          className="w-56 p-1.5 bg-card border border-border shadow-xl rounded-xl z-[99999999]"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="px-2 py-1 text-[11px] font-semibold text-muted-foreground">
              Shotuno • Free & OSS
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => openTab('#guide')}
              className="flex items-center gap-2 text-xs font-medium cursor-pointer px-2 py-1.5 rounded-lg"
            >
              <BookOpen size={14} className="text-primary" />
              <span>User Guide</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => openTab('#about')}
              className="flex items-center gap-2 text-xs font-medium cursor-pointer px-2 py-1.5 rounded-lg"
            >
              <User size={14} className="text-primary" />
              <span>About Developer</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => openTab('#settings')}
              className="flex items-center gap-2 text-xs font-medium cursor-pointer px-2 py-1.5 rounded-lg"
            >
              <Settings size={14} className="text-primary" />
              <span>{t('settings.title')}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1 bg-border/40" />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 text-xs font-medium cursor-pointer px-2 py-1.5 rounded-lg">
              <Globe size={14} className="text-primary" />
              <span>{t('language.select')}</span>
              <span className="ml-auto text-[10px] text-muted-foreground pr-1">
                {SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeLabel || language}
              </span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="p-1 min-w-36">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex items-center justify-between text-xs px-2 py-1.5 rounded-md cursor-pointer ${
                      isSelected ? 'bg-primary/10 text-primary font-medium' : 'text-foreground'
                    }`}
                  >
                    <span>{lang.nativeLabel}</span>
                    {isSelected && <Check size={12} className="text-primary shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="my-1 bg-border/40" />

          <DropdownMenuItem
            onClick={() => window.open(GITHUB_REPO_URL, '_blank')}
            className="flex items-center gap-2 text-xs font-medium cursor-pointer px-2 py-1.5 rounded-lg"
          >
            <GithubIcon size={14} />
            <span>GitHub Repository</span>
            <ExternalLink size={11} className="ml-auto opacity-50" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-card border border-border/80 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-foreground">
          <Heart size={14} className="text-primary fill-primary/20" />
          <span>Shotuno Free & Open Source</span>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          MIT
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground leading-snug">
        100% offline-first screenshot editor. All tools, 4K UHD export, and OCR are free forever.
      </p>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => openTab('#guide')}>
          <BookOpen size={13} />
          Guide
        </Button>
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => openTab('#about')}>
          <User size={13} />
          About
        </Button>
      </div>
    </div>
  );
}
