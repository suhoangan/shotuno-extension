import { useState } from 'react';
import { Sparkles, Pin, ShieldCheck, Zap, Layers, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function OnboardingHero() {
  const { t } = useTranslation();
  const [pinDialogOpen, setPinDialogOpen] = useState(false);

  return (
    <div className="text-center space-y-8 max-w-3xl mx-auto pt-4">
      {/* Welcome Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-2xs">
        <Sparkles className="size-3.5" />
        <span>{t('onboarding.welcome')}</span>
      </div>

      {/* Main Headline */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          {t('onboarding.title')}
        </h1>
        <p className="text-sm sm:text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto">
          {t('onboarding.subtitle')}
        </p>
      </div>

      {/* Primary Action Button */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button
          onClick={() => setPinDialogOpen(true)}
          size="lg"
          className="gap-2 font-semibold h-11 px-6 shadow-xs text-sm"
        >
          <Pin className="size-4" />
          {t('onboarding.pinButton')}
        </Button>
      </div>

      {/* 3 Core Value Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-medium text-muted-foreground">
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Zap className="size-4" />
          </div>
          <span className="text-foreground">{t('onboarding.inTabFloating')}</span>
        </div>

        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Layers className="size-4" />
          </div>
          <span className="text-foreground">{t('onboarding.sidePanelDrag')}</span>
        </div>

        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ShieldCheck className="size-4" />
          </div>
          <span className="text-foreground">{t('onboarding.localPrivacy')}</span>
        </div>
      </div>

      {/* Interactive Pinning Guide Dialog */}
      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Pin className="size-4 text-primary" />
              How to Pin Shotuno in Chrome
            </DialogTitle>
            <DialogDescription className="text-xs">
              Pin Shotuno to your browser toolbar for 1-click capture access on any website.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 border border-border/60">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                1
              </span>
              <div>
                <p className="font-semibold text-foreground">Click the Extensions Puzzle Icon</p>
                <p className="text-muted-foreground mt-0.5">
                  Look at the top-right corner of Chrome next to your address bar and click the 🧩 icon.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary/50 border border-border/60">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                2
              </span>
              <div>
                <p className="font-semibold text-foreground">Click the Pin Icon (📌) next to Shotuno</p>
                <p className="text-muted-foreground mt-0.5">
                  Click the pin icon so the Shotuno logo stays visible for quick captures.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={() => setPinDialogOpen(false)}>
              <Check className="size-3.5 mr-1" />
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
