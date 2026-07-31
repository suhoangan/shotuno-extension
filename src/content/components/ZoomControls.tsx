import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { BTN, BAR_GAP, ICON, CHROME } from './toolbar/toolbarUi';
import { BUTTON_ZOOM_STEP, MAX_ZOOM, MIN_ZOOM } from './canvas/renderScale';

interface ZoomControlsProps {
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  fitScale: number;
}

export const ZoomControls = React.memo(function ZoomControls({ scale, setScale, fitScale }: ZoomControlsProps) {
  return (
    <TooltipProvider delay={300}>
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-[9999999] ${CHROME} px-1 py-0.5 flex items-center ${BAR_GAP} pointer-events-auto`}>
        <Tooltip>
          <TooltipTrigger render={
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setScale(s => Math.max(MIN_ZOOM, s / BUTTON_ZOOM_STEP))} 
              className={`${BTN} hover:bg-accent text-muted-foreground hover:text-foreground`} 
            />
          }>
            <ZoomOut size={ICON}/>
          </TooltipTrigger>
          <TooltipContent side="top">Zoom Out</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={
            <Button 
              variant="ghost" 
              onClick={() => setScale(fitScale)} 
              className="h-8 px-1.5 hover:bg-accent text-muted-foreground hover:text-foreground text-xs font-semibold min-w-[3.25rem]" 
            />
          }>
            {Math.round(scale * 100)}%
          </TooltipTrigger>
          <TooltipContent side="top">Fit to Screen</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setScale(s => Math.min(MAX_ZOOM, s * BUTTON_ZOOM_STEP))} 
              className={`${BTN} hover:bg-accent text-muted-foreground hover:text-foreground`} 
            />
          }>
            <ZoomIn size={ICON}/>
          </TooltipTrigger>
          <TooltipContent side="top">Zoom In</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
});
