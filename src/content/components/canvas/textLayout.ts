import {
  TEXT_MAX_WIDTH,
  TEXT_PADDING,
  textHeightForLines,
  textMinHeight,
  textMinWidth,
} from '../../../store/editorDefaults';

export function measureTextWidth(text: string, fontSize: number, maxWidth = TEXT_MAX_WIDTH) {
  const minWidth = textMinWidth(fontSize);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return minWidth;

  ctx.font = `600 ${fontSize}px sans-serif`;
  let maxLineWidth = 0;
  for (const line of text.split('\n')) {
    maxLineWidth = Math.max(maxLineWidth, ctx.measureText(line || ' ').width);
  }
  return Math.min(Math.max(minWidth, Math.ceil(maxLineWidth + TEXT_PADDING * 2)), maxWidth);
}

/** Count visual lines including soft-wraps inside the content box. */
function countVisualLines(text: string, fontSize: number, boxWidth: number) {
  const innerWidth = Math.max(1, boxWidth - TEXT_PADDING * 2);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return Math.max(1, text.split('\n').length);

  ctx.font = `600 ${fontSize}px sans-serif`;
  let lines = 0;

  for (const paragraph of text.split('\n')) {
    if (paragraph.length === 0) {
      lines += 1;
      continue;
    }

    let lineWidth = 0;
    let lineCount = 1;
    for (const char of paragraph) {
      const charWidth = ctx.measureText(char).width;
      if (lineWidth + charWidth > innerWidth && lineWidth > 0) {
        lineCount += 1;
        lineWidth = charWidth;
      } else {
        lineWidth += charWidth;
      }
    }
    lines += lineCount;
  }

  return Math.max(1, lines);
}

export function measureTextHeight(text: string, fontSize: number, boxWidth: number) {
  if (text.length === 0) return textMinHeight(fontSize);
  return textHeightForLines(fontSize, countVisualLines(text, fontSize, boxWidth));
}

export function measureTextareaSize(
  textarea: HTMLTextAreaElement,
  text: string,
  fontSize: number,
  maxWidth = TEXT_MAX_WIDTH,
) {
  const width = measureTextWidth(text, fontSize, maxWidth);
  const height = measureTextHeight(text, fontSize, width);

  textarea.style.width = `${width}px`;
  textarea.style.height = `${height}px`;

  return { width, height };
}
