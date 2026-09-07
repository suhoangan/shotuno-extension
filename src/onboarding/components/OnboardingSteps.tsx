import { Pin, MousePointerClick, Edit3, Bot } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

export function OnboardingSteps() {
  const { t } = useTranslation();

  const steps = [
    {
      step: '01',
      icon: Pin,
      title: 'Pin Extension to Toolbar',
      desc: 'Click the Chrome puzzle icon (🧩) top-right, then pin Shotuno for instant 1-click access anytime.',
    },
    {
      step: '02',
      icon: MousePointerClick,
      title: 'Pick a Capture Mode',
      desc: 'Choose Pin Area, Visible Viewport, Selected Area, Scrolling Full-Page, or Screen Grid capture.',
    },
    {
      step: '03',
      icon: Edit3,
      title: 'Annotate on Floating Canvas',
      desc: 'Add step counters (1-2-3), text, 2X magnifier loupe, pixel ruler, or Smart Privacy Blur.',
    },
    {
      step: '04',
      icon: Bot,
      title: 'Drag & Drop or Send to AI',
      desc: 'Drag pinned captures from the Chrome Side Panel into web pages, Jira, GitHub, Slack, or ChatGPT.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {t('onboarding.stepsTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t('onboarding.stepsSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map(({ step, icon: Icon, title, desc }) => (
          <div
            key={step}
            className="flex items-start gap-4 rounded-2xl border border-border/80 bg-card p-5 transition-colors hover:border-primary/40 shadow-2xs group"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 font-mono font-bold text-sm text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {step}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-primary shrink-0" />
                <h3 className="font-semibold text-sm text-foreground truncate">{title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
