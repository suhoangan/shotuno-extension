import { useEditorStore } from '../../../store/useEditorStore';

const STICKER_EMOJIS = ['🔥', '✅', '❌', '💡', '💯', '⭐', '❤️', '⚠️', '👀', '✨', '👍', '👎', '🎉', '🚀', '📌'];

interface StickerPickerProps {
  onPicked?: () => void;
  /** When set, parent handles add (e.g. Pro gate). Otherwise dispatches add-sticker. */
  onAddSticker?: (emoji: string) => void;
}

/** Emoji grid — used inside ShapeToolMenu (and anywhere else stickers are offered). */
export function StickerPicker({ onPicked, onAddSticker }: StickerPickerProps) {
  const { setActiveTool } = useEditorStore();

  const handleAddSticker = (emoji: string) => {
    if (onAddSticker) {
      onAddSticker(emoji);
      return;
    }
    document.dispatchEvent(new CustomEvent('add-sticker', { detail: emoji }));
    setActiveTool('select');
    onPicked?.();
  };

  return (
    <div className="w-full px-1 pb-1">
      <div className="text-xs text-muted-foreground mb-1 px-0.5 font-medium">Stickers</div>
      <div className="grid grid-cols-5 gap-1 w-full">
        {STICKER_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            draggable={!onAddSticker}
            onDragStart={(e) => {
              if (onAddSticker) {
                e.preventDefault();
                return;
              }
              e.dataTransfer.setData('text/emoji', emoji);
              e.dataTransfer.effectAllowed = 'copy';
            }}
            onDragEnd={() => {
              setActiveTool('select');
              onPicked?.();
            }}
            onClick={() => handleAddSticker(emoji)}
            className="aspect-square min-w-0 w-full flex items-center justify-center text-base leading-none hover:bg-accent cursor-grab active:cursor-grabbing rounded"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
