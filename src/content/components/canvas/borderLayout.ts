import {
  BORDER_FOOTER_HEIGHT,
  BORDER_HEADER_HEIGHT,
  BORDER_MACOS_CONTROLS_WIDTH,
  BORDER_PADDING_PRESETS,
  BORDER_WINDOWS_CONTROLS_GAP,
  BORDER_WINDOWS_CONTROLS_RIGHT_PAD,
  BORDER_WINDOWS_CONTROLS_WIDTH,
  DEFAULT_BORDER_PADDING_PRESET,
  type BorderPaddingPresetId,
} from '../../../store/editorDefaults';

export { BORDER_HEADER_HEIGHT, BORDER_FOOTER_HEIGHT };

export type HeaderLabel = {
  x: number;
  y: number;
  width: number;
  height: number;
  align: 'left' | 'right' | 'center';
};

export type HeaderUrlBar = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function getPaddingFill(
  presetId: BorderPaddingPresetId,
  width: number,
  height: number,
) {
  const preset =
    BORDER_PADDING_PRESETS.find((entry) => entry.id === presetId)
    ?? BORDER_PADDING_PRESETS.find((entry) => entry.id === DEFAULT_BORDER_PADDING_PRESET)!;

  if (preset.type === 'solid') {
    return { fill: preset.colors[0] };
  }

  const stops = preset.colors.flatMap((color, index) => [
    index / (preset.colors.length - 1),
    color,
  ]);

  return {
    fillLinearGradientStartPoint: { x: 0, y: 0 },
    fillLinearGradientEndPoint: { x: width, y: height },
    fillLinearGradientColorStops: stops,
  };
}

function layoutWindowsHeader(
  frameWidth: number,
  showUrlTop: boolean,
  showDateTop: boolean,
) {
  const leftInset = 16;
  // Keep all header text left of Min/Max/Close — never under the top-right cluster.
  const controlsReserved =
    BORDER_WINDOWS_CONTROLS_WIDTH + BORDER_WINDOWS_CONTROLS_RIGHT_PAD + BORDER_WINDOWS_CONTROLS_GAP;
  const contentRight = frameWidth - controlsReserved;
  const dateWidth = 108;
  const urlMinWidth = 96;
  const urlMaxWidth = 280;
  const urlHeight = 28;
  const urlY = 10;
  const gap = 10;

  let dateLabel: HeaderLabel | null = null;
  let urlBar: HeaderUrlBar | null = null;

  if (showDateTop) {
    dateLabel = {
      x: leftInset,
      y: 16,
      width: Math.min(dateWidth, Math.max(0, contentRight - leftInset)),
      height: 20,
      align: 'left',
    };
  }

  if (showUrlTop) {
    const urlLeft = showDateTop ? leftInset + (dateLabel?.width ?? dateWidth) + gap : leftInset;
    const urlAvailable = Math.max(0, contentRight - urlLeft);
    const width = Math.min(urlMaxWidth, Math.max(urlMinWidth, urlAvailable));
    urlBar = {
      x: urlLeft + Math.max(0, (urlAvailable - width) / 2),
      y: urlY,
      width: Math.min(width, urlAvailable),
      height: urlHeight,
    };

    if (urlBar.width < urlMinWidth) {
      urlBar = {
        x: urlLeft,
        y: urlY,
        width: Math.max(48, urlAvailable),
        height: urlHeight,
      };
    }

    // Hard clamp so the URL bar can never spill into window controls.
    if (urlBar.x + urlBar.width > contentRight) {
      urlBar.width = Math.max(0, contentRight - urlBar.x);
    }
  }

  return {
    leftInset,
    rightInset: controlsReserved,
    urlBar,
    dateLabel,
  };
}

function layoutMacHeader(
  frameWidth: number,
  showUrlTop: boolean,
  showDateTop: boolean,
) {
  const leftInset = BORDER_MACOS_CONTROLS_WIDTH;
  const rightInset = 16;
  const dateWidth = 92;
  const urlMinWidth = 120;
  const urlMaxWidth = 260;
  const urlHeight = 28;
  const urlY = 10;

  let dateLabel: HeaderLabel | null = null;
  let urlBar: HeaderUrlBar | null = null;

  if (showDateTop) {
    dateLabel = {
      x: frameWidth - rightInset - dateWidth,
      y: 16,
      width: dateWidth,
      height: 20,
      align: 'right',
    };
  }

  if (showUrlTop) {
    const dateSpace = showDateTop ? dateWidth + 12 : 0;
    const available = frameWidth - leftInset - rightInset - dateSpace;
    const width = Math.min(urlMaxWidth, Math.max(urlMinWidth, available - 8));
    urlBar = {
      x: leftInset + Math.max(0, (available - width) / 2),
      y: urlY,
      width,
      height: urlHeight,
    };

    if (showDateTop && urlBar.x + urlBar.width > dateLabel!.x - 8) {
      const segmentEnd = dateLabel!.x - 8;
      urlBar.width = Math.max(urlMinWidth, segmentEnd - leftInset - 8);
      urlBar.x = leftInset + Math.max(0, (segmentEnd - leftInset - urlBar.width) / 2);
    }
  }

  return { leftInset, rightInset, urlBar, dateLabel };
}

export function getBorderHeaderLayout({
  frameWidth,
  style,
  includeUrl,
  includeDate,
  urlPosition,
}: {
  frameWidth: number;
  style: 'macos' | 'windows';
  includeUrl: boolean;
  includeDate: boolean;
  urlPosition: 'top' | 'bottom';
}) {
  const showUrlTop = includeUrl && urlPosition === 'top';
  // Date in the title bar whenever included, unless it already rides along in the bottom footer.
  const showDateTop = includeDate && !(includeUrl && urlPosition === 'bottom');

  if (style === 'windows') {
    return layoutWindowsHeader(frameWidth, showUrlTop, showDateTop);
  }

  return layoutMacHeader(frameWidth, showUrlTop, showDateTop);
}
