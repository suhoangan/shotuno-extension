import { useState } from 'react';
import { Sparkles, Code, Type, Bug, Bot, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { editorActions } from '../editorActions';
import { useProGate } from './hooks/useProGate';

interface SendToAIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SendToAIModal({ isOpen, onClose }: SendToAIModalProps) {
  const { runPro } = useProGate();
  const [prompt, setPrompt] = useState('');

  const handleSend = (provider: string) => {
    void runPro('send_to_ai', () => {
      editorActions.emitExportCanvas({
        type: 'ai',
        prompt: prompt.trim(),
        aiProvider: provider,
      });
      onClose();
    });
  };

  const quickPrompts = [
    { label: 'Explain', icon: Type, text: 'Explain this screenshot in detail.' },
    { label: 'Extract Text', icon: Type, text: 'Extract all the text from this image exactly as written.' },
    { label: 'Find Bugs', icon: Bug, text: 'Analyze this UI/Code screenshot and find potential bugs or UX issues.' },
    { label: 'To Tailwind', icon: Code, text: 'Write a React component with Tailwind CSS that perfectly replicates this UI.' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border text-foreground p-0 overflow-hidden gap-0">
        <DialogHeader className="p-4 border-b border-border bg-background/50 flex flex-row items-center space-y-0 gap-2">
          <Sparkles size={20} className="text-primary" />
          <DialogTitle className="font-semibold text-lg">Send to AI</DialogTitle>
        </DialogHeader>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-foreground">Prompt</Label>
            <Textarea
              value={prompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              placeholder="What do you want the AI to do with this image? (e.g. Write code for this UI, explain this graph...)"
              className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring resize-none min-h-[96px]"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {quickPrompts.map(qp => (
              <Button
                key={qp.label}
                variant="outline"
                size="sm"
                onClick={() => setPrompt(qp.text)}
                className="rounded-full bg-accent/50 border-border text-foreground hover:bg-accent hover:text-foreground h-7 text-xs px-3"
              >
                <qp.icon size={12} className="mr-1.5" />
                {qp.label}
              </Button>
            ))}
          </div>

          <div className="mt-2 flex flex-col gap-3">
            <Label className="text-sm font-medium text-foreground">Select AI Assistant</Label>
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
                  <span className="font-semibold text-foreground group-hover:text-primary-foreground text-sm">ChatGPT</span>
                  <span className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 font-normal">OpenAI</span>
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
                  <span className="font-semibold text-foreground group-hover:text-primary-foreground text-sm">Claude</span>
                  <span className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 font-normal">Anthropic</span>
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
                  <span className="font-semibold text-foreground group-hover:text-primary-foreground text-sm">Gemini</span>
                  <span className="text-xs text-muted-foreground group-hover:text-primary-foreground/80 font-normal">Google</span>
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
                <span className="font-semibold text-foreground text-sm">Copy Image & Prompt</span>
                <span className="text-xs text-muted-foreground group-hover:text-foreground font-normal">Use with any other AI tool</span>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
