import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface PreviewOverlayProps {
  url: string;
  onClose: () => void;
}

export function PreviewOverlay({ url, onClose }: PreviewOverlayProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[999999] flex flex-col pointer-events-auto bg-black/90 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="flex justify-end p-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onClose}
          className="h-10 w-10 rounded-full bg-background/20 border-border/20 text-white hover:bg-background/40 hover:text-white"
        >
          <X size={20} />
        </Button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 min-h-0" onClick={onClose}>
        <img
          src={url}
          alt="Preview"
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}

export default PreviewOverlay;
