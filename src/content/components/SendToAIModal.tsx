import { useState } from 'react';
import { Sparkles, Bot, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { useTranslation } from '../../lib/i18n';
import { editorActions } from '../editorActions';
import { SEND_TO_AI_PRESET_ICONS, SEND_TO_AI_PRESET_IDS } from './sendToAIPresets';

interface SendToAIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SendToAIModal({ isOpen, onClose }: SendToAIModalProps) {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');

  const handleSend = (provider: string) => {
    editorActions.emitExportCanvas({
      type: 'ai',
      prompt: prompt.trim(),
      aiProvider: provider,
    });
    onClose();
  };

  const presetKey = (id: (typeof SEND_TO_AI_PRESET_IDS)[number], field: 'label' | 'text') =>
    `modals.sendToAI.presets.${id}.${field}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground p-0 overflow-hidden gap-0">
        <DialogHeader className="p-4 border-b border-border bg-background/50 flex flex-row items-center space-y-0 gap-2">
          <Sparkles size={20} className="text-primary" />
          <DialogTitle className="font-semibold text-lg">{t('modals.sendToAI.title')}</DialogTitle>
        </DialogHeader>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">{t('modals.sendToAI.promptLabel')}</Label>
            <Textarea
              value={prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              placeholder={t('modals.sendToAI.promptPlaceholder')}
              className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring resize-none min-h-[96px]"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {SEND_TO_AI_PRESET_IDS.map((id) => {
              const Icon = SEND_TO_AI_PRESET_ICONS[id];
              return (
                <Button
                  key={id}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(t(presetKey(id, 'text')))}
                  className="rounded-full bg-accent/50 border-border text-foreground hover:bg-accent hover:text-foreground h-7 text-xs px-3"
                >
                  <Icon size={12} className="mr-1.5" />
                  {t(presetKey(id, 'label'))}
                </Button>
              );
            })}
          </div>

          <div className="mt-2 flex flex-col gap-3">
            <Label className="text-sm font-medium text-foreground">{t('modals.sendToAI.selectAssistant')}</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSend('ChatGPT')}
                className="h-auto p-3 justify-start bg-accent border-border hover:bg-primary hover:border-primary group"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary-foreground/20 shrink-0 mr-3">
                  <Bot size={18} className="text-primary group-hover:text-primary-foreground" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-foreground group-hover:text-primary-foreground text-sm">
                    {t('modals.sendToAI.chatgpt')}
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 font-normal">
                    {t('modals.sendToAI.openai')}
                  </span>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSend('Claude')}
                className="h-auto p-3 justify-start bg-accent border-border hover:bg-primary hover:border-primary group"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary-foreground/20 shrink-0 mr-3">
                  <Bot size={18} className="text-primary group-hover:text-primary-foreground" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-foreground group-hover:text-primary-foreground text-sm">
                    {t('modals.sendToAI.claude')}
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 font-normal">
                    {t('modals.sendToAI.anthropic')}
                  </span>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => handleSend('Gemini')}
                className="h-auto p-3 justify-start bg-accent border-border hover:bg-primary hover:border-primary group"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary-foreground/20 shrink-0 mr-3">
                  <Bot size={18} className="text-primary group-hover:text-primary-foreground" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold text-foreground group-hover:text-primary-foreground text-sm">
                    {t('modals.sendToAI.gemini')}
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 font-normal">
                    {t('modals.sendToAI.google')}
                  </span>
                </div>
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => handleSend('Copy')}
              className="w-full h-auto p-3 mt-1 justify-center bg-accent border-border hover:bg-accent hover:text-accent-foreground hover:border-border group flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center group-hover:bg-background shrink-0">
                <Copy size={18} className="text-foreground group-hover:text-foreground" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-semibold text-foreground text-sm">{t('modals.sendToAI.copyImageTitle')}</span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground font-normal">
                  {t('modals.sendToAI.copyImageHint')}
                </span>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
