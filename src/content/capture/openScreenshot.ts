import { limitImageResolution, MAX_IMPORT_EDGE, FREE_MAX_IMPORT_EDGE } from '../../lib/limitImageResolution';
import { useEditorStore } from '../../store/useEditorStore';
import { isUserFreeTier } from '../../lib/entitlements/license';
import { toast } from 'sonner';
import { storage } from '../../lib/chromeStorage';
import { webUrl } from '../../lib/api';



/**
 * Prepare a screenshot for the editor: reset store + cap resolution so the
 * data URL and decoded image share one coordinate space (OCR / Smart Blur).
 */
export async function prepareScreenshot(
  dataUrl: string,
): Promise<string> {
  const store = useEditorStore.getState();
  store.reset();
  
  const { authUser } = await storage.local.get(['authUser']);
  
  const isFree = isUserFreeTier(authUser as any);
  const maxEdge = isFree ? FREE_MAX_IMPORT_EDGE : MAX_IMPORT_EDGE;
  
  const { dataUrl: sized } = await limitImageResolution(dataUrl, { maxEdge });
  
  if (isFree && sized !== dataUrl) {
    // We don't have the exact original dimensions before the call easily here unless we check scale,
    // but limitImageResolution does the resizing only if it exceeds maxEdge.
    // If it was resized, dataUrl is completely re-encoded so it won't strictly === dataUrl (actually it will return a different string data:image/png...)
    // Wait, let's just show the toast if we know it could be limited.
    toast.info('Image resolution limited on Free tier. Upgrade to Pro for full quality.', {
      duration: 5000,
      action: {
        label: 'Upgrade',
        onClick: () => window.open(webUrl('#pricing'), '_blank')
      }
    });
  }
  
  return sized;
}
