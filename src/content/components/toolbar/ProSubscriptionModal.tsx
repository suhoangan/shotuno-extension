import { Crown, Sparkles, ShieldAlert, Image, CheckCircle2 } from 'lucide-react';
import { webUrl } from '../../../lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { ProBadge } from './ProBadge';

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
      <AlertDialogContent className="max-w-md sm:max-w-md p-5 bg-card border border-border/80 shadow-2xl rounded-2xl z-[99999999]">
        <AlertDialogHeader className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                <Crown size={20} className="fill-primary/20" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
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
            <div className="relative p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
              <Sparkles size={18} className="text-primary" />
              <ProBadge show className="-top-1 -right-1 ring-2" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-foreground block">Smart Parse & OCR</span>
              <span className="text-muted-foreground">Extract text, tables, and AI insights directly from captures.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/40">
            <div className="relative p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
              <ShieldAlert size={18} className="text-primary" />
              <ProBadge show className="-top-1 -right-1 ring-2" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-foreground block">AI Sensitive Data Blur</span>
              <span className="text-muted-foreground">Auto-detect and obscure credentials, emails, and secrets.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border/40">
            <div className="relative p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
              <Image size={18} className="text-primary" />
              <ProBadge show className="-top-1 -right-1 ring-2" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-foreground block">Pro Styling & Watermarks</span>
              <span className="text-muted-foreground">Add custom branding, window padding, and export framing.</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 px-1 text-xs font-medium text-foreground">
            <CheckCircle2 size={14} className="shrink-0 text-primary" />
            <span>Standard editing tools (arrows, text, crop, export) remain 100% free.</span>
          </div>
        </div>

        <div className="mt-4 -mx-5 -mb-5 p-5 flex flex-col-reverse sm:flex-row gap-2 justify-center bg-muted/30 border-t border-border/50 rounded-b-2xl">
          <AlertDialogCancel className="w-full sm:w-auto text-xs font-medium text-muted-foreground hover:bg-accent rounded-xl py-2.5 px-4 border border-border/60 m-0">
            Continue with Free Tools
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUpgradeClick}
            className="w-full sm:w-auto text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl py-2.5 px-5 shadow-sm transition-all m-0"
          >
            Log In / Upgrade to Pro
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
