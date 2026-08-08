import { useCallback, useEffect, useRef, useState } from 'react';
import { Crop } from 'lucide-react';
import { toast } from 'sonner';
import {
  PINS_STORAGE_KEY,
  createPinFileCache,
  deletePins,
  downloadPinImages,
  getPinFullImage,
  startPinAreaCapture,
  syncPins,
  type PinImage,
} from '../../lib/pinDb';
import { Button } from '../ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '../ui/alert-dialog';
import { GalleryChrome } from '../gallery/GalleryChrome';
import { GalleryPreview } from '../gallery/GalleryPreview';
import {
  DEFAULT_GALLERY_UI_PREFS,
  loadGalleryUiPrefs,
  saveGalleryUiPrefs,
  type GalleryUiPrefs,
  type GalleryViewMode,
} from '../gallery/galleryPrefs';
import { useActiveTabEditing } from './useActiveTabEditing';
import { useLibraryImageDrop } from '../library/useLibraryImageDrop';
import { setShotunoDragData } from '../../lib/shotunoDrag';
import { openEditorWithDataUrl } from '../../lib/openEditor';
import { PinList } from './PinList';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { storage } from '../../lib/chromeStorage';


async function openPinInEditor(id: string) {
  const dataUrl = await getPinFullImage(id);
  if (!dataUrl) throw new Error('Pin image missing');
  await openEditorWithDataUrl(dataUrl);
}

export function PinPanel({ className = '' }: { className?: string }) {
  const [pins, setPins] = useState<PinImage[]>([]);
  const [prefs, setPrefs] = useState<GalleryUiPrefs>(DEFAULT_GALLERY_UI_PREFS);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const fileCache = useRef(createPinFileCache());
  const editorBusy = useActiveTabEditing();
  const { draggingOver, importing, dropProps } = useLibraryImageDrop();

  useEffect(() => { loadGalleryUiPrefs().then(setPrefs); }, []);

  useEffect(() => {
    void syncPins().then(setPins);
    if (!storage.isAvailable()) return;
    const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
      if (area !== 'local' || !changes[PINS_STORAGE_KEY]) return;
      setPins((changes[PINS_STORAGE_KEY].newValue as PinImage[]) || []);
    };
    storage.onChanged.addListener(listener);
    return () => storage.onChanged.removeListener(listener);
  }, []);

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => pins.some((p) => p.id === id)));
  }, [pins]);

  useEffect(() => {
    for (const pin of pins.slice(0, 20)) {
      fileCache.current.prefetch(pin.id, pin.filename || `pin-${pin.id}.png`);
    }
    selectedIds.forEach((id) => {
      const pin = pins.find((p) => p.id === id);
      fileCache.current.prefetch(id, pin?.filename || `pin-${id}.png`);
    });
  }, [pins, selectedIds]);

  const updatePrefs = useCallback((patch: Partial<GalleryUiPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      saveGalleryUiPrefs(next);
      return next;
    });
  }, []);

  const handleCapture = useCallback(async () => {
    if (editorBusy) {
      toast.message('Close the editor on the active tab first');
      return;
    }
    try {
      const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      await startPinAreaCapture(tabs[0]?.id);
      toast.message('Draw an area on the active tab');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not start pin capture');
    }
  }, [editorBusy]);

  const editPin = (id: string) => {
    void openPinInEditor(id).catch((e) =>
      toast.error(e instanceof Error ? e.message : 'Could not edit'));
  };

  const handleDragStart = (e: React.DragEvent, pin: PinImage, selected: boolean) => {
    const dragIds = selected && selectedIds.length ? selectedIds : [pin.id];
    setShotunoDragData(e.dataTransfer, { kind: 'pin', ids: dragIds });
    if (!fileCache.current.attachFilesToDataTransfer(e.dataTransfer, dragIds)) {
      toast.info('Preparing image… try drag again');
      dragIds.forEach((id) => {
        const meta = pins.find((p) => p.id === id);
        fileCache.current.prefetch(id, meta?.filename || `pin-${id}.png`);
      });
    }
    toast.info(`Dragging ${dragIds.length} pin${dragIds.length > 1 ? 's' : ''}`);
  };

  const subtitle = importing
    ? 'Importing…'
    : editorBusy
      ? 'Editor open — close it to capture'
      : `${pins.length} pin${pins.length === 1 ? '' : 's'} · drop images from the web`;

  return (
    <div className={`relative flex flex-col h-full min-h-0 ${className}`} {...dropProps}>
      {draggingOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10 pointer-events-none">
          <p className="text-sm font-medium text-foreground px-4 text-center">Drop images to pin</p>
        </div>
      )}

      <GalleryChrome
        title="Pins"
        subtitle={subtitle}
        view={prefs.view}
        selectedCount={selectedIds.length}
        onViewChange={(view: GalleryViewMode) => updatePrefs({ view })}
        onSelectAll={() => setSelectedIds(pins.map((p) => p.id))}
        onClearSelection={() => setSelectedIds([])}
        onRequestBulkDelete={() => setBulkDeleteOpen(true)}
        onBulkDownload={() => {
          void downloadPinImages([...selectedIds])
            .then((n) => toast.success(`Downloaded ${n} image${n === 1 ? '' : 's'}`))
            .catch((e) => toast.error(e instanceof Error ? e.message : 'Download failed'));
        }}
        onBulkEdit={() => {
          const id = selectedIds[0];
          if (!id) return;
          void openPinInEditor(id)
            .then(() => {
              if (selectedIds.length > 1) {
                toast.message('Opened first pin — drag the rest into the editor');
              }
            })
            .catch((e) => toast.error(e instanceof Error ? e.message : 'Could not edit'));
        }}
        bulkDeleteLabel="Remove"
        headerAction={(
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs"
                  disabled={editorBusy || importing}
                  onClick={() => void handleCapture()}
                >
                  <Crop size={12} className="mr-1" /> Capture
                </Button>
              }
            />
            <TooltipContent side="bottom" sideOffset={8}>
              {editorBusy ? 'Close the editor on the active tab first' : 'Pin area on the active tab'}
            </TooltipContent>
          </Tooltip>
        )}
      />

      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <PinList
          pins={pins}
          view={prefs.view}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
          onPreview={(id, fallback) => {
            setPreviewId(id);
            void getPinFullImage(id).then((full) => setPreviewUrl(full || fallback));
          }}
          onEdit={editPin}
          onDragStart={handleDragStart}
        />
      </div>

      <GalleryPreview
        open={previewId !== null}
        url={previewUrl}
        onOpenChange={(open) => { if (!open) { setPreviewId(null); setPreviewUrl(null); } }}
        footer={previewId ? (
          <Button size="sm" className="w-full mt-2" onClick={() => {
            void openPinInEditor(previewId)
              .then(() => setPreviewId(null))
              .catch((e) => toast.error(e instanceof Error ? e.message : 'Could not edit'));
          }}>
            Edit in Shotuno
          </Button>
        ) : null}
      />

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {selectedIds.length} pins?</AlertDialogTitle>
            <AlertDialogDescription>Removes pin references only. Capture again anytime.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              const ids = [...selectedIds];
              void deletePins(ids).then(() => {
                setSelectedIds([]);
                setBulkDeleteOpen(false);
                toast.success(`Removed ${ids.length} pin${ids.length > 1 ? 's' : ''}`);
              });
            }}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
