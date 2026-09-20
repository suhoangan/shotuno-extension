import type { DownloadImageFormat } from '../../../lib/captureSettings';

/** Export the Konva stage to a data URL (and optional blob) with format support. */
export function exportStageToPng(
  stage: any,
  format: DownloadImageFormat = 'png',
): { uri: string; blobPromise: Promise<Blob> } {
  const transformers = stage.find('Transformer');
  transformers.forEach((t: any) => t.hide());

  const oldScaleX = stage.scaleX();
  const oldScaleY = stage.scaleY();
  const oldWidth = stage.width();
  const oldHeight = stage.height();
  const oldX = stage.x();
  const oldY = stage.y();

  stage.scale({ x: 1, y: 1 });
  stage.width(oldWidth / oldScaleX);
  stage.height(oldHeight / oldScaleY);
  stage.x(0);
  stage.y(0);

  // Blur/pixelate patches are Konva nodes — included in the stage bitmap.
  const canvas = stage.toCanvas({ pixelRatio: 1 });

  let exportCanvas: HTMLCanvasElement = canvas;
  let mimeType = 'image/png';
  let quality: number | undefined = undefined;

  if (format === 'jpg') {
    mimeType = 'image/jpeg';
    quality = 0.92;
    // Composite over white background to avoid black background on transparent areas
    const flatCanvas = document.createElement('canvas');
    flatCanvas.width = canvas.width;
    flatCanvas.height = canvas.height;
    const ctx = flatCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, flatCanvas.width, flatCanvas.height);
      ctx.drawImage(canvas, 0, 0);
      exportCanvas = flatCanvas;
    }
  } else if (format === 'webp') {
    mimeType = 'image/webp';
    quality = 0.92;
  }

  const uri = exportCanvas.toDataURL(mimeType, quality);

  stage.scale({ x: oldScaleX, y: oldScaleY });
  stage.width(oldWidth);
  stage.height(oldHeight);
  stage.x(oldX);
  stage.y(oldY);
  transformers.forEach((t: any) => t.show());

  const blobPromise = new Promise<Blob>((resolve, reject) => {
    exportCanvas.toBlob(
      (blob: Blob | null) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      mimeType,
      quality,
    );
  });

  return { uri, blobPromise };
}
