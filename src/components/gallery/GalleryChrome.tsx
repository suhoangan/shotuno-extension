import type { ReactNode } from 'react';
import { CheckSquare, Download, LayoutGrid, List, Pencil, Trash2, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import type { GalleryDateFilter, GalleryViewMode } from './galleryPrefs';

interface GalleryChromeProps {
  title: string;
  subtitle: string;
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
      <div className="px-3 pt-2.5 pb-2 border-b border-border/60 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 min-h-9">
          <div className="min-w-0">
            <h2 className="font-semibold text-foreground text-sm leading-tight">
              {selecting ? `${selectedCount} selected` : title}
            </h2>
            <p className="text-[10px] text-muted-foreground truncate">
              {selecting ? 'Bulk actions' : subtitle}
            </p>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
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
                <div className="flex items-center p-0.5 rounded-md bg-muted">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 ${view === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                          onClick={() => onViewChange('grid')}
                          aria-pressed={view === 'grid'}
                        >
                          <LayoutGrid size={14} />
                        </Button>
                      }
                    />
                    <TooltipContent side="bottom" sideOffset={8}>Grid view</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-7 w-7 ${view === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                          onClick={() => onViewChange('list')}
                          aria-pressed={view === 'list'}
                        >
                          <List size={14} />
                        </Button>
                      }
                    />
                    <TooltipContent side="bottom" sideOffset={8}>List view</TooltipContent>
                  </Tooltip>
                </div>
              </>
            )}
          </div>
        </div>

        {showFilters && onFilterChange && (
          <div className="flex gap-1">
            {([
              ['all', 'All'],
              ['today', 'Today'],
              ['week', 'Week'],
            ] as const).map(([value, label]) => (
              <Button
                key={value}
                variant={filter === value ? 'secondary' : 'ghost'}
                size="sm"
                className={`h-7 px-2 text-[11px] flex-1 ${
                  filter === value ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
                }`}
                onClick={() => onFilterChange(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
