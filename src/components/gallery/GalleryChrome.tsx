import type { ReactNode } from 'react';
import { CheckSquare, Download, LayoutGrid, List, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import type { GalleryDateFilter, GalleryViewMode } from './galleryPrefs';

interface GalleryChromeProps {
  title: ReactNode;
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
      <div className="px-3 py-2 border-b border-border flex items-center justify-between gap-2 h-10">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {selecting ? (
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {selectedCount} selected
            </span>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              {title}
              {subtitle && (
                <span className="text-xs text-muted-foreground truncate hidden sm:inline-block">
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
                        className="h-7 w-7 text-muted-foreground"
                        onClick={onSelectAll}
                      >
                        <CheckSquare size={14} />
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
                          className="h-7 w-7 text-muted-foreground"
                          onClick={onBulkEdit}
                        >
                          <Pencil size={14} />
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
                          className="h-7 w-7 text-muted-foreground"
                          onClick={onBulkDownload}
                        >
                          <Download size={14} />
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
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={onRequestBulkDelete}
                      >
                        <Trash2 size={14} />
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
                        className="h-7 w-7 text-muted-foreground"
                        onClick={onClearSelection}
                      >
                        <X size={14} />
                      </Button>
                    }
                  />
                  <TooltipContent side="bottom" sideOffset={8}>Clear selection</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                {headerAction}
                <div className="flex items-center p-0.5 rounded-lg bg-muted border border-border/60">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant={view === 'grid' ? 'default' : 'ghost'}
                          size="sm"
                          className={`h-6 px-1.5 rounded-md transition-all flex items-center justify-center ${
                            view === 'grid'
                              ? 'shadow-xs font-semibold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          onClick={() => onViewChange('grid')}
                          aria-pressed={view === 'grid'}
                        >
                          <LayoutGrid size={13} />
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
                          className={`h-6 px-1.5 rounded-md transition-all flex items-center justify-center ${
                            view === 'list'
                              ? 'shadow-xs font-semibold'
                              : 'text-muted-foreground hover:text-foreground'
                          }`}
                          onClick={() => onViewChange('list')}
                          aria-pressed={view === 'list'}
                        >
                          <List size={13} />
                        </Button>
                      }
                    />
                    <TooltipContent side="bottom" sideOffset={8}>List view</TooltipContent>
                  </Tooltip>
                </div>
                {showFilters && onFilterChange && (
                  <div className="flex items-center p-0.5 rounded-lg bg-muted border border-border/60">
                    {([
                      ['all', 'All'],
                      ['today', 'Today'],
                      ['week', 'Week'],
                    ] as const).map(([value, label]) => (
                      <Button
                        key={value}
                        variant={filter === value ? 'default' : 'ghost'}
                        size="sm"
                        className={`h-6 px-2.5 text-[11px] rounded-md transition-all ${
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
