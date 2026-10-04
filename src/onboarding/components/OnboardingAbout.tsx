import { Heart, ShieldCheck, Sparkles, ExternalLink, Code2, Bug, Star } from 'lucide-react';
import { GithubIcon } from '@/components/icons/GithubIcon';
import { Button } from '@/components/ui/button';
import {
  GITHUB_REPO_URL,
  GITHUB_ISSUES_URL,
  DEVELOPER_PROFILE_URL,
  DEVELOPER_NAME,
  DEVELOPER_HANDLE,
  PROJECT_LICENSE,
} from '@/lib/api';

export function OnboardingAbout() {
  return (
    <div className="space-y-12 max-w-3xl mx-auto py-4">
      {/* Developer Hero Card */}
      <section className="p-8 rounded-3xl border border-border bg-card shadow-xs relative overflow-hidden space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="size-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl shadow-inner shrink-0 border border-primary/20">
            <Code2 className="size-10 text-primary" />
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                {DEVELOPER_NAME}
              </h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {DEVELOPER_HANDLE}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Software Engineer & Creator of Shotuno. Built with the belief that daily productivity tools
              should be lightning fast, beautifully crafted, and 100% free without annoying paywalls or cloud lock-in.
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-xs font-medium h-9 px-3.5"
                onClick={() => window.open(DEVELOPER_PROFILE_URL, '_blank')}
              >
                <GithubIcon className="size-3.5" />
                GitHub Profile
                <ExternalLink className="size-3 opacity-60" />
              </Button>

              <Button
                variant="default"
                size="sm"
                className="gap-2 text-xs font-semibold h-9 px-4 shadow-2xs"
                onClick={() => window.open(GITHUB_REPO_URL, '_blank')}
              >
                <Star className="size-3.5" />
                Star on GitHub
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-xs font-medium h-9 px-3 text-muted-foreground hover:text-foreground"
                onClick={() => window.open(GITHUB_ISSUES_URL, '_blank')}
              >
                <Bug className="size-3.5" />
                Report an Issue
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold text-foreground px-1">Open Source & Privacy Values</h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-2.5 shadow-2xs">
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Heart className="size-4" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">100% Free Forever</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              No subscription tiers, no trial credits, and no pro gates. All features and 4K exports are unlocked for everyone.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-2.5 shadow-2xs">
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="size-4" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">Zero Cloud Telemetry</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your captures, local OCR, and sensitive redacted info never leave your machine. Runs completely offline.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border/80 bg-card space-y-2.5 shadow-2xs">
            <div className="size-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Sparkles className="size-4" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">{PROJECT_LICENSE} Open Source</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Transparent source code. You are welcome to inspect, study, fork, or contribute on GitHub anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Technical Credits */}
      <section className="p-6 rounded-2xl border border-border/60 bg-muted/30 space-y-3">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Built With Open Source Tech</h4>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="px-2.5 py-1 rounded-lg bg-card border border-border/60">React 19</span>
          <span className="px-2.5 py-1 rounded-lg bg-card border border-border/60">Konva 2D Canvas</span>
          <span className="px-2.5 py-1 rounded-lg bg-card border border-border/60">Tesseract.js OCR</span>
          <span className="px-2.5 py-1 rounded-lg bg-card border border-border/60">Tailwind CSS</span>
          <span className="px-2.5 py-1 rounded-lg bg-card border border-border/60">Base UI & Radix</span>
          <span className="px-2.5 py-1 rounded-lg bg-card border border-border/60">Chrome MV3</span>
        </div>
      </section>
    </div>
  );
}
