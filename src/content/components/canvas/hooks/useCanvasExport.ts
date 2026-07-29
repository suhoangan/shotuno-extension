import { useEffect } from 'react';
import { toast } from 'sonner';
import { useEditorStore } from '../../../../store/useEditorStore';
import { saveGalleryImage } from '../../../../lib/galleryDb';
import { copyImageAndTextToClipboard } from '../../../utils/clipboardUtils';
import { exportStageToPng } from '../exportStageToPng';

const AI_URLS: Record<string, string> = {
  ChatGPT: 'https://chatgpt.com/',
  Claude: 'https://claude.ai/new',
  Gemini: 'https://gemini.google.com/app',
};

export function useCanvasExport(stageRef: React.RefObject<any>) {
  useEffect(() => {
    let lastSaveTime = 0;
    const timeouts = new Set<ReturnType<typeof setTimeout>>();

    const runExport = (): { uri: string; blobPromise: Promise<Blob> } | null => {
      const stage = stageRef.current;
      if (!stage) return null;
      return exportStageToPng(stage);
    };

    const handleSave = (type: string, filename: string = 'screenshot', options?: any) => {
      const now = Date.now();
      if (now - lastSaveTime < 2000) return;
      lastSaveTime = now;
      useEditorStore.getState().setSelectedShapeIds([]);

      // Start clipboard write while user activation is still valid.
      // Image Promise resolves after the deferred stage export finishes.
      let resolveBlob!: (blob: Blob) => void;
      let rejectBlob!: (err: unknown) => void;
      const blobGate = new Promise<Blob>((resolve, reject) => {
        resolveBlob = resolve;
        rejectBlob = reject;
      });

      const prompt = options?.prompt || '';
      const aiProvider = options?.aiProvider as string | undefined;
      const needsClipboard = type === 'copy' || type === 'ai';

      let clipboardPromise: Promise<boolean> | null = null;
      if (needsClipboard) {
        clipboardPromise = copyImageAndTextToClipboard(
          blobGate,
          type === 'ai' ? prompt : '',
        );
      }

      const timeoutId = setTimeout(async () => {
        timeouts.delete(timeoutId);
        try {
          const exported = runExport();
          if (!exported) {
            rejectBlob(new Error('Stage not ready'));
            toast.error('Export failed');
            return;
          }

          const { uri, blobPromise } = exported;
          blobPromise.then(resolveBlob, rejectBlob);

          if (type === 'download') {
            try {
              await saveGalleryImage(
                uri,
                filename,
                stageRef.current.toDataURL({ pixelRatio: 0.2 }),
              );
              toast.success('Saved and downloaded');
            } catch (err) {
              console.error('Failed to save gallery image', err);
              toast.error('Download failed');
            }
            return;
          }

          if (type === 'copy') {
            const ok = await clipboardPromise;
            toast[ok ? 'success' : 'error'](ok ? 'Copied to clipboard!' : 'Copy failed');
            return;
          }

          if (type === 'ai') {
            if (aiProvider && aiProvider !== 'Cursor' && aiProvider !== 'Copy') {
              await chrome.storage.local.set({
                pendingAIInjection: {
                  provider: aiProvider,
                  prompt: prompt || '',
                  imageUri: uri,
                  timestamp: Date.now(),
                },
              });
            }

            const ok = await clipboardPromise;
            if (!ok) {
              toast.error('Could not copy image and prompt');
              return;
            }

            if (aiProvider === 'Cursor') {
              toast.success('Copied! Open Cursor Composer and press Ctrl+V');
            } else if (aiProvider === 'Copy') {
              toast.success('Image and prompt copied to clipboard!');
            } else {
              const tip =
                aiProvider === 'Gemini'
                  ? 'Opening Gemini… Stay signed in so we can attach the image (clipboard backup ready).'
                  : `Opening ${aiProvider}... Please wait while we inject the image!`;
              toast.success(tip);
              const url = aiProvider ? AI_URLS[aiProvider] : undefined;
              if (url) window.open(url, '_blank');
            }
          }
        } catch (err) {
          rejectBlob(err);
          console.error('Export failed', err);
          toast.error('Export failed');
        }
      }, 50);
      timeouts.add(timeoutId);
    };

    const handleExport = (e: any) => handleSave(e.detail.type, e.detail.filename, e.detail);
    document.addEventListener('export-canvas', handleExport);
    return () => {
      document.removeEventListener('export-canvas', handleExport);
      timeouts.forEach(clearTimeout);
      timeouts.clear();
    };
  }, [stageRef]);
}
