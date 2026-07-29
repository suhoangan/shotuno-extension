import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { openProPricing } from '../../lib/entitlements/requirePro';
import { webUrl } from '../../lib/api';

interface ProPaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  needAuth?: boolean;
}

export function ProPaywall({
  open,
  onOpenChange,
  title = 'Pro feature',
  description = 'This tool needs a Pro plan or remaining trial credits.',
  needAuth = false,
}: ProPaywallProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="pointer-events-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>{needAuth ? 'Sign in required' : title}</AlertDialogTitle>
          <AlertDialogDescription>
            {needAuth
              ? 'Log in on the Shotuno website so Pro and trial credits sync to the extension.'
              : description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Not now</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (needAuth) window.open(webUrl('/login'), '_blank');
              else openProPricing();
            }}
          >
            {needAuth ? 'Log in' : 'Upgrade — $4.99/mo'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
