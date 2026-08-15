import { ArrowShape } from '../components/canvas/shapes/ArrowShape';
import { MeasureShape } from '../components/canvas/shapes/MeasureShape';
import { RectShape } from '../components/canvas/shapes/RectShape';
import { BlurShape } from '../components/canvas/shapes/BlurShape';
import { BrushShape } from '../components/canvas/shapes/BrushShape';
import { HighlightAreaShape } from '../components/canvas/shapes/HighlightAreaShape';
import { TextShape } from '../components/canvas/shapes/TextShape';
import { StickerShape } from '../components/canvas/shapes/StickerShape';
import { ImageShape } from '../components/canvas/shapes/ImageShape';
import { CounterShape } from '../components/canvas/shapes/CounterShape';
import { ConnectedMagnifier } from './ConnectedMagnifier';
import {
  startArrow, startBoxTool, startCounter, startCrop, startMeasure, startOcr,
  startStrokeTool, startText, moveArrow, moveBox, moveCrop, moveMagnifier,
  moveMeasure, moveOcr, moveStroke,
} from './drawHandlers';
import {
  areBuiltinsRegistered,
  markBuiltinsRegistered,
  registerFeature,
} from './registry';

/** Idempotent — call once before editor draw/render. */
export function ensureBuiltinFeaturesRegistered(): void {
  if (areBuiltinsRegistered()) return;

  registerFeature({
    id: 'arrow', tools: ['arrow'], shapeTypes: ['arrow'],
    startDraw: startArrow, moveDraw: moveArrow,
    renderShape: (p) => <ArrowShape shape={p.shape as any} commonProps={p.commonProps} />,
  });
  registerFeature({
    id: 'measure', tools: ['measure'], shapeTypes: ['measure'],
    startDraw: startMeasure, moveDraw: moveMeasure,
    renderShape: (p) => <MeasureShape shape={p.shape as any} commonProps={p.commonProps} />,
  });
  registerFeature({
    id: 'shapes', tools: ['rect', 'circle', 'triangle'], shapeTypes: ['rect', 'circle', 'triangle'],
    startDraw: startBoxTool, moveDraw: moveBox,
    renderShape: (p) => <RectShape shape={p.shape as any} commonProps={p.commonProps} />,
  });
  registerFeature({
    id: 'blur', tools: ['blur'], shapeTypes: ['blur'],
    startDraw: startBoxTool, moveDraw: moveBox,
    renderShape: (p) => (
      <BlurShape shape={p.shape as any} commonProps={p.commonProps} bgImage={p.bgImage} />
    ),
  });
  registerFeature({
    id: 'magnifier', tools: ['magnifier'], shapeTypes: ['magnifier'],
    startDraw: startBoxTool, moveDraw: moveMagnifier,
    renderShape: (p) => <ConnectedMagnifier {...p} />,
  });
  registerFeature({
    id: 'brush', tools: ['brush'], shapeTypes: ['brush'],
    startDraw: startStrokeTool, moveDraw: moveStroke,
    renderShape: (p) => <BrushShape shape={p.shape as any} commonProps={p.commonProps} />,
  });
  registerFeature({
    id: 'highlight', tools: ['highlight'], shapeTypes: ['highlight'],
    startDraw: startStrokeTool, moveDraw: moveStroke,
    renderShape: (p) => <BrushShape shape={p.shape as any} commonProps={p.commonProps} />,
  });
  registerFeature({
    id: 'highlight-area', tools: ['highlight-area'], shapeTypes: ['highlight-area'],
    startDraw: startBoxTool, moveDraw: moveBox,
    renderShape: (p) => <HighlightAreaShape shape={p.shape as any} commonProps={p.commonProps} />,
  });
  registerFeature({
    id: 'text', tools: ['text'], shapeTypes: ['text'],
    startDraw: startText,
    renderShape: (p) => (
      <TextShape
        shape={p.shape as any}
        commonProps={p.commonProps}
        isEditing={p.editingTextId === p.shape.id}
        onDblClick={p.onTextDblClick as any}
      />
    ),
  });
  registerFeature({
    id: 'stickers', shapeTypes: ['sticker'],
    renderShape: (p) => <StickerShape shape={p.shape as any} commonProps={p.commonProps} />,
  });
  registerFeature({
    id: 'image', shapeTypes: ['image'],
    renderShape: (p) => <ImageShape shape={p.shape as any} commonProps={p.commonProps} />,
  });
  registerFeature({
    id: 'counter', tools: ['counter'], shapeTypes: ['counter'],
    startDraw: startCounter,
    renderShape: (p) => <CounterShape shape={p.shape as any} commonProps={p.commonProps} />,
  });
  registerFeature({
    id: 'crop', tools: ['crop'],
    startDraw: startCrop, moveDraw: moveCrop,
  });
  registerFeature({
    id: 'ocr', tools: ['ocr'],
    startDraw: startOcr, moveDraw: moveOcr,
    load: async () => { await import('../utils/extractText'); },
  });
  registerFeature({
    id: 'smart_blur',
    load: async () => { await import('../utils/smartBlur'); },
  });

  markBuiltinsRegistered();
}
