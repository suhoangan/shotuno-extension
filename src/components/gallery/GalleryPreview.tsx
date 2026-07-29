import type { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface GalleryPreviewProps {
  open: boolean;
  url: string | null;
  onOpenChange: (open: boolean) => void;
  footer?: ReactNode;
}

export function GalleryPreview({ open, url, onOpenChange, footer }: GalleryPreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-3 pointer-events-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">Preview</DialogTitle>
        </DialogHeader>
        <div className="rounded-lg overflow-hidden bg-muted border border-border/50 max-h-[70vh] flex items-center justify-center">
          {url ? (
            <img src={url} alt="Gallery preview" className="max-w-full max-h-[70vh] object-contain" />
          ) : (
            <p className="text-xs text-muted-foreground py-12">Loading…</p>
          )}
        </div>
        {footer}
      </DialogContent>
    </Dialog>
  );
}
