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
import { useTranslation } from '../../../lib/i18n';

interface ClearAllDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shapeCount: number;
  onConfirm: () => void;
}

export function ClearAllDialog({
  open,
  onOpenChange,
  shapeCount: _shapeCount,
  onConfirm,
}: ClearAllDialogProps) {
  const { t } = useTranslation();
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogs.clearCanvasTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('dialogs.clearCanvasDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('dialogs.cancel')}</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
          >
            {t('toolbar.clear')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
