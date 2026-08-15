import { Sparkles, Pin, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

export function OnboardingHero() {
  const { t } = useTranslation();

  const onPinClick = () => {
    alert('Click the Chrome extensions puzzle icon (🧩) in your top-right browser bar and click the Pin icon next to Shotuno!');
  };

  return (
    <div className="text-center space-y-6 max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-wider">
        <Sparkles className="size-4" />
        {t('onboarding.welcome')}
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        {t('onboarding.title')}
      </h1>

      <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
        {t('onboarding.subtitle')}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button onClick={onPinClick} size="lg" className="gap-2 font-bold h-12 px-6 shadow-md">
          <Pin className="size-4" />
          {t('onboarding.pinButton')}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs font-medium text-muted-foreground">
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
          <Zap className="size-4 text-primary" />
          <span>{t('onboarding.inTabFloating')}</span>
        </div>
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
          <Pin className="size-4 text-primary" />
          <span>{t('onboarding.sidePanelDrag')}</span>
        </div>
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
          <Shield className="size-4 text-primary" />
          <span>{t('onboarding.localPrivacy')}</span>
        </div>
      </div>
    </div>
  );
}
