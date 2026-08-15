import { Minus, Plus } from 'lucide-react';
import { Slider } from '../../../components/ui/slider';
import { Button } from '../../../components/ui/button';
import { ICON_XS } from './toolbarUi';

interface OpacityControlProps {
  value: number;
  onChange: (value: number) => void;
}

export function OpacityControl({ value, onChange }: OpacityControlProps) {
  // Convert 0.1 - 0.9 to 10 - 90
  const snapped = Math.round((value ?? 0.2) * 100);

  const bump = (delta: number) => {
    const next = snapped + delta * 10;
    const clamped = Math.min(90, Math.max(10, next));
    onChange(clamped / 100);
  };

  return (
    <div
      className="flex items-center gap-1.5"
      title="Background Dim Opacity (10% - 90%)"
    >
      <span className="min-w-[1.25rem] text-xs font-semibold tabular-nums text-foreground">
        {snapped}%
      </span>

      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        aria-label="Decrease opacity"
        className="shrink-0 border-border/70"
        disabled={snapped <= 10}
        onClick={() => bump(-1)}
      >
        <Minus size={ICON_XS} />
      </Button>

      <div className="flex min-w-[100px] flex-1 px-1">
        <Slider
          min={10}
          max={90}
          step={10}
          marksStep={10}
          value={[snapped]}
          onValueChange={(val) => {
            const next = Array.isArray(val) ? val[0] : val;
            onChange(next / 100);
          }}
          className="w-full min-w-[100px]"
          aria-label="Opacity"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        aria-label="Increase opacity"
        className="shrink-0 border-border/70"
        disabled={snapped >= 90}
        onClick={() => bump(1)}
      >
        <Plus size={ICON_XS} />
      </Button>
    </div>
  );
}
