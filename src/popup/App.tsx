import { useRef, useState } from 'react';
import { Maximize, Crop, AlignVerticalSpaceAround, Images, FolderOpen, Pin, Loader2, LayoutGrid } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { UserAccountHeader } from '../components/UserAccountHeader';

export default function App() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const startCapture = async (type: 'visible' | 'area' | 'full' | 'pin_area' | 'grid') => {
    setError(null);
    setLoading(type);
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
          setLoading(null);
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
      setLoading(null);
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
    <div className="w-72 p-4 bg-background text-foreground font-sans flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-sm font-bold text-foreground tracking-tight">Shotuno</h1>
        <UserAccountHeader compact />
      </div>

      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-0.5">
        Capture Mode
      </h2>

      {error && (
        <p className="text-xs text-destructive leading-snug rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5">
          {error}
        </p>
      )}

      <Button
        variant="outline"
        className="h-auto justify-start gap-3 py-2.5 px-3 ring-1 ring-primary/30"
        onClick={() => void startCapture('pin_area')}
        disabled={loading !== null}
      >
        {loading === 'pin_area' ? (
          <Loader2 size={18} className="text-primary shrink-0 animate-spin" />
        ) : (
          <Pin size={18} className="text-primary shrink-0" />
        )}
        <div className="flex flex-col items-start text-left">
          <span className="font-medium text-sm">Pin area</span>
          <span className="text-xs text-muted-foreground font-normal">
            Save to side panel for any tab
          </span>
        </div>
      </Button>

      <Button
        variant="outline"
        className="h-auto justify-start gap-3 py-2.5 px-3"
        onClick={() => void startCapture('visible')}
        disabled={loading !== null}
      >
        {loading === 'visible' ? (
          <Loader2 size={18} className="text-primary shrink-0 animate-spin" />
        ) : (
          <Maximize size={18} className="text-primary shrink-0" />
        )}
        <div className="flex flex-col items-start text-left">
          <span className="font-medium text-sm">Visible Content</span>
          <span className="text-xs text-muted-foreground font-normal">
            Capture what&apos;s on screen
          </span>
        </div>
      </Button>

      <Button
        variant="outline"
        className="h-auto justify-start gap-3 py-2.5 px-3"
        onClick={() => void startCapture('area')}
        disabled={loading !== null}
      >
        {loading === 'area' ? (
          <Loader2 size={18} className="text-primary shrink-0 animate-spin" />
        ) : (
          <Crop size={18} className="text-primary shrink-0" />
        )}
        <div className="flex flex-col items-start text-left">
          <span className="font-medium text-sm">Selected Area</span>
          <span className="text-xs text-muted-foreground font-normal">
            Draw a region to edit
          </span>
        </div>
      </Button>

      <Button
        variant="outline"
        className="h-auto justify-start gap-3 py-2.5 px-3"
        onClick={() => void startCapture('grid')}
        disabled={loading !== null}
      >
        {loading === 'grid' ? (
          <Loader2 size={18} className="text-primary shrink-0 animate-spin" />
        ) : (
          <LayoutGrid size={18} className="text-primary shrink-0" />
        )}
        <div className="flex flex-col items-start text-left">
          <span className="font-medium text-sm">Grid Capture</span>
          <span className="text-xs text-muted-foreground font-normal">
            Capture multiple regions
          </span>
        </div>
      </Button>

      <Button
        variant="outline"
        className="h-auto justify-start gap-3 py-2.5 px-3"
        onClick={() => void startCapture('full')}
        disabled={loading !== null}
      >
        {loading === 'full' ? (
          <Loader2 size={18} className="text-primary shrink-0 animate-spin" />
        ) : (
          <AlignVerticalSpaceAround size={18} className="text-primary shrink-0" />
        )}
        <div className="flex flex-col items-start text-left">
          <span className="font-medium text-sm">Full Page</span>
          <span className="text-xs text-muted-foreground font-normal">
            Like DevTools full-size screenshot
          </span>
        </div>
      </Button>

      <Separator className="bg-border/40" />

      <Button variant="outline" className="justify-start gap-2 h-auto py-2.5" onClick={() => void openGallery()}>
        <Images size={16} className="shrink-0" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">Open pins & gallery</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            Drag shots onto web pages
          </span>
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
      <Button
        variant="outline"
        className="justify-start gap-2 h-auto py-2.5"
        onClick={() => fileRef.current?.click()}
      >
        <FolderOpen size={16} className="shrink-0" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">Open image</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            Edit a file from your desktop
          </span>
        </div>
      </Button>
    </div>
  );
}
