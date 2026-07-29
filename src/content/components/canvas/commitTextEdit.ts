import { useEditorStore } from '../../../store/useEditorStore';

export interface EditingTextState {
  id: string;
  text: string;
  width?: number;
  height?: number;
}

/** Fired by the toolbar so text edit ends in the same click as the tool change. */
export const END_TEXT_EDIT_EVENT = 'shotuno-end-text-edit';

export function requestEndTextEdit() {
  document.dispatchEvent(new CustomEvent(END_TEXT_EDIT_EVENT));
}

/** Set when mousedown already committed so the following blur is a no-op. */
let suppressBlurCommit = false;

export function suppressNextTextBlurCommit() {
  suppressBlurCommit = true;
}

export function consumeTextBlurCommitSuppression() {
  if (!suppressBlurCommit) return false;
  suppressBlurCommit = false;
  return true;
}

/** Persist or remove the in-progress text shape. Safe to call from blur or mousedown. */
export function commitTextEdit(editingText: EditingTextState | null) {
  if (!editingText) return;

  const { shapes, setShapes, updateShape, saveHistory } = useEditorStore.getState();

  if (editingText.text.trim()) {
    updateShape(editingText.id, {
      text: editingText.text,
      width: editingText.width,
      height: editingText.height,
    });
    saveHistory();
  } else {
    setShapes(shapes.filter((s) => s.id !== editingText.id));
  }
}
