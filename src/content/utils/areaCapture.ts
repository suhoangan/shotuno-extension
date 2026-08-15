export function cropVisibleCapture(
  dataUrl: string,
  rect: { x: number; y: number; w: number; h: number },
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const viewportW = window.innerWidth;
      const viewportH = window.innerHeight;
      const scaleX = img.naturalWidth / viewportW;
      const scaleY = img.naturalHeight / viewportH;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(rect.w * scaleX));
      canvas.height = Math.max(1, Math.round(rect.h * scaleY));
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas unavailable'));
        return;
      }
      ctx.drawImage(
        img,
        rect.x * scaleX,
        rect.y * scaleY,
        rect.w * scaleX,
        rect.h * scaleY,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      const out = canvas.toDataURL('image/png');
      canvas.width = 0;
      canvas.height = 0;
      resolve(out);
    };
    img.onerror = () => reject(new Error('Failed to load capture'));
    img.src = dataUrl;
  });
}

export function captureVisibleTab(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: 'CAPTURE_VISIBLE_TAB' }, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      const dataUrl = (response as { dataUrl?: string; error?: string } | undefined)?.dataUrl;
      if (!dataUrl) {
        reject(new Error((response as { error?: string } | undefined)?.error || 'Capture failed'));
        return;
      }
      resolve(dataUrl);
    });
  });
}

/** Wait for Shotuno UI to unmount/paint before captureVisibleTab so overlays are not in the shot. */
export async function settleThenCaptureVisibleTab(): Promise<string> {
  await new Promise((r) => setTimeout(r, 120));
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  return captureVisibleTab();
}
