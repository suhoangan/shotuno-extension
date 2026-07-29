import { useEditorStore } from '../../../store/useEditorStore';
import { TEXT_MAX_WIDTH } from '../../../store/editorDefaults';

export type PendingTextEditTimer = { current: number | null };

/** Open inline edit after paint — aborted if the user already left the text tool. */
export function scheduleTextEditEntry(
  pendingTimer: PendingTextEditTimer,
  setEditingText: (text: any) => void,
  payload: {
    id: string;
    x: number;
    y: number;
    fontSize: number;
    color: string;
    width: number;
    height: number;
  },
) {
  if (pendingTimer.current !== null) {
    window.clearTimeout(pendingTimer.current);
  }
  pendingTimer.current = window.setTimeout(() => {
    pendingTimer.current = null;
    if (useEditorStore.getState().activeTool !== 'text') return;
    setEditingText({
      ...payload,
      text: '',
      maxWidth: TEXT_MAX_WIDTH,
      isSolid: true,
      rotation: 0,
    });
  }, 0);
}

export function cancelPendingTextEdit(pendingTimer: PendingTextEditTimer) {
  if (pendingTimer.current === null) return;
  window.clearTimeout(pendingTimer.current);
  pendingTimer.current = null;
}
