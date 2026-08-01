import { Pin, MousePointerClick, Edit3, Bot } from 'lucide-react';

export function OnboardingSteps() {
  const steps = [
    {
      step: '01',
      icon: Pin,
      title: 'Pin extension to Chrome bar',
      desc: 'Click the Chrome puzzle icon (🧩) top-right, then pin Shotuno for 1-click access anytime.',
    },
    {
      step: '02',
      icon: MousePointerClick,
      title: 'Pick a capture mode',
      desc: 'Choose Pin Area, Visible Content, Selected Area, or Full-Page scrolling capture from the popup.',
    },
    {
      step: '03',
      icon: Edit3,
      title: 'Annotate on the floating editor',
      desc: 'Add step counters (1-2-3), arrows, text, 2X loupe magnifier, pixel ruler, or Smart Privacy Blur.',
    },
    {
      step: '04',
      icon: Bot,
      title: 'Drag & Drop or Send to AI',
      desc: 'Drag pinned captures out of the Chrome Side Panel into web pages, Jira, GitHub, Slack, or ChatGPT.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">Getting Started in 4 Easy Steps</h2>
        <p className="text-sm text-muted-foreground mt-1">Master Shotuno in under 60 seconds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map(({ step, icon: Icon, title, desc }) => (
          <div
            key={step}
            className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 shadow-sm"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono font-bold text-primary">
              {step}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Icon className="size-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">{title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
