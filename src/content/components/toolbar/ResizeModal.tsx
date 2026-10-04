import { useState, useEffect } from 'react';
import { X, Lock, Unlock, AlertCircle } from 'lucide-react';
import { useEditorStore } from '../../../store/useEditorStore';
import { Button } from '../../../components/ui/button';
import { validateResolution } from '../canvas/resolutionLimits';
import { useTranslation } from '../../../lib/i18n';

interface ResizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: HTMLImageElement | null;
  setImage?: (img: HTMLImageElement) => void;
}

export const ResizeModal = ({ isOpen, onClose, image, setImage }: ResizeModalProps) => {
  const { t } = useTranslation();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [keepAspectRatio, setKeepAspectRatio] = useState(true);
  const { shapes, setShapes, saveHistory } = useEditorStore();

  useEffect(() => {
    if (isOpen && image) {
      setWidth(image.width);
      setHeight(image.height);
    }
  }, [isOpen, image]);

  if (!isOpen || !image) return null;

  const validation = validateResolution(width, height);
  const isExceedingMax = validation.status === 'exceeds_max';
  const isInvalid = validation.status === 'invalid_dimensions';

  const handleWidthChange = (val: string) => {
    const w = parseInt(val, 10) || 0;
    setWidth(w);
    if (keepAspectRatio && image.width > 0) {
      setHeight(Math.round(w * (image.height / image.width)));
    }
  };

  const handleHeightChange = (val: string) => {
    const h = parseInt(val, 10) || 0;
    setHeight(h);
    if (keepAspectRatio && image.height > 0) {
      setWidth(Math.round(h * (image.width / image.height)));
    }
  };

  const performScale = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(image, 0, 0, width, height);
    const newImageSrc = canvas.toDataURL('image/png');
    const scaleX = width / image.width;
    const scaleY = height / image.height;

    if (setImage) {
      const newImg = new window.Image();
      newImg.src = newImageSrc;
      newImg.onload = () => setImage(newImg);
    } else {
      image.src = newImageSrc;
    }

    const newShapes = shapes.map((shape) => {
      const s = { ...shape } as any;
      if (s.x !== undefined) s.x *= scaleX;
      if (s.y !== undefined) s.y *= scaleY;
      if (s.width !== undefined) s.width *= scaleX;
      if (s.height !== undefined) s.height *= scaleY;
      if (s.points) {
        s.points = s.points.map((p: number, i: number) => (i % 2 === 0 ? p * scaleX : p * scaleY));
      }
      if (s.fontSize) s.fontSize *= scaleY;
      if (s.strokeWidth) s.strokeWidth *= Math.min(scaleX, scaleY);
      if (s.radius) s.radius *= Math.min(scaleX, scaleY);
      return s;
    });

    setShapes(newShapes);
    saveHistory();
    onClose();
  };

  const handleResize = () => {
    if (isInvalid || isExceedingMax) return;
    performScale();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[999999] flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{t('resize.title')}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('resize.currentDimensions')}: {image.width} × {image.height}px
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="flex gap-4 items-center justify-center">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">{t('resize.width')}</label>
              <input
                type="number"
                value={width || ''}
                onChange={(e) => handleWidthChange(e.target.value)}
                className="bg-card border border-border rounded p-2 text-foreground w-28 text-center focus:ring-1 focus:ring-ring outline-none"
              />
            </div>

            <Button
              variant={keepAspectRatio ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setKeepAspectRatio(!keepAspectRatio)}
              className="mt-4"
              title={t('resize.maintainAspect')}
            >
              {keepAspectRatio ? <Lock size={16} /> : <Unlock size={16} />}
            </Button>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">{t('resize.height')}</label>
              <input
                type="number"
                value={height || ''}
                onChange={(e) => handleHeightChange(e.target.value)}
                className="bg-card border border-border rounded p-2 text-foreground w-28 text-center focus:ring-1 focus:ring-ring outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-muted-foreground bg-card/60 p-2.5 rounded-lg border border-border/40 flex items-center justify-between">
              <span>{t('resize.presets')}</span>
              <span className="font-semibold text-primary">Up to 4K UHD</span>
            </div>

            {isExceedingMax && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 p-2.5 rounded-lg flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{t('resize.exceedsMax')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border/50 bg-card/30 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            {t('dialogs.cancel')}
          </Button>
          <Button
            variant="default"
            disabled={isInvalid || isExceedingMax}
            onClick={handleResize}
            className="relative"
          >
            {t('resize.apply')}
          </Button>
        </div>
      </div>
    </div>
  );
};
