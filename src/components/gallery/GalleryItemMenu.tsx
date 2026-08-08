import { useState, type ReactNode } from 'react';
import { Download, Eye, FolderOpen, Pencil, PencilLine, Share2, Trash2 } from 'lucide-react';
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
  onDownload?: () => void;
  onShareLink?: () => void;
  onCopyCloudLink?: () => void;
  onOpenDesktop?: () => void;
  onRemove?: () => void;
}

/** Right-click menu shared by Pins and Downloads items. */
export function LibraryItemMenu({
  children,
  onEdit,
  onPreview,
  onRename,
  onDownload,
  onShareLink,
  onCopyCloudLink,
  onOpenDesktop,
  onRemove,
}: LibraryItemMenuProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <div
        className="contents"
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPos({ x: e.clientX, y: e.clientY });
          setOpen(true);
        }}
      >
        {children}
      </div>
      <DropdownMenuTrigger
        className="fixed w-0 h-0 p-0 overflow-hidden opacity-0 pointer-events-none"
        style={{ left: pos.x, top: pos.y }}
        aria-hidden
        tabIndex={-1}
      />
      <DropdownMenuContent align="start" side="bottom" sideOffset={0} className="min-w-44">
        <DropdownMenuItem onClick={onEdit}>
          <Pencil size={14} />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPreview}>
          <Eye size={14} />
          Preview
        </DropdownMenuItem>
        {onShareLink && (
          <DropdownMenuItem onClick={onShareLink}>
            <Share2 size={14} />
            Share Cloud Link
          </DropdownMenuItem>
        )}
        {onCopyCloudLink && (
          <DropdownMenuItem onClick={onCopyCloudLink}>
            <Share2 size={14} />
            Copy Cloud Link (Synced)
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
