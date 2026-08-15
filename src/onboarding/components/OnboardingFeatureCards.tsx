import { Hash, ZoomIn, ShieldOff, LayoutTemplate, ScanText, Bot, Move, Ruler } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

export function OnboardingFeatureCards() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Hash,
      title: 'Step Counters 1-2-3',
      desc: 'Auto-incrementing red badges (1, 2, 3) for clean feature walkthroughs.',
    },
    {
      icon: ZoomIn,
      title: '2X Zoom Loupe',
      desc: 'Circular magnifier lens zooming 200% on code & UI details.',
    },
    {
      icon: ShieldOff,
      title: 'Smart Privacy Blur',
      desc: 'Auto-detect and obscure passwords, emails, and API keys.',
    },
    {
      icon: Ruler,
      title: 'Pixel Measurement Ruler',
      desc: 'Measure exact dimensions (e.g. 480px × 210px) on screen elements.',
    },
    {
      icon: LayoutTemplate,
      title: 'macOS & Windows Frames',
      desc: 'Wrap captures in stylish browser window chrome with background gradients.',
    },
    {
      icon: ScanText,
      title: 'Instant OCR Text Extraction',
      desc: 'Extract code snippets, text, and tables from any screenshot in 1 click.',
    },
    {
      icon: Move,
      title: 'Chrome Side Panel Drag & Drop',
      desc: 'Keep pinned captures per tab in the side panel and drag directly onto web forms.',
    },
    {
      icon: Bot,
      title: 'Smart Auto-Paste to AI & SaaS',
      desc: 'Send screenshots straight into ChatGPT, Claude, Gemini, Jira, GitHub, and Slack.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">{t('onboarding.featuresTitle')}</h2>
        <p className="text-sm text-muted-foreground mt-1">{t('onboarding.featuresSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 shadow-sm"
          >
            <div>
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-4" />
              </div>
              <h3 className="font-semibold text-sm text-foreground mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
