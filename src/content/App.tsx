import { useEffect, useState } from 'react';
import CanvasEditor from './components/CanvasEditor';
import Toolbar from './components/Toolbar';
import AreaCaptureOverlay from './components/AreaCaptureOverlay';
import FullPageCaptureOverlay from './components/FullPageCaptureOverlay';
import GridCaptureOverlay from './components/grid-capture/GridCaptureOverlay';
import { HardLoadingHost } from './components/HardLoadingHost';
import { Toaster } from '../components/ui/sonner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useEditorStore } from '../store/useEditorStore';
import { useHardLoadingStore } from '../store/useHardLoadingStore';
import { savePinImage, savePinImagesBatch } from '../lib/pinDb';
import { cropVisibleCapture, settleThenCaptureVisibleTab } from './utils/areaCapture';
import { limitImageResolution } from '../lib/limitImageResolution';
import { toast } from 'sonner';

export type BootstrapMessage =
  | { type: 'TOGGLE_EDITOR'; payload?: string }
  | { type: 'START_AREA_SELECTION' }
  | { type: 'START_PIN_AREA_SELECTION' }
  | { type: 'START_FULL_PAGE_CAPTURE' }
  | { type: 'START_GRID_CAPTURE' };

type CaptureMode = 'area' | 'pin_area' | 'full' | 'grid' | null;

function captureModeFromBootstrap(message: BootstrapMessage | null): CaptureMode {
  if (!message) return null;
  if (message.type === 'START_AREA_SELECTION') return 'area';
  if (message.type === 'START_PIN_AREA_SELECTION') return 'pin_area';
  if (message.type === 'START_FULL_PAGE_CAPTURE') return 'full';
  if (message.type === 'START_GRID_CAPTURE') return 'grid';
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
    try {
      useEditorStore.getState().reset();
      const { dataUrl: sized } = await limitImageResolution(dataUrl);
      setScreenshot(sized);
    } catch (e) {
      console.error('Failed to prepare image', e);
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
    } else if (bootstrap.type === 'START_FULL_PAGE_CAPTURE') {
      setCaptureMode('full');
    } else if (bootstrap.type === 'START_GRID_CAPTURE') {
      setCaptureMode('grid');
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
    
    try {
      const full = await settleThenCaptureVisibleTab();
      const cropped = await cropVisibleCapture(full, rect);
      await openScreenshot(cropped);
    } catch (e) {
      console.error(e);
      onCloseEditor?.();
    }
  };

  const finishAreaAsPin = async (rect: { x: number; y: number; w: number; h: number }) => {
    setCaptureMode(null);
    if (rect.w === 0 || rect.h === 0) {
      onCloseEditor?.();
      return;
    }
    
    try {
      const full = await settleThenCaptureVisibleTab();
      const cropped = await cropVisibleCapture(full, rect);
      await savePinImage(cropped);
      chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
      onCloseEditor?.();
      toast.success('Saved to pins');
    } catch (e) {
      console.error(e);
      const detail = e instanceof Error && e.message ? e.message : 'Could not pin screenshot';
      toast.error(detail);
      onCloseEditor?.();
    }
  };

  const finishGridCapture = async (regions: { id: string; x: number; y: number; w: number; h: number }[]) => {
    setCaptureMode(null);
    if (regions.length === 0) {
      onCloseEditor?.();
      return;
    }
    
    try {
      const full = await settleThenCaptureVisibleTab();
      useHardLoadingStore.getState().showHardLoading({ title: 'Capturing grid', message: 'Processing regions' });
      const batchId = `batch-${Date.now()}`;
      
      const croppedUrls: string[] = [];
      for (const rect of regions) {
        const cropped = await cropVisibleCapture(full, rect);
        croppedUrls.push(cropped);
      }
      
      await savePinImagesBatch(croppedUrls, batchId);
      useHardLoadingStore.getState().hideHardLoading();
      chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
      onCloseEditor?.();
      toast.success(`Saved ${regions.length} regions to pins`);
    } catch (e) {
      useHardLoadingStore.getState().hideHardLoading();
      console.error(e);
      const detail = e instanceof Error && e.message ? e.message : 'Could not save grid capture';
      toast.error(detail);
      onCloseEditor?.();
    }
  };

  const handleFullPageCapture = (dataUrl: string | null) => {
    setCaptureMode(null);
    if (dataUrl) void openScreenshot(dataUrl);
    else onCloseEditor?.();
  };

  if (!screenshot && !captureMode && !hardLoading) return null;

  if (captureMode === 'area' || captureMode === 'pin_area') {
    return (
      <>
        <Toaster position="top-center" theme="light" />
        <HardLoadingHost />
        <AreaCaptureOverlay
          onClose={closeEditor}
          onCapture={(rect) => 
            captureMode === 'pin_area' 
              ? finishAreaAsPin(rect) 
              : finishAreaAsEditor(rect)
          }
        />
      </>
    );
  }

  if (captureMode === 'grid') {
    return (
      <>
        <Toaster position="top-center" theme="light" />
        <HardLoadingHost />
        <GridCaptureOverlay
          onClose={closeEditor}
          onCaptureAll={finishGridCapture}
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
