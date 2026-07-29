/** Export the Konva stage to a PNG data URL (and optional blob). */
export function exportStageToPng(stage: any): { uri: string; blobPromise: Promise<Blob> } {
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
  const uri = canvas.toDataURL('image/png');

  stage.scale({ x: oldScaleX, y: oldScaleY });
  stage.width(oldWidth);
  stage.height(oldHeight);
  stage.x(oldX);
  stage.y(oldY);
  transformers.forEach((t: any) => t.show());

  const blobPromise = new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob: Blob | null) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/png',
    );
  });

  return { uri, blobPromise };
}
