import { useEffect, useLayoutEffect, useRef } from 'react';
import { Html } from 'react-konva-utils';
import { useEditorStore } from '../../../store/useEditorStore';
import {
  TEXT_LINE_HEIGHT,
  TEXT_MAX_WIDTH,
  TEXT_PADDING,
  textMinHeight,
  textMinWidth,
} from '../../../store/editorDefaults';
import { measureTextareaSize } from './textLayout';
import { calloutTextFill } from './calloutTailLayout';
import {
  commitTextEdit,
  consumeTextBlurCommitSuppression,
  suppressNextTextBlurCommit,
} from './commitTextEdit';

interface InlineTextEditorProps {
  editingText: any;
  setEditingText: (text: any | null) => void;
}

export const InlineTextEditor = ({ editingText, setEditingText }: InlineTextEditorProps) => {
  const updateShape = useEditorStore((s) => s.updateShape);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editingTextRef = useRef(editingText);
  editingTextRef.current = editingText;

  useEffect(() => {
    if (!editingText || !textareaRef.current) return;

    let cancelled = false;
    const timers: number[] = [];
    const focusTextarea = () => {
      if (cancelled || !textareaRef.current) return;
      textareaRef.current.focus({ preventScroll: true });
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      );
    };
    timers.push(window.setTimeout(focusTextarea, 10));
    timers.push(window.setTimeout(focusTextarea, 50));
    timers.push(window.setTimeout(focusTextarea, 150));

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
    };
    // Re-focus only when switching to a different text shape, not on every keystroke.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [editingText?.id]);

  useEffect(() => {
    if (!editingText || !textareaRef.current) return;
    const { width, height } = measureTextareaSize(
      textareaRef.current,
      editingText.text,
      editingText.fontSize,
      editingText.maxWidth || TEXT_MAX_WIDTH,
    );
    if (width !== editingText.width || height !== editingText.height) {
      const updates = { width, height };
      setEditingText({ ...editingText, ...updates });
      updateShape(editingText.id, updates);
    }
    // Size once when opening the editor for this shape.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [editingText?.id]);

  // Backup: end editing before paint if tool changed without the toolbar event.
  const activeTool = useEditorStore((s) => s.activeTool);
  useLayoutEffect(() => {
    const current = editingTextRef.current;
    if (!current) return;
    if (activeTool === 'text') return;
    commitTextEdit(current);
    suppressNextTextBlurCommit();
    setEditingText(null);
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTool]);

  if (!editingText) return null;

  const syncSize = (target: HTMLTextAreaElement, text: string) => {
    const maxAllowedWidth = editingText.maxWidth || TEXT_MAX_WIDTH;
    const { width, height } = measureTextareaSize(target, text, editingText.fontSize, maxAllowedWidth);
    const updates = { text, width, height };
    setEditingText({ ...editingText, ...updates });
    updateShape(editingText.id, updates);
  };

  return (
    <Html
      groupProps={{ x: editingText.x, y: editingText.y, rotation: editingText.rotation }}
      // Container must not capture hits — only the textarea should.
      divProps={{ style: { opacity: 1, zIndex: 10, pointerEvents: 'none' } }}
    >
      <textarea
        ref={textareaRef}
        autoFocus
        value={editingText.text}
        onChange={e => syncSize(e.target, e.target.value)}
        onMouseUp={(e) => {
          e.stopPropagation();
          const target = e.target as HTMLTextAreaElement;
          const minH = textMinHeight(editingText.fontSize);
          const width = Math.max(textMinWidth(editingText.fontSize), target.offsetWidth);
          const height = Math.max(minH, target.offsetHeight);
          target.style.width = `${width}px`;
          target.style.height = `${height}px`;
          const updates = {
            width,
            height,
            maxWidth: Math.max(editingText.maxWidth || TEXT_MAX_WIDTH, width),
          };
          setEditingText({ ...editingText, ...updates });
          updateShape(editingText.id, { width, height });
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onBlur={() => {
          if (consumeTextBlurCommitSuppression()) return;
          // Tool-switch effect may already have committed and cleared editing.
          if (!editingTextRef.current || editingTextRef.current.id !== editingText.id) return;
          commitTextEdit(editingText);
          setEditingText(null);
        }}
        style={{
          width: editingText.width,
          height: editingText.height,
          minWidth: textMinWidth(editingText.fontSize),
          minHeight: textMinHeight(editingText.fontSize),
          fontSize: `${editingText.fontSize}px`,
          fontWeight: 600,
          color: editingText.isSolid ? calloutTextFill(editingText.color) : editingText.color,
          background: editingText.isSolid ? editingText.color : 'transparent',
          border: 'none',
          outline: editingText.isSolid ? 'none' : '2px dashed #3b82f6',
          borderRadius: editingText.isSolid ? '8px' : undefined,
          boxShadow: editingText.isSolid ? '0 4px 10px rgba(0,0,0,0.2)' : undefined,
          outlineOffset: '0px',
          resize: 'both',
          overflow: 'hidden',
          boxSizing: 'border-box',
          padding: `${TEXT_PADDING}px`,
          margin: 0,
          lineHeight: TEXT_LINE_HEIGHT,
          fontFamily: 'sans-serif',
          whiteSpace: 'pre-wrap',
          pointerEvents: 'auto',
        }}
      />
    </Html>
  );
};
