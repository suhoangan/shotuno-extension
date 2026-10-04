import { limitImageResolution, MAX_IMPORT_EDGE } from '../../lib/limitImageResolution';
import { useEditorStore } from '../../store/useEditorStore';

/**
 * Prepare a screenshot for the editor: reset store + cap resolution so the
 * data URL and decoded image share one coordinate space (OCR / Smart Blur).
 * All users receive full MAX_IMPORT_EDGE resolution under the Free Forever model.
 */
export async function prepareScreenshot(
  dataUrl: string,
): Promise<string> {
  const store = useEditorStore.getState();
  store.reset();

  const { dataUrl: sized } = await limitImageResolution(dataUrl, { maxEdge: MAX_IMPORT_EDGE });
  return sized;
}
