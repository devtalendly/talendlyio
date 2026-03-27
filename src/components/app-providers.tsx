'use client';

import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { ThemeProvider } from 'next-themes';

import { Toaster } from '@/components/ui/sonner';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
      <Toaster richColors />
      <TanStackDevtools plugins={[formDevtoolsPlugin()]} />
    </>
  );
}
