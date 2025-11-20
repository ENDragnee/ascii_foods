"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronsLeft, ChevronsRight, User } from 'lucide-react';
import { RootState } from '@/store';
import { toggleSidebar } from '@/store/slices/sidebarSlice';
import { useNavigationLinks, NavLink } from '@/hooks/use-navigation-links';
import { UserNav } from './user-nav';
import { Session } from '@/types';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  session: Session | null;
}

const NavItem = ({ link, isOpen }: { link: NavLink; isOpen: boolean }) => {
  const pathname = usePathname();
  const isActive = pathname === link.href;

  return (
    <Link href={link.href} passHref>
      <div
        className={`group relative flex items-center gap-4 rounded-lg px-4 py-3 transition-colors ${isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }`}
      >
        <link.icon size={20} className="flex-shrink-0" />
        <span className={`whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          {link.label}
        </span>
        {!isOpen && (
          <div className="absolute left-full z-10 ml-4 hidden rounded-md bg-card px-2 py-1 text-sm font-medium text-card-foreground shadow-md group-hover:block">
            {link.label}
          </div>
        )}
      </div>
    </Link>
  );
};

export const Sidebar = ({ session }: SidebarProps) => {
  const isOpen = useSelector((state: RootState) => state.sidebar.isOpen);
  const dispatch = useDispatch();
  const navLinks = useNavigationLinks(session);
  const router = useRouter();

  return (
    <aside
      className={`hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'
        }`}
    >
      <div className="flex h-20 items-center border-b border-sidebar-border px-6">
        <h1 className={`text-2xl font-bold text-primary transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
          KK Yellow
        </h1>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navLinks.map((link) => (
          <NavItem key={link.href} link={link} isOpen={isOpen} />
        ))}
      </nav>

      {/* User Info and Settings Popover */}
      {session ? (
        <div className="border-t border-sidebar-border p-4">
          <UserNav session={session} asChild>
            <div className="flex items-center gap-3 cursor-pointer rounded-lg p-2 hover:bg-sidebar-accent">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground">
                <User size={20} />
              </div>
              <div
                className={`flex flex-col overflow-hidden transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
              >
                <p className="truncate text-sm font-semibold text-sidebar-foreground">{session.user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
              </div>
            </div>
          </UserNav>
        </div>
      ) : (
        <Button
          className={`flex items-center gap-4 rounded-lg transition-colors bg-primary text-primary-foreground m-4`}
          onClick={() => router.push("/auth?view=signin")}>
          Sign In
        </Button>
      )}

      {/* ✅ FIX: The collapse/uncollapse button is now at the bottom */}
      <div className="border-t border-sidebar-border p-4">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-3 text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <ChevronsLeft size={20} /> : <ChevronsRight size={20} />}
        </button>
      </div>
    </aside>
  );
};
