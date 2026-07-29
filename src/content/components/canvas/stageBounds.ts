import {
  BORDER_FOOTER_HEIGHT,
  BORDER_HEADER_HEIGHT,
  snapBorderPaddingSize,
} from '../../../store/editorDefaults';

export type ContentRect = { x: number; y: number; width: number; height: number };

export type StageBounds = ContentRect & {
  content: ContentRect;
};

type BorderOpts = {
  borderEnabled: boolean;
  borderStyle: 'macos' | 'windows' | 'none';
  borderPadding: boolean;
  borderPaddingSize: number;
  includeUrl: boolean;
  urlPosition: 'top' | 'bottom';
};

/** Image area the editor treats as "current" — full image while cropping, else crop when set. */
export function getContentRect(
  image: { width: number; height: number },
  cropRect: ContentRect | null,
  activeTool: string,
): ContentRect {
  if (cropRect && activeTool !== 'crop') {
    return {
      x: cropRect.x,
      y: cropRect.y,
      width: cropRect.width,
      height: cropRect.height,
    };
  }
  return { x: 0, y: 0, width: image.width, height: image.height };
}

/** Stage rect including optional window-chrome around the current content. */
export function getStageBounds(
  image: { width: number; height: number },
  cropRect: ContentRect | null,
  activeTool: string,
  border: BorderOpts,
): StageBounds {
  const content = getContentRect(image, cropRect, activeTool);

  const sidePadding =
    border.borderEnabled && border.borderPadding
      ? snapBorderPaddingSize(border.borderPaddingSize)
      : 0;
  const headerHeight =
    border.borderEnabled && border.borderStyle !== 'none' ? BORDER_HEADER_HEIGHT : 0;
  const footerHeight =
    border.borderEnabled && border.borderStyle !== 'none' && border.includeUrl && border.urlPosition === 'bottom'
      ? BORDER_FOOTER_HEIGHT
      : 0;

  return {
    x: content.x - sidePadding,
    y: content.y - sidePadding - headerHeight,
    width: content.width + sidePadding * 2,
    height: content.height + sidePadding * 2 + headerHeight + footerHeight,
    content,
  };
}
