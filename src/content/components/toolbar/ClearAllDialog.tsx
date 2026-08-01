import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';

interface ClearAllDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shapeCount: number;
  onConfirm: () => void;
}

export function ClearAllDialog({
  open,
  onOpenChange,
  shapeCount,
  onConfirm,
}: ClearAllDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Clear all annotations?</AlertDialogTitle>
          <AlertDialogDescription>
            {shapeCount === 1
              ? 'This removes the 1 annotation on this screenshot. You can still undo it afterwards.'
              : `This removes all ${shapeCount} annotations on this screenshot. You can still undo it afterwards.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
          >
            Clear all
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
