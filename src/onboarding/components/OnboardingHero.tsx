import { Sparkles, Pin, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function OnboardingHero() {
  const onPinClick = () => {
    alert('Click the Chrome extensions puzzle icon (🧩) in your top-right browser bar and click the Pin icon next to Shotuno!');
  };

  return (
    <div className="text-center space-y-6 max-w-3xl mx-auto">
      <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary uppercase tracking-wider">
        <Sparkles className="size-4" />
        WELCOME TO SHOTUNO
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        Capture. Annotate. <span className="text-primary">Ship.</span>
      </h1>

      <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto">
        Your precision screenshot & annotation tool. Built with an in-page floating editor, Chrome Side Panel pins library, Smart Privacy Blur, and 1-click AI auto-paste.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button onClick={onPinClick} size="lg" className="gap-2 font-bold h-12 px-6 shadow-md">
          <Pin className="size-4" />
          Pin Shotuno to Toolbar
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-xs font-medium text-muted-foreground">
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
          <Zap className="size-4 text-primary" />
          <span>In-Tab Floating Editor</span>
        </div>
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
          <Pin className="size-4 text-primary" />
          <span>Side Panel Drag & Drop</span>
        </div>
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card p-3 shadow-sm">
          <Shield className="size-4 text-primary" />
          <span>100% Local-First Privacy</span>
        </div>
      </div>
    </div>
  );
}
