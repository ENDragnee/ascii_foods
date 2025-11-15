"use client";

import React from 'react';
import { usePathname } from 'next/navigation'; // ✅ FIX: Import the hook to read the URL
import { Sidebar } from './sidebar';
import { BottomBar } from './bottom-bar';
import { Session } from '@/types';
import path from 'path';

interface MainLayoutProps {
  children: React.ReactNode;
  session: Session | null;
}

export default function MainLayout({ children, session }: MainLayoutProps) {
  const pathname = usePathname();

  const isHomePage = pathname === '/';
  const isAuthPage = pathname === '/auth'

  if (isHomePage || isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar session={session} />

      <main className="flex-1 flex flex-col min-w-0 md:pb-0 pb-20">
        {children}
      </main>

      <BottomBar session={session} />
    </div>
  );
}
