import { useRef, useState } from 'react';
import { Maximize, Crop, AlignVerticalSpaceAround, Images, FolderOpen, Loader2, LayoutGrid } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { UserAccountHeader } from '../components/UserAccountHeader';
import { useTranslation } from '../lib/i18n';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

const CAPTURE_OPTIONS = [
  { type: 'visible', icon: Maximize, titleKey: 'popup.visibleContent.title', descKey: 'popup.visibleContent.description' },
  { type: 'area', icon: Crop, titleKey: 'popup.selectedArea.title', descKey: 'popup.selectedArea.description' },
  { type: 'grid', icon: LayoutGrid, titleKey: 'popup.gridCapture.title', descKey: 'popup.gridCapture.description' },
  { type: 'full', icon: AlignVerticalSpaceAround, titleKey: 'popup.fullPage.title', descKey: 'popup.fullPage.description' },
] as const;

function CaptureButton({
  option,
  loading,
  onClick,
}: {
  option: (typeof CAPTURE_OPTIONS)[number];
  loading: string | null;
  onClick: () => void;
}) {
  const { t } = useTranslation();
  const Icon = option.icon;
  return (
    <Button
      variant="outline"
      className="h-auto justify-start gap-3 py-2.5 px-3"
      onClick={onClick}
      disabled={loading !== null}
    >
      {loading === option.type ? (
        <Loader2 size={18} className="text-primary shrink-0 animate-spin" />
      ) : (
        <Icon size={18} className="text-primary shrink-0" />
      )}
      <div className="flex flex-col items-start text-left">
        <span className="font-medium text-sm">{t(option.titleKey)}</span>
        <span className="text-xs text-muted-foreground font-normal">
          {t(option.descKey)}
        </span>
      </div>
    </Button>
  );
}

export default function App() {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const startCapture = async (type: 'visible' | 'area' | 'full' | 'grid') => {
    setError(null);
    setLoading(type);
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs[0];
      if (!activeTab?.id) {
        setError(t('popup.noActiveTab'));
        return;
      }
      if (
        activeTab.url?.startsWith('chrome://') ||
        activeTab.url?.startsWith('chrome-extension://') ||
        activeTab.url?.startsWith('edge://')
      ) {
        setError(t('popup.invalidTab'));
        return;
      }

      chrome.runtime.sendMessage(
        {
          type: 'INITIATE_CAPTURE',
          payload: { captureType: type, tabId: activeTab.id },
        },
        (response) => {
          setLoading(null);
          if (chrome.runtime.lastError) {
            setError(chrome.runtime.lastError.message || t('popup.extensionError'));
            return;
          }
          if (response && response.success === false) {
            setError(response.error || t('popup.captureFailed'));
            return;
          }
          window.close();
        },
      );
    } catch (e) {
      setLoading(null);
      console.error('Failed to initiate capture', e);
      setError(e instanceof Error ? e.message : t('popup.captureFailed'));
    }
  };

  const openGallery = async () => {
    setError(null);
    try {
      const win = await chrome.windows.getCurrent();
      if (win.id != null) await chrome.sidePanel.open({ windowId: win.id });
      window.close();
    } catch (e) {
      console.error('Failed to open side panel', e);
      setError(e instanceof Error ? e.message : t('popup.captureFailed'));
    }
  };

  const openLocalImage = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result !== 'string') return;
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0]?.id;
      if (!tabId) {
        setError(t('popup.noActiveTab'));
        return;
      }
      chrome.tabs.sendMessage(tabId, { type: 'TOGGLE_EDITOR', payload: reader.result }, () => {
        if (chrome.runtime.lastError) {
          setError(t('popup.refreshTabPrompt'));
          return;
        }
        window.close();
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-72 p-4 bg-background text-foreground font-sans flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-sm font-bold text-foreground tracking-tight">{t('popup.title')}</h1>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <UserAccountHeader compact />
        </div>
      </div>

      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-0.5">
        {t('popup.captureMode')}
      </h2>

      {error && (
        <p className="text-xs text-destructive leading-snug rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5">
          {error}
        </p>
      )}

      {CAPTURE_OPTIONS.map((option) => (
        <CaptureButton
          key={option.type}
          option={option}
          loading={loading}
          onClick={() => void startCapture(option.type as any)}
        />
      ))}

      <Separator className="bg-border/40" />

      <Button variant="outline" className="justify-start gap-2 h-auto py-2.5" onClick={() => void openGallery()}>
        <Images size={16} className="shrink-0" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">{t('popup.openGallery.title')}</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            {t('popup.openGallery.description')}
          </span>
        </div>
      </Button>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) openLocalImage(file);
          e.target.value = '';
        }}
      />
      <Button
        variant="outline"
        className="justify-start gap-2 h-auto py-2.5"
        onClick={() => fileRef.current?.click()}
      >
        <FolderOpen size={16} className="shrink-0" />
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium">{t('popup.openImage.title')}</span>
          <span className="text-[10px] text-muted-foreground font-normal">
            {t('popup.openImage.description')}
          </span>
        </div>
      </Button>
    </div>
  );
}
