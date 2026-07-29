import type { ToolSettings } from './editorDefaults';

type StyleState = {
  activeTool: string;
  toolSettings: Record<string, ToolSettings>;
};

/** Merge UI style patch; optionally also write into the active tool's saved defaults. */
export function withToolStylePersist<T extends Record<string, unknown>>(
  state: StyleState,
  uiPatch: T,
  toolPatch: Partial<ToolSettings>,
  persistToTool = true,
): T & { toolSettings?: Record<string, ToolSettings> } {
  if (!persistToTool) return uiPatch;
  return {
    ...uiPatch,
    toolSettings: {
      ...state.toolSettings,
      [state.activeTool]: { ...state.toolSettings[state.activeTool], ...toolPatch },
    },
  };
}
