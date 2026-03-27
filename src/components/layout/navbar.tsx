import Link from 'next/link';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { config } from '@/config/app';

export function Navbar(props: React.ComponentProps<typeof NavigationMenu>) {
  return (
    <NavigationMenu {...props}>
      <NavigationMenuList className="gap-1.5">
        {config.navLinks.map((link) => (
          <NavigationMenuItem key={link.href}>
            <NavigationMenuLink
              className="text-muted-foreground hover:text-foreground text-sm hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent"
              render={<Link href={link.href}>{link.label}</Link>}
            />
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
