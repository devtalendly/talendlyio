import Link from 'next/link';

import { LinkedInIcon } from '@/components/icons/linkedin';
import { TwitterIcon } from '@/components/icons/twitter';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import { config } from '@/config/app';

export function Footer() {
  return (
    <footer className="border-border/50 bg-background border-t py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/">
              <Logo />
            </Link>
            <p className="text-muted-foreground mt-4 max-w-xs text-sm leading-relaxed">
              The salary-transparent, candidate-first hiring platform for Greece
              and Cyprus.
            </p>
          </div>

          {/* Links */}
          {config.footerLinks.map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-foreground text-sm font-semibold">{title}</h4>
              <ul className="mt-4 flex flex-col gap-2.5" role="list">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground text-xs">
              {'\u00A9'} {new Date().getFullYear()} Talendly. All rights
              reserved.
            </p>
            <p className="text-muted-foreground/60 text-xs">
              GDPR compliant &middot; Your data is never sold
            </p>
          </div>
          <div className="flex items-center gap-5">
            <Link
              href="#linkedin"
              className="opacity-70 transition-opacity hover:opacity-100"
              aria-label="Talendly on LinkedIn"
            >
              <LinkedInIcon className="size-5" />
            </Link>
            <Link
              href="#twitter"
              className="opacity-70 transition-opacity hover:opacity-100"
              aria-label="Talendly on X"
            >
              <TwitterIcon className="size-5" />
            </Link>
            <Link
              href="mailto:hello@talendly.io"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              hello@talendly.io
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
