import { Undo, Redo } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { ICON } from './toolbarUi';

interface UndoRedoControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export function UndoRedoControls({ canUndo, canRedo, onUndo, onRedo }: UndoRedoControlsProps) {
  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              onClick={onUndo}
              disabled={!canUndo}
              className={`h-8 w-8 rounded-lg transition-colors flex items-center justify-center ${
                !canUndo
                  ? 'text-muted-foreground/50'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            />
          }
        >
          <Undo size={ICON} />
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          Undo
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              onClick={onRedo}
              disabled={!canRedo}
              className={`h-8 w-8 rounded-lg transition-colors flex items-center justify-center ${
                !canRedo
                  ? 'text-muted-foreground/50'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            />
          }
        >
          <Redo size={ICON} />
        </TooltipTrigger>
        <TooltipContent side="bottom" sideOffset={8}>
          Redo
        </TooltipContent>
      </Tooltip>
    </>
  );
}
