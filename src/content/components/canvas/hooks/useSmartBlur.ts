import { useState } from 'react';
import { toast } from 'sonner';
import { useEditorStore } from '../../../../store/useEditorStore';
import { detectSensitiveAreas } from '../../../utils/smartBlur';

export function useSmartBlur(screenshotUrl: string | null) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { shapes, setShapes, blurType, saveHistory } = useEditorStore();

  const handleSmartBlur = async () => {
    if (!screenshotUrl) return;
    
    setIsProcessing(true);
    const loadingToastId = toast.loading('Scanning for sensitive content...');
    
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = screenshotUrl;
      });

      const newShapes = await detectSensitiveAreas(img, blurType);
      
      if (newShapes.length > 0) {
        setShapes([...shapes, ...newShapes]);
        saveHistory();
        toast.success(`Smart Blur applied to ${newShapes.length} sensitive items`, { id: loadingToastId });
      } else {
        toast.info('No sensitive content detected.', { id: loadingToastId });
      }
    } catch (err) {
      console.error('Smart Blur error:', err);
      toast.error('Smart Blur failed to process image.', { id: loadingToastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return { isProcessing, handleSmartBlur };
}
