/** Shared capture mode ids — popup + context menu SSOT. */
export const CAPTURE_TYPES = [
  'visible',
  'area',
  'scroll_area',
  'full',
  'pin_area',
  'grid',
] as const;

export type CaptureType = (typeof CAPTURE_TYPES)[number];

export function isCaptureType(value: string): value is CaptureType {
  return (CAPTURE_TYPES as readonly string[]).includes(value);
}

/** Short titles for Chrome contextMenus (text-only). */
export const CAPTURE_MENU_TITLES: Record<CaptureType, string> = {
  visible: 'Capture visible',
  area: 'Capture area',
  scroll_area: 'Scroll capture area',
  full: 'Capture full page',
  pin_area: 'Pin area',
  grid: 'Grid capture',
};
