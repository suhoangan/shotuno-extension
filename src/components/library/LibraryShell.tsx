import { useCallback, useRef, useState } from 'react';
import { FolderOpen, Images, Pin } from 'lucide-react';
import { Button } from '../ui/button';
import { GalleryPanel, type GalleryDragMode } from '../gallery/GalleryPanel';
import { PinPanel } from '../pins/PinPanel';
import type { GalleryImage } from '../../lib/galleryDb';
import { BuyMeCoffeeLink } from '../BuyMeCoffeeLink';

export type LibraryTab = 'pins' | 'downloads';

interface LibraryShellProps {
  dragMode: GalleryDragMode;
  onOpenImageFile?: (file: File) => void;
  className?: string;
}

export function LibraryShell({
  dragMode,
  onOpenImageFile,
  className = '',
}: LibraryShellProps) {
  const [tab, setTab] = useState<LibraryTab>('pins');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImagesChange = useCallback((next: GalleryImage[]) => setImages(next), []);

  return (
    <div className={`flex flex-col h-full min-h-0 bg-background text-foreground ${className}`}>
      <div className="px-3 py-2 border-b border-border/60 flex items-center gap-2">
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted min-w-0 flex-1">
          <Button
            variant={tab === 'pins' ? 'default' : 'ghost'}
            size="sm"
            className={`h-8 flex-1 text-xs gap-1 ${
              tab === 'pins'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setTab('pins')}
            aria-pressed={tab === 'pins'}
          >
            <Pin size={13} /> Pins
          </Button>
          <Button
            variant={tab === 'downloads' ? 'default' : 'ghost'}
            size="sm"
            className={`h-8 flex-1 text-xs gap-1 ${
              tab === 'downloads'
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setTab('downloads')}
            aria-pressed={tab === 'downloads'}
          >
            <Images size={13} /> Downloads
          </Button>
        </div>

        {onOpenImageFile && (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onOpenImageFile(file);
                e.target.value = '';
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              title="Open image to edit"
              onClick={() => fileRef.current?.click()}
            >
              <FolderOpen size={14} />
            </Button>
          </>
        )}
      </div>

      {tab === 'pins' ? (
        <PinPanel className="flex-1 min-h-0" />
      ) : (
        <GalleryPanel
          images={images}
          onImagesChange={handleImagesChange}
          dragMode={dragMode}
          emptyHint="Saved downloads appear here. Multi-select, then drag into the editor or a page input."
          className="flex-1 min-h-0"
        />
      )}

      <div className="shrink-0 border-t border-border/60 p-3">
        <BuyMeCoffeeLink className="w-full justify-center" />
      </div>
    </div>
  );
}
