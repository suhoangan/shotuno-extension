import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ensureImageExt, sanitizeBaseName } from '../../lib/imageNames';

interface RenameImageDialogProps {
  open: boolean;
  initialName: string;
  onOpenChange: (open: boolean) => void;
  onSave: (filename: string) => void;
}

export function RenameImageDialog({
  open,
  initialName,
  onOpenChange,
  onSave,
}: RenameImageDialogProps) {
  const [value, setValue] = useState(initialName);

  useEffect(() => {
    if (open) setValue(initialName.replace(/\.[a-z0-9]+$/i, ''));
  }, [open, initialName]);

  const submit = () => {
    const next = ensureImageExt(sanitizeBaseName(value, 'image'));
    onSave(next);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Rename</DialogTitle>
        </DialogHeader>
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Image name"
          className="h-9"
          autoFocus
        />
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={submit} disabled={!value.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
