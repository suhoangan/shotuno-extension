import { Coffee } from 'lucide-react';
import { Button } from './ui/button';
import { openSupportPage } from '../lib/support';

type BuyMeCoffeeLinkProps = {
  className?: string;
  size?: 'sm' | 'default';
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
};

/** Opens the web intro support section (marketing site only — no API). */
export function BuyMeCoffeeLink({
  className = '',
  size = 'sm',
  variant = 'outline',
}: BuyMeCoffeeLinkProps) {
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={`pointer-events-auto gap-1.5 ${className}`}
      onClick={() => openSupportPage()}
    >
      <Coffee className="size-3.5 shrink-0" aria-hidden />
      Buy me a coffee
    </Button>
  );
}
