import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ToolType } from '../../../store/useEditorStore';
import { Button } from '../../../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { BTN, ICON } from './toolbarUi';

type IconComponent = LucideIcon | ((props: { size?: number; className?: string }) => ReactNode);

interface ToolButtonProps {
  tool: ToolType;
  activeTool: ToolType;
  icon: IconComponent;
  label: string;
  onSelect: (tool: ToolType) => void;
}

export function ToolButton({ tool, activeTool, icon: Icon, label, onSelect }: ToolButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant={activeTool === tool ? 'default' : 'ghost'}
            size="icon"
            onClick={() => onSelect(tool)}
            className={`${BTN} rounded-lg transition-colors flex items-center justify-center ${
              activeTool === tool
                ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          />
        }
      >
        <Icon size={ICON} />
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8} className="z-[99999999]">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
