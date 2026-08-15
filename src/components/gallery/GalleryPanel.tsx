import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  createFullImageCache,
  deleteGalleryImage,
  deleteGalleryImages,
  getFullImage,
  openGalleryOnDesktop,
  redownloadGalleryImage,
  renameGalleryImage,
  syncGalleryImages,
  type GalleryImage,
} from '../../lib/galleryDb';
import { openPreviewWithUrl } from '../../lib/openPreview';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../ui/alert-dialog';
import { GalleryChrome } from './GalleryChrome';
import { GalleryItem } from './GalleryItem';
import { LibraryItemMenu } from './GalleryItemMenu';
import { RenameImageDialog } from '../library/RenameImageDialog';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DEFAULT_GALLERY_UI_PREFS,
  filterGalleryByDate,
  loadGalleryUiPrefs,
  saveGalleryUiPrefs,
  type GalleryDateFilter,
  type GalleryUiPrefs,
  type GalleryViewMode,
} from './galleryPrefs';
import { setShotunoDragData } from '../../lib/shotunoDrag';
import { storage } from '../../lib/chromeStorage';
import { useActiveTabEditing } from '../pins/useActiveTabEditing';
import { useLibraryImageDrop } from '../library/useLibraryImageDrop';

export type GalleryDragMode = 'canvas' | 'web';

interface GalleryPanelProps {
  images: GalleryImage[];
  onImagesChange: (images: GalleryImage[]) => void;
  dragMode: GalleryDragMode;
  emptyHint?: string;
  className?: string;
  headerTitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  onPreviewImage?: (id: string) => void;
}

export function GalleryPanel({
  images,
  onImagesChange,
  dragMode,
  emptyHint = 'Images you download will appear here',
  className = '',
  headerTitle,
  headerAction,
  onPreviewImage,
}: GalleryPanelProps) {
  const [prefs, setPrefs] = useState<GalleryUiPrefs>(DEFAULT_GALLERY_UI_PREFS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<GalleryImage | null>(null);
  const fileCache = useRef(createFullImageCache());
  const editorBusy = useActiveTabEditing();
  const { draggingOver, importing, dropProps } = useLibraryImageDrop();

  useEffect(() => { loadGalleryUiPrefs().then(setPrefs); }, []);

  useEffect(() => {
    syncGalleryImages().then(onImagesChange);
    if (!storage.isAvailable()) return;
    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== 'local' || !changes.canvas_gallery_images) return;
      onImagesChange((changes.canvas_gallery_images.newValue as GalleryImage[]) || []);
    };
    storage.onChanged.addListener(listener);
    return () => storage.onChanged.removeListener(listener);
  }, [onImagesChange]);

  const updatePrefs = useCallback((patch: Partial<GalleryUiPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      saveGalleryUiPrefs(next);
      return next;
    });
  }, []);

  const filtered = useMemo(() => filterGalleryByDate(images, prefs.filter), [images, prefs.filter]);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => images.some((img) => img.id === id)));
  }, [images]);

  useEffect(() => {
    if (selectedIds.length === 0) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIds([]);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIds.length]);

  useEffect(() => {
    for (const img of filtered.slice(0, 20)) {
      fileCache.current.prefetch(img.id, img.filename || `shotuno-${img.id}.png`);
    }
    for (const id of selectedIds) {
      const img = images.find((i) => i.id === id);
      fileCache.current.prefetch(id, img?.filename || `shotuno-${id}.png`);
    }
  }, [filtered, selectedIds, images]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const openPreview = async (id: string) => {
    if (onPreviewImage) {
      onPreviewImage(id);
      return;
    }
    const full = await getFullImage(id);
    const url = full || images.find((i) => i.id === id)?.url;
    if (!url) {
      toast.error('Image missing');
      return;
    }
    try {
      await openPreviewWithUrl(url);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Preview failed — refresh the active tab and try again');
    }
  };

  const editImage = async (id: string) => {
    const dataUrl = await getFullImage(id);
    if (!dataUrl) { toast.error('Image missing'); return; }
    try {
      const { openEditorWithDataUrl } = await import('../../lib/openEditor');
      await openEditorWithDataUrl(dataUrl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Open a normal web page, then try again');
    }
  };

  const copyImage = async (id: string) => {
    try {
      const dataUrl = await getFullImage(id);
      if (!dataUrl) throw new Error('Image missing');
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type || 'image/png']: blob })
      ]);
      toast.success('Image copied to clipboard');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not copy image');
    }
  };

  const handleDragStart = (e: React.DragEvent, img: GalleryImage, selected: boolean) => {
    const ids = selected && selectedIds.length ? selectedIds : [img.id];
    setShotunoDragData(e.dataTransfer, { kind: 'gallery', ids });
    const added = fileCache.current.attachFilesToDataTransfer(e.dataTransfer, ids);
    if (!added) {
      toast.info('Preparing image… try drag again');
      ids.forEach((id) => {
        const meta = images.find((i) => i.id === id);
        fileCache.current.prefetch(id, meta?.filename || `shotuno-${id}.png`);
      });
    }
    toast.info(`Dragging ${ids.length} image${ids.length > 1 ? 's' : ''}`);
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    await deleteGalleryImages(ids);
    setSelectedIds([]);
    setBulkDeleteOpen(false);
    toast.success(`Deleted ${ids.length} image${ids.length > 1 ? 's' : ''}`);
  };

  const dragHint = selectedIds.length > 1
    ? `Drag ${selectedIds.length}`
    : dragMode === 'web'
      ? 'Drag to editor'
      : 'Drag to canvas';

  const subtitle = importing
    ? 'Importing…'
    : editorBusy
      ? 'Editor open'
      : `${filtered.length} saved screenshot${filtered.length === 1 ? '' : 's'}`;

  return (
    <div className={`relative flex flex-col h-full min-h-0 ${className}`} {...dropProps}>
      {draggingOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 pointer-events-none">
          <p className="text-sm font-medium text-foreground px-4 text-center">Drop images to save</p>
        </div>
      )}
      <GalleryChrome
        title={headerTitle || 'Downloads'}
        subtitle={subtitle}
        view={prefs.view}
        filter={prefs.filter}
        showFilters
        selectedCount={selectedIds.length}
        onViewChange={(view: GalleryViewMode) => updatePrefs({ view })}
        onFilterChange={(filter: GalleryDateFilter) => updatePrefs({ filter })}
        onSelectAll={() => setSelectedIds(filtered.map((i) => i.id))}
        onClearSelection={() => setSelectedIds([])}
        onRequestBulkDelete={() => setBulkDeleteOpen(true)}
        bulkDeleteLabel="Delete"
        headerAction={headerAction}
      />

      <div 
        className="flex-1 overflow-y-auto p-3 custom-scrollbar"
        onClick={(e) => {
          if (e.target === e.currentTarget) setSelectedIds([]);
        }}
      >
        {filtered.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2 px-2">
            <Download size={24} className="opacity-40" />
            <p className="text-xs text-center">{emptyHint}</p>
          </div>
        ) : (
          <div className={prefs.view === 'grid' ? 'grid gap-2 grid-cols-2' : 'flex flex-col gap-1.5'}>
            {filtered.map((img) => {
              const selected = selectedIds.includes(img.id);
              return (
                  <GalleryItem
                    key={img.id}
                    image={img}
                    selected={selected}
                    view={prefs.view}
                    selectedCount={selectedIds.length}
                    selectMode={selectedIds.length > 0}
                    onToggleSelect={() => toggleSelect(img.id)}
                    onPreview={() => void openPreview(img.id)}
                    onDelete={() => {
                      void deleteGalleryImage(img.id);
                      setSelectedIds((prev) => prev.filter((id) => id !== img.id));
                    }}
                    onDragStart={(e) => handleDragStart(e, img, selected)}
                    draggable={editorBusy}
                    dragHint={dragHint}
                    menu={
                      <LibraryItemMenu
                        onEdit={() => void editImage(img.id)}
                        onPreview={() => void openPreview(img.id)}
                        onRename={() => setRenameTarget(img)}
                        onCopy={() => void copyImage(img.id)}
                        onDownload={() => {
                          void redownloadGalleryImage(img.id)
                            .then(() => toast.success('Saved to Downloads'))
                            .catch((e) => toast.error(e instanceof Error ? e.message : 'Download failed'));
                        }}
                        onOpenDesktop={() => {
                          void openGalleryOnDesktop(img.id)
                            .then(() => toast.message('Opened on your desktop'))
                            .catch((e) => toast.error(e instanceof Error ? e.message : 'Could not open'));
                        }}
                        onRemove={() => {
                          void deleteGalleryImage(img.id);
                          setSelectedIds((prev) => prev.filter((id) => id !== img.id));
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          data-item-action
                          className={`absolute top-1.5 right-1.5 z-10 h-7 w-7 rounded-full bg-background/80 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 ${prefs.view === 'list' ? 'relative top-0 right-0' : ''}`}
                        >
                          <MoreHorizontal size={14} />
                        </Button>
                      </LibraryItemMenu>
                    }
                  />
              );
            })}
          </div>
        )}
      </div>


      <RenameImageDialog
        open={renameTarget !== null}
        initialName={renameTarget?.filename || 'image.png'}
        onOpenChange={(open) => { if (!open) setRenameTarget(null); }}
        onSave={(filename) => {
          if (!renameTarget) return;
          void renameGalleryImage(renameTarget.id, filename)
            .then(() => toast.success('Renamed'))
            .catch((e) => toast.error(e instanceof Error ? e.message : 'Rename failed'));
        }}
      />

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} images?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes them from the gallery. Downloaded files on disk are not deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleBulkDelete()}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
