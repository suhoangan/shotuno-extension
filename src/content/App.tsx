import { lazy, Suspense, useEffect, useState } from 'react';
import { HardLoadingHost } from './components/HardLoadingHost';
import { Toaster } from '../components/ui/sonner';
import { useEditorStore } from '../store/useEditorStore';
import { useHardLoadingStore } from '../store/useHardLoadingStore';
import { prepareScreenshot } from './capture/openScreenshot';
import { captureAreaCrop, finishAreaAsPin } from './capture/finishArea';
import { finishGridCapture } from './capture/finishGrid';
import type { CaptureMode } from './capture/types';



export type BootstrapMessage =
  | { type: 'TOGGLE_EDITOR'; payload?: string }
  | { type: 'START_AREA_SELECTION' }
  | { type: 'START_PIN_AREA_SELECTION' }
  | { type: 'START_FULL_PAGE_CAPTURE' }
  | { type: 'START_GRID_CAPTURE' }
  | { type: 'START_SCROLL_AREA_CAPTURE' };

/** Capture / editor chunks — validated under `vite build` (CRX dynamic import). */
const AreaCaptureOverlay = lazy(() => import('./components/AreaCaptureOverlay'));
const FullPageCaptureOverlay = lazy(() => import('./components/FullPageCaptureOverlay'));
const GridCaptureOverlay = lazy(() => import('./components/grid-capture/GridCaptureOverlay'));
const ScrollAreaCaptureOverlay = lazy(() => import('./components/ScrollAreaCaptureOverlay'));
const EditorShell = lazy(() => import('./components/EditorShell'));

function captureModeFromBootstrap(message: BootstrapMessage | null): CaptureMode {
  if (!message) return null;
  if (message.type === 'START_AREA_SELECTION') return 'area';
  if (message.type === 'START_PIN_AREA_SELECTION') return 'pin_area';
  if (message.type === 'START_FULL_PAGE_CAPTURE') return 'full';
  if (message.type === 'START_GRID_CAPTURE') return 'grid';
  if (message.type === 'START_SCROLL_AREA_CAPTURE') return 'scroll_area';
  return null;
}

function screenshotFromBootstrap(message: BootstrapMessage | null): string | null {
  if (message?.type === 'TOGGLE_EDITOR') return message.payload ?? null;
  return null;
}

function ShellChrome({ children }: { children?: React.ReactNode }) {
  return (
    <>
      <Toaster position="top-center" theme="light" />
      <HardLoadingHost />
      {children}
    </>
  );
}

/** Blocks page interaction while a lazy capture/editor chunk loads. */
function ChunkFallback() {
  return (
    <div className="fixed inset-0 z-[999998] pointer-events-auto bg-foreground/20" aria-hidden />
  );
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

  const openScreenshot = async (dataUrl: string | null) => {
    setCaptureMode(null);
    if (!dataUrl) {
      setScreenshot(null);
      return;
    }
    try {
      setScreenshot(await prepareScreenshot(dataUrl));
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
    } else if (bootstrap.type === 'START_SCROLL_AREA_CAPTURE') {
      setCaptureMode('scroll_area');
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
    useEditorStore.getState().reset();
    onCloseEditor?.();
  };

  const finishAreaAsEditor = async (rect: { x: number; y: number; w: number; h: number }) => {
    setCaptureMode(null);
    try {
      const cropped = await captureAreaCrop(rect);
      if (!cropped) {
        onCloseEditor?.();
        return;
      }
      await openScreenshot(cropped);
    } catch (e) {
      console.error(e);
      onCloseEditor?.();
    }
  };

  const onPinArea = async (rect: { x: number; y: number; w: number; h: number }) => {
    setCaptureMode(null);
    await finishAreaAsPin(rect);
    onCloseEditor?.();
  };

  const onGridCapture = async (
    regions: { id: string; x: number; y: number; w: number; h: number }[],
  ) => {
    setCaptureMode(null);
    await finishGridCapture(regions);
    onCloseEditor?.();
  };

  const handleFullPageCapture = (dataUrl: string | null) => {
    setCaptureMode(null);
    if (dataUrl) void openScreenshot(dataUrl);
    else onCloseEditor?.();
  };

  if (!screenshot && !captureMode && !hardLoading) return null;

  if (captureMode === 'area' || captureMode === 'pin_area') {
    return (
      <ShellChrome>
        <Suspense fallback={<ChunkFallback />}>
          <AreaCaptureOverlay
            onClose={closeEditor}
            onCapture={(rect) =>
              captureMode === 'pin_area' ? onPinArea(rect) : finishAreaAsEditor(rect)
            }
          />
        </Suspense>
      </ShellChrome>
    );
  }

  if (captureMode === 'grid') {
    return (
      <ShellChrome>
        <Suspense fallback={<ChunkFallback />}>
          <GridCaptureOverlay onClose={closeEditor} onCaptureAll={onGridCapture} />
        </Suspense>
      </ShellChrome>
    );
  }

  if (captureMode === 'scroll_area') {
    return (
      <ShellChrome>
        <Suspense fallback={<ChunkFallback />}>
          <ScrollAreaCaptureOverlay onClose={closeEditor} />
        </Suspense>
      </ShellChrome>
    );
  }

  if (captureMode === 'full') {
    return (
      <Suspense fallback={<ShellChrome><ChunkFallback /></ShellChrome>}>
        <FullPageCaptureOverlay onCapture={handleFullPageCapture} />
      </Suspense>
    );
  }

  if (!screenshot) {
    return <ShellChrome />;
  }

  return (
    <ShellChrome>
      <Suspense fallback={<ChunkFallback />}>
        <EditorShell screenshotUrl={screenshot} onClose={closeEditor} />
      </Suspense>
    </ShellChrome>
  );
}
