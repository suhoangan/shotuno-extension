export async function extractTextFromImage(
  image: HTMLImageElement,
  rect: { x: number; y: number; width: number; height: number }
): Promise<string> {
  if (rect.width <= 0 || rect.height <= 0) return '';

  // Draw the selected region to a temporary canvas
  const canvas = document.createElement('canvas');
  canvas.width = rect.width;
  canvas.height = rect.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  ctx.drawImage(
    image,
    rect.x, rect.y, rect.width, rect.height,
    0, 0, rect.width, rect.height
  );

  const dataUrl = canvas.toDataURL('image/png');

  try {
    // Dynamic import keeps tesseract out of the editor shell chunk.
    const { default: Tesseract } = await import('tesseract.js');
    const result = await Tesseract.recognize(dataUrl, 'eng');
    return result.data.text.trim();
  } catch (err) {
    console.error('OCR failed:', err);
    throw err;
  }
}
