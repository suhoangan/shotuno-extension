import { Crown } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface ProBadgeProps {
  show?: boolean;
  className?: string;
}

export function ProBadge({ show = false, className }: ProBadgeProps) {
  if (!show) return null;
  return (
    <span
      className={cn(
        "absolute -top-0.5 -right-0.5 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full !bg-amber-500 !text-white dark:!bg-amber-400 dark:!text-slate-950 shadow-sm !ring-1 !ring-background pointer-events-none",
        className
      )}
      aria-hidden
    >
      <Crown className="size-2.5 fill-current shrink-0" />
    </span>
  );
}

