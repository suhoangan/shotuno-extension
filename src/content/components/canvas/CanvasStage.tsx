import { Stage, Layer, Image as KonvaImage, Rect, Group } from 'react-konva';
import type { Shape, TextShape, ToolType } from '../../../store/editorTypes';
import type { BorderPaddingPresetId, WatermarkMode } from '../../../store/editorDefaults';
import {
  WATERMARK_IMAGE_MAX_WIDTH,
  WATERMARK_OPACITY,
  WATERMARK_PAD,
} from '../../../store/editorDefaults';
import { cursorForTool, canMoveShapesWith } from './toolInteraction';
import { toImageAnnotationSize } from './annotationSize';
import { ShapeTransformer } from './ShapeTransformer';
import { SelectionBox } from './SelectionBox';
import { InlineTextEditor } from './InlineTextEditor';
import { ShapeRenderer } from './shapes/ShapeRenderer';
import { MeasureShape } from './shapes/MeasureShape';
import { BorderOverlay } from './BorderOverlay';
import { pickSmartMeasureAxis } from './measureTool';
import type { StageBounds } from './stageBounds';
import { useHtmlImage } from './useHtmlImage';
import { TiledTextWatermark } from './TiledTextWatermark';

interface CanvasStageProps {
  stageRef: React.RefObject<any>;
  image: HTMLImageElement;
  bounds: StageBounds;
  scale: number;
  shapes: Shape[];
  selectedShapeIds: string[];
  selectedColor: string;
  strokeWidth: number;
  smartMeasureBounds: any;
  borderEnabled: boolean;
  borderStyle: 'macos' | 'windows' | 'none';
  borderPadding: boolean;
  borderPaddingSize: number;
  borderPaddingPreset: BorderPaddingPresetId;
  includeUrl: boolean;
  includeDate: boolean;
  urlPosition: 'top' | 'bottom';
  watermarkEnabled: boolean;
  watermarkText: string;
  watermarkMode: WatermarkMode;
  watermarkImageUrl: string | null;
  selectionBox: any;
  editingText: any;
  setEditingText: (v: any) => void;
  isPanning: boolean;
  activeTool: string;
  handleMouseDown: (e: any) => void;
  handleMouseMove: (e: any) => void;
  handleMouseUp: () => void;
  onTextDblClick: (e: any, shape: TextShape) => void;
}

export function CanvasStage(props: CanvasStageProps) {
  const {
    stageRef, image, bounds, scale, shapes, selectedShapeIds, selectedColor, strokeWidth,
    smartMeasureBounds, borderEnabled, borderStyle, borderPadding, borderPaddingSize, borderPaddingPreset, includeUrl, includeDate,
    urlPosition, watermarkEnabled, watermarkText, watermarkMode, watermarkImageUrl, selectionBox, editingText, setEditingText,
    isPanning, activeTool, handleMouseDown, handleMouseMove, handleMouseUp, onTextDblClick,
  } = props;

  const watermarkImg = useHtmlImage(
    watermarkEnabled && watermarkMode === 'image' ? watermarkImageUrl : null,
  );
  const wmW = watermarkImg ? Math.min(WATERMARK_IMAGE_MAX_WIDTH, watermarkImg.width) : 0;
  const wmH = watermarkImg && watermarkImg.width
    ? (watermarkImg.height / watermarkImg.width) * wmW
    : 0;

  return (
    <Stage
      ref={stageRef}
      width={bounds.width * scale}
      height={bounds.height * scale}
      scaleX={scale}
      scaleY={scale}
      offsetX={bounds.x}
      offsetY={bounds.y}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      className="shadow-2xl bg-black/10"
      style={{ cursor: isPanning ? 'grab' : cursorForTool(activeTool as ToolType) }}
    >
      <Layer>
        <Rect x={bounds.x} y={bounds.y} width={bounds.width} height={bounds.height} fill="transparent" listening={false} />
        {borderEnabled && (
          <BorderOverlay
            width={bounds.width}
            height={bounds.height}
            x={bounds.x}
            y={bounds.y}
            style={borderStyle}
            hasPadding={borderPadding}
            paddingSize={borderPaddingSize}
            paddingPreset={borderPaddingPreset}
            includeUrl={includeUrl}
            includeDate={includeDate}
            urlPosition={urlPosition}
          />
        )}
        <KonvaImage
          image={image}
          name="bg-image"
          listening={false}
          x={bounds.content.x}
          y={bounds.content.y}
          width={bounds.content.width}
          height={bounds.content.height}
          crop={{
            x: bounds.content.x,
            y: bounds.content.y,
            width: bounds.content.width,
            height: bounds.content.height,
          }}
        />
      </Layer>

      <Layer>
        {smartMeasureBounds && (
          <Group>
            {pickSmartMeasureAxis({ x: smartMeasureBounds.centerX, y: smartMeasureBounds.centerY }, smartMeasureBounds) === 'height' && (
              <MeasureShape
                shape={{
                  id: 'tmpV',
                  type: 'measure',
                  points: [smartMeasureBounds.centerX, smartMeasureBounds.top, smartMeasureBounds.centerX, smartMeasureBounds.bottom],
                  color: selectedColor,
                  strokeWidth: toImageAnnotationSize(strokeWidth),
                }}
                commonProps={{ listening: false }}
              />
            )}
            {pickSmartMeasureAxis({ x: smartMeasureBounds.centerX, y: smartMeasureBounds.centerY }, smartMeasureBounds) === 'width' && (
              <MeasureShape
                shape={{
                  id: 'tmpH',
                  type: 'measure',
                  points: [smartMeasureBounds.left, smartMeasureBounds.centerY, smartMeasureBounds.right, smartMeasureBounds.centerY],
                  color: selectedColor,
                  strokeWidth: toImageAnnotationSize(strokeWidth),
                }}
                commonProps={{ listening: false }}
              />
            )}
          </Group>
        )}
        {shapes.map((shape) => (
          <ShapeRenderer
            key={shape.id}
            shape={shape}
            stageRef={stageRef}
            editingTextId={editingText?.id || null}
            onTextDblClick={onTextDblClick}
            bgImage={image}
            allShapes={shapes}
            activeTool={activeTool}
            isSelected={selectedShapeIds.includes(shape.id)}
          />
        ))}
      </Layer>

      <Layer listening={false}>
        {watermarkEnabled && watermarkMode === 'text' && watermarkText && (
          <TiledTextWatermark
            text={watermarkText}
            x={bounds.content.x}
            y={bounds.content.y}
            width={bounds.content.width}
            height={bounds.content.height}
          />
        )}
        {watermarkEnabled && watermarkMode === 'image' && watermarkImg && (
          <KonvaImage
            image={watermarkImg}
            listening={false}
            opacity={WATERMARK_OPACITY}
            width={wmW}
            height={wmH}
            x={bounds.content.x + bounds.content.width - wmW - WATERMARK_PAD}
            y={bounds.content.y + bounds.content.height - wmH - WATERMARK_PAD}
          />
        )}
      </Layer>

      <Layer>
        <SelectionBox {...selectionBox} />
        {canMoveShapesWith(activeTool as ToolType) && selectedShapeIds.map((id) => {
          return <ShapeTransformer key={id} shapeId={id} isMulti={selectedShapeIds.length > 1} shapes={shapes} />;
        })}
        <InlineTextEditor editingText={editingText} setEditingText={setEditingText} />
      </Layer>
    </Stage>
  );
}
