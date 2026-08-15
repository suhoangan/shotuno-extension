import { useState, useEffect } from 'react';
import { Copy, Check, ScanText } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useTranslation } from '../../lib/i18n';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

interface OcrResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  loading: boolean;
}

export function OcrResultDialog({ open, onOpenChange, text, loading }: OcrResultDialogProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="pointer-events-auto sm:max-w-[500px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ScanText className="w-5 h-5 text-primary" />
            {t('dialogs.ocrTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('dialogs.ocrDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="relative my-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-muted-foreground animate-pulse">{t('dialogs.scanning')}</p>
            </div>
          ) : (
            <div className="relative group">
              <textarea
                readOnly
                value={text}
                className="w-full min-h-[150px] max-h-[300px] p-4 rounded-md border border-input bg-muted/50 text-foreground resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {text && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          {!loading && (
            <>
              <AlertDialogCancel>{t('dialogs.close')}</AlertDialogCancel>
              {text && (
                <AlertDialogAction onClick={handleCopy}>
                  {copied ? t('dialogs.copied') : t('dialogs.copyToClipboard')}
                </AlertDialogAction>
              )}
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
