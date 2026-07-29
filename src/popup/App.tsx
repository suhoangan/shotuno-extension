import { useRef, useState } from 'react';
import { Maximize, Crop, AlignVerticalSpaceAround, Images, FolderOpen, Pin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { BuyMeCoffeeLink } from '../components/BuyMeCoffeeLink';

export default function App() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const startCapture = async (type: 'visible' | 'area' | 'full' | 'pin_area') => {
    setError(null);
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      if (!activeTab?.id) {
        setError('No active tab to capture');
        return;
      }
      if (
        activeTab.url?.startsWith('chrome://') ||
        activeTab.url?.startsWith('chrome-extension://') ||
        activeTab.url?.startsWith('edge://')
      ) {
        setError('Cannot capture this page — open a normal website tab');
        return;
      }

      chrome.runtime.sendMessage(
        {
          type: 'INITIATE_CAPTURE',
          payload: { captureType: type, tabId: activeTab.id },
        },
        (response) => {
          if (chrome.runtime.lastError) {
            setError(
              chrome.runtime.lastError.message ||
                'Extension error — reload Shotuno on chrome://extensions',
            );
            return;
          }
          if (response && response.success === false) {
            setError(response.error || 'Capture failed — refresh the tab and try again');
            return;
          }
          window.close();
        },
      );
    } catch (e) {
      console.error('Failed to initiate capture', e);
      setError(e instanceof Error ? e.message : 'Failed to start capture');
    }
  };

  const openGallery = async () => {
    setError(null);
    try {
      const win = await chrome.windows.getCurrent();
      if (win.id != null) await chrome.sidePanel.open({ windowId: win.id });
      window.close();
    } catch (e) {
      console.error('Failed to open side panel', e);
      setError(e instanceof Error ? e.message : 'Could not open side panel');
    }
  };

  const openLocalImage = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return;
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0]?.id;
      if (!tabId) {
        setError('No active tab');
        return;
      }
      chrome.tabs.sendMessage(tabId, { type: 'TOGGLE_EDITOR', payload: reader.result }, () => {
        if (chrome.runtime.lastError) {
          setError('Refresh the tab, then try Open image again');
          return;
        }
        window.close();
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-64 p-4 bg-background text-foreground font-sans flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-foreground mb-1">Capture Mode</h2>

      {error && (
        <p className="text-xs text-destructive leading-snug rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5">
          {error}
        </p>
      )}

      <button
        onClick={() => void startCapture('pin_area')}
        className="flex items-center gap-3 p-3 rounded-lg bg-card text-foreground hover:bg-accent transition-colors text-left ring-1 ring-primary/30"
      >
        <Pin size={18} className="text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Pin area</span>
          <span className="text-xs text-muted-foreground">Save to side panel for any tab</span>
        </div>
      </button>

      <button
        onClick={() => void startCapture('visible')}
        className="flex items-center gap-3 p-3 rounded-lg bg-card text-foreground hover:bg-accent transition-colors text-left"
      >
        <Maximize size={18} className="text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Visible Content</span>
          <span className="text-xs text-muted-foreground">Capture what&apos;s on screen</span>
        </div>
      </button>

      <button
        onClick={() => void startCapture('area')}
        className="flex items-center gap-3 p-3 rounded-lg bg-card text-foreground hover:bg-accent transition-colors text-left"
      >
        <Crop size={18} className="text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Selected Area</span>
          <span className="text-xs text-muted-foreground">Draw a region to edit</span>
        </div>
      </button>

      <button
        onClick={() => void startCapture('full')}
        className="flex items-center gap-3 p-3 rounded-lg bg-card text-foreground hover:bg-accent transition-colors text-left"
      >
        <AlignVerticalSpaceAround size={18} className="text-primary" />
        <div className="flex flex-col">
          <span className="font-medium text-sm">Full Page</span>
          <span className="text-xs text-muted-foreground">Scroll and capture everything</span>
        </div>
      </button>

      <Separator className="bg-border/40" />

      <Button variant="outline" className="justify-start gap-2 h-auto py-2.5" onClick={() => void openGallery()}>
        <Images size={16} />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">Open pins & gallery</span>
          <span className="text-[10px] text-muted-foreground font-normal">Drag shots onto web pages</span>
        </div>
      </Button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) openLocalImage(file);
          e.target.value = '';
        }}
      />
      <Button variant="outline" className="justify-start gap-2 h-auto py-2.5" onClick={() => fileRef.current?.click()}>
        <FolderOpen size={16} />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">Open image</span>
          <span className="text-[10px] text-muted-foreground font-normal">Edit a file from your desktop</span>
        </div>
      </Button>

      <BuyMeCoffeeLink className="w-full justify-center mt-1" />
    </div>
  );
}
