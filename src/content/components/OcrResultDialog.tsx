import { useState, useEffect } from 'react';
import { Copy, Check, ScanText } from 'lucide-react';
import { Button } from '../../components/ui/button';
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
            Extract Text
          </AlertDialogTitle>
          <AlertDialogDescription>
            Text recognized from your selection.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="relative my-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-muted-foreground animate-pulse">Scanning image...</p>
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
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>
          )}
        </div>

        <AlertDialogFooter>
          {!loading && (
            <>
              <AlertDialogCancel>Close</AlertDialogCancel>
              {text && (
                <AlertDialogAction onClick={handleCopy}>
                  {copied ? 'Copied!' : 'Copy to Clipboard'}
                </AlertDialogAction>
              )}
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
