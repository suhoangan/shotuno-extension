import { Crown, Sparkles, ShieldAlert, Image, CheckCircle2 } from 'lucide-react';
import { webUrl } from '../../../lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';

interface ProSubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

export function ProSubscriptionModal({
  open,
  onOpenChange,
  message,
}: ProSubscriptionModalProps) {
  const handleUpgradeClick = () => {
    window.open(webUrl('/auth'), '_blank');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md p-6 bg-card border border-border/80 shadow-2xl rounded-2xl z-[99999999]">
        <AlertDialogHeader className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/30">
                <Crown size={20} className="fill-amber-500/20" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Shotuno Pro
              </span>
            </div>
            <span className="text-xs text-muted-foreground font-medium bg-muted px-2.5 py-1 rounded-md border border-border/50">
              15 Free Credits/Day
            </span>
          </div>

          <AlertDialogTitle className="text-xl font-bold text-foreground tracking-tight">
            Unlock Advanced AI Features
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {message ||
              'Log in on the website to claim your 15 daily free AI credits or upgrade for unlimited high-speed access.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 space-y-2.5">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/40">
            <div className="relative p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0">
              <Sparkles size={18} className="text-amber-500" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-sm ring-2 ring-background">
                <Crown size={8} className="fill-current" />
              </span>
            </div>
            <div className="text-xs">
              <span className="font-semibold text-foreground block">Smart Parse & OCR</span>
              <span className="text-muted-foreground">Extract text, tables, and AI insights directly from captures.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/40">
            <div className="relative p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 shrink-0">
              <ShieldAlert size={18} className="text-blue-500" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-sm ring-2 ring-background">
                <Crown size={8} className="fill-current" />
              </span>
            </div>
            <div className="text-xs">
              <span className="font-semibold text-foreground block">AI Sensitive Data Blur</span>
              <span className="text-muted-foreground">Auto-detect and obscure credentials, emails, and secrets.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/40">
            <div className="relative p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 shrink-0">
              <Image size={18} className="text-emerald-500" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-slate-950 shadow-sm ring-2 ring-background">
                <Crown size={8} className="fill-current" />
              </span>
            </div>
            <div className="text-xs">
              <span className="font-semibold text-foreground block">Pro Styling & Watermarks</span>
              <span className="text-muted-foreground">Add custom branding, window padding, and export framing.</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 px-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={14} className="shrink-0" />
            <span>Standard editing tools (arrows, text, crop, export) remain 100% free.</span>
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <AlertDialogCancel className="w-full sm:w-auto text-xs font-medium text-muted-foreground hover:bg-accent rounded-xl py-2.5 px-4 border border-border/60">
            Continue with Free Tools
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUpgradeClick}
            className="w-full sm:w-auto text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-xl py-2.5 px-5 shadow-sm transition-all"
          >
            Log In / Upgrade to Pro
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
