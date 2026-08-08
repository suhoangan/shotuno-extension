import { LogIn, Sparkles, ExternalLink, LogOut, Crown, ChevronDown } from 'lucide-react';
import { useAuthUser } from '../lib/useAuthUser';
import { webUrl } from '../lib/api';
import {
  dailyCreditsRemaining,
  hasUnlimitedCredits,
  licenseStatusOf,
} from '../lib/entitlements/license';
import { Avatar, AvatarFallback, AvatarImage, AvatarBadge } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function UserAccountHeader({ compact = false }: { compact?: boolean }) {
  const { authUser, loading, loginViaWeb, logout } = useAuthUser();

  if (loading) {
    return (
      <div className="h-9 w-9 rounded-full bg-muted animate-pulse shrink-0" />
    );
  }

  if (!authUser) {
    if (compact) {
      return (
        <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={loginViaWeb}>
          <LogIn size={14} />
          Log in
        </Button>
      );
    }
    return (
      <div className="p-3 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
          <Sparkles size={14} className="text-primary" />
          <span>Sign in for 15 Free AI Credits</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-snug">
          Sync your account and unlock AI Smart Parse, OCR &amp; Sensitive Data Blur.
        </p>
        <Button size="sm" className="mt-1 w-full gap-2 text-xs" onClick={loginViaWeb}>
          <LogIn size={14} />
          Log in via Web
          <ExternalLink size={12} className="opacity-70" />
        </Button>
      </div>
    );
  }

  const license = licenseStatusOf(authUser);
  const unlimited = hasUnlimitedCredits(authUser);
  const credits = dailyCreditsRemaining(authUser);
  const fullName = authUser.name || authUser.email || 'User Account';
  const avatarChar = fullName.charAt(0).toUpperCase();
  const planLabel = license === 'PRO' ? 'PRO' : 'FREE';
  const creditsLabel = unlimited
    ? 'Unlimited credits'
    : `${credits} credits left`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="h-9 gap-0 rounded-full border-border bg-background p-0 pl-1 pr-1.5 hover:bg-muted"
            aria-label="Account menu"
          >
            <Avatar className="size-7 rounded-full">
              {authUser.avatarUrl ? (
                <AvatarImage src={authUser.avatarUrl} alt={fullName} />
              ) : null}
              <AvatarFallback className="bg-muted text-[11px] font-semibold text-muted-foreground">
                {avatarChar}
              </AvatarFallback>
              {license === 'PRO' && (
                <AvatarBadge>
                  <Crown className="fill-current" />
                </AvatarBadge>
              )}
            </Avatar>
            <span className="ml-0.5 flex size-6 items-center justify-center rounded-full text-muted-foreground">
              <ChevronDown className="size-4 shrink-0" aria-hidden />
            </span>
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-64 p-2 bg-card border border-border shadow-xl rounded-xl z-[99999999]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-2 space-y-1 font-normal">
            <div className="text-xs font-bold text-foreground truncate">{fullName}</div>
            {authUser.email && (
              <div className="text-[11px] text-muted-foreground truncate">
                {authUser.email}
              </div>
            )}
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-muted border-border text-foreground">
                {planLabel}
              </span>
              <span className="text-[10px] font-semibold text-primary">
                {creditsLabel}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1 bg-border/40" />

        <DropdownMenuItem
          onClick={() => window.open(webUrl('/dashboard'), '_blank')}
          className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg"
        >
          <ExternalLink size={14} className="text-primary" />
          <span>Open Web Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          variant="destructive"
          onClick={() => void logout()}
          className="flex items-center gap-2 text-xs font-medium cursor-pointer p-2 rounded-lg"
        >
          <LogOut size={14} />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
