import type { ReactNode } from 'react';
import type { Shape, ShapeType, ToolType } from '../../store/editorTypes';
import type { ProFeatureId } from '../../lib/entitlements/proFeatures';

export type DrawPoint = { x: number; y: number };

export type StartDrawContext = {
  pos: DrawPoint;
  selectedColor: string;
  strokeWidth: number;
  addShape: (shape: Shape) => void;
  saveHistory: () => void;
  setIsDrawing: (v: boolean) => void;
  setCurrentShapeId: (id: string | null) => void;
  setEditingText: (text: unknown | null) => void;
  pendingTextEditTimer: React.MutableRefObject<number | null>;
};

export type MoveDrawContext = {
  e: { evt?: { shiftKey?: boolean } };
  pos: DrawPoint;
  isDrawing: boolean;
  currentShapeId: string | null;
  startPos: DrawPoint;
  updateShape: (id: string, props: Record<string, unknown>) => void;
  findEdges?: (x: number, y: number) => unknown;
  lastEdgeCheckTime: React.MutableRefObject<number>;
};

export type ShapeRenderProps = {
  shape: Shape;
  commonProps: Record<string, unknown>;
  bgImage: HTMLImageElement | null;
  editingTextId: string | null;
  onTextDblClick: (e: unknown, shape: Shape) => void;
  /** Nested render for magnifier siblings */
  renderChild?: (shape: Shape) => ReactNode;
};

export type FeatureModule = {
  /** Pro catalog id, or always-on shell tools */
  id: ProFeatureId | 'select' | 'pan' | 'image' | 'core_shapes';
  /** Tools this module owns */
  tools?: ToolType[];
  /** Shape types this module can render */
  shapeTypes?: ShapeType[];
  startDraw?: (tool: ToolType, ctx: StartDrawContext) => boolean;
  moveDraw?: (tool: ToolType, ctx: MoveDrawContext) => boolean;
  renderShape?: (props: ShapeRenderProps) => ReactNode;
  /** Optional heavy deps (tesseract, etc.) */
  load?: () => Promise<void>;
};
