import { Button } from '../../../components/ui/button';

export const COLOR_PALETTE = [
  '#ef4444',
  '#facc15',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ffffff',
  '#000000',
];

interface ColorPalettePickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  disabled?: boolean;
}

export function ColorPalettePicker({
  selectedColor,
  onColorChange,
  disabled = false,
}: ColorPalettePickerProps) {
  return (
    <div
      className={`flex gap-2 ${disabled ? 'pointer-events-none opacity-40' : ''}`}
      aria-disabled={disabled || undefined}
      title={disabled ? 'Enable Border to change color' : undefined}
    >
      {COLOR_PALETTE.map((c) => (
        <Button
          key={c}
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          onClick={() => onColorChange(c)}
          className={`w-5 h-5 rounded-full border-2 p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-transform ${
            disabled ? 'cursor-not-allowed' : 'hover:scale-110'
          } ${selectedColor === c ? 'border-foreground scale-110 shadow-sm' : 'border-border hover:border-foreground/40'}`}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}
