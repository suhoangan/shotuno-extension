import { useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from '../components/ui/sonner';
import { LibraryShell } from '../components/library/LibraryShell';
import { openEditorWithDataUrl } from '../lib/openEditor';
import { UserAccountHeader } from '../components/UserAccountHeader';

export default function App() {
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

  return (
    <div className="h-screen flex flex-col font-sans bg-background">
      <Toaster position="top-center" theme="light" />
      <div className="flex items-center justify-between gap-2 p-3 border-b border-border/50">
        <h1 className="text-sm font-bold text-foreground tracking-tight">Library</h1>
        <UserAccountHeader compact />
      </div>
      <LibraryShell
        dragMode="web"
        onOpenImageFile={handleOpenImage}
        className="flex-1 min-h-0"
      />
    </div>
  );
}
