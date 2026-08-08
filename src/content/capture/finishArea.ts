import { toast } from 'sonner';
import { savePinImage } from '../../lib/pinDb';
import { cropVisibleCapture, settleThenCaptureVisibleTab } from '../utils/areaCapture';
import type { CaptureRect } from './types';

export async function captureAreaCrop(rect: CaptureRect): Promise<string | null> {
  if (rect.w === 0 || rect.h === 0) return null;
  const full = await settleThenCaptureVisibleTab();
  return cropVisibleCapture(full, rect);
}

export async function finishAreaAsPin(rect: CaptureRect): Promise<'saved' | 'empty' | 'error'> {
  if (rect.w === 0 || rect.h === 0) return 'empty';
  try {
    const cropped = await captureAreaCrop(rect);
    if (!cropped) return 'empty';
    await savePinImage(cropped);
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' });
    toast.success('Saved to pins');
    return 'saved';
  } catch (e) {
    console.error(e);
    const detail = e instanceof Error && e.message ? e.message : 'Could not pin screenshot';
    toast.error(detail);
    return 'error';
  }
}
