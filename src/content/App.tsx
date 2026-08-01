import { useEffect, useState } from 'react';
import CanvasEditor from './components/CanvasEditor';
import Toolbar from './components/Toolbar';
import AreaCaptureOverlay from './components/AreaCaptureOverlay';
import FullPageCaptureOverlay from './components/FullPageCaptureOverlay';
import { HardLoadingHost } from './components/HardLoadingHost';
import { Toaster } from '../components/ui/sonner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useEditorStore } from '../store/useEditorStore';
import { useHardLoadingStore } from '../store/useHardLoadingStore';
import { savePinImage } from '../lib/pinDb';
import { cropVisibleCapture, settleThenCaptureVisibleTab } from './utils/areaCapture';
import { limitImageResolution } from '../lib/limitImageResolution';
import { toast } from 'sonner';

export type BootstrapMessage =
  | { type: 'TOGGLE_EDITOR'; payload?: string }
  | { type: 'START_AREA_SELECTION' }
  | { type: 'START_PIN_AREA_SELECTION' }
  | { type: 'START_MULTI_PIN_AREA_SELECTION' }
  | { type: 'START_FULL_PAGE_CAPTURE' };

type CaptureMode = 'area' | 'pin_area' | 'multi_pin_area' | 'full' | null;

function captureModeFromBootstrap(message: BootstrapMessage | null): CaptureMode {
  if (!message) return null;
  if (message.type === 'START_AREA_SELECTION') return 'area';
  if (message.type === 'START_PIN_AREA_SELECTION') return 'pin_area';
  if (message.type === 'START_MULTI_PIN_AREA_SELECTION') return 'multi_pin_area';
  if (message.type === 'START_FULL_PAGE_CAPTURE') return 'full';
  return null;
}

function screenshotFromBootstrap(message: BootstrapMessage | null): string | null {
  if (message?.type === 'TOGGLE_EDITOR') return message.payload ?? null;
  return null;
}

export default function App({
  bootstrap,
  onCloseEditor,
}: {
  bootstrap: BootstrapMessage | null;
  onCloseEditor?: () => void;
}) {
  const [screenshot, setScreenshot] = useState<string | null>(() => screenshotFromBootstrap(bootstrap));
  const [captureMode, setCaptureMode] = useState<CaptureMode>(() => captureModeFromBootstrap(bootstrap));
  const hardLoading = useHardLoadingStore((s) => s.loading);

  /**
   * Single entry point for every screenshot — tab capture, area crop, full page, and the
   * popup's "Open image". Capping here rather than in `CanvasEditor` keeps the URL and the
   * decoded image in the same coordinate space, which Smart Blur and OCR both depend on.
   */
  const openScreenshot = async (dataUrl: string | null) => {
    setCaptureMode(null);
    if (!dataUrl) {
      setScreenshot(null);
      return;
    }
    const { showHardLoading, hideHardLoading } = useHardLoadingStore.getState();
    showHardLoading({ title: 'Preparing image…', message: 'Optimizing for the editor' });
    try {
      useEditorStore.getState().reset();
      const { dataUrl: sized } = await limitImageResolution(dataUrl);
      setScreenshot(sized);
    } finally {
      hideHardLoading();
    }
  };

  useEffect(() => {
    if (!bootstrap) return;
    if (bootstrap.type === 'TOGGLE_EDITOR') {
      void openScreenshot(bootstrap.payload ?? null);
    } else if (bootstrap.type === 'START_AREA_SELECTION') {
      setCaptureMode('area');
    } else if (bootstrap.type === 'START_PIN_AREA_SELECTION') {
      setCaptureMode('pin_area');
    } else if (bootstrap.type === 'START_MULTI_PIN_AREA_SELECTION') {
      setCaptureMode('multi_pin_area');
    } else if (bootstrap.type === 'START_FULL_PAGE_CAPTURE') {
      setCaptureMode('full');
    }
  }, [bootstrap]);

  useEffect(() => {
    const onReplace = (e: Event) => {
      const dataUrl = (e as CustomEvent<{ dataUrl?: string }>).detail?.dataUrl;
      if (dataUrl) void openScreenshot(dataUrl);
    };
    document.addEventListener('replace-screenshot', onReplace);
    return () => document.removeEventListener('replace-screenshot', onReplace);
  }, []);

  const closeEditor = () => {
    useHardLoadingStore.getState().hideHardLoading();
    setScreenshot(null);
    setCaptureMode(null);
    // The store is module-level in a content script that outlives the editor, so without
    // this the shapes and the 50-step history stay resident for the life of the tab.
    useEditorStore.getState().reset();
    onCloseEditor?.();
  };

  const finishAreaAsEditor = async (rect: { x: number; y: number; w: number; h: number }) => {
    setCaptureMode(null);
    if (rect.w === 0 || rect.h === 0) {
      onCloseEditor?.();
      return;
    }
    const { showHardLoading, hideHardLoading } = useHardLoadingStore.getState();
    // Hide our UI first — captureVisibleTab would otherwise include the loading popup.
    hideHardLoading();
    try {
      const full = await settleThenCaptureVisibleTab();
      showHardLoading({ title: 'Capturing…', message: 'Cropping selected area' });
      const cropped = await cropVisibleCapture(full, rect);
      await openScreenshot(cropped);
    } catch (e) {
      console.error(e);
      hideHardLoading();
      onCloseEditor?.();
    }
  };

  const finishAreaAsPin = async (rect: { x: number; y: number; w: number; h: number }, isMulti?: boolean) => {
    if (!isMulti) setCaptureMode(null);
    if (rect.w === 0 || rect.h === 0) {
      if (!isMulti) onCloseEditor?.();
      return;
    }
    const { showHardLoading, hideHardLoading } = useHardLoadingStore.getState();
    hideHardLoading();
    try {
      if (isMulti) {
        // Flash effect for smooth UX
        const flash = document.createElement('div');
        flash.className = 'fixed inset-0 z-[99999999] bg-white pointer-events-none transition-opacity duration-300';
        document.body.appendChild(flash);
        void flash.offsetWidth; // force reflow
        flash.style.opacity = '0';
        setTimeout(() => flash.remove(), 300);
      }

      const full = await settleThenCaptureVisibleTab();
      if (!isMulti) {
        showHardLoading({ title: 'Pinning…', message: 'Saving area to pins' });
      }
      const cropped = await cropVisibleCapture(full, rect);
      await savePinImage(cropped);
      chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
      if (!isMulti) onCloseEditor?.();
      toast.success('Saved to pins');
    } catch (e) {
      console.error(e);
      const detail = e instanceof Error && e.message ? e.message : 'Could not pin screenshot';
      toast.error(detail);
      if (!isMulti) onCloseEditor?.();
    } finally {
      if (!isMulti) hideHardLoading();
    }
  };

  const handleFullPageCapture = (dataUrl: string | null) => {
    setCaptureMode(null);
    if (dataUrl) void openScreenshot(dataUrl);
    else onCloseEditor?.();
  };

  if (!screenshot && !captureMode && !hardLoading) return null;

  if (captureMode === 'area' || captureMode === 'pin_area' || captureMode === 'multi_pin_area') {
    return (
      <>
        <Toaster position="top-center" theme="light" />
        <HardLoadingHost />
        <AreaCaptureOverlay
          isMulti={captureMode === 'multi_pin_area'}
          onClose={() => setCaptureMode(null)}
          onCapture={(rect) => 
            captureMode === 'pin_area' || captureMode === 'multi_pin_area' 
              ? finishAreaAsPin(rect, captureMode === 'multi_pin_area') 
              : finishAreaAsEditor(rect)
          }
        />
      </>
    );
  }

  if (captureMode === 'full') {
    return <FullPageCaptureOverlay onCapture={handleFullPageCapture} />;
  }

  if (!screenshot) {
    return (
      <>
        <Toaster position="top-center" theme="light" />
        <HardLoadingHost />
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden font-sans bg-foreground/30 backdrop-blur-md pointer-events-auto">
      <Toaster position="top-center" theme="light" />
      <HardLoadingHost />
      <Toolbar onClose={closeEditor} />
      <div className="w-full h-full">
        <ErrorBoundary fallbackTitle="Canvas crashed">
          <CanvasEditor screenshotUrl={screenshot} />
        </ErrorBoundary>
      </div>
    </div>
  );
}
