import { useEffect, useState } from 'react';
import CanvasEditor from './components/CanvasEditor';
import Toolbar from './components/Toolbar';
import AreaCaptureOverlay from './components/AreaCaptureOverlay';
import FullPageCaptureOverlay from './components/FullPageCaptureOverlay';
import { Toaster } from '../components/ui/sonner';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useEditorStore } from '../store/useEditorStore';
import { savePinImage } from '../lib/pinDb';
import { captureVisibleTab, cropVisibleCapture } from './utils/areaCapture';
import { toast } from 'sonner';

export type BootstrapMessage =
  | { type: 'TOGGLE_EDITOR'; payload?: string }
  | { type: 'START_AREA_SELECTION' }
  | { type: 'START_PIN_AREA_SELECTION' }
  | { type: 'START_FULL_PAGE_CAPTURE' };

type CaptureMode = 'area' | 'pin_area' | 'full' | null;

function captureModeFromBootstrap(message: BootstrapMessage | null): CaptureMode {
  if (!message) return null;
  if (message.type === 'START_AREA_SELECTION') return 'area';
  if (message.type === 'START_PIN_AREA_SELECTION') return 'pin_area';
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

  const openScreenshot = (dataUrl: string | null) => {
    if (dataUrl) useEditorStore.getState().reset();
    setScreenshot(dataUrl);
    setCaptureMode(null);
  };

  useEffect(() => {
    if (!bootstrap) return;
    if (bootstrap.type === 'TOGGLE_EDITOR') {
      openScreenshot(bootstrap.payload ?? null);
    } else if (bootstrap.type === 'START_AREA_SELECTION') {
      setCaptureMode('area');
    } else if (bootstrap.type === 'START_PIN_AREA_SELECTION') {
      setCaptureMode('pin_area');
    } else if (bootstrap.type === 'START_FULL_PAGE_CAPTURE') {
      setCaptureMode('full');
    }
  }, [bootstrap]);

  useEffect(() => {
    const onReplace = (e: Event) => {
      const dataUrl = (e as CustomEvent<{ dataUrl?: string }>).detail?.dataUrl;
      if (dataUrl) openScreenshot(dataUrl);
    };
    document.addEventListener('replace-screenshot', onReplace);
    return () => document.removeEventListener('replace-screenshot', onReplace);
  }, []);

  const closeEditor = () => {
    setScreenshot(null);
    setCaptureMode(null);
    onCloseEditor?.();
  };

  const finishAreaAsEditor = async (rect: { x: number; y: number; w: number; h: number }) => {
    setCaptureMode(null);
    if (rect.w === 0 || rect.h === 0) {
      onCloseEditor?.();
      return;
    }
    await new Promise((r) => setTimeout(r, 100));
    try {
      const full = await captureVisibleTab();
      const cropped = await cropVisibleCapture(full, rect);
      setScreenshot(cropped);
      useEditorStore.getState().reset();
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
    await new Promise((r) => setTimeout(r, 100));
    try {
      const full = await captureVisibleTab();
      const cropped = await cropVisibleCapture(full, rect);
      await savePinImage(cropped);
      chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
      onCloseEditor?.();
    } catch (e) {
      console.error(e);
      const detail = e instanceof Error && e.message ? e.message : 'Could not pin screenshot';
      toast.error(detail);
      onCloseEditor?.();
    }
  };

  const handleFullPageCapture = (dataUrl: string | null) => {
    setCaptureMode(null);
    if (dataUrl) openScreenshot(dataUrl);
    else onCloseEditor?.();
  };

  if (!screenshot && !captureMode) return null;

  if (captureMode === 'area' || captureMode === 'pin_area') {
    return (
      <>
        <Toaster position="top-center" theme="light" />
        <AreaCaptureOverlay
          onCapture={captureMode === 'pin_area' ? finishAreaAsPin : finishAreaAsEditor}
        />
      </>
    );
  }

  if (captureMode === 'full') {
    return <FullPageCaptureOverlay onCapture={handleFullPageCapture} />;
  }

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center overflow-hidden font-sans bg-foreground/30 backdrop-blur-md pointer-events-auto">
      <Toaster position="top-center" theme="light" />
      <Toolbar onClose={closeEditor} />
      <div className="w-full h-full">
        {screenshot && (
          <ErrorBoundary fallbackTitle="Canvas crashed">
            <CanvasEditor screenshotUrl={screenshot} />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}
