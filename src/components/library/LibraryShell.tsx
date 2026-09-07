import { useCallback, useRef, useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '../ui/button';
import { GalleryPanel, type GalleryDragMode } from '../gallery/GalleryPanel';
import { PinPanel } from '../pins/PinPanel';
import type { GalleryImage } from '../../lib/galleryDb';
import { useTranslation } from '../../lib/i18n';

export type LibraryTab = 'pins' | 'downloads';

interface LibraryShellProps {
  dragMode: GalleryDragMode;
  onOpenImageFile?: (file: File) => void;
  className?: string;
  onPreviewImage?: (id: string) => void;
}

export function LibraryShell({
  dragMode,
  onOpenImageFile,
  className = '',
  onPreviewImage,
}: LibraryShellProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<LibraryTab>('pins');
  const [images, setImages] = useState<GalleryImage[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImagesChange = useCallback((next: GalleryImage[]) => setImages(next), []);

  const openFileNode = onOpenImageFile ? (
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
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
        title={t('sidepanel.openImage')}
        onClick={() => fileRef.current?.click()}
      >
        <FolderOpen size={14} />
      </Button>
    </>
  ) : null;

  return (
    <div className={`flex flex-col h-full min-h-0 bg-background text-foreground ${className}`}>
      {/* Top Tabs Bar */}
      <div className="px-3 border-b border-border flex items-center justify-between gap-2 h-10 bg-background shrink-0">
        <div className="flex items-center gap-4">
          <button
            className={`text-sm font-medium h-10 flex items-center transition-colors relative ${
              tab === 'pins'
                ? 'text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setTab('pins')}
            aria-pressed={tab === 'pins'}
          >
            {t('sidepanel.pins')}
          </button>
          <button
            className={`text-sm font-medium h-10 flex items-center transition-colors relative ${
              tab === 'downloads'
                ? 'text-foreground font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setTab('downloads')}
            aria-pressed={tab === 'downloads'}
          >
            {t('sidepanel.downloads')}
          </button>
        </div>
        {openFileNode}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 min-h-0">
        {tab === 'pins' ? (
          <PinPanel
            className="h-full"
            onPreviewImage={onPreviewImage}
          />
        ) : (
          <GalleryPanel
            images={images}
            onImagesChange={handleImagesChange}
            dragMode={dragMode}
            emptyHint={t('sidepanel.emptyHint')}
            className="h-full"
            onPreviewImage={onPreviewImage}
          />
        )}
      </div>
    </div>
  );
}
