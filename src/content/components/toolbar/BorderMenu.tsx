import { Monitor } from 'lucide-react';
import { useEditorStore } from '../../../store/useEditorStore';
import {
  BORDER_PADDING_PRESETS,
  BORDER_PADDING_SIZE_MAX,
  BORDER_PADDING_SIZE_MIN,
  BORDER_PADDING_SIZE_STEP,
  snapBorderPaddingSize,
} from '../../../store/editorDefaults';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Checkbox } from '../../../components/ui/checkbox';
import { Label } from '../../../components/ui/label';
import { Slider } from '../../../components/ui/slider';
import { BTN, ICON } from './toolbarUi';
import { ProBadge } from './ProBadge';

export function BorderMenu({
  showBorderMenu,
  setShowBorderMenu,
  isPro,
}: {
  showBorderMenu: boolean;
  setShowBorderMenu: (show: boolean) => void;
  isPro?: boolean;
}) {
  const {
    borderEnabled, setBorderEnabled, borderStyle, setBorderStyle,
    borderPadding, setBorderPadding, borderPaddingPreset, setBorderPaddingPreset,
    borderPaddingSize, setBorderPaddingSize,
    includeUrl, setIncludeUrl, includeDate, setIncludeDate, urlPosition, setUrlPosition,
  } = useEditorStore();

  const paddingSize = snapBorderPaddingSize(borderPaddingSize);
  const triggerClass = `inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 relative ${BTN} ${showBorderMenu || borderEnabled ? 'bg-primary text-primary-foreground hover:bg-primary/80' : 'bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground'}`;

  return (
    <Popover open={showBorderMenu} onOpenChange={setShowBorderMenu}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger className={triggerClass}>
              <Monitor size={ICON} />
              <ProBadge show={isPro} />
            </PopoverTrigger>
          }
        />
        <TooltipContent side="bottom" sideOffset={8} className="z-[99999999]">
          Window Border & Padding
        </TooltipContent>
      </Tooltip>

      <PopoverContent className="w-72 bg-background border-border p-3 flex flex-col gap-3 text-foreground" sideOffset={8}>
        <div className="flex items-center justify-between">
          <Label className="text-foreground font-medium">Border</Label>
          <Switch
            checked={borderEnabled}
            onCheckedChange={setBorderEnabled}
          />
        </div>

        <div className={`flex flex-col gap-3 transition-opacity ${borderEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div className="grid grid-cols-2 gap-2 bg-card p-1 rounded-lg">
            <Button
              variant={borderStyle === 'macos' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => { setBorderStyle('macos'); }}
              className={borderStyle === 'macos' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}
            >
              macOS
            </Button>
            <Button
              variant={borderStyle === 'windows' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => { setBorderStyle('windows'); }}
              className={borderStyle === 'windows' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}
            >
              Windows
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-card p-1 rounded-lg">
            <Button
              variant={urlPosition === 'top' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => { setUrlPosition('top'); }}
              className={urlPosition === 'top' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}
            >
              URL Top
            </Button>
            <Button
              variant={urlPosition === 'bottom' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => { setUrlPosition('bottom'); }}
              className={urlPosition === 'bottom' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}
            >
              URL Bottom
            </Button>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="include-url" className="text-sm font-normal text-foreground cursor-pointer">Include URL</Label>
              <Checkbox
                id="include-url"
                checked={includeUrl}
                onCheckedChange={(checked: boolean) => setIncludeUrl(checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="include-date" className="text-sm font-normal text-foreground cursor-pointer">Include Date</Label>
              <Checkbox
                id="include-date"
                checked={includeDate}
                onCheckedChange={(checked: boolean) => setIncludeDate(checked)}
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-border/40 w-full" />

        {/* Padding is its own section — size + background color stay interactive. */}
        <div className="flex items-center justify-between">
          <Label className="text-foreground text-sm font-medium">Padding</Label>
          <Switch
            checked={borderPadding && borderEnabled}
            onCheckedChange={setBorderPadding}
          />
        </div>

        <div className={`flex flex-col gap-3 transition-opacity ${borderPadding && borderEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">Padding size</Label>
              <span className="text-xs font-semibold tabular-nums text-foreground">{paddingSize}px</span>
            </div>
            <Slider
              min={BORDER_PADDING_SIZE_MIN}
              max={BORDER_PADDING_SIZE_MAX}
              step={BORDER_PADDING_SIZE_STEP}
              marksStep={BORDER_PADDING_SIZE_STEP}
              value={[paddingSize]}
              onValueChange={(val) => {
                const next = Array.isArray(val) ? val[0] : val;
                setBorderPaddingSize(snapBorderPaddingSize(next));
              }}
              aria-label="Border padding size"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs font-medium text-muted-foreground">Background color</Label>
            <div className="grid grid-cols-6 gap-2">
              {BORDER_PADDING_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  title={preset.id}
                  onClick={() => setBorderPaddingPreset(preset.id)}
                  className={`h-7 w-7 rounded-full border-2 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${borderPaddingPreset === preset.id && borderPadding && borderEnabled ? 'border-foreground scale-110 shadow-sm' : 'border-border hover:border-foreground/40'}`}
                  style={{ background: preset.swatch }}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
