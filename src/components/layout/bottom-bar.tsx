"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoreHorizontal, User } from 'lucide-react';
import { useNavigationLinks } from '@/hooks/use-navigation-links';
import { Session } from '@/types';
import { UserNav } from './user-nav';

interface BottomBarProps {
  session: Session | null;
}

export const BottomBar = ({ session }: BottomBarProps) => {
  const pathname = usePathname();
  const navLinks = useNavigationLinks(session);

  return (
    // ✅ FIX: Removed `justify-around`. The `flex` property is sufficient.
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-20 items-center border-t border-sidebar-border bg-sidebar md:hidden">
      {navLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link href={link.href} key={link.href} passHref legacyBehavior>
            <a
              // ✅ FIX: Added `flex-1` to make this item grow and take up equal space.
              className={`flex h-full flex-1 flex-col items-center justify-center gap-1 p-2 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <link.icon size={24} />
              <span className="text-xs font-medium">{link.label}</span>
            </a>
          </Link>
        );
      })}

      {/* Conditional "More" or "Sign In" button */}
      {session ? (
        // ✅ FIX: Added `flex-1` to this container as well.
        <div className="flex h-full flex-1 flex-col items-center justify-center gap-1 p-2 text-muted-foreground">
          <UserNav session={session} asChild>
            <button className="flex h-full w-full flex-col items-center justify-center gap-1">
              <MoreHorizontal size={24} />
              <span className="text-xs font-medium">More</span>
            </button>
          </UserNav>
        </div>
      ) : (
        <Link href={"/auth?view=signin"} key={"signin"} passHref legacyBehavior>
          <a
            // ✅ FIX: Added `flex-1` to this link as well.
            className="flex h-full flex-1 flex-col items-center justify-center gap-1 p-2 transition-colors text-muted-foreground hover:text-foreground"
          >
            <User size={24} />
            <span className="text-xs font-medium">Sign In</span>
          </a>
        </Link>
      )}
    </nav>
  );
};
