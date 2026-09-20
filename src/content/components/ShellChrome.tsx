import type { ReactNode } from 'react';
import { Toaster } from '../../components/ui/sonner';
import { HardLoadingHost } from './HardLoadingHost';

export function ShellChrome({ children }: { children?: ReactNode }) {
  return (
    <>
      <Toaster position="top-center" theme="light" />
      <HardLoadingHost />
      {children}
    </>
  );
}

/** Blocks page interaction while a lazy capture/editor chunk loads. */
export function ChunkFallback() {
  return (
    <div className="fixed inset-0 z-[999998] pointer-events-auto bg-foreground/20" aria-hidden />
  );
}
