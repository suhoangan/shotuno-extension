/**
 * Typed in-editor IPC — prefer this over document CustomEvents so features
 * can subscribe without silent miss if the listener is not mounted.
 *
 * CRX note: keep handlers registered while EditorShell is mounted; do not
 * dynamic-import this module from the background SW.
 */

type Handler = (detail?: unknown) => void;

const listeners = new Map<string, Set<Handler>>();

function on(event: string, handler: Handler): () => void {
  let set = listeners.get(event);
  if (!set) {
    set = new Set();
    listeners.set(event, set);
  }
  set.add(handler);
  return () => {
    set!.delete(handler);
  };
}

function emit(event: string, detail?: unknown): void {
  const set = listeners.get(event);
  if (!set) return;
  for (const handler of set) handler(detail);
}

export const editorActions = {
  onAddSticker: (handler: (emoji: string) => void) =>
    on('add-sticker', (d) => handler(d as string)),
  emitAddSticker: (emoji: string) => emit('add-sticker', emoji),

  onSmartBlur: (handler: () => void) => on('smart-blur', () => handler()),
  emitSmartBlur: () => emit('smart-blur'),

  onOpenResize: (handler: () => void) => on('open-resize', () => handler()),
  emitOpenResize: () => emit('open-resize'),

  onExportCanvas: (
    handler: (detail: {
      type: string;
      filename?: string;
      prompt?: string;
      aiProvider?: string;
    }) => void,
  ) =>
    on('export-canvas', (d) =>
      handler(d as { type: string; filename?: string; prompt?: string; aiProvider?: string }),
    ),
  emitExportCanvas: (detail: {
    type: string;
    filename?: string;
    prompt?: string;
    aiProvider?: string;
  }) => emit('export-canvas', detail),
};
