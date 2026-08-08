import { useEffect } from 'react';
import { useEditorStore } from '../../../../store/useEditorStore';
import { STICKER_SIZE } from '../../../../store/editorDefaults';
import { editorActions } from '../../../editorActions';
import { toImageAnnotationSize } from '../annotationSize';
import { useProGate } from '../../hooks/useProGate';

/** Listen for toolbar add-sticker actions and spawn a sticker in view. */
export function useStickerSpawn(
  containerRef: React.RefObject<HTMLDivElement | null>,
  stageRef: React.RefObject<{ x: () => number; y: () => number; container: () => HTMLElement } | null>,
  scale: number,
  bounds: { x: number; y: number; width: number; height: number },
) {
  const { runPro } = useProGate();

  useEffect(() => {
    return editorActions.onAddSticker((emoji) => {
      void runPro('stickers', () => {
        const state = useEditorStore.getState();
        const size = toImageAnnotationSize(STICKER_SIZE);

      let spawnX = bounds.x + bounds.width / 2 - size / 2;
      let spawnY = bounds.y + bounds.height / 2 - size / 2;

      if (containerRef.current && stageRef.current) {
        const containerBox = containerRef.current.getBoundingClientRect();
        const stageBox = stageRef.current.container().getBoundingClientRect();
        const centerX = containerBox.left + containerBox.width / 2;
        const centerY = containerBox.top + containerBox.height / 2;
        const stageX = stageRef.current.x() || 0;
        const stageY = stageRef.current.y() || 0;
        spawnX = (centerX - stageBox.left - stageX) / scale + bounds.x - size / 2;
        spawnY = (centerY - stageBox.top - stageY) / scale + bounds.y - size / 2;
      }

      if (isNaN(spawnX)) spawnX = bounds.x + bounds.width / 2 - size / 2;
      if (isNaN(spawnY)) spawnY = bounds.y + bounds.height / 2 - size / 2;

      spawnX = Math.max(bounds.x, Math.min(spawnX, bounds.x + bounds.width - size));
      spawnY = Math.max(bounds.y, Math.min(spawnY, bounds.y + bounds.height - size));

      const id = Date.now().toString();
      state.addShape({
        id,
        type: 'sticker',
        x: spawnX,
        y: spawnY,
        width: size,
        height: size,
        emoji,
      });
      state.setSelectedShapeIds([id]);
      state.saveHistory();
      });
    });
  }, [bounds, scale, containerRef, stageRef, runPro]);
}
