"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import { useNavigationLinks } from '@/hooks/use-navigation-links';
import { Session } from '@/types';
import { UserNav } from './user-nav'; // Import the UserNav popover

interface BottomBarProps {
  session: Session | null;
}

export const BottomBar = ({ session }: BottomBarProps) => {
  const pathname = usePathname();
  const navLinks = useNavigationLinks(session);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center justify-around border-t border-sidebar-border bg-sidebar md:hidden">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link href={link.href} key={link.href} passHref>
            <div
              className={`flex h-full w-full flex-col items-center justify-center gap-1 p-2 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <link.icon size={24} />
              <span className="text-xs font-medium">{link.label}</span>
            </div>
          </Link>
        );
      })}

      {/* ✅ NEW: "More" button that triggers the UserNav popover */}
      {session && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-muted-foreground">
          <UserNav session={session} asChild>
            <button className="flex h-full w-full flex-col items-center justify-center gap-1">
              <MoreHorizontal size={24} />
              <span className="text-xs font-medium">More</span>
            </button>
          </UserNav>
        </div>
      )}
    </nav>
  );
};
