import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { ToolType } from '../../../store/useEditorStore';
import { Button } from '../../../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { BTN, ICON } from './toolbarUi';

type IconComponent = LucideIcon | ((props: { size?: number; className?: string }) => ReactNode);

interface ToolButtonProps {
  tool?: ToolType | string;
  activeTool?: ToolType;
  icon: IconComponent;
  label: string;
  onSelect?: (tool: ToolType) => void;
  onClick?: () => void;
}

export function ToolButton({ tool, activeTool, icon: Icon, label, onSelect, onClick }: ToolButtonProps) {
  const isActive = Boolean(tool && activeTool === tool);
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (tool && onSelect) {
      onSelect(tool as ToolType);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            data-tool={tool}
            aria-label={label}
            variant={isActive ? 'default' : 'ghost'}
            size="icon"
            onClick={handleClick}
            className={`${BTN} relative overflow-visible rounded-lg flex items-center justify-center ${
              isActive
                ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <Icon size={ICON} className="size-5" />
          </Button>
        }
      />
      <TooltipContent side="bottom" sideOffset={8} className="z-[99999999]">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
