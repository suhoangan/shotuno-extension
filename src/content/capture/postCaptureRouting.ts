import { toast } from 'sonner';
import { copyImageAndTextToClipboard } from '../utils/clipboardUtils';
import { getCaptureSettings } from '../../lib/captureSettings';
import { saveAutoPinImage } from '../../lib/pinDb';

export interface PostCaptureOptions {
  skipAutoPin?: boolean;
}

export async function routePostCapture(
  dataUrl: string,
  options?: PostCaptureOptions,
): Promise<'open_editor' | 'handled'> {
  const settings = await getCaptureSettings();

  if (settings.postCaptureAction !== 'copy_clipboard') {
    return 'open_editor';
  }

  if (settings.autoPinEnabled && !options?.skipAutoPin) {
    try {
      await saveAutoPinImage(dataUrl);
      toast.success('Saved to Quick Pins');
    } catch (err) {
      console.error('[shotuno] auto-pin failed:', err);
    }
  }

  const success = await copyImageAndTextToClipboard(dataUrl);
  if (success) {
    toast.success('Screenshot copied to clipboard!');
  } else {
    toast.error('Failed to copy to clipboard');
  }
  return 'handled';
}
