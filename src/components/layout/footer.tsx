import Link from 'next/link';

import { Separator } from '@/components/ui/separator';
import { config } from '@/config/app';

export function Footer() {
  return (
    <footer className="border-border/50 bg-background border-t py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="text-foreground flex items-center gap-2 text-lg font-semibold tracking-tight"
            >
              <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm font-bold">
                T
              </span>
              Talendly
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

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            {'\u00A9'} {new Date().getFullYear()} Talendly. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="#linkedin"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
              aria-label="LinkedIn"
            >
              LinkedIn
            </Link>
            <Link
              href="#twitter"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
              aria-label="X (formerly Twitter)"
            >
              X
            </Link>
            <Link
              href="mailto:hello@talendly.io"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              hello@talendly.io
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
