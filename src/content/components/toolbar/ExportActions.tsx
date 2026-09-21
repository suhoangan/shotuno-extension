import { Copy, Download, Share2, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { ICON } from './toolbarUi';
import { useTranslation } from '../../../lib/i18n';

interface ExportActionsProps {
  onCopy?: () => void;
  onDownload?: () => void;
  onShareLink?: () => void;
  onClose: () => void;
  isVertical?: boolean;
  busy?: boolean;
}

export function ExportActions({
  onCopy,
  onDownload,
  onShareLink,
  onClose,
  isVertical,
  busy = false,
}: ExportActionsProps) {
  const { t } = useTranslation();

  return (
    <>
      {onShareLink && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={onShareLink}
                disabled={busy}
                className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground"
              />
            }
          >
            <Share2 size={ICON} />
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('toolbar.shareCloudLink')}</TooltipContent>
        </Tooltip>
      )}

      {onCopy && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={onCopy}
                disabled={busy}
                className="h-8 w-8 text-muted-foreground hover:bg-accent hover:text-foreground"
              />
            }
          >
            <Copy size={ICON} />
          </TooltipTrigger>
          <TooltipContent side="bottom">{t('toolbar.copyTooltip')}</TooltipContent>
        </Tooltip>
      )}

      {onDownload && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                size="icon"
                onClick={onDownload}
                disabled={busy}
                className={`h-8 w-8 text-muted-foreground hover:bg-primary hover:text-primary-foreground bg-card ${isVertical ? 'mt-1' : 'ml-1'}`}
              />
            }
          >
            <Download size={ICON} />
          </TooltipTrigger>
          {!isVertical && <TooltipContent side="bottom">{t('toolbar.saveFile')}</TooltipContent>}
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              size="icon"
              onClick={onClose}
              disabled={busy}
              className={`h-8 w-8 bg-destructive hover:bg-destructive/80 text-destructive-foreground shadow ${isVertical ? 'mt-1' : 'ml-1'}`}
            />
          }
        >
          <X size={ICON} />
        </TooltipTrigger>
        {!isVertical && <TooltipContent side="bottom">{t('toolbar.closeTooltip')}</TooltipContent>}
      </Tooltip>
    </>
  );
}
