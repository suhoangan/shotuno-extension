import { Button } from '../../../components/ui/button';

interface GridCaptureToolbarProps {
  regionCount: number;
  onClear: () => void;
  onCancel: () => void;
  onCaptureAll: () => void;
}

export function GridCaptureToolbar({
  regionCount,
  onClear,
  onCancel,
  onCaptureAll,
}: GridCaptureToolbarProps) {
  return (
    <div
      id="grid-capture-toolbar"
      className="fixed top-4 left-1/2 -translate-x-1/2 bg-card/95 border border-border shadow-lg rounded-xl flex items-center gap-2 px-4 py-2 pointer-events-auto backdrop-blur-sm z-[9999999]"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex flex-col items-center justify-center mr-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Grid Capture
        </span>
        <span className="text-sm font-medium text-foreground">
          {regionCount} region{regionCount !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="w-px h-8 bg-border mx-1" />
      <Button
        variant="ghost"
        size="sm"
        onClick={onClear}
        disabled={regionCount === 0}
      >
        Clear All
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={onCaptureAll}
        disabled={regionCount === 0}
        className="flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Capture All
      </Button>
    </div>
  );
}
