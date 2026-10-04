import { HelpCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { CHROME } from './toolbar/toolbarUi';

export function GuideFloatingButton() {
  const handleOpenGuide = () => {
    const url = chrome.runtime.getURL('src/onboarding/index.html#guide');
    window.open(url, '_blank');
  };

  return (
    <TooltipProvider delay={300}>
      <div className="fixed top-4 right-4 z-[9999999] pointer-events-auto">
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenGuide}
                aria-label="Guide & Shortcuts"
                className={`${CHROME} h-8 px-2.5 text-xs font-medium gap-1.5 hover:bg-accent hover:text-foreground text-muted-foreground shadow-lg flex items-center cursor-pointer`}
              >
                <HelpCircle size={15} className="text-primary shrink-0" />
                <span className="hidden sm:inline">Guide & Shortcuts</span>
              </Button>
            }
          />
          <TooltipContent side="bottom" sideOffset={6} className="z-[99999999]">
            Guide & Shortcuts
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
