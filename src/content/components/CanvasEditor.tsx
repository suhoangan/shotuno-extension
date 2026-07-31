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
import { useCanvasStageProps } from './canvas/hooks/useCanvasStageProps';
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

  const stageProps = useCanvasStageProps();
  const { activeTool } = stageProps;
  const ocrRect = useEditorStore((s) => s.ocrRect);
  const setSelectedShapeIds = useEditorStore((s) => s.setSelectedShapeIds);
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

  const { scale, setScale, fitScale, renderScale } = useCanvasZoom(
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
    setSelectedShapeIds([]);
  };

  const frameW = bounds.width * scale;
  const frameH = bounds.height * scale;

  return (
    <div className="w-full h-full relative overflow-hidden flex">
      <div className="flex-1 h-full relative flex flex-col min-w-0">
        <div
          ref={containerRef}
          className={`flex-1 overflow-auto p-12 custom-scrollbar relative ${
            activeTool === 'pan'
              ? isPanning
                ? 'cursor-grabbing'
                : 'cursor-grab'
              : activeTool === 'select'
                ? 'cursor-default'
                : 'cursor-crosshair'
          }`}
          onMouseDown={() => activeTool === 'pan' && setIsPanning(true)}
          onMouseMove={(e) => {
            if (activeTool === 'pan' && isPanning && containerRef.current) {
              containerRef.current.scrollBy(-e.movementX, -e.movementY);
            }
          }}
          onMouseUp={() => setIsPanning(false)}
          onMouseLeave={() => setIsPanning(false)}
        >
          <div className="min-w-full min-h-full flex p-4 w-max h-max">
            <div
              className={`relative m-auto shadow-2xl rounded-lg ${
                activeTool === 'crop' ? 'overflow-visible' : 'overflow-hidden'
              }`}
              style={{ width: frameW, height: frameH, minWidth: frameW, minHeight: frameH }}
              onMouseMove={(e) => {
                if (isDrawing || selectionBox.visible || activeTool === 'measure') {
                  handleMouseMove(e.nativeEvent);
                }
              }}
              onMouseUp={() => {
                if (isDrawing || selectionBox.visible || activeTool === 'measure') {
                  handleMouseUp();
                }
              }}
              onMouseLeave={() => {
                // OCR keeps the gesture alive via document listeners in useCanvasDrawing;
                // treating leave as mouseup was auto-firing extract text.
                if (activeTool === 'ocr') return;
                if (isDrawing || selectionBox.visible || activeTool === 'measure') {
                  handleMouseUp();
                }
              }}
            >
              {image && (
                <div
                  className="absolute inset-0 border border-border/50"
                  style={{ width: frameW, height: frameH }}
                >
                  {/* The stage rasterises at renderScale; this soaks up the rest of the zoom
                      on the compositor so the canvas bitmaps stay within their pixel budget. */}
                  <div
                    style={{
                      width: bounds.width * renderScale,
                      height: bounds.height * renderScale,
                      transform: `scale(${scale / renderScale})`,
                      transformOrigin: 'top left',
                    }}
                  >
                    <CanvasStage
                      {...stageProps}
                      stageRef={stageRef}
                      image={image}
                      bounds={bounds}
                      renderScale={renderScale}
                      selectionBox={selectionBox}
                      editingText={editingText}
                      setEditingText={setEditingText}
                      isPanning={isPanning}
                      handleMouseDown={handleMouseDown}
                      handleMouseMove={handleMouseMove}
                      handleMouseUp={handleMouseUp}
                      onTextDblClick={handleTextDblClick}
                    />
                  </div>
                </div>
              )}
              {activeTool === 'crop' && bounds && <CropOverlay bounds={bounds} scale={scale} />}
              {ocrRect && (
                <div
                  className="absolute border-2 border-primary bg-primary/20 pointer-events-none z-50"
                  style={{
                    left: `${(ocrRect.x - bounds.x) * scale}px`,
                    top: `${(ocrRect.y - bounds.y) * scale}px`,
                    width: `${ocrRect.width * scale}px`,
                    height: `${ocrRect.height * scale}px`,
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
