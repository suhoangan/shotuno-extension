import React, { useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useToggleSidePanel } from '../../lib/sidePanelUi';
import { Button } from '../../components/ui/button';

const TOGGLE_W = 24;

/** Edge control — toggles the Chrome side panel (library). */
export const RightSidebar: React.FC = React.memo(() => {
  const onError = useCallback((msg: string) => toast.error(msg), []);
  const { open, toggle } = useToggleSidePanel(onError);

  return (
    <div
      className="absolute right-0 top-1/2 -translate-y-1/2 z-[101] pointer-events-auto"
      style={{ width: TOGGLE_W }}
    >
      <Button
        variant="outline"
        size="icon"
        aria-label={open ? 'Close pins & gallery side panel' : 'Open pins & gallery side panel'}
        aria-pressed={open}
        title={open ? 'Close side panel' : 'Open side panel'}
        className="w-full h-16 bg-card border border-r-0 border-border rounded-l-md rounded-r-none flex items-center justify-center cursor-pointer shadow-[-4px_0_10px_rgba(0,0,0,0.08)] hover:bg-muted text-muted-foreground hover:text-foreground p-0"
        onClick={toggle}
      >
        {open ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </Button>
    </div>
  );
});
