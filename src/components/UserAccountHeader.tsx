import { LogIn, Sparkles, ExternalLink, LogOut, Crown, ChevronDown, Check, Globe, BookOpen, Settings } from 'lucide-react';
import { useAuthUser } from '../lib/useAuthUser';
import { webUrl } from '../lib/api';
import { useTranslation, SUPPORTED_LANGUAGES } from '../lib/i18n';
import {
  dailyCreditsRemaining,
  hasUnlimitedCredits,
  licenseStatusOf,
} from '../lib/entitlements/license';
import { Avatar, AvatarFallback, AvatarImage, AvatarBadge } from './ui/avatar';
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

function openSettingsPage() {
  const url = chrome.runtime.getURL('src/onboarding/index.html#settings');
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
  const { authUser, loading, loginViaWeb, logout } = useAuthUser();

  if (loading) {
    return (
      <div className="h-9 w-9 rounded-full bg-muted animate-pulse shrink-0" />
    );
  }

  if (!authUser) {
    if (compact) {
      return (
        <div className="flex items-center gap-1.5">
          <Button
            size="icon"
            variant="ghost"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={openSettingsPage}
            title={t('settings.title')}
          >
            <Settings size={14} />
          </Button>
          <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={loginViaWeb}>
            <LogIn size={14} />
            {t('userAccount.login')}
          </Button>
        </div>
      );
    }
    return (
      <div className="p-3 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Sparkles size={14} className="text-primary" />
          <span>{t('userAccount.signInPromptTitle')}</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug">
          {t('userAccount.signInPromptSubtitle')}
        </p>
        <Button size="sm" className="mt-1 w-full gap-2 text-xs" onClick={loginViaWeb}>
          <LogIn size={14} />
          {t('userAccount.loginViaWeb')}
          <ExternalLink size={12} className="opacity-70" />
        </Button>
        <Button size="sm" variant="outline" className="w-full gap-2 text-xs" onClick={openSettingsPage}>
          <Settings size={14} />
          {t('settings.title')}
        </Button>
      </div>
    );
  }

  const license = licenseStatusOf(authUser);
  const unlimited = hasUnlimitedCredits(authUser);
  const credits = dailyCreditsRemaining(authUser);
  const fullName = authUser.name || authUser.email || 'User Account';
  const avatarChar = fullName.charAt(0).toUpperCase();
  const planLabel = license === 'PRO' ? 'PRO' : 'FREE';
  const creditsLabel = unlimited
    ? t('userAccount.unlimitedCredits')
    : t('userAccount.creditsLeft', { credits });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center h-9 gap-0 rounded-full border border-border bg-background p-0 pl-1 pr-1.5 hover:bg-muted outline-none cursor-pointer transition-colors select-none"
        aria-label="Account menu"
      >
        <Avatar className="size-7 rounded-full">
          {authUser.avatarUrl ? (
            <AvatarImage src={authUser.avatarUrl} alt={fullName} />
          ) : null}
          <AvatarFallback className="bg-muted text-[11px] font-semibold text-muted-foreground">
            {avatarChar}
          </AvatarFallback>
          {license === 'PRO' && (
            <AvatarBadge className="bg-amber-500 text-primary-foreground dark:bg-amber-400 dark:text-foreground ring-background">
              <Crown className="fill-current" />
            </AvatarBadge>
          )}
        </Avatar>
        <span className="ml-0.5 flex size-6 items-center justify-center rounded-full text-muted-foreground">
          <ChevronDown className="size-4 shrink-0" aria-hidden />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-64 p-2 bg-card border border-border shadow-xl rounded-xl z-[99999999]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-2 space-y-1 font-normal">
            <div className="text-xs font-bold text-foreground truncate">{fullName}</div>
            {authUser.email && (
              <div className="text-[11px] text-muted-foreground truncate">
                {authUser.email}
              </div>
            )}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                license === 'PRO'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold'
                  : 'bg-muted border-border text-foreground'
              }`}>
                {planLabel}
              </span>
              <span className="text-[10px] font-semibold text-primary">
                {creditsLabel}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-border/40" />

        <DropdownMenuItem
          onClick={openSettingsPage}
          className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg"
        >
          <Settings size={14} className="text-primary" />
          <span>{t('settings.title')}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => window.open(webUrl('/dashboard'), '_blank')}
          className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg"
        >
          <ExternalLink size={14} className="text-primary" />
          <span>{t('userAccount.openDashboard')}</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => {
            try {
              if (typeof chrome !== 'undefined' && chrome.tabs?.create) {
                chrome.tabs.create({ url: chrome.runtime.getURL('src/onboarding/index.html') });
                return;
              }
            } catch { /* ignore */ }
            const url = typeof chrome !== 'undefined' && chrome.runtime?.getURL
              ? chrome.runtime.getURL('src/onboarding/index.html')
              : '/src/onboarding/index.html';
            window.open(url, '_blank');
          }}
          className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg"
        >
          <BookOpen size={14} className="text-primary" />
          <span>{t('userAccount.openOnboarding')}</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-border/40" />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg">
            <Globe size={14} className="text-primary" />
            <span>{t('language.select')}</span>
            <span className="ml-auto text-[11px] text-muted-foreground pr-1">
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
          variant="destructive"
          onClick={() => void logout()}
          className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg"
        >
          <LogOut size={14} />
          <span>{t('userAccount.logout')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
