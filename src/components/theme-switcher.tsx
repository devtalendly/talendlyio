'use client';

import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const ThemeSwitcher = ({ className }: React.ComponentProps<'div'>) => {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <div
      className={cn(
        'ring-border relative isolate flex h-8 rounded-full p-1 ring-1',
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="System theme"
        className={cn(
          'hover:border-accent-foreground relative rounded-full',
          resolvedTheme === 'system' && 'border-accent',
        )}
        onClick={() => setTheme('system')}
      >
        <MonitorIcon className="text-accent-foreground relative z-10 m-auto size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Light theme"
        className={cn(
          'hover:border-accent-foreground relative rounded-full',
          resolvedTheme === 'light' && 'border-accent',
        )}
        onClick={() => setTheme('light')}
      >
        <SunIcon className="text-accent-foreground relative z-10 m-auto size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Dark theme"
        className={cn(
          'hover:border-accent-foreground relative rounded-full',
          resolvedTheme === 'dark' && 'border-accent',
        )}
        onClick={() => setTheme('dark')}
      >
        <MoonIcon className="text-accent-foreground relative z-10 m-auto size-4" />
      </Button>
    </div>
  );
};
