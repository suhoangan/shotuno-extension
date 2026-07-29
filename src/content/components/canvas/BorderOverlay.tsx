import { Group, Rect, Circle, Text, Path } from 'react-konva';
import type { BorderPaddingPresetId } from '../../../store/editorDefaults';
import {
  BORDER_FOOTER_HEIGHT,
  BORDER_HEADER_HEIGHT,
  BORDER_WINDOWS_CONTROLS_RIGHT_PAD,
  BORDER_WINDOWS_CONTROLS_WIDTH,
  snapBorderPaddingSize,
} from '../../../store/editorDefaults';
import {
  getBorderHeaderLayout,
  getPaddingFill,
} from './borderLayout';

interface BorderOverlayProps {
  width: number;
  height: number;
  x: number;
  y: number;
  style: 'macos' | 'windows' | 'none';
  hasPadding: boolean;
  paddingSize: number;
  paddingPreset: BorderPaddingPresetId;
  includeUrl: boolean;
  includeDate: boolean;
  urlPosition: 'top' | 'bottom';
}

export const BorderOverlay = ({
  width,
  height,
  x,
  y,
  style,
  hasPadding,
  paddingSize,
  paddingPreset,
  includeUrl,
  includeDate,
  urlPosition,
}: BorderOverlayProps) => {
  if (style === 'none') return null;

  const sidePadding = hasPadding ? snapBorderPaddingSize(paddingSize) : 0;
  const frameX = x + sidePadding;
  const frameY = y + sidePadding;
  const frameWidth = width - sidePadding * 2;
  const frameHeight = height - sidePadding * 2;
  const header = getBorderHeaderLayout({
    frameWidth,
    style,
    includeUrl,
    includeDate,
    urlPosition,
  });

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://example.com';
  const currentDate = new Date().toLocaleDateString();

  // Decorative only — must not steal hits from drawing/select tools underneath.
  return (
    <Group listening={false}>
      {hasPadding && (
        <Rect
          x={x}
          y={y}
          width={width}
          height={height}
          listening={false}
          {...getPaddingFill(paddingPreset, width, height)}
        />
      )}

      <Rect
        x={frameX}
        y={frameY}
        width={frameWidth}
        height={frameHeight}
        fill="#ffffff"
        cornerRadius={12}
        shadowColor="rgba(0,0,0,0.3)"
        shadowBlur={30}
        shadowOffset={{ x: 0, y: 15 }}
        listening={false}
      />

      <Group x={frameX} y={frameY} listening={false}>
        <Rect
          x={0}
          y={0}
          width={frameWidth}
          height={BORDER_HEADER_HEIGHT}
          fill="#f3f4f6"
          cornerRadius={[12, 12, 0, 0]}
        />
        <Rect x={0} y={BORDER_HEADER_HEIGHT - 1} width={frameWidth} height={1} fill="#e5e7eb" />

        {style === 'macos' && (
          <Group x={16} y={24}>
            <Circle x={0} y={0} radius={6} fill="#ff5f56" />
            <Circle x={20} y={0} radius={6} fill="#ffbd2e" />
            <Circle x={40} y={0} radius={6} fill="#27c93f" />
          </Group>
        )}

        {style === 'windows' && (
          <Group x={frameWidth - BORDER_WINDOWS_CONTROLS_WIDTH - BORDER_WINDOWS_CONTROLS_RIGHT_PAD} y={0}>
            <Group x={0} y={0}>
              <Rect width={40} height={BORDER_HEADER_HEIGHT} fill="transparent" />
              <Rect x={15} y={BORDER_HEADER_HEIGHT / 2} width={10} height={1} fill="#4b5563" />
            </Group>
            <Group x={40} y={0}>
              <Rect width={40} height={BORDER_HEADER_HEIGHT} fill="transparent" />
              <Rect x={15} y={BORDER_HEADER_HEIGHT / 2 - 5} width={10} height={10} stroke="#4b5563" strokeWidth={1} />
            </Group>
            <Group x={80} y={0}>
              <Rect width={40} height={BORDER_HEADER_HEIGHT} fill="transparent" />
              <Path data="M15,19 L25,29 M25,19 L15,29" stroke="#4b5563" strokeWidth={1.5} />
            </Group>
          </Group>
        )}

        {header.urlBar && (
          <Group x={header.urlBar.x} y={header.urlBar.y}>
            <Rect width={header.urlBar.width} height={header.urlBar.height} fill="#e5e7eb" cornerRadius={6} />
            <Text
              text={currentUrl}
              x={10}
              y={8}
              width={header.urlBar.width - 20}
              height={20}
              fill="#6b7280"
              fontSize={12}
              fontFamily="sans-serif"
              align="center"
              ellipsis
              wrap="none"
            />
          </Group>
        )}

        {header.dateLabel && (
          <Text
            text={currentDate}
            x={header.dateLabel.x}
            y={header.dateLabel.y}
            width={header.dateLabel.width}
            height={header.dateLabel.height}
            fill="#9ca3af"
            fontSize={12}
            fontFamily="sans-serif"
            align={header.dateLabel.align}
            ellipsis
            wrap="none"
          />
        )}
      </Group>

      {includeUrl && urlPosition === 'bottom' && (
        <Group x={frameX} y={frameY + frameHeight - BORDER_FOOTER_HEIGHT}>
          <Rect width={frameWidth} height={BORDER_FOOTER_HEIGHT} fill="#f9fafb" cornerRadius={[0, 0, 12, 12]} />
          <Rect x={0} y={0} width={frameWidth} height={1} fill="#e5e7eb" />
          <Text
            text={includeDate ? `${currentDate}  •  ${currentUrl}` : currentUrl}
            x={20}
            y={12}
            width={frameWidth - 40}
            height={20}
            fill="#9ca3af"
            fontSize={12}
            fontFamily="sans-serif"
            align="left"
            ellipsis
            wrap="none"
          />
        </Group>
      )}
    </Group>
  );
};
