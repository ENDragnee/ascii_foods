"use client";

import { LogOut, User, MoreHorizontal } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"; // Assuming Shadcn UI
import { Button } from '@/components/ui/button';
import { Session } from '@/types';

interface UserNavProps {
  session: Session | null;
  // Use 'asChild' to allow a custom trigger (like a button or div)
  asChild?: boolean;
  children?: React.ReactNode;
}

export const UserNav = ({ session, asChild = false, children }: UserNavProps) => {
  const { setTheme } = useTheme();

  if (!session?.user) return null;

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    window.location.reload();
  };

  const trigger = asChild ? children : (
    <Button variant="ghost" size="icon" className="rounded-full">
      <User className="h-5 w-5" />
    </Button>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild={asChild}>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Theme</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
