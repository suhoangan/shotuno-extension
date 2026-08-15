import { useState, type ReactNode } from 'react';
import { Copy, Download, Eye, FolderOpen, Pencil, PencilLine, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface LibraryItemMenuProps {
  children: ReactNode;
  onEdit: () => void;
  onPreview: () => void;
  onRename?: () => void;
  onCopy?: () => void;
  onDownload?: () => void;
  onOpenDesktop?: () => void;
  onRemove?: () => void;
}

/** Right-click menu shared by Pins and Downloads items. */
export function LibraryItemMenu({
  children,
  onEdit,
  onPreview,
  onRename,
  onCopy,
  onDownload,
  onOpenDesktop,
  onRemove,
}: LibraryItemMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger render={children as React.ReactElement} />
      <DropdownMenuContent 
        align="start" 
        side="bottom" 
        sideOffset={0} 
        className="min-w-44" 
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem onClick={onEdit}>
          <Pencil size={14} />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPreview}>
          <Eye size={14} />
          Preview
        </DropdownMenuItem>
        {onCopy && (
          <DropdownMenuItem onClick={onCopy}>
            <Copy size={14} />
            Copy Image
          </DropdownMenuItem>
        )}
        {onRename && (
          <DropdownMenuItem onClick={onRename}>
            <PencilLine size={14} />
            Rename
          </DropdownMenuItem>
        )}
        {onDownload && (
          <DropdownMenuItem onClick={onDownload}>
            <Download size={14} />
            Download
          </DropdownMenuItem>
        )}
        {onOpenDesktop && (
          <DropdownMenuItem onClick={onOpenDesktop}>
            <FolderOpen size={14} />
            Open on your desktop
          </DropdownMenuItem>
        )}
        {onRemove && (
          <DropdownMenuItem variant="destructive" onClick={onRemove}>
            <Trash2 size={14} />
            Remove
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
