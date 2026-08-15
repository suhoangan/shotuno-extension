import { Command } from 'lucide-react';
import { useTranslation } from '../../lib/i18n';

export function OnboardingShortcuts() {
  const { t } = useTranslation();

  const shortcuts = [
    { key: 'Alt + Shift + S', mac: 'Option + Shift + S', action: 'Open Shotuno capture popup' },
    { key: 'Esc', mac: 'Esc', action: 'Cancel selection / Close canvas editor' },
    { key: 'Ctrl + Z', mac: 'Cmd + Z', action: 'Undo last annotation step' },
    { key: 'Ctrl + Shift + Z', mac: 'Cmd + Shift + Z', action: 'Redo annotation step' },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Command className="size-4 text-primary" />
        <h3 className="font-bold text-base text-foreground">{t('onboarding.shortcutsTitle')}</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {shortcuts.map(({ key, mac, action }) => (
          <div key={action} className="flex items-center justify-between gap-2 rounded-lg bg-secondary/50 p-3 text-xs">
            <span className="font-medium text-foreground">{action}</span>
            <div className="flex flex-col items-end gap-1 font-mono text-[10px] font-bold text-primary">
              <span className="rounded bg-background px-2 py-0.5 border border-border">{key}</span>
              {mac !== key && <span className="text-[9px] text-muted-foreground">Mac: {mac}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
