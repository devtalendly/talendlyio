'use client';

import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const ThemeSwitcher = ({ className }: React.ComponentProps<'div'>) => {
  const { setTheme, theme } = useTheme();

  const activeTheme = theme ?? 'system';

  function handleThemeChange(nextTheme: 'system' | 'light' | 'dark') {
    setTheme(nextTheme);
  }

  return (
    <div
      className={cn(
        'bg-background ring-border relative isolate flex items-center rounded-full p-0.5 ring-1',
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="System theme"
        className={cn(
          'text-muted-foreground hover:text-foreground relative rounded-full',
          activeTheme === 'system' &&
            'border-border bg-muted text-foreground hover:bg-muted hover:text-foreground',
        )}
        onClick={() => handleThemeChange('system')}
      >
        <MonitorIcon className="relative z-10 m-auto" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Light theme"
        className={cn(
          'text-muted-foreground hover:text-foreground relative rounded-full',
          activeTheme === 'light' &&
            'border-border bg-muted text-foreground hover:bg-muted hover:text-foreground',
        )}
        onClick={() => handleThemeChange('light')}
      >
        <SunIcon className="relative z-10 m-auto" />
      </Button>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label="Dark theme"
        className={cn(
          'text-muted-foreground hover:text-foreground relative rounded-full',
          activeTheme === 'dark' &&
            'border-border bg-muted text-foreground hover:bg-muted hover:text-foreground',
        )}
        onClick={() => handleThemeChange('dark')}
      >
        <MoonIcon className="relative z-10 m-auto" />
      </Button>
    </div>
  );
};
