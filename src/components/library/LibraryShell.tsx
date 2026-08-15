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

  const tabsNode = (
    <div className="flex items-center gap-4 shrink-0">
      <button
        className={`text-sm font-medium pb-1 ${
          tab === 'pins'
            ? 'text-foreground border-b-2 border-primary'
            : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent'
        }`}
        onClick={() => setTab('pins')}
        aria-pressed={tab === 'pins'}
      >
        {t('sidepanel.pins')}
      </button>
      <button
        className={`text-sm font-medium pb-1 ${
          tab === 'downloads'
            ? 'text-foreground border-b-2 border-primary'
            : 'text-muted-foreground hover:text-foreground border-b-2 border-transparent'
        }`}
        onClick={() => setTab('downloads')}
        aria-pressed={tab === 'downloads'}
      >
        {t('sidepanel.downloads')}
      </button>
    </div>
  );

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
        className="h-7 w-7 shrink-0 text-muted-foreground"
        title={t('sidepanel.openImage')}
        onClick={() => fileRef.current?.click()}
      >
        <FolderOpen size={14} />
      </Button>
    </>
  ) : null;

  return (
    <div className={`flex flex-col h-full min-h-0 bg-background text-foreground ${className}`}>
      {tab === 'pins' ? (
        <PinPanel
          className="flex-1 min-h-0"
          headerTitle={tabsNode}
          headerAction={openFileNode}
          onPreviewImage={onPreviewImage}
        />
      ) : (
        <GalleryPanel
          images={images}
          onImagesChange={handleImagesChange}
          dragMode={dragMode}
          emptyHint={t('sidepanel.emptyHint')}
          className="flex-1 min-h-0"
          headerTitle={tabsNode}
          headerAction={openFileNode}
          onPreviewImage={onPreviewImage}
        />
      )}
    </div>
  );
}
