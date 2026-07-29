/** Crop a visible-tab capture to a CSS-pixel rect (accounts for devicePixelRatio). */
export function cropVisibleCapture(
  dataUrl: string,
  rect: { x: number; y: number; w: number; h: number },
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const dpr = window.devicePixelRatio || 1;
      const canvas = document.createElement('canvas');
      canvas.width = rect.w * dpr;
      canvas.height = rect.h * dpr;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas unavailable'));
        return;
      }
      ctx.drawImage(
        img,
        rect.x * dpr,
        rect.y * dpr,
        rect.w * dpr,
        rect.h * dpr,
        0,
        0,
        rect.w * dpr,
        rect.h * dpr,
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
