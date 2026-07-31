import { useEffect } from 'react';
import { toast } from 'sonner';
import { useEditorStore } from '../../../../store/useEditorStore';
import { STICKER_SIZE, imageShapeStyleFromTool } from '../../../../store/editorDefaults';
import { toImageAnnotationSize } from '../annotationSize';
import {
  SHOTUNO_DRAG_MIME,
  fetchLibraryDataUrl,
  parseShotunoDragIds,
} from '../../../../lib/shotunoDrag';
import { limitImageResolution } from '../../../../lib/limitImageResolution';

export function useCanvasDrop(stageRef: React.RefObject<any>, scale: number, bounds: { x: number; y: number; width: number; height: number }) {
  const { addShape } = useEditorStore();

  useEffect(() => {
    const handleNativeDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleNativeDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const emojiData = e.dataTransfer?.getData('text/emoji');
      const custom = e.dataTransfer?.getData(SHOTUNO_DRAG_MIME);
      const plain = e.dataTransfer?.getData('text/plain');
      const uriList = e.dataTransfer?.getData('text/uri-list');
      const htmlData = e.dataTransfer?.getData('text/html');
      const library = parseShotunoDragIds(custom) || parseShotunoDragIds(plain);

      if (!stageRef.current) return;
      const stageBox = stageRef.current.container().getBoundingClientRect();
      const stageX = stageRef.current.x();
      const stageY = stageRef.current.y();

      const clientX = Math.min(Math.max(e.clientX, stageBox.left), stageBox.right);
      const clientY = Math.min(Math.max(e.clientY, stageBox.top), stageBox.bottom);
      const relativePos = {
        x: (clientX - stageBox.left - stageX) / scale + bounds.x,
        y: (clientY - stageBox.top - stageY) / scale + bounds.y,
      };

      const clampToBounds = (x: number, y: number, width: number, height: number) => ({
        x: Math.max(bounds.x, Math.min(x, bounds.x + bounds.width - width)),
        y: Math.max(bounds.y, Math.min(y, bounds.y + bounds.height - height)),
      });

      if (emojiData) {
        const size = toImageAnnotationSize(STICKER_SIZE);
        const pos = clampToBounds(relativePos.x - size / 2, relativePos.y - size / 2, size, size);
        addShape({
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          type: 'sticker',
          x: pos.x,
          y: pos.y,
          width: size,
          height: size,
          emoji: emojiData,
        });
        useEditorStore.getState().saveHistory();
        return;
      }

      const processImage = async (srcUrl: string, offsetX = 0, offsetY = 0) => {
        try {
          // Drawn a few hundred pixels wide, so there is no point keeping a 4K source alive
          // in the store and in every undo snapshot that references this shape.
          const sized = await limitImageResolution(srcUrl, {
            crossOrigin: srcUrl.startsWith('http') ? 'Anonymous' : undefined,
          });

          let finalWidth = sized.width;
          let finalHeight = sized.height;

          const maxSize = Math.min(500, Math.max(bounds.width, bounds.height) * 0.5);

          if (finalWidth > maxSize || finalHeight > maxSize) {
            const ratio = Math.min(maxSize / finalWidth, maxSize / finalHeight);
            finalWidth = finalWidth * ratio;
            finalHeight = finalHeight * ratio;
          }

          const pos = clampToBounds(
            relativePos.x - finalWidth / 2 + offsetX,
            relativePos.y - finalHeight / 2 + offsetY,
            finalWidth,
            finalHeight,
          );

          const style = imageShapeStyleFromTool(useEditorStore.getState().toolSettings);
          addShape({
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            type: 'image',
            x: pos.x,
            y: pos.y,
            width: finalWidth,
            height: finalHeight,
            src: sized.dataUrl,
            color: style.color,
            strokeWidth: toImageAnnotationSize(style.strokeWidth),
            isSolid: style.isSolid,
          });
          useEditorStore.getState().saveHistory();
        } catch {
          toast.error('Failed to load dropped image');
        }
      };

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        let added = 0;
        Array.from(files).forEach((file, index) => {
          if (file.type.startsWith('image/')) {
            added += 1;
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                void processImage(event.target.result as string, index * 30, index * 30);
              }
            };
            reader.readAsDataURL(file);
          }
        });
        if (added) return;
      }

      if (library) {
        void Promise.all(
          library.ids.map(async (id, index) => {
            const dataUrl = await fetchLibraryDataUrl(library.kind, id);
            if (dataUrl) {
              await processImage(dataUrl, index * 30, index * 30);
              return;
            }
            const other = library.kind === 'pin' ? 'gallery' : 'pin';
            const fallback = await fetchLibraryDataUrl(other, id);
            if (fallback) await processImage(fallback, index * 30, index * 30);
            else toast.error(`Failed to load image ${id}`);
          }),
        );
        return;
      }

      let url = uriList || (plain?.startsWith('http') || plain?.startsWith('data:') ? plain : '');
      if (!url && htmlData) {
        const match = htmlData.match(/src="([^"]+)"/);
        if (match) url = match[1];
      }

      if (url) {
        void processImage(url);
      } else {
        toast.error('Drop failed: No image data found');
      }
    };

    const targets: EventTarget[] = [document];
    const host = document.getElementById('shotuno-root');
    if (host) targets.push(host);
    const app = host?.shadowRoot?.getElementById('shotuno-app-container');
    if (app) targets.push(app);

    for (const t of targets) {
      t.addEventListener('dragover', handleNativeDragOver as EventListener, { capture: true });
      t.addEventListener('dragenter', handleNativeDragOver as EventListener, { capture: true });
      t.addEventListener('drop', handleNativeDrop as EventListener, { capture: true });
    }

    return () => {
      for (const t of targets) {
        t.removeEventListener('dragover', handleNativeDragOver as EventListener, { capture: true });
        t.removeEventListener('dragenter', handleNativeDragOver as EventListener, { capture: true });
        t.removeEventListener('drop', handleNativeDrop as EventListener, { capture: true });
      }
    };
  }, [scale, bounds.x, bounds.y, bounds.width, bounds.height, addShape, stageRef]);
}
