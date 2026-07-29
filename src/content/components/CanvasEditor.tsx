import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { TEXT_MAX_WIDTH, textDefaultHeight, textDefaultWidth } from '../../store/editorDefaults';
import type { TextShape } from '../../store/editorTypes';
import { useCanvasExport } from './canvas/hooks/useCanvasExport';
import { useCanvasEvents } from './canvas/hooks/useCanvasEvents';
import { useCanvasDrawing } from './canvas/hooks/useCanvasDrawing';
import { usePixelEdgeDetection } from './canvas/hooks/usePixelEdgeDetection';
import { useStickerSpawn } from './canvas/hooks/useStickerSpawn';
import { RightSidebar } from './RightSidebar';
import { CropOverlay } from './CropOverlay';
import { useCanvasDrop } from './canvas/hooks/useCanvasDrop';
import { useCanvasBounds } from './canvas/hooks/useCanvasBounds';
import { useCanvasZoom } from './canvas/hooks/useCanvasZoom';
import { ZoomControls } from './ZoomControls';
import { ResizeModal } from './toolbar/ResizeModal';
import { CanvasStage } from './canvas/CanvasStage';
import { OcrResultDialog } from './OcrResultDialog';
import {
  commitTextEdit,
  END_TEXT_EDIT_EVENT,
  suppressNextTextBlurCommit,
} from './canvas/commitTextEdit';
import { useSmartBlur } from './canvas/hooks/useSmartBlur';
import { useOcrExtract } from './canvas/hooks/useOcrExtract';
import { syncAnnotationSizeFactor } from './canvas/annotationSize';
import { useEditorPrefs } from './canvas/hooks/useEditorPrefs';

interface CanvasEditorProps {
  screenshotUrl: string;
}

export default function CanvasEditor({ screenshotUrl }: CanvasEditorProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const [editingText, setEditingText] = useState<any | null>(null);
  const editingTextRef = useRef<any | null>(null);
  editingTextRef.current = editingText;
  const [isPanning, setIsPanning] = useState(false);
  const [isResizeOpen, setIsResizeOpen] = useState(false);
  const { handleSmartBlur } = useSmartBlur(screenshotUrl);

  useEditorPrefs();

  useEffect(() => {
    const handleOpenResize = () => setIsResizeOpen(true);
    const handleSmartBlurEvent = () => handleSmartBlur();
    
    document.addEventListener('open-resize', handleOpenResize);
    document.addEventListener('trigger-smart-blur', handleSmartBlurEvent);
    
    return () => {
      document.removeEventListener('open-resize', handleOpenResize);
      document.removeEventListener('trigger-smart-blur', handleSmartBlurEvent);
    };
  }, [handleSmartBlur]);

  useLayoutEffect(() => {
    const endEdit = () => {
      const current = editingTextRef.current;
      if (!current) return;
      commitTextEdit(current);
      suppressNextTextBlurCommit();
      setEditingText(null);
    };
    document.addEventListener(END_TEXT_EDIT_EVENT, endEdit);
    return () => document.removeEventListener(END_TEXT_EDIT_EVENT, endEdit);
  }, []);

  const store = useEditorStore();
  const bounds = useCanvasBounds(image);

  useEffect(() => {
    syncAnnotationSizeFactor(bounds.content.width, bounds.content.height);
  }, [bounds.content.width, bounds.content.height]);

  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.onload = () => {
      if (!cancelled) setImage(img);
    };
    img.onerror = () => {
      if (!cancelled) setImage(null);
    };
    img.src = screenshotUrl;
    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
      img.src = '';
    };
  }, [screenshotUrl]);

  const { scale, setScale, fitScale } = useCanvasZoom(
    containerRef as React.RefObject<HTMLDivElement>,
    image,
    bounds,
  );

  useCanvasExport(stageRef);
  useCanvasEvents({ bounds, editingText });
  useCanvasDrop(stageRef, scale, bounds);
  useStickerSpawn(containerRef, stageRef, scale, bounds);

  const { findEdges } = usePixelEdgeDetection(image, bounds);
  const { selectionBox, isDrawing, handleMouseDown, handleMouseMove, handleMouseUp } =
    useCanvasDrawing({ stageRef, scale, bounds, editingText, setEditingText, findEdges });
  const { isOcrOpen, setIsOcrOpen, ocrText, isOcrLoading } = useOcrExtract(image, isDrawing);

  const handleTextDblClick = (_e: unknown, shape: TextShape) => {
    setEditingText({
      id: shape.id,
      x: shape.x,
      y: shape.y,
      text: shape.text,
      width: shape.width || textDefaultWidth(shape.fontSize),
      maxWidth: Math.max(TEXT_MAX_WIDTH, shape.width || 0),
      height: shape.height || textDefaultHeight(shape.fontSize),
      fontSize: shape.fontSize,
      color: shape.color,
      isSolid: shape.isSolid ?? true,
      rotation: shape.rotation || 0,
    });
    store.setSelectedShapeIds([]);
  };

  const frameW = bounds.width * scale;
  const frameH = bounds.height * scale;

  return (
    <div className="w-full h-full relative overflow-hidden flex">
      <div className="flex-1 h-full relative flex flex-col min-w-0">
        <div
          ref={containerRef}
          className={`flex-1 overflow-auto p-12 custom-scrollbar relative ${
            store.activeTool === 'pan'
              ? isPanning
                ? 'cursor-grabbing'
                : 'cursor-grab'
              : store.activeTool === 'select'
                ? 'cursor-default'
                : 'cursor-crosshair'
          }`}
          onMouseDown={() => store.activeTool === 'pan' && setIsPanning(true)}
          onMouseMove={(e) => {
            if (store.activeTool === 'pan' && isPanning && containerRef.current) {
              containerRef.current.scrollBy(-e.movementX, -e.movementY);
            }
          }}
          onMouseUp={() => setIsPanning(false)}
          onMouseLeave={() => setIsPanning(false)}
        >
          <div className="min-w-full min-h-full flex p-4 w-max h-max">
            <div
              className={`relative m-auto shadow-2xl rounded-lg ${
                store.activeTool === 'crop' ? 'overflow-visible' : 'overflow-hidden'
              }`}
              style={{ width: frameW, height: frameH, minWidth: frameW, minHeight: frameH }}
              onMouseMove={(e) => {
                if (isDrawing || selectionBox.visible || store.activeTool === 'measure') {
                  handleMouseMove(e.nativeEvent);
                }
              }}
              onMouseUp={() => {
                if (isDrawing || selectionBox.visible || store.activeTool === 'measure') {
                  handleMouseUp();
                }
              }}
              onMouseLeave={() => {
                // OCR keeps the gesture alive via document listeners in useCanvasDrawing;
                // treating leave as mouseup was auto-firing extract text.
                if (store.activeTool === 'ocr') return;
                if (isDrawing || selectionBox.visible || store.activeTool === 'measure') {
                  handleMouseUp();
                }
              }}
            >
              {image && (
                <div
                  className="absolute inset-0 border border-border/50"
                  style={{
                    width: bounds.width * scale,
                    height: bounds.height * scale,
                  }}
                >
                  <CanvasStage
                    stageRef={stageRef}
                    image={image}
                    bounds={bounds}
                    scale={scale}
                    shapes={store.shapes}
                    selectedShapeIds={store.selectedShapeIds}
                    selectedColor={store.selectedColor}
                    strokeWidth={store.strokeWidth}
                    smartMeasureBounds={store.smartMeasureBounds}
                    borderEnabled={store.borderEnabled}
                    borderStyle={store.borderStyle}
                    borderPadding={store.borderPadding}
                    borderPaddingSize={store.borderPaddingSize}
                    borderPaddingPreset={store.borderPaddingPreset}
                    includeUrl={store.includeUrl}
                    includeDate={store.includeDate}
                    urlPosition={store.urlPosition}
                    watermarkEnabled={store.watermarkEnabled}
                    watermarkText={store.watermarkText}
                    watermarkMode={store.watermarkMode}
                    watermarkImageUrl={store.watermarkImageUrl}
                    selectionBox={selectionBox}
                    editingText={editingText}
                    setEditingText={setEditingText}
                    isPanning={isPanning}
                    activeTool={store.activeTool}
                    handleMouseDown={handleMouseDown}
                    handleMouseMove={handleMouseMove}
                    handleMouseUp={handleMouseUp}
                    onTextDblClick={handleTextDblClick}
                  />
                </div>
              )}
              {store.activeTool === 'crop' && bounds && <CropOverlay bounds={bounds} scale={scale} />}
              {store.ocrRect && (
                <div
                  className="absolute border-2 border-primary bg-primary/20 pointer-events-none z-50"
                  style={{
                    left: `${(store.ocrRect.x - bounds.x) * scale}px`,
                    top: `${(store.ocrRect.y - bounds.y) * scale}px`,
                    width: `${store.ocrRect.width * scale}px`,
                    height: `${store.ocrRect.height * scale}px`,
                  }}
                />
              )}
            </div>
          </div>
        </div>
        <ZoomControls scale={scale} setScale={setScale} fitScale={fitScale} />
      </div>

      <RightSidebar />
      <ResizeModal
        isOpen={isResizeOpen}
        onClose={() => setIsResizeOpen(false)}
        image={image}
        setImage={setImage}
      />
      <OcrResultDialog open={isOcrOpen} onOpenChange={setIsOcrOpen} text={ocrText} loading={isOcrLoading} />
    </div>
  );
}
