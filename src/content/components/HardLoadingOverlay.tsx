import { Button } from '../../components/ui/button';

export const HARD_LOADING_OVERLAY_ID = 'shotuno-hard-loading';

export type HardLoadingOverlayProps = {
  title: string;
  message?: string;
  progress?: number | null;
  onCancel?: () => void;
  /** Defaults to HARD_LOADING_OVERLAY_ID so floating-chrome hide can skip it. */
  overlayId?: string;
};

/** Blocking overlay for slow async work (capture, copy, download, prepare). */
export function HardLoadingOverlay({
  title,
  message = 'Please do not interact with the page…',
  progress,
  onCancel,
  overlayId = HARD_LOADING_OVERLAY_ID,
}: HardLoadingOverlayProps) {
  const showProgress = progress != null && Number.isFinite(progress);

  return (
    <div
      id={overlayId}
      className="fixed inset-0 z-[9999999] bg-background/80 flex flex-col items-center justify-center pointer-events-auto backdrop-blur-sm transition-opacity duration-75"
    >
      <div className="bg-card p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full border border-border">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>

        {showProgress && (
          <>
            <div className="w-full bg-accent rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground font-medium">
              {Math.min(100, Math.max(0, Math.round(progress)))}%
            </div>
          </>
        )}

        {onCancel && (
          <Button type="button" variant="secondary" className="mt-2" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
}
