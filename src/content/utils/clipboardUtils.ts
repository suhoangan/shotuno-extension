function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Ensure a PNG blob — Chrome clipboard write only accepts image/png. */
export async function ensurePngBlob(blob: Blob): Promise<Blob> {
  if (blob.type === 'image/png') return blob;

  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (png) => (png ? resolve(png) : reject(new Error('PNG conversion failed'))),
      'image/png',
    );
  });
}

function buildHtml(plainText: string): string {
  const paragraphs = escapeHtml(plainText)
    .split('\n')
    .map((line) => `<p>${line || '<br>'}</p>`)
    .join('');
  return `<!DOCTYPE html><html><body>${paragraphs}</body></html>`;
}

/**
 * Write image + prompt in one ClipboardItem.
 * Call this while user activation is still valid; pass a Promise for the image
 * so heavy export can finish after write() is invoked.
 */
export async function copyImageAndTextToClipboard(
  image: Blob | Promise<Blob> | string,
  text: string = '',
): Promise<boolean> {
  const imagePromise = (async () => {
    let blob: Blob;
    if (typeof image === 'string') {
      blob = await (await fetch(image)).blob();
    } else {
      blob = await image;
    }
    return ensurePngBlob(blob);
  })();

  const plain = text || '';
  const formats: Record<string, Blob | Promise<Blob>> = {
    'image/png': imagePromise,
  };

  if (plain) {
    formats['text/plain'] = new Blob([plain], { type: 'text/plain' });
    formats['text/html'] = new Blob([buildHtml(plain)], { type: 'text/html' });
  }

  try {
    await navigator.clipboard.write([new ClipboardItem(formats)]);
    return true;
  } catch (combinedErr) {
    console.warn('Clipboard write with HTML failed, retrying image+text', combinedErr);
  }

  // Some Chromium builds reject text/html alongside image/png
  if (plain) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': imagePromise,
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        }),
      ]);
      return true;
    } catch (err) {
      console.warn('image+text clipboard write failed', err);
    }
  }

  // Last resort: image only (a second writeText would wipe the image)
  try {
    const png = await imagePromise;
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })]);
    return !plain;
  } catch (error) {
    console.error('Failed to copy to clipboard', error);
    return false;
  }
}
