import { Crown } from 'lucide-react';

interface ProBadgeProps {
  show?: boolean;
}

export function ProBadge({ show = false }: ProBadgeProps) {
  if (!show) return null;
  return (
    <span
      className="absolute -top-0.5 -right-0.5 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-1 ring-background pointer-events-none"
      aria-hidden
    >
      <Crown size={8} className="fill-current" />
    </span>
  );
}
