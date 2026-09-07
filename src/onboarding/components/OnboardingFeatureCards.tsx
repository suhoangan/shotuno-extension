import { Hash, ZoomIn, ShieldOff, LayoutTemplate, ScanText, Bot, Move, Ruler } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

export function OnboardingFeatureCards() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Hash,
      title: 'Step Counters 1-2-3',
      desc: 'Auto-incrementing numbered badges for clean walkthroughs and bug reproduction steps.',
      tag: 'Annotation',
    },
    {
      icon: ZoomIn,
      title: '2X Zoom Loupe',
      desc: 'Circular magnifier lens zooming 200% on code snippets and fine UI details.',
      tag: 'Precision',
    },
    {
      icon: ShieldOff,
      title: 'Smart Privacy Blur',
      desc: 'Auto-detect and obscure passwords, emails, session tokens, and sensitive API keys.',
      tag: 'AI Pro',
    },
    {
      icon: Ruler,
      title: 'Pixel Measurement Ruler',
      desc: 'Measure exact dimensions (e.g. 480px × 210px) directly on screen elements.',
      tag: 'Precision',
    },
    {
      icon: LayoutTemplate,
      title: 'macOS & Windows Frames',
      desc: 'Wrap captures in stylish browser window chrome with customizable borders & shadows.',
      tag: 'Styling',
    },
    {
      icon: ScanText,
      title: 'Instant OCR Text Extraction',
      desc: 'Extract code snippets, text, and tables from any screen capture in a single click.',
      tag: 'AI Pro',
    },
    {
      icon: Move,
      title: 'Chrome Side Panel Drag & Drop',
      desc: 'Keep pinned captures per tab in the side panel and drag directly into any web app.',
      tag: 'Workflow',
    },
    {
      icon: Bot,
      title: 'Smart Auto-Paste to AI & SaaS',
      desc: 'Send screenshots directly into ChatGPT, Claude, Gemini, Jira, GitHub, and Slack.',
      tag: 'Workflow',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {t('onboarding.featuresTitle')}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {t('onboarding.featuresSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map(({ icon: Icon, title, desc, tag }) => (
          <div
            key={title}
            className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4.5 transition-colors hover:border-primary/40 shadow-2xs group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="size-4" />
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                  {tag}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold text-xs sm:text-sm text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
