import { useEffect, useState } from 'react';
import { useEditorStore } from '../../../../store/useEditorStore';
import { extractTextFromImage } from '../../../utils/extractText';
import { useProGate } from '../../hooks/useProGate';

/** Run OCR when an extract-text drag finishes (isDrawing → false with an ocrRect). */
export function useOcrExtract(image: HTMLImageElement | null, isDrawing: boolean) {
  const { runPro } = useProGate();
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

    void runPro('ocr', async () => {
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
    });
  }, [isDrawing, ocrRect, image, setOcrRect, isOcrLoading, runPro]);

  return { isOcrOpen, setIsOcrOpen, ocrText, isOcrLoading };
}
