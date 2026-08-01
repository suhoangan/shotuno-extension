import { Check, Trash2, LayoutGrid } from 'lucide-react';
import { Button } from '../ui/button';
import type { GalleryImage } from '../../lib/galleryDb';
import type { GalleryViewMode } from './galleryPrefs';
import { formatGalleryDate } from './galleryPrefs';

interface GalleryItemProps {
  image: GalleryImage;
  selected: boolean;
  view: GalleryViewMode;
  selectedCount: number;
  /** When true, clicking the card toggles selection instead of opening preview. */
  selectMode: boolean;
  onToggleSelect: () => void;
  onPreview: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  dragHint?: string;
}

export function GalleryItem({
  image,
  selected,
  view,
  selectedCount,
  selectMode,
  onToggleSelect,
  onPreview,
  onDelete,
  onDragStart,
  dragHint = 'Drag to use',
}: GalleryItemProps) {
  const label = image.filename || `Shot ${image.id.slice(-4)}`;
  const multiHint = selected && selectedCount > 1 ? `Drag ${selectedCount}` : dragHint;

  const handleCardClick = (e: React.MouseEvent) => {
    // Action buttons stopPropagation; anything else hits the card.
    if ((e.target as HTMLElement).closest('[data-item-action]')) return;
    if (selectMode) {
      onToggleSelect();
      return;
    }
    onPreview();
  };

  if (view === 'list') {
    return (
      <div
        role="button"
        tabIndex={0}
        draggable
        onDragStart={onDragStart}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (selectMode) onToggleSelect();
            else onPreview();
          }
        }}
        className={`group flex items-center gap-2 rounded-lg border p-1.5 cursor-grab active:cursor-grabbing transition-colors ${
          selected ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-border hover:bg-muted/40'
        }`}
      >
        <button
          type="button"
          data-item-action
          onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
          className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
            selected ? 'bg-primary border-primary text-primary-foreground' : 'border-border bg-background'
          }`}
          aria-label={selected ? 'Deselect' : 'Select'}
        >
          {selected && <Check size={12} />}
        </button>
        <div className="shrink-0 w-12 h-12 rounded-md overflow-hidden bg-muted border border-border/40 pointer-events-none">
          <img src={image.url} alt={label} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0 text-left pointer-events-none">
          <p className="text-xs font-medium text-foreground truncate flex items-center gap-1">
            {label}
            {image.batchId && <span title="Grid Batch"><LayoutGrid size={10} className="text-muted-foreground inline" /></span>}
          </p>
          <p className="text-[10px] text-muted-foreground">{formatGalleryDate(image.timestamp)}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          data-item-action
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
          title="Delete"
        >
          <Trash2 size={14} />
        </Button>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      draggable
      onDragStart={onDragStart}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (selectMode) onToggleSelect();
          else onPreview();
        }
      }}
      className={`group relative aspect-square rounded-xl overflow-hidden border bg-muted cursor-grab active:cursor-grabbing transition-all ${
        selected ? 'border-primary ring-2 ring-primary/30' : 'border-border/50 hover:border-border'
      }`}
    >
      <img src={image.url} alt={label} className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
      <button
        type="button"
        data-item-action
        onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
        className={`absolute top-1.5 left-1.5 z-10 w-5 h-5 rounded-md border flex items-center justify-center shadow-sm transition-colors ${
          selected
            ? 'bg-primary border-primary text-primary-foreground'
            : `bg-background/80 border-border ${selectMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`
        }`}
        aria-label={selected ? 'Deselect' : 'Select'}
      >
        {selected && <Check size={12} />}
      </button>
      <div className="absolute inset-x-0 bottom-0 px-2 py-2 bg-gradient-to-t from-black/65 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <p className="text-xs font-medium text-primary-foreground truncate drop-shadow-sm">{multiHint}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        data-item-action
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute top-1.5 right-1.5 z-10 h-7 w-7 rounded-full bg-background/80 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100"
        title="Delete"
      >
        <Trash2 size={14} />
      </Button>

      {image.batchId && (
        <div className="absolute bottom-1.5 right-1.5 z-10 h-6 px-1.5 rounded-full bg-background/80 border border-border flex items-center justify-center text-muted-foreground shadow-sm pointer-events-none" title="Part of a Grid Capture batch">
          <LayoutGrid size={12} />
        </div>
      )}
    </div>
  );
}
