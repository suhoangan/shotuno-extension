/** True when the key event originated in a form field (incl. shadow DOM). */
export function isEditableKeyboardTarget(e: KeyboardEvent): boolean {
  return e.composedPath().some(
    (node) =>
      node instanceof HTMLInputElement ||
      node instanceof HTMLTextAreaElement ||
      node instanceof HTMLSelectElement ||
      (node instanceof HTMLElement && node.isContentEditable),
  );
}
