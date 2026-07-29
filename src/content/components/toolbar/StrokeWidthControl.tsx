import { Minus, Plus } from 'lucide-react';
import { Slider } from '../../../components/ui/slider';
import { Button } from '../../../components/ui/button';
import {
  STROKE_WIDTH_MAX,
  STROKE_WIDTH_MIN,
  STROKE_WIDTH_STEP,
  snapStrokeWidth,
} from '../../../store/editorDefaults';
import { ICON_XS } from './toolbarUi';

interface StrokeWidthControlProps {
  value: number;
  onChange: (value: number) => void;
}

export function StrokeWidthControl({ value, onChange }: StrokeWidthControlProps) {
  const snapped = snapStrokeWidth(value);

  const bump = (delta: number) => onChange(snapStrokeWidth(snapped + delta * STROKE_WIDTH_STEP));

  return (
    <div
      className="flex items-center gap-1.5"
      title={`Stroke width — steps of ${STROKE_WIDTH_STEP}px (${STROKE_WIDTH_MIN}–${STROKE_WIDTH_MAX})`}
    >
      <span className="min-w-[1.25rem] text-xs font-semibold tabular-nums text-foreground">
        {snapped}
      </span>

      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        aria-label="Decrease stroke width"
        className="shrink-0 border-border/70"
        disabled={snapped <= STROKE_WIDTH_MIN}
        onClick={() => bump(-1)}
      >
        <Minus size={ICON_XS} />
      </Button>

      <div className="flex min-w-[100px] flex-1 px-1">
        <Slider
          min={STROKE_WIDTH_MIN}
          max={STROKE_WIDTH_MAX}
          step={STROKE_WIDTH_STEP}
          marksStep={STROKE_WIDTH_STEP}
          value={[snapped]}
          onValueChange={(val) => {
            const next = Array.isArray(val) ? val[0] : val;
            onChange(snapStrokeWidth(next));
          }}
          className="w-full min-w-[100px]"
          aria-label="Stroke width"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon-xs"
        aria-label="Increase stroke width"
        className="shrink-0 border-border/70"
        disabled={snapped >= STROKE_WIDTH_MAX}
        onClick={() => bump(1)}
      >
        <Plus size={ICON_XS} />
      </Button>
    </div>
  );
}
