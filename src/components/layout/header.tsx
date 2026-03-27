import Link from 'next/link';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { MobileMenu } from './mobile-menu';
import { Navbar } from './navbar';

export function Header() {
  return (
    <header className="border-border/50 bg-background/80 fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/">
          <Logo />
        </Link>

        <Navbar className="hidden lg:flex" />

        <div className="hidden items-center gap-3 lg:flex">
          <Button
            variant="ghost"
            size="lg"
            render={<Link href="/sign-in" />}
            nativeButton={false}
          >
            Log in
          </Button>
          <Button
            size="lg"
            render={<Link href="/sign-up" />}
            nativeButton={false}
          >
            Get Started Free
          </Button>
        </div>

        <MobileMenu />
      </div>
    </header>
  );
}
