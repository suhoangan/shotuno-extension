import { useEditorStore } from '../../../../store/useEditorStore';

/**
 * Every store field `CanvasStage` draws from, selected one at a time.
 *
 * Reading the store without a selector subscribes to the whole state object, and `set` always
 * produces a new one — so unrelated churn like `isDragging`, `historyStep` or `galleryImages`
 * used to re-render the editor and the entire shape tree on every drag frame.
 */
export function useCanvasStageProps() {
  return {
    shapes: useEditorStore((s) => s.shapes),
    selectedShapeIds: useEditorStore((s) => s.selectedShapeIds),
    selectedColor: useEditorStore((s) => s.selectedColor),
    strokeWidth: useEditorStore((s) => s.strokeWidth),
    smartMeasureBounds: useEditorStore((s) => s.smartMeasureBounds),
    activeTool: useEditorStore((s) => s.activeTool),
    borderEnabled: useEditorStore((s) => s.borderEnabled),
    borderStyle: useEditorStore((s) => s.borderStyle),
    borderPadding: useEditorStore((s) => s.borderPadding),
    borderPaddingSize: useEditorStore((s) => s.borderPaddingSize),
    borderPaddingPreset: useEditorStore((s) => s.borderPaddingPreset),
    includeUrl: useEditorStore((s) => s.includeUrl),
    includeDate: useEditorStore((s) => s.includeDate),
    urlPosition: useEditorStore((s) => s.urlPosition),
    watermarkEnabled: useEditorStore((s) => s.watermarkEnabled),
    watermarkText: useEditorStore((s) => s.watermarkText),
    watermarkMode: useEditorStore((s) => s.watermarkMode),
    watermarkImageUrl: useEditorStore((s) => s.watermarkImageUrl),
  };
}
