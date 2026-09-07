import type { ReactNode } from 'react';
import { CheckSquare, Download, LayoutGrid, List, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import type { GalleryDateFilter, GalleryViewMode } from './galleryPrefs';

interface GalleryChromeProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  view: GalleryViewMode;
  selectedCount: number;
  onViewChange: (view: GalleryViewMode) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onRequestBulkDelete: () => void;
  /** Date filters — Downloads only */
  filter?: GalleryDateFilter;
  onFilterChange?: (filter: GalleryDateFilter) => void;
  showFilters?: boolean;
  headerAction?: ReactNode;
  bulkDeleteLabel?: string;
  onBulkDownload?: () => void;
  onBulkEdit?: () => void;
}

export function GalleryChrome({
  title,
  subtitle,
  view,
  selectedCount,
  onViewChange,
  onSelectAll,
  onClearSelection,
  onRequestBulkDelete,
  filter = 'all',
  onFilterChange,
  showFilters = false,
  headerAction,
  bulkDeleteLabel = 'Delete',
  onBulkDownload,
  onBulkEdit,
}: GalleryChromeProps) {
  const selecting = selectedCount > 0;

  return (
    <TooltipProvider delay={300}>
      <div className="px-3 py-1.5 border-b border-border/70 bg-muted/20 flex items-center justify-between gap-2 min-h-[37px] shrink-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selecting ? (
            <span className="text-xs font-semibold text-foreground whitespace-nowrap">
              {selectedCount} selected
            </span>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              {title && <span className="text-xs font-semibold text-foreground truncate">{title}</span>}
              {subtitle && (
                <span className="text-[11px] text-muted-foreground truncate">
                  {subtitle}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {selecting ? (
            <>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground"
                      onClick={onSelectAll}
                    >
                      <CheckSquare size={13} />
                    </Button>
                  }
                />
                <TooltipContent side="bottom" sideOffset={8}>Select all</TooltipContent>
              </Tooltip>
              {onBulkEdit && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground"
                        onClick={onBulkEdit}
                      >
                        <Pencil size={13} />
                      </Button>
                    }
                  />
                  <TooltipContent side="bottom" sideOffset={8}>Edit</TooltipContent>
                </Tooltip>
              )}
              {onBulkDownload && (
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground"
                        onClick={onBulkDownload}
                      >
                        <Download size={13} />
                      </Button>
                    }
                  />
                  <TooltipContent side="bottom" sideOffset={8}>{`Download (${selectedCount})`}</TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={onRequestBulkDelete}
                    >
                      <Trash2 size={13} />
                    </Button>
                  }
                />
                <TooltipContent side="bottom" sideOffset={8}>{`${bulkDeleteLabel} (${selectedCount})`}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground"
                      onClick={onClearSelection}
                    >
                      <X size={13} />
                    </Button>
                  }
                />
                <TooltipContent side="bottom" sideOffset={8}>Clear selection</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <>
              {headerAction}
              <div className="flex items-center p-0.5 rounded-md bg-muted border border-border/60">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant={view === 'grid' ? 'default' : 'ghost'}
                        size="sm"
                        className={`h-5 px-1.5 rounded transition-all flex items-center justify-center ${
                          view === 'grid'
                            ? 'shadow-xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => onViewChange('grid')}
                        aria-pressed={view === 'grid'}
                      >
                        <LayoutGrid size={12} />
                      </Button>
                    }
                  />
                  <TooltipContent side="bottom" sideOffset={8}>Grid view</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant={view === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        className={`h-5 px-1.5 rounded transition-all flex items-center justify-center ${
                          view === 'list'
                            ? 'shadow-xs font-semibold'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => onViewChange('list')}
                        aria-pressed={view === 'list'}
                      >
                        <List size={12} />
                      </Button>
                    }
                  />
                  <TooltipContent side="bottom" sideOffset={8}>List view</TooltipContent>
                </Tooltip>
              </div>

              {showFilters && onFilterChange && (
                <div className="flex items-center p-0.5 rounded-md bg-muted border border-border/60">
                  {([
                    ['all', 'All'],
                    ['today', 'Today'],
                    ['week', 'Week'],
                  ] as const).map(([value, label]) => (
                    <Button
                      key={value}
                      variant={filter === value ? 'default' : 'ghost'}
                      size="sm"
                      className={`h-5 px-2 text-[10px] rounded transition-all ${
                        filter === value
                          ? 'shadow-xs font-semibold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => onFilterChange(value)}
                      aria-pressed={filter === value}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
