import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  Maximize,
  Crop,
  AlignVerticalSpaceAround,
  LayoutGrid,
  Pin,
  Menu,
  Check,
  Zap,
  Clipboard,
  Pencil,
  Archive,
  Download,
} from 'lucide-react';
import {
  getCaptureSettings,
  saveCaptureSettings,
  type CaptureSettings,
  type ExtensionIconAction,
  type PostCaptureAction,
  type DownloadImageFormat,
} from '../../lib/captureSettings';
import { useTranslation } from '../../lib/i18n';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';

const ICON_OPTIONS: { id: ExtensionIconAction; labelKey: string; icon: typeof Menu }[] = [
  { id: 'popup', labelKey: 'settings.actionPopup', icon: Menu },
  { id: 'visible', labelKey: 'settings.actionVisible', icon: Maximize },
  { id: 'area', labelKey: 'settings.actionArea', icon: Crop },
  { id: 'full', labelKey: 'settings.actionFull', icon: AlignVerticalSpaceAround },
  { id: 'grid', labelKey: 'settings.actionGrid', icon: LayoutGrid },
  { id: 'pin_area', labelKey: 'settings.actionPinArea', icon: Pin },
];

const FORMAT_OPTIONS: { id: DownloadImageFormat; labelKey: string }[] = [
  { id: 'png', labelKey: 'settings.formatPng' },
  { id: 'jpg', labelKey: 'settings.formatJpg' },
  { id: 'webp', labelKey: 'settings.formatWebp' },
];

export function SettingsView() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<CaptureSettings | null>(null);

  useEffect(() => {
    void getCaptureSettings().then(setSettings);
  }, []);

  if (!settings) return null;

  const update = async (patch: Partial<CaptureSettings>) => {
    const updated = await saveCaptureSettings(patch);
    setSettings(updated);
    toast.success(t('settings.saveSuccess'));
  };

  const selectPostCapture = (action: PostCaptureAction) => {
    const patch: Partial<CaptureSettings> = { postCaptureAction: action };
    if (action !== 'copy_clipboard') patch.autoPinEnabled = false;
    void update(patch);
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-2">
      <section className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Zap className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('settings.iconActionTitle')}</h2>
            <p className="text-xs text-muted-foreground">{t('settings.iconActionDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {ICON_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = settings.iconAction === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => void update({ iconAction: opt.id })}
                className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                    : 'border-border bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`size-4 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="text-xs font-medium">{t(opt.labelKey)}</span>
                </div>
                {isSelected && <Check className="size-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Clipboard className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('settings.postCaptureTitle')}</h2>
            <p className="text-xs text-muted-foreground">{t('settings.postCaptureDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => selectPostCapture('open_editor')}
            className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
              settings.postCaptureAction === 'open_editor'
                ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                : 'border-border bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Pencil className={`size-4 shrink-0 ${settings.postCaptureAction === 'open_editor' ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-xs font-medium">{t('settings.postCaptureEdit')}</span>
            </div>
            {settings.postCaptureAction === 'open_editor' && <Check className="size-4 text-primary shrink-0" />}
          </button>

          <div
            className={`rounded-xl border transition-all ${
              settings.postCaptureAction === 'copy_clipboard'
                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                : 'border-border bg-background'
            }`}
          >
            <button
              type="button"
              onClick={() => selectPostCapture('copy_clipboard')}
              className={`flex w-full items-center justify-between p-3.5 text-left transition-all rounded-xl ${
                settings.postCaptureAction === 'copy_clipboard'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clipboard className={`size-4 shrink-0 ${settings.postCaptureAction === 'copy_clipboard' ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-xs font-medium">{t('settings.postCaptureCopy')}</span>
              </div>
              {settings.postCaptureAction === 'copy_clipboard' && <Check className="size-4 text-primary shrink-0" />}
            </button>

            {settings.postCaptureAction === 'copy_clipboard' && (
              <div className="mx-3 mb-3 p-3 rounded-lg border border-border/60 bg-background space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Archive className="size-4 shrink-0 text-primary mt-0.5" />
                    <div className="min-w-0">
                      <Label htmlFor="auto-pin-toggle" className="text-xs font-medium text-foreground cursor-pointer">
                        {t('settings.autoPinTitle')}
                      </Label>
                      <p className="text-[11px] text-muted-foreground pt-0.5 leading-snug">
                        {t('settings.autoPinDesc')}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="auto-pin-toggle"
                    checked={settings.autoPinEnabled}
                    onCheckedChange={(checked) => void update({ autoPinEnabled: checked })}
                  />
                </div>
                {settings.autoPinEnabled && (
                  <div className="flex items-center justify-between text-[11px] pl-6">
                    <span className="text-muted-foreground">{t('settings.autoPinLimit')}</span>
                    <span className="font-semibold text-foreground px-2 py-0.5 bg-muted rounded-md border border-border">
                      3 / 3 (FIFO)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Download className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">{t('settings.downloadFormatTitle')}</h2>
            <p className="text-xs text-muted-foreground">{t('settings.downloadFormatDesc')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          {FORMAT_OPTIONS.map((opt) => {
            const isSelected = settings.downloadFormat === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => void update({ downloadFormat: opt.id })}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 text-foreground ring-1 ring-primary'
                    : 'border-border bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="text-xs font-medium">{t(opt.labelKey)}</span>
                {isSelected && <Check className="size-4 text-primary shrink-0 ml-2" />}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
