import { useEffect, useState } from 'react';
import { useEditorStore } from '../../../../store/useEditorStore';
import { extractTextFromImage } from '../../../utils/extractText';
/** Run OCR when an extract-text drag finishes (isDrawing → false with an ocrRect). */
export function useOcrExtract(image: HTMLImageElement | null, isDrawing: boolean) {
  const ocrRect = useEditorStore((s) => s.ocrRect);
  const setOcrRect = useEditorStore((s) => s.setOcrRect);
  const [isOcrOpen, setIsOcrOpen] = useState(false);
  const [ocrText, setOcrText] = useState('');
  const [isOcrLoading, setIsOcrLoading] = useState(false);

  useEffect(() => {
    if (isDrawing || !ocrRect || !image || isOcrLoading) return;

    const rect = ocrRect;
    setOcrRect(null);

    if (rect.width <= 0 || rect.height <= 0) return;

    void (async () => {
      setIsOcrOpen(true);
      setIsOcrLoading(true);
      setOcrText('');

      try {
        const text = await extractTextFromImage(image, rect);
        setOcrText(text);
      } catch {
        setOcrText('Failed to extract text. Please try again.');
      } finally {
        setIsOcrLoading(false);
      }
    })();
  }, [isDrawing, ocrRect, image, setOcrRect, isOcrLoading]);

  return { isOcrOpen, setIsOcrOpen, ocrText, isOcrLoading };
}
