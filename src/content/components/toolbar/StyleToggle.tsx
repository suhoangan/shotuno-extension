import type { ReactNode } from 'react';
import { Button } from '../../../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { TOGGLE } from './toolbarUi';

interface StyleToggleProps {
  label: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}

// Single definition of the icon toggle used across the contextual style toolbar
export function StyleToggle({ label, active, onClick, children }: StyleToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger render={
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          className={`${TOGGLE} ${active ? 'bg-primary/20 text-primary hover:bg-primary/30 hover:text-primary/80' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}
        />
      }>
        {children}
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>{label}</TooltipContent>
    </Tooltip>
  );
}
