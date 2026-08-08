import { useEditorStore } from '../../../store/useEditorStore';
import { textFontSizeFromStrokeWidth, textDefaultHeight } from '../../../store/editorDefaults';
import { Square, Grid, Droplets, Circle, MapPin, ArrowLeftRight, Minus, Square as SquareOutline } from 'lucide-react';
import { StyleToggle } from './StyleToggle';
import { StrokeWidthControl } from './StrokeWidthControl';
import { ICON, STYLE_BAR, STYLE_GAP, CHROME } from './toolbarUi';
import { toImageAnnotationSize } from '../canvas/annotationSize';
import { Button } from '../../../components/ui/button';

const colors = ['#ef4444', '#facc15', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ffffff', '#000000'];

export function StyleToolbar() {
  const { 
    activeTool, selectedShapeIds, shapes, updateShape, saveHistory,
    blurType, setBlurType,
    counterStyle, setCounterStyle,
    isTwoWay, setIsTwoWay,
    isLine, setIsLine,
    isSolid, setIsSolid,
    selectedColor, setSelectedColor,
    strokeWidth, setStrokeWidth
  } = useEditorStore();

  if (!(
    ['arrow', 'measure', 'rect', 'circle', 'triangle', 'text', 'brush', 'highlight', 'blur', 'callout', 'magnifier', 'counter'].includes(activeTool) ||
    selectedShapeIds.length > 0
  )) {
    return null;
  }

  const selection = shapes.filter(s => selectedShapeIds.includes(s.id));
  const selectedTypes = new Set(selection.map(s => s.type));

  // A mixed selection has no style in common: showing every type's controls at
  // once would push irrelevant props onto the other shapes when one is used
  if (selectedTypes.size > 1) {
    return null;
  }

  // Stickers carry no colour or stroke, they are resized with the transformer handles
  if (selectedTypes.has('sticker')) {
    return null;
  }

  const applyToSelection = (props: any) => {
    if (selectedShapeIds.length === 0) return;
    selectedShapeIds.forEach(id => updateShape(id, props));
    saveHistory();
  };

  // Only write into the active tool's saved picker when the user changes color/size/style
  const persistOpts = { persistToTool: true as const };

  const appliesTo = (...types: string[]) =>
    types.includes(activeTool) || selection.some(s => types.includes(s.type));

  const isBlur = appliesTo('blur');
  const isSolidRedact = (activeTool === 'blur' && blurType === 'solid') ||
    selection.some(s => s.type === 'blur' && s.blurType === 'solid');

  // Magnifier / image color+stroke are the border only — disable while borderless
  const borderStrokeOnly =
    (selection.length === 0 && (activeTool === 'magnifier' || activeTool === 'image')) ||
    (selection.length > 0 && selection.every((s) => s.type === 'magnifier' || s.type === 'image'));
  // Prefer the selection's border state so the toggle matches what's on canvas
  const effectiveIsSolid = selection.length > 0
    ? selection.every((s) => Boolean(s.isSolid))
    : isSolid;
  const borderStrokeBorderless = borderStrokeOnly && effectiveIsSolid;
  const showColorPicker = !isBlur || blurType === 'solid';
  const showStrokeWidth = !isSolidRedact;
  const borderStyleLocked = borderStrokeBorderless;

  return (
    <div className={`${CHROME} ${STYLE_BAR} flex flex-wrap ${STYLE_GAP} mt-1 items-center min-h-11 w-fit max-w-full pointer-events-auto`}>
      {isBlur && (
        <>
          <StyleToggle label="Solid Redact" active={blurType === 'solid'} onClick={() => { setBlurType('solid', persistOpts); applyToSelection({ blurType: 'solid' }); }}>
            <Square size={ICON} />
          </StyleToggle>
          <StyleToggle label="Pixelate" active={blurType === 'pixelate'} onClick={() => { setBlurType('pixelate', persistOpts); applyToSelection({ blurType: 'pixelate' }); }}>
            <Grid size={ICON} />
          </StyleToggle>
          <StyleToggle label="Gaussian Blur" active={blurType === 'blur'} onClick={() => { setBlurType('blur', persistOpts); applyToSelection({ blurType: 'blur' }); }}>
            <Droplets size={ICON} />
          </StyleToggle>
          <div className="h-4 w-px shrink-0 bg-border/40" />
        </>
      )}
      
      {appliesTo('counter') && (
        <>
          <StyleToggle label="Circle Style" active={counterStyle === 'circle'} onClick={() => { setCounterStyle('circle', persistOpts); applyToSelection({ counterStyle: 'circle' }); }}>
            <Circle size={ICON} />
          </StyleToggle>
          <StyleToggle label="Square Style" active={counterStyle === 'square'} onClick={() => { setCounterStyle('square', persistOpts); applyToSelection({ counterStyle: 'square' }); }}>
            <Square size={ICON} />
          </StyleToggle>
          <StyleToggle label="Waterpoint Style" active={counterStyle === 'waterpoint'} onClick={() => { setCounterStyle('waterpoint', persistOpts); applyToSelection({ counterStyle: 'waterpoint' }); }}>
            <MapPin size={ICON} />
          </StyleToggle>
          <div className="h-4 w-px shrink-0 bg-border/40" />
        </>
      )}
      
      {appliesTo('arrow') && (
        <>
          <StyleToggle
            label="Line"
            active={isLine}
            onClick={() => {
              const next = !isLine;
              setIsLine(next, persistOpts);
              if (next) setIsTwoWay(false, persistOpts);
              applyToSelection({ isLine: next, ...(next ? { isTwoWay: false } : {}) });
            }}
          >
            <Minus size={ICON} />
          </StyleToggle>
          <StyleToggle
            label="Toggle Two-Way Arrow"
            active={isTwoWay && !isLine}
            onClick={() => {
              const next = !isTwoWay;
              setIsTwoWay(next, persistOpts);
              if (next) setIsLine(false, persistOpts);
              applyToSelection({ isTwoWay: next, ...(next ? { isLine: false } : {}) });
            }}
          >
            <ArrowLeftRight size={ICON} />
          </StyleToggle>
          <div className="h-4 w-px shrink-0 bg-border/40" />
        </>
      )}

      {borderStrokeOnly && (
        <>
          <StyleToggle
            label="Border"
            active={!effectiveIsSolid}
            onClick={() => {
              const next = !effectiveIsSolid;
              setIsSolid(next, persistOpts);
              applyToSelection({ isSolid: next });
            }}
          >
            {effectiveIsSolid ? <SquareOutline size={ICON} /> : <Square size={ICON} fill="currentColor" />}
          </StyleToggle>
          <div className="h-4 w-px shrink-0 bg-border/40" />
        </>
      )}

      {appliesTo('rect', 'circle', 'triangle', 'text') && (
        <>
          <StyleToggle
            label="Toggle Fill"
            active={isSolid}
            onClick={() => { setIsSolid(!isSolid, persistOpts); applyToSelection({ isSolid: !isSolid }); }}
          >
            {isSolid ? <Square size={ICON} fill="currentColor" /> : <SquareOutline size={ICON} />}
          </StyleToggle>
          <div className="h-4 w-px shrink-0 bg-border/40" />
        </>
      )}

      {showColorPicker && (
        <div
          className={`flex gap-2 ${borderStyleLocked ? 'pointer-events-none opacity-40' : ''}`}
          aria-disabled={borderStyleLocked || undefined}
          title={borderStyleLocked ? 'Enable Border to change color' : undefined}
        >
          {colors.map(c => (
            <Button 
              key={c}
              type="button"
              variant="outline"
              size="icon"
              disabled={borderStyleLocked}
              onClick={() => { setSelectedColor(c, persistOpts); applyToSelection({ color: c }); }}
              className={`w-5 h-5 rounded-full border-2 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-transform ${borderStyleLocked ? 'cursor-not-allowed' : 'hover:scale-110'} ${selectedColor === c ? 'border-foreground scale-110 shadow-sm' : 'border-border hover:border-foreground/40'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      )}

      {showStrokeWidth && (
        <>
          {showColorPicker && <div className="h-4 w-px shrink-0 bg-border/40" />}
          <div
            className={borderStyleLocked ? 'pointer-events-none opacity-40' : undefined}
            aria-disabled={borderStyleLocked || undefined}
            title={borderStyleLocked ? 'Enable Border to change size' : undefined}
          >
            <StrokeWidthControl
              value={strokeWidth}
              onChange={(newWidth) => {
                if (borderStyleLocked) return;
                setStrokeWidth(newWidth, persistOpts);
                const imageWidth = toImageAnnotationSize(newWidth);
                if (appliesTo('text')) {
                  const fontSize = textFontSizeFromStrokeWidth(imageWidth);
                  if (selectedShapeIds.length === 0) return;
                  selectedShapeIds.forEach((id) => {
                    const s = shapes.find((sh) => sh.id === id);
                    if (!s || s.type !== 'text') {
                      updateShape(id, { strokeWidth: imageWidth });
                      return;
                    }
                    const oldFont = s.fontSize || 20;
                    const oldH = s.height || textDefaultHeight(oldFont);
                    const newH = textDefaultHeight(fontSize);
                    const ratio = oldFont > 0 ? fontSize / oldFont : 1;
                    const hRatio = oldH > 0 ? newH / oldH : ratio;
                    const patch: Record<string, unknown> = {
                      strokeWidth: imageWidth,
                      fontSize,
                      height: newH,
                    };
                    if (s.tailX !== undefined && s.tailY !== undefined) {
                      patch.tailX = s.tailX * ratio;
                      patch.tailY = s.tailY * hRatio;
                    }
                    updateShape(id, patch);
                  });
                  saveHistory();
                } else {
                  applyToSelection({ strokeWidth: imageWidth });
                }
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
