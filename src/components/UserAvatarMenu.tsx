import { ChevronDown, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { userInitials } from '../lib/userInitials';

type Props = {
  name: string | null;
  email: string | null;
  onLogout: () => void | Promise<void>;
};

/** Same trigger as shotuno-web: square avatar + chevron pill. */
export function UserAvatarMenu({ name, email, onLogout }: Props) {
  const label = name || email || 'Account';
  const initials = userInitials(name, email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            className="h-9 gap-0 rounded-full border-border bg-background p-0 pl-1 pr-1.5 hover:bg-muted"
            aria-label="Account menu"
          >
            <Avatar className="size-7 rounded-md after:rounded-md">
              <AvatarFallback
                delay={0}
                className="rounded-md bg-muted text-xs font-semibold text-foreground"
              >
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="ml-0.5 flex size-6 items-center justify-center rounded-full text-muted-foreground">
              <ChevronDown className="size-4 shrink-0" aria-hidden />
            </span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-0.5">
              <span className="truncate text-sm font-medium text-foreground">
                {label}
              </span>
              {name && email ? (
                <span className="truncate text-xs text-muted-foreground">
                  {email}
                </span>
              ) : null}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="gap-2"
          onClick={() => void onLogout()}
        >
          <LogOut className="size-4 shrink-0 text-destructive" aria-hidden />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
