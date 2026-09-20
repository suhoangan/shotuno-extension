import type { CaptureMode } from './capture/types';

export type BootstrapMessage =
  | { type: 'TOGGLE_EDITOR'; payload?: string }
  | { type: 'TOGGLE_PREVIEW'; payload?: string }
  | { type: 'START_AREA_SELECTION' }
  | { type: 'START_PIN_AREA_SELECTION' }
  | { type: 'START_FULL_PAGE_CAPTURE' }
  | { type: 'START_GRID_CAPTURE' }
  | { type: 'START_SCROLL_AREA_CAPTURE' };

export function captureModeFromBootstrap(message: BootstrapMessage | null): CaptureMode {
  if (!message) return null;
  if (message.type === 'START_AREA_SELECTION') return 'area';
  if (message.type === 'START_PIN_AREA_SELECTION') return 'pin_area';
  if (message.type === 'START_FULL_PAGE_CAPTURE') return 'full';
  if (message.type === 'START_GRID_CAPTURE') return 'grid';
  if (message.type === 'START_SCROLL_AREA_CAPTURE') return 'scroll_area';
  return null;
}

export function screenshotFromBootstrap(message: BootstrapMessage | null): string | null {
  if (message?.type === 'TOGGLE_EDITOR' || message?.type === 'TOGGLE_PREVIEW') {
    return message.payload ?? null;
  }
  return null;
}
