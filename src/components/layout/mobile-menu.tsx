'use client';

import { MenuIcon } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { config } from '@/config/app';

export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open menu"
          />
        }
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>

      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>
            <Link
              href="/"
              className="text-foreground flex items-center gap-2 text-lg font-semibold tracking-tight"
            >
              <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm font-bold">
                T
              </span>
              Talendly
            </Link>
          </SheetTitle>
        </SheetHeader>

        <nav className="flex-1 px-4">
          <ul className="flex flex-col gap-1" role="list">
            {config.navLinks.map((link) => (
              <li key={link.href}>
                <SheetClose
                  render={
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground hover:bg-accent block rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                    />
                  }
                  nativeButton={false}
                >
                  {link.label}
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>

        <SheetFooter>
          <SheetClose
            render={
              <Button
                variant="outline"
                className="w-full"
                render={<Link href="/sign-in" />}
                nativeButton={false}
              />
            }
            nativeButton={false}
          >
            Log in
          </SheetClose>
          <SheetClose
            render={
              <Button
                className="w-full"
                render={<Link href="/sign-up" />}
                nativeButton={false}
              />
            }
            nativeButton={false}
          >
            Get Started
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
