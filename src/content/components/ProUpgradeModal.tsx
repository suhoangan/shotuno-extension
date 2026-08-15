import { Crown, Sparkles, Ruler, Shield, Layout, CheckCircle2 } from 'lucide-react';
import { webUrl } from '../../lib/api';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { useEditorStore } from '../../store/useEditorStore';

export function ProUpgradeModal() {
  const showUpgradeModal = useEditorStore((s) => s.showUpgradeModal);
  const setShowUpgradeModal = useEditorStore((s) => s.setShowUpgradeModal);

  const handleUpgradeClick = () => {
    window.open(webUrl('/pricing'), '_blank');
  };

  return (
    <AlertDialog open={showUpgradeModal} onOpenChange={setShowUpgradeModal}>
      <AlertDialogContent className="max-w-md sm:max-w-md p-5 bg-card border border-border shadow-2xl rounded-2xl z-[99999999]">
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
            <span className="text-xs text-muted-foreground font-semibold bg-muted px-2.5 py-1 rounded-md border border-border/50">
              $3.99/mo · $15 Lifetime
            </span>
          </div>

          <AlertDialogTitle className="text-xl font-bold text-foreground tracking-tight">
            Unlock Precision Pro Tools
          </AlertDialogTitle>

          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Upgrade to Shotuno Pro to unlock advanced developer and designer tools with unlimited storage.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4 space-y-2.5">
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/50 border border-border/40">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0 text-primary">
              <Sparkles size={16} />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-foreground block">Step Badges & 2X Loupe Lens</span>
              <span className="text-muted-foreground">Auto-incrementing badges (1-2-3) and circular zoom magnifier.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/50 border border-border/40">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0 text-primary">
              <Ruler size={16} />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-foreground block">Pixel Measurement Ruler</span>
              <span className="text-muted-foreground">Measure exact element dimensions and distance on canvas.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/50 border border-border/40">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0 text-primary">
              <Shield size={16} />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-foreground block">Privacy Pixelation Blur</span>
              <span className="text-muted-foreground">Obscure passwords, credit cards, and confidential text.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/50 border border-border/40">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 shrink-0 text-primary">
              <Layout size={16} />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-foreground block">macOS Window Frame & Unlimited Pins</span>
              <span className="text-muted-foreground">Custom window headers, padding gradients, and unlimited pin storage.</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 px-1 text-xs font-medium text-foreground">
            <CheckCircle2 size={14} className="shrink-0 text-primary" />
            <span>Standard capture, arrows, text, and PNG export stay 100% free.</span>
          </div>
        </div>

        <div className="mt-4 -mx-5 -mb-5 p-4 flex flex-col-reverse sm:flex-row gap-2 justify-center bg-muted/30 border-t border-border/50 rounded-b-2xl">
          <AlertDialogCancel className="w-full sm:w-auto text-xs font-medium text-muted-foreground hover:bg-accent rounded-xl py-2.5 px-4 border border-border/60 m-0">
            Continue with Free
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUpgradeClick}
            className="w-full sm:w-auto text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl py-2.5 px-5 shadow-sm transition-all m-0"
          >
            Upgrade to Pro — $15
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
