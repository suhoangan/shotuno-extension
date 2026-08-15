import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';
import { LibraryShell } from '../components/library/LibraryShell';
import { openEditorWithDataUrl, openPreviewWithUrl } from '../lib/openEditor';
import { UserAccountHeader } from '../components/UserAccountHeader';
import { SidePanelImagePreview } from '../components/side-panel/SidePanelImagePreview';
import { getFullImage } from '../lib/galleryDb';
import { getPinFullImage } from '../lib/pinDb';

import { useTranslation } from '../lib/i18n';
import { CaptureBar } from './CaptureBar';

export default function App() {
  const { t } = useTranslation();
  const [previewImageId, setPreviewImageId] = useState<string | null>(null);

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'SIDE_PANEL_READY' });

    const onMessage = (message: { type?: string }) => {
      if (message?.type === 'CLOSE_SIDE_PANEL') {
        window.close();
      }
    };
    chrome.runtime.onMessage.addListener(onMessage);

    const onUnload = () => {
      chrome.runtime.sendMessage({ type: 'SIDE_PANEL_CLOSED' });
    };
    window.addEventListener('pagehide', onUnload);

    return () => {
      chrome.runtime.onMessage.removeListener(onMessage);
      window.removeEventListener('pagehide', onUnload);
      chrome.runtime.sendMessage({ type: 'SIDE_PANEL_CLOSED' });
    };
  }, []);

  const handleOpenImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      void openEditorWithDataUrl(reader.result).catch((e) => {
        toast.error(e instanceof Error ? e.message : 'Could not open editor');
      });
    };
    reader.readAsDataURL(file);
  };

  const handleExpandImage = async (id: string) => {
    try {
      // First try to get it from gallery, then pins
      let full = await getFullImage(id);
      if (!full) {
        full = await getPinFullImage(id);
      }
      
      if (!full) {
        toast.error('Image missing');
        return;
      }
      await openPreviewWithUrl(full);
      setPreviewImageId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Expand failed');
    }
  };

  return (
    <div className="h-screen flex flex-col font-sans bg-background relative">
      <Toaster position="top-center" theme="light" />
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <h1 className="text-base font-semibold text-foreground tracking-tight">{t('sidepanel.galleryTitle')}</h1>
        <UserAccountHeader compact />
      </div>
      <LibraryShell
        dragMode="web"
        onOpenImageFile={handleOpenImage}
        onPreviewImage={setPreviewImageId}
        className="flex-1 min-h-0"
      />
      <CaptureBar />
      
      {previewImageId && (
        <SidePanelImagePreview
          imageId={previewImageId}
          onClose={() => setPreviewImageId(null)}
          onExpand={handleExpandImage}
        />
      )}
    </div>
  );
}
