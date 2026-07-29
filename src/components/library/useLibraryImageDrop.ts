import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react';
import { toast } from 'sonner';
import { collectDropImages, dropHasImages, isShotunoLibraryDrag } from '../../lib/collectDropImages';
import { importWebToPins } from '../../lib/pinDb';

const CLIENT_IMPORT_TIMEOUT_MS = 50_000;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

/** Drop zone handlers for importing web / desktop images into Pins. */
export function useLibraryImageDrop() {
  const [draggingOver, setDraggingOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const importingRef = useRef(false);

  const clearDrag = useCallback(() => setDraggingOver(false), []);

  useEffect(() => {
    // dragleave often misses when the cursor leaves the side panel into Chrome chrome.
    window.addEventListener('dragend', clearDrag);
    window.addEventListener('drop', clearDrag);
    return () => {
      window.removeEventListener('dragend', clearDrag);
      window.removeEventListener('drop', clearDrag);
    };
  }, [clearDrag]);

  const onDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (dropHasImages(e.dataTransfer)) setDraggingOver(true);
  }, []);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (dropHasImages(e.dataTransfer)) {
      e.dataTransfer.dropEffect = 'copy';
      setDraggingOver(true);
    }
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    const related = e.relatedTarget as Node | null;
    if (related && e.currentTarget.contains(related)) return;
    setDraggingOver(false);
  }, []);

  const onDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);

    // Pin/gallery drag returning to the panel — not an import.
    if (isShotunoLibraryDrag(e.dataTransfer)) return;

    if (importingRef.current) {
      toast.message('Still importing — wait a moment');
      return;
    }

    const { files, urls } = collectDropImages(e.dataTransfer);
    if (!files.length && !urls.length) {
      toast.message('No image found — try dragging the image itself, not the page link');
      return;
    }

    importingRef.current = true;
    setImporting(true);
    const total = files.length + urls.length;
    const toastId = toast.loading(`Importing ${total} image${total === 1 ? '' : 's'}…`);

    void (async () => {
      try {
        const dataUrls = await Promise.all(files.map((f) => fileToDataUrl(f)));
        const count = await withTimeout(
          importWebToPins({ dataUrls, urls }),
          CLIENT_IMPORT_TIMEOUT_MS,
          'Import timed out — try fewer images',
        );
        toast.success(`Pinned ${count} image${count === 1 ? '' : 's'}`, { id: toastId });
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Import failed', { id: toastId });
      } finally {
        importingRef.current = false;
        setImporting(false);
      }
    })();
  }, []);

  return {
    draggingOver,
    importing,
    dropProps: {
      onDragEnter,
      onDragOver,
      onDragLeave,
      onDrop,
    },
  };
}
