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
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-2xs space-y-4">
      <div className="flex items-center gap-2 border-b border-border/50 pb-3">
        <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Command className="size-4" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-foreground">{t('onboarding.shortcutsTitle')}</h3>
          <p className="text-[11px] text-muted-foreground">Productivity keybindings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {shortcuts.map(({ key, mac, action }) => (
          <div
            key={action}
            className="flex items-center justify-between gap-3 rounded-xl bg-muted/40 border border-border/50 p-3 text-xs"
          >
            <span className="font-medium text-foreground">{action}</span>
            <div className="flex flex-col items-end gap-1 font-mono text-[10px] shrink-0">
              <kbd className="rounded-md bg-background px-2 py-0.5 border border-border/80 shadow-2xs font-semibold text-foreground">
                {key}
              </kbd>
              {mac !== key && (
                <span className="text-[10px] text-muted-foreground">Mac: {mac}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
