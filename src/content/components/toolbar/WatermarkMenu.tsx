import { Stamp } from 'lucide-react';
import { useRef } from 'react';
import { useEditorStore } from '../../../store/useEditorStore';
import { WATERMARK_IMAGE_MAX_WIDTH } from '../../../store/editorDefaults';
import { Popover, PopoverContent, PopoverTrigger } from '../../../components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { Button } from '../../../components/ui/button';
import { Switch } from '../../../components/ui/switch';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { BTN, ICON } from './toolbarUi';
import { useUIStore } from '../../../store/useUIStore';
import { useTranslation } from '../../../lib/i18n';

export function WatermarkMenu() {
  const { t } = useTranslation();
  const {
    watermarkEnabled, setWatermarkEnabled,
    watermarkMode, setWatermarkMode,
    watermarkText, setWatermarkText,
    watermarkImageUrl, setWatermarkImageUrl,
  } = useEditorStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const pickImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setWatermarkMode('image');
        setWatermarkImageUrl(reader.result);
        setWatermarkEnabled(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const { activeMenu, setActiveMenu } = useUIStore();
  const showWatermarkMenu = activeMenu === 'watermark';
  const isActive = showWatermarkMenu || watermarkEnabled;

  return (
    <Popover open={showWatermarkMenu} onOpenChange={(open) => setActiveMenu(open ? 'watermark' : null)}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              render={
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="icon"
                  className={`${BTN} relative overflow-visible rounded-lg flex items-center justify-center ${
                    isActive
                      ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <Stamp size={ICON} className="size-5" />
                </Button>
              }
            />
          }
        />
        <TooltipContent side="bottom" sideOffset={8} className="z-[99999999]">
          {t('watermark.title')}
        </TooltipContent>
      </Tooltip>

      <PopoverContent className="w-72 bg-background border-border p-3 flex flex-col gap-3 text-foreground" sideOffset={8}>
        <div className="flex items-center justify-between">
          <Label className="text-foreground font-medium">{t('watermark.enable')}</Label>
          <Switch
            checked={watermarkEnabled}
            onCheckedChange={setWatermarkEnabled}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 bg-card p-1 rounded-lg">
            <Button
              variant={watermarkMode === 'text' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setWatermarkMode('text')}
              className={watermarkMode === 'text' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}
            >
              {t('watermark.modeText')}
            </Button>
            <Button
              variant={watermarkMode === 'image' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setWatermarkMode('image')}
              className={watermarkMode === 'image' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}
            >
              {t('watermark.modeImage')}
            </Button>
          </div>

          {watermarkMode === 'text' ? (
            <div className="flex flex-col gap-1.5">
              <Input
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder={t('watermark.textPlaceholder')}
                className="h-8 text-sm"
              />
              <p className="text-[10px] text-muted-foreground">{t('watermark.repeatsDiagonally')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {watermarkImageUrl ? (
                <div className="rounded-md border border-border/60 bg-muted p-2 flex items-center justify-center">
                  <img
                    src={watermarkImageUrl}
                    alt="Watermark"
                    className="max-h-16 max-w-full object-contain opacity-80"
                    style={{ maxWidth: WATERMARK_IMAGE_MAX_WIDTH }}
                  />
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{t('watermark.chooseLogoHint')}</p>
              )}
              <div className="flex gap-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) pickImage(file);
                    e.target.value = '';
                  }}
                />
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => fileRef.current?.click()}>
                  {t('watermark.uploadLogo')}
                </Button>
                {watermarkImageUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setWatermarkImageUrl(null)}
                  >
                    {t('watermark.clearLogo')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
