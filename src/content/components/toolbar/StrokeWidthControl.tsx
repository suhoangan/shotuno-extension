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
  color: string;
  onChange: (value: number) => void;
  /** Stroke-thickness swatch; hide for tools where size isn't a stroke (e.g. blur). */
  showPreview?: boolean;
}

export function StrokeWidthControl({ value, color, onChange, showPreview = true }: StrokeWidthControlProps) {
  const snapped = snapStrokeWidth(value);
  const previewHeight = Math.max(2, Math.round((snapped / STROKE_WIDTH_MAX) * 14));

  const bump = (delta: number) => onChange(snapStrokeWidth(snapped + delta * STROKE_WIDTH_STEP));

  return (
    <div
      className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/80 px-2 py-1 shadow-sm"
      title={`Stroke width — steps of ${STROKE_WIDTH_STEP}px (${STROKE_WIDTH_MIN}–${STROKE_WIDTH_MAX})`}
    >
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Size
        </span>
        {showPreview && (
          <div
            aria-hidden
            className="flex h-7 w-9 items-center justify-center rounded-md border border-border/70 bg-muted/40 px-1"
          >
            <div
              className="w-full rounded-full transition-[height] duration-150"
              style={{ height: previewHeight, backgroundColor: color }}
            />
          </div>
        )}
        <span className="min-w-[1.25rem] text-xs font-semibold tabular-nums text-foreground">
          {snapped}
        </span>
      </div>

      <div className="flex min-w-[152px] items-center gap-1.5">
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

        <div className="flex flex-1 px-1">
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
    </div>
  );
}
