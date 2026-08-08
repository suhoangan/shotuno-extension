export type CaptureRect = { x: number; y: number; w: number; h: number };

export type GridRegion = CaptureRect & { id: string };

export type CaptureMode = 'area' | 'pin_area' | 'full' | 'grid' | 'scroll_area' | null;
