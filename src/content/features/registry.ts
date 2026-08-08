import type { ShapeType, ToolType } from '../../store/editorTypes';
import type {
  FeatureModule,
  MoveDrawContext,
  ShapeRenderProps,
  StartDrawContext,
} from './types';

const modules: FeatureModule[] = [];
const startByTool = new Map<ToolType, FeatureModule['startDraw']>();
const moveByTool = new Map<ToolType, FeatureModule['moveDraw']>();
const renderByShape = new Map<ShapeType, FeatureModule['renderShape']>();
const loadById = new Map<string, () => Promise<void>>();
const loaded = new Set<string>();

let builtinsRegistered = false;

export function registerFeature(mod: FeatureModule): void {
  modules.push(mod);
  for (const tool of mod.tools ?? []) {
    if (mod.startDraw) startByTool.set(tool, mod.startDraw);
    if (mod.moveDraw) moveByTool.set(tool, mod.moveDraw);
  }
  for (const shapeType of mod.shapeTypes ?? []) {
    if (mod.renderShape) renderByShape.set(shapeType, mod.renderShape);
  }
  if (mod.load) loadById.set(mod.id, mod.load);
}

export function getRegisteredFeatures(): readonly FeatureModule[] {
  return modules;
}

export function startDrawForTool(tool: ToolType, ctx: StartDrawContext): boolean {
  const fn = startByTool.get(tool);
  if (!fn) return false;
  return fn(tool, ctx);
}

export function moveDrawForTool(tool: ToolType, ctx: MoveDrawContext): boolean {
  const fn = moveByTool.get(tool);
  if (!fn) return false;
  return fn(tool, ctx);
}

export function renderShapeType(type: ShapeType, props: ShapeRenderProps) {
  const fn = renderByShape.get(type);
  return fn ? fn(props) : null;
}

export function hasShapeRenderer(type: ShapeType): boolean {
  return renderByShape.has(type);
}

/** Load heavy deps for a feature once (OCR / smart blur). */
export async function ensureFeatureLoaded(id: string): Promise<void> {
  if (loaded.has(id)) return;
  const load = loadById.get(id);
  if (!load) {
    loaded.add(id);
    return;
  }
  await load();
  loaded.add(id);
}

export function markBuiltinsRegistered(): void {
  builtinsRegistered = true;
}

export function areBuiltinsRegistered(): boolean {
  return builtinsRegistered;
}

/** Test helper — clear registry between tests. */
export function resetFeatureRegistryForTests(): void {
  modules.length = 0;
  startByTool.clear();
  moveByTool.clear();
  renderByShape.clear();
  loadById.clear();
  loaded.clear();
  builtinsRegistered = false;
}
