import { Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../../components/ui/tooltip';
import { ICON_SM } from './toolbarUi';
import { useEditorStore } from '../../../store/useEditorStore';

const TOOL_LABELS: Record<string, string> = {
  blur: 'Blur',
  counter: 'Counters',
  brush: 'Brush',
  highlight: 'Highlights',
  'highlight-area': 'Highlights',
  arrow: 'Arrows',
  measure: 'Measures',
  text: 'Text',
  rect: 'Rectangles',
  circle: 'Circles',
  triangle: 'Triangles',
  magnifier: 'Magnifiers',
  callout: 'Callouts',
};

const getTargetTypes = (tool: string): string[] => {
  if (tool === 'highlight' || tool === 'highlight-area') return ['highlight', 'highlight-area'];
  if (tool === 'arrow') return ['arrow', 'line'];
  return [tool];
};

export function ClearToolButton({
  activeTool,
  selectedTypes,
}: {
  activeTool: string;
  selectedTypes: Set<string>;
}) {
  const { shapes, setShapes, selectedShapeIds, setSelectedShapeIds, saveHistory } = useEditorStore();

  const targetTool = selectedTypes.size === 1 ? Array.from(selectedTypes)[0] : activeTool;
  const targetTypes = getTargetTypes(targetTool);
  const matchingShapes = shapes.filter((s) => targetTypes.includes(s.type));

  if (matchingShapes.length === 0) return null;

  const label = TOOL_LABELS[targetTool] || targetTool;

  const handleClear = () => {
    const idsToRemove = new Set(matchingShapes.map((s) => s.id));
    setShapes(shapes.filter((s) => !idsToRemove.has(s.id)));
    setSelectedShapeIds(selectedShapeIds.filter((id) => !idsToRemove.has(id)));
    saveHistory();
  };

  return (
    <>
      <div className="h-4 w-px shrink-0 bg-border/40" />
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 px-2 text-xs gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
            >
              <Trash2 size={ICON_SM} />
              <span className="whitespace-nowrap font-medium">Clear {label}</span>
            </Button>
          }
        />
        <TooltipContent side="bottom" sideOffset={8}>
          Remove all {label.toLowerCase()} ({matchingShapes.length})
        </TooltipContent>
      </Tooltip>
    </>
  );
}
