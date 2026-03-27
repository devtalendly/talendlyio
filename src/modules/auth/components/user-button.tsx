'use client';

import { LogOutIcon, SettingsIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut, useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/theme-switcher';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('');
}

export function UserButton() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (isSessionPending || !session?.user) {
    return (
      <Button
        render={<Link href="/sign-in">Sign in</Link>}
        nativeButton={false}
      />
    );
  }

  const { name, email, image } = session.user;
  const initials = getInitials(name);

  function handleSignOut() {
    startTransition(async () => {
      await signOut({
        fetchOptions: {
          onSuccess: () => router.push('/sign-in'),
        },
      });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="User menu"
        className="focus-visible:ring-ring focus-visible:ring-offset-background rounded-full outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <Avatar size="lg">
          {image && <AvatarImage src={image} alt={name} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <Avatar>
            {image && <AvatarImage src={image} alt={name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{name}</span>
            <span className="text-muted-foreground truncate text-xs">
              {email}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => router.push('/settings')}
            className="cursor-pointer"
          >
            <SettingsIcon />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            Theme
            <ThemeSwitcher className="ml-auto" />
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuItem
          variant="destructive"
          onClick={handleSignOut}
          disabled={isPending}
          className="cursor-pointer"
        >
          <LogOutIcon />
          {isPending ? 'Signing out…' : 'Sign out'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
