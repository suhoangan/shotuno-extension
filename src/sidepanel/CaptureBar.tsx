import { Crop, Maximize, AlignVerticalSpaceAround, LayoutGrid } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from '../lib/i18n';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { useActiveTabEditing } from '../components/pins/useActiveTabEditing';

const CAPTURE_OPTIONS = [
  { type: 'visible', icon: Maximize, titleKey: 'popup.visibleContent.title', descKey: 'popup.visibleContent.description' },
  { type: 'area', icon: Crop, titleKey: 'popup.selectedArea.title', descKey: 'popup.selectedArea.description' },
  { type: 'grid', icon: LayoutGrid, titleKey: 'popup.gridCapture.title', descKey: 'popup.gridCapture.description' },
  { type: 'full', icon: AlignVerticalSpaceAround, titleKey: 'popup.fullPage.title', descKey: 'popup.fullPage.description' },
] as const;

export function CaptureBar() {
  const { t } = useTranslation();
  const isEditing = useActiveTabEditing();

  const startCapture = async (type: 'visible' | 'area' | 'full' | 'grid') => {
    if (isEditing) return;
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      if (!activeTab?.id) {
        toast.error(t('popup.noActiveTab'));
        return;
      }
      if (
        activeTab.url?.startsWith('chrome://') ||
        activeTab.url?.startsWith('chrome-extension://') ||
        activeTab.url?.startsWith('edge://')
      ) {
        toast.error(t('popup.invalidTab'));
        return;
      }

      chrome.runtime.sendMessage(
        {
          type: 'INITIATE_CAPTURE',
          payload: { captureType: type, tabId: activeTab.id },
        },
        (response) => {
          if (chrome.runtime.lastError) {
            toast.error(
              chrome.runtime.lastError.message ||
                t('popup.extensionError')
            );
            return;
          }
          if (response && response.success === false) {
            toast.error(response.error || t('popup.captureFailed'));
            return;
          }
        }
      );
    } catch (e) {
      console.error('Failed to initiate capture', e);
      toast.error(e instanceof Error ? e.message : t('popup.captureFailed'));
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 border-t border-border/40 bg-background py-1.5 shrink-0">
      <TooltipProvider delay={300}>
        {CAPTURE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const title = t(option.titleKey);
          return (
            <Tooltip key={option.type}>
              <TooltipTrigger 
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isEditing}
                    className={`w-10 h-10 shrink-0 text-muted-foreground hover:text-foreground ${isEditing ? 'opacity-40 cursor-not-allowed' : ''}`}
                    onClick={() => void startCapture(option.type)}
                    aria-label={title}
                  >
                    <Icon size={20} />
                  </Button>
                } 
              />
              <TooltipContent side="top" sideOffset={8}>
                {isEditing ? `${title} (Editor active)` : title}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </TooltipProvider>
    </div>
  );
}
