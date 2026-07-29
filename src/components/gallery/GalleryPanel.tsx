import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import {
  createFullImageCache,
  deleteGalleryImage,
  deleteGalleryImages,
  getFullImage,
  openGalleryOnDesktop,
  renameGalleryImage,
  syncGalleryImages,
  type GalleryImage,
} from '../../lib/galleryDb';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../ui/alert-dialog';
import { GalleryChrome } from './GalleryChrome';
import { GalleryItem } from './GalleryItem';
import { LibraryItemMenu } from './GalleryItemMenu';
import { GalleryPreview } from './GalleryPreview';
import { RenameImageDialog } from '../library/RenameImageDialog';
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

export type GalleryDragMode = 'canvas' | 'web';

interface GalleryPanelProps {
  images: GalleryImage[];
  onImagesChange: (images: GalleryImage[]) => void;
  dragMode: GalleryDragMode;
  emptyHint?: string;
  className?: string;
}

export function GalleryPanel({
  images,
  onImagesChange,
  dragMode,
  emptyHint = 'Images you download will appear here',
  className = '',
}: GalleryPanelProps) {
  const [prefs, setPrefs] = useState<GalleryUiPrefs>(DEFAULT_GALLERY_UI_PREFS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<GalleryImage | null>(null);
  const fileCache = useRef(createFullImageCache());

  useEffect(() => { loadGalleryUiPrefs().then(setPrefs); }, []);

  useEffect(() => {
    syncGalleryImages().then(onImagesChange);
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== 'local' || !changes.canvas_gallery_images) return;
      onImagesChange((changes.canvas_gallery_images.newValue as GalleryImage[]) || []);
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
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
    setPreviewId(id);
    const full = await getFullImage(id);
    setPreviewUrl(full || images.find((i) => i.id === id)?.url || null);
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
      ? 'Drag to editor or page'
      : 'Drag to canvas';

  return (
    <div className={`flex flex-col h-full min-h-0 ${className}`}>
      <GalleryChrome
        title="Downloads"
        subtitle={`${filtered.length} saved screenshot${filtered.length === 1 ? '' : 's'}`}
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
      />

      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
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
                <LibraryItemMenu
                  key={img.id}
                  onEdit={() => void editImage(img.id)}
                  onPreview={() => void openPreview(img.id)}
                  onRename={() => setRenameTarget(img)}
                  onOpenDesktop={() => {
                    void openGalleryOnDesktop(img.id)
                      .then(() => toast.message('Opened on your desktop'))
                      .catch((e) => toast.error(e instanceof Error ? e.message : 'Could not open'));
                  }}
                >
                  <GalleryItem
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
                    dragHint={dragHint}
                  />
                </LibraryItemMenu>
              );
            })}
          </div>
        )}
      </div>

      <GalleryPreview
        open={previewId !== null}
        url={previewUrl}
        onOpenChange={(open) => {
          if (!open) { setPreviewId(null); setPreviewUrl(null); }
        }}
      />

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
