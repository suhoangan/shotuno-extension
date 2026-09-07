import { OnboardingHero } from './components/OnboardingHero';
import { OnboardingSteps } from './components/OnboardingSteps';
import { OnboardingFeatureCards } from './components/OnboardingFeatureCards';
import { OnboardingShortcuts } from './components/OnboardingShortcuts';
import { useTranslation } from '@/lib/i18n';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Camera } from 'lucide-react';

export default function App() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground">
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
                v1.0.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-6 sm:px-10 space-y-16 max-w-6xl mx-auto">
        {/* Hero Section */}
        <OnboardingHero />

        {/* Getting Started 4-Step Guide */}
        <OnboardingSteps />

        {/* Core Tools & Capabilities Grid */}
        <OnboardingFeatureCards />

        {/* Keyboard Shortcuts */}
        <OnboardingShortcuts />

        {/* Footer */}
        <footer className="text-center text-xs text-muted-foreground border-t border-border/60 pt-8 pb-12">
          {t('onboarding.footer')}
        </footer>
      </main>
    </div>
  );
}
