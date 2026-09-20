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

  return (
    <div className="space-y-8 max-w-3xl mx-auto py-2">
      {/* Extension Icon Action */}
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

      {/* Post-Capture Action */}
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
          {[
            { id: 'open_editor' as PostCaptureAction, labelKey: 'settings.postCaptureEdit', icon: Pencil },
            { id: 'copy_clipboard' as PostCaptureAction, labelKey: 'settings.postCaptureCopy', icon: Clipboard },
          ].map((opt) => {
            const Icon = opt.icon;
            const isSelected = settings.postCaptureAction === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => void update({ postCaptureAction: opt.id })}
                className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
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

      {/* Auto-Pin Buffer (Max 3 screenshots) */}
      <section className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Archive className="size-5" />
            </div>
            <div>
              <Label htmlFor="auto-pin-toggle" className="text-base font-semibold text-foreground cursor-pointer">
                {t('settings.autoPinTitle')}
              </Label>
              <p className="text-xs text-muted-foreground max-w-md pt-0.5">
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
          <div className="flex items-center justify-between p-3 bg-muted/40 rounded-xl border border-border/50 text-xs">
            <span className="text-muted-foreground">{t('settings.autoPinLimit')}</span>
            <span className="font-semibold text-foreground px-2 py-0.5 bg-background rounded-md border border-border">
              3 / 3 (FIFO)
            </span>
          </div>
        )}
      </section>

      {/* Download File Format */}
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
