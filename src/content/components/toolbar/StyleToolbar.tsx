import { useEditorStore } from '../../../store/useEditorStore';
import { Square, Grid, Droplets, ArrowLeftRight, Minus, Square as SquareOutline } from 'lucide-react';
import { StyleToggle } from './StyleToggle';
import { CounterStyleControls } from './CounterStyleControls';
import { StrokeWidthControl } from './StrokeWidthControl';
import { OpacityControl } from './OpacityControl';
import { ColorPalettePicker } from './ColorPalettePicker';
import { ClearToolButton } from './ClearToolButton';
import { ICON, STYLE_BAR, STYLE_GAP, CHROME } from './toolbarUi';
import { useShallow } from 'zustand/react/shallow';
import { useShapeStyleSync } from './hooks/useShapeStyleSync';
import { handleStrokeWidthUpdate } from './hooks/useStrokeWidthUpdater';
import { useTranslation } from '../../../lib/i18n';

export function StyleToolbar() {
  useShapeStyleSync();
  const { t } = useTranslation();
  const { 
    activeTool, selectedShapeIds, shapes, updateShape, saveHistory,
    blurType, setBlurType,
    counterStyle, setCounterStyle,
    continueCounter, setContinueCounter,
    isTwoWay, setIsTwoWay,
    isLine, setIsLine,
    isSolid, setIsSolid,
    selectedColor, setSelectedColor,
    strokeWidth, setStrokeWidth,
    opacity, setOpacity
  } = useEditorStore(useShallow(state => ({
    activeTool: state.activeTool,
    selectedShapeIds: state.selectedShapeIds,
    shapes: state.shapes,
    updateShape: state.updateShape,
    saveHistory: state.saveHistory,
    blurType: state.blurType,
    setBlurType: state.setBlurType,
    counterStyle: state.counterStyle,
    setCounterStyle: state.setCounterStyle,
    continueCounter: state.continueCounter,
    setContinueCounter: state.setContinueCounter,
    isTwoWay: state.isTwoWay,
    setIsTwoWay: state.setIsTwoWay,
    isLine: state.isLine,
    setIsLine: state.setIsLine,
    isSolid: state.isSolid,
    setIsSolid: state.setIsSolid,
    selectedColor: state.selectedColor,
    setSelectedColor: state.setSelectedColor,
    strokeWidth: state.strokeWidth,
    setStrokeWidth: state.setStrokeWidth,
    opacity: state.opacity,
    setOpacity: state.setOpacity
  })));

  const allowedTools = ['arrow', 'measure', 'rect', 'circle', 'triangle', 'text', 'brush', 'highlight', 'highlight-area', 'blur', 'callout', 'magnifier', 'counter'];
  if (!allowedTools.includes(activeTool) && selectedShapeIds.length === 0) {
    return null;
  }

  const selection = shapes.filter(s => selectedShapeIds.includes(s.id));
  const selectedTypes = new Set(selection.map(s => s.type));

  if (selectedTypes.size > 1 || selectedTypes.has('sticker')) {
    return null;
  }

  const applyToSelection = (props: any) => {
    if (selectedShapeIds.length === 0) return;
    selectedShapeIds.forEach(id => updateShape(id, props));
    saveHistory();
  };

  const persistOpts = { persistToTool: true as const };
  const appliesTo = (...types: string[]) =>
    types.includes(activeTool) || selection.some(s => types.includes(s.type));

  const isBlur = appliesTo('blur');
  const isSolidRedact = (activeTool === 'blur' && blurType === 'solid') || selection.some(s => s.type === 'blur' && s.blurType === 'solid');

  const borderStrokeOnly =
    (selection.length === 0 && (activeTool === 'magnifier' || activeTool === 'image')) ||
    (selection.length > 0 && selection.every((s) => s.type === 'magnifier' || s.type === 'image'));

  const effectiveIsSolid = selection.length > 0
    ? selection.every((s) => Boolean(s.isSolid))
    : isSolid;
  const borderStrokeBorderless = borderStrokeOnly && effectiveIsSolid;
  const isHighlightArea = appliesTo('highlight-area');
  const showColorPicker = (!isBlur || blurType === 'solid') && (!isHighlightArea || effectiveIsSolid);
  const showStrokeWidth = !isSolidRedact && !isHighlightArea;
  const borderStyleLocked = borderStrokeBorderless;

  return (
    <div className={`${CHROME} ${STYLE_BAR} flex flex-wrap ${STYLE_GAP} mt-1 items-center min-h-11 w-fit max-w-full pointer-events-auto`}>
      {isBlur && (
        <>
          <StyleToggle label={t('toolbar.styles.solidRedact')} active={blurType === 'solid'} onClick={() => { setBlurType('solid', persistOpts); applyToSelection({ blurType: 'solid' }); }}>
            <Square size={ICON} />
          </StyleToggle>
          <StyleToggle label={t('toolbar.styles.pixelate')} active={blurType === 'pixelate'} onClick={() => { setBlurType('pixelate', persistOpts); applyToSelection({ blurType: 'pixelate' }); }}>
            <Grid size={ICON} />
          </StyleToggle>
          <StyleToggle label={t('toolbar.styles.blur')} active={blurType === 'blur'} onClick={() => { setBlurType('blur', persistOpts); applyToSelection({ blurType: 'blur' }); }}>
            <Droplets size={ICON} />
          </StyleToggle>
          <div className="h-4 w-px shrink-0 bg-border/40" />
        </>
      )}
      
      {appliesTo('counter') && (
        <CounterStyleControls
          counterStyle={counterStyle}
          setCounterStyle={setCounterStyle}
          continueCounter={continueCounter}
          setContinueCounter={setContinueCounter}
          applyToSelection={applyToSelection}
          persistOpts={persistOpts}
        />
      )}
      
      {appliesTo('arrow') && (
        <>
          <StyleToggle
            label={t('toolbar.styles.dashedLine')}
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
            label={t('toolbar.styles.twoWayArrow')}
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
            label={t('toolbar.styles.borderOnly')}
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
            label={t('toolbar.styles.solidFill')}
            active={isSolid}
            onClick={() => { setIsSolid(!isSolid, persistOpts); applyToSelection({ isSolid: !isSolid }); }}
          >
            {isSolid ? <Square size={ICON} fill="currentColor" /> : <SquareOutline size={ICON} />}
          </StyleToggle>
          <div className="h-4 w-px shrink-0 bg-border/40" />
        </>
      )}

      {appliesTo('highlight-area') && (
        <>
          <StyleToggle
            label={t('toolbar.styles.dimBackground')}
            active={!isSolid}
            onClick={() => { setIsSolid(!isSolid, persistOpts); applyToSelection({ isSolid: !isSolid }); }}
          >
            {!isSolid ? <Square size={ICON} fill="currentColor" /> : <SquareOutline size={ICON} />}
          </StyleToggle>
          {!isSolid && (
            <>
              <div className="h-4 w-px shrink-0 bg-border/40" />
              <OpacityControl
                value={opacity ?? 0.2}
                onChange={(newOpacity) => {
                  setOpacity(newOpacity, persistOpts);
                  applyToSelection({ opacity: newOpacity });
                }}
              />
            </>
          )}
          <div className="h-4 w-px shrink-0 bg-border/40" />
        </>
      )}

      {showColorPicker && (
        <ColorPalettePicker
          selectedColor={selectedColor}
          onColorChange={(c) => {
            setSelectedColor(c, persistOpts);
            applyToSelection({ color: c });
          }}
          disabled={borderStyleLocked}
        />
      )}

      {showStrokeWidth && (
        <>
          {showColorPicker && <div className="h-4 w-px shrink-0 bg-border/40" />}
          <div
            className={borderStyleLocked ? 'pointer-events-none opacity-40' : undefined}
            aria-disabled={borderStyleLocked || undefined}
            title={borderStyleLocked ? t('border.enableToChangeSize') : undefined}
          >
            <StrokeWidthControl
              value={strokeWidth}
              onChange={(newWidth) => {
                if (borderStyleLocked) return;
                handleStrokeWidthUpdate(
                  newWidth,
                  appliesTo('text'),
                  selectedShapeIds,
                  shapes,
                  setStrokeWidth,
                  updateShape,
                  saveHistory,
                  applyToSelection
                );
              }}
            />
          </div>
        </>
      )}

      <ClearToolButton activeTool={activeTool} selectedTypes={selectedTypes} />
    </div>
  );
}
