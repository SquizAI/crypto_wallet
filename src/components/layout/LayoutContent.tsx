/**
 * Layout Content Component
 *
 * Handles routing logic and conditional sidebar display.
 * Shows sidebar only when wallet is unlocked and not on auth pages.
 */

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { Sidebar } from './Sidebar';
import { LockWarningBanner } from './LockWarningBanner';
import { BackupReminderWrapper } from '@/components/backup/BackupReminderWrapper';
import { NotificationCenter } from '@/components/alerts/NotificationCenter';

const AUTH_ROUTES = ['/onboarding', '/unlock', '/create-wallet', '/import-wallet'];

interface LayoutContentProps {
  children: React.ReactNode;
}

export function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasExistingWallet, isUnlocked } = useWallet();

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname?.startsWith(route));
  const showSidebar = !isAuthRoute && isUnlocked;

  // Routing logic
  useEffect(() => {
    // Skip routing on auth pages or landing page
    if (isAuthRoute || pathname === '/') return;

    const walletExists = hasExistingWallet();

    // No wallet exists -> redirect to home/landing
    if (!walletExists) {
      router.push('/');
      return;
    }

    // Wallet exists but locked -> redirect to unlock
    if (walletExists && !isUnlocked && pathname !== '/unlock') {
      router.push('/unlock');
      return;
    }

    // Wallet unlocked -> ensure not on unlock page
    if (isUnlocked && pathname === '/unlock') {
      router.push('/');
      return;
    }
  }, [pathname, hasExistingWallet, isUnlocked, isAuthRoute, router]);

  if (showSidebar) {
    return (
      <>
        <LockWarningBanner />
        <BackupReminderWrapper />
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-h-screen relative">
            {/* Notification Center - Fixed position in top right */}
            <div className="fixed top-4 right-4 z-40">
              <NotificationCenter />
            </div>
            {children}
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <BackupReminderWrapper />
      {children}
    </>
  );
}
