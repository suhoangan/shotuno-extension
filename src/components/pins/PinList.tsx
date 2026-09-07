import { useState } from 'react';
import { MoreHorizontal, Pin } from 'lucide-react';
import { toast } from 'sonner';
import {
  deletePin,
  downloadPinImage,
  renamePin,
  type PinImage,
} from '../../lib/pinDb';
import { GalleryItem } from '../gallery/GalleryItem';
import { LibraryItemMenu } from '../gallery/GalleryItemMenu';
import type { GalleryViewMode } from '../gallery/galleryPrefs';
import { RenameImageDialog } from '../library/RenameImageDialog';
import { Button } from '../ui/button';
import { useActiveTabEditing } from './useActiveTabEditing';

interface PinListProps {
  pins: PinImage[];
  view: GalleryViewMode;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[] | ((prev: string[]) => string[])) => void;
  onPreview: (id: string, fallbackUrl: string) => void;
  onEdit: (id: string) => void;
  onCopy: (id: string) => void;
  onDragStart: (e: React.DragEvent, pin: PinImage, selected: boolean) => void;
}

export function PinList({
  pins,
  view,
  selectedIds,
  onSelectedIdsChange,
  onPreview,
  onEdit,
  onCopy,
  onDragStart,
}: PinListProps) {
  const [renameTarget, setRenameTarget] = useState<PinImage | null>(null);
  const editorBusy = useActiveTabEditing();

  if (pins.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2 px-2">
        <Pin size={24} className="opacity-40" />
        <p className="text-xs text-center">
          Drag images from any webpage into this panel, or capture an area. Select pins to download all or edit.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={view === 'grid' ? 'grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]' : 'flex flex-col gap-1.5'}>
        {pins.map((pin) => {
          const selected = selectedIds.includes(pin.id);
          const openPreview = () => onPreview(pin.id, pin.url);
          const removePin = () => {
            void deletePin(pin.id);
            onSelectedIdsChange((prev) => prev.filter((id) => id !== pin.id));
          };
          return (
            <GalleryItem
              key={pin.id}
              image={pin}
              selected={selected}
              view={view}
              selectedCount={selectedIds.length}
              selectMode={selectedIds.length > 0}
              onToggleSelect={() => onSelectedIdsChange((prev) => (
                prev.includes(pin.id) ? prev.filter((x) => x !== pin.id) : [...prev, pin.id]
              ))}
              onPreview={openPreview}
              onDelete={removePin}
              onDragStart={(e) => onDragStart(e, pin, selected)}
              draggable={editorBusy}
              dragHint={selectedIds.length > 1 && selected ? `Drag ${selectedIds.length}` : 'Drag to editor'}
              menu={
                <LibraryItemMenu
                  onEdit={() => onEdit(pin.id)}
                  onCopy={() => onCopy(pin.id)}
                  onPreview={openPreview}
                  onRename={() => setRenameTarget(pin)}
                  onDownload={() => {
                    void downloadPinImage(pin.id)
                      .then(() => toast.success('Saved to Downloads'))
                      .catch((e) => toast.error(e instanceof Error ? e.message : 'Download failed'));
                  }}
                  onRemove={removePin}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    data-item-action
                    className={`absolute top-1.5 right-1.5 z-10 h-7 w-7 rounded-full bg-background/80 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 ${view === 'list' ? 'relative top-0 right-0' : ''}`}
                  >
                    <MoreHorizontal size={14} />
                  </Button>
                </LibraryItemMenu>
              }
            />
          );
        })}
      </div>

      <RenameImageDialog
        open={renameTarget !== null}
        initialName={renameTarget?.filename || 'image.png'}
        onOpenChange={(open) => { if (!open) setRenameTarget(null); }}
        onSave={(filename) => {
          if (!renameTarget) return;
          void renamePin(renameTarget.id, filename)
            .then(() => toast.success('Renamed'))
            .catch((e) => toast.error(e instanceof Error ? e.message : 'Rename failed'));
        }}
      />
    </>
  );
}
