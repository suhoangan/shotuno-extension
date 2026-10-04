import { useState, useEffect } from 'react';
import { OnboardingHero } from './components/OnboardingHero';
import { OnboardingSteps } from './components/OnboardingSteps';
import { OnboardingFeatureCards } from './components/OnboardingFeatureCards';
import { OnboardingShortcuts } from './components/OnboardingShortcuts';
import { OnboardingAbout } from './components/OnboardingAbout';
import { SettingsView } from './components/SettingsView';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Camera, Settings, BookOpen, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';

type ActiveTab = 'guide' | 'settings' | 'about';

function resolveTabFromHash(): ActiveTab {
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  if (hash === '#settings') return 'settings';
  if (hash === '#about') return 'about';
  return 'guide';
}

export default function App() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ActiveTab>(resolveTabFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setTab(resolveTabFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const selectTab = (nextTab: ActiveTab) => {
    setTab(nextTab);
    window.location.hash = `#${nextTab}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" />
      {/* Top Header Bar */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-10 px-6 sm:px-10 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-2xs">
              <Camera className="size-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-base tracking-tight text-foreground">
                Shotuno
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                v1.0.2 • Free & OSS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/50 mr-2">
              <Button
                variant={tab === 'guide' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-xs gap-1.5 rounded-lg"
                onClick={() => selectTab('guide')}
              >
                <BookOpen className="size-3.5" />
                Guide
              </Button>
              <Button
                variant={tab === 'about' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-xs gap-1.5 rounded-lg"
                onClick={() => selectTab('about')}
              >
                <User className="size-3.5" />
                About Developer
              </Button>
              <Button
                variant={tab === 'settings' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-xs gap-1.5 rounded-lg"
                onClick={() => selectTab('settings')}
              >
                <Settings className="size-3.5" />
                {t('settings.title')}
              </Button>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-6 sm:px-10 max-w-6xl mx-auto">
        {tab === 'settings' && <SettingsView />}
        {tab === 'about' && <OnboardingAbout />}
        {tab === 'guide' && (
          <div className="space-y-16">
            <OnboardingHero />
            <OnboardingSteps />
            <OnboardingFeatureCards />
            <OnboardingShortcuts />
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground border-t border-border/60 pt-8 pb-12 mt-16 space-y-1">
          <p>{t('onboarding.footer')}</p>
          <p className="text-[11px] opacity-80">
            Open Source under MIT License • Built by Hoang An Su (@suhoangan)
          </p>
        </footer>
      </main>
    </div>
  );
}
