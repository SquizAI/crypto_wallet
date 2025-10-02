/**
 * Sidebar Component
 *
 * Comprehensive navigation sidebar with glassmorphic styling.
 * Features wallet state awareness and smooth transitions.
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { useNotifications } from '@/context/NotificationContext';
import { CompactThemeToggle } from '@/components/ui/ThemeToggle';
import { NotificationCenter } from '@/components/alerts/NotificationCenter';
import { WalletSwitcher } from '@/components/wallet/WalletSwitcher';
import { NetworkSwitcher } from '@/components/network/NetworkSwitcher';
import { useState } from 'react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  requiresUnlock?: boolean;
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    requiresUnlock: true,
  },
  {
    href: '/send',
    label: 'Send',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    ),
    requiresUnlock: true,
  },
  {
    href: '/receive',
    label: 'Receive',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>
    ),
    requiresUnlock: true,
  },
  {
    href: '/swap',
    label: 'Swap',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    requiresUnlock: true,
  },
  {
    href: '/transactions',
    label: 'Transactions',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    requiresUnlock: true,
  },
  {
    href: '/address-book',
    label: 'Address Book',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    requiresUnlock: true,
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    requiresUnlock: true,
  },
  {
    href: '/alerts',
    label: 'Price Alerts',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    requiresUnlock: true,
  },
  {
    href: '/wallets',
    label: 'Wallets',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    requiresUnlock: true,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    requiresUnlock: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isUnlocked, lock, address } = useWallet();
  const { unreadCount } = useNotifications();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLockWallet = () => {
    lock();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fadeIn"
          onClick={() => setIsCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen z-50
          transition-all duration-300 ease-in-out
          ${isCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
          lg:sticky lg:top-0
          w-64 lg:w-64
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        <div
          className="h-full w-full glass-strong border-r border-white/10 flex flex-col"
          style={{
            backgroundColor: 'rgba(13, 17, 23, 0.95)',
          }}
        >
          {/* Logo & Toggle */}
          <div className="p-4 sm:p-6 border-b border-white/10 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-white">Wallet</h1>
              </div>

              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="lg:hidden text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10 active:bg-white/20 touch-manipulation"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Wallet Switcher or Wallet Address */}
            <div className="mt-3 sm:mt-4 space-y-2">
              <WalletSwitcher />
              {/* Show simple address if not multi-wallet mode */}
              {address && !WalletSwitcher && (
                <div className="px-2 sm:px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-gray-400 mb-1">Wallet Address</p>
                  <p className="text-xs sm:text-sm font-mono text-white truncate">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </p>
                </div>
              )}

              {/* Network Switcher */}
              {isUnlocked && (
                <div className="pt-2">
                  <NetworkSwitcher />
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const isDisabled = item.requiresUnlock && !isUnlocked;

              return (
                <Link
                  key={item.href}
                  href={isDisabled ? '#' : item.href}
                  onClick={(e) => {
                    if (isDisabled) {
                      e.preventDefault();
                    } else {
                      setIsCollapsed(true);
                    }
                  }}
                  className={`
                    flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl
                    transition-all duration-300
                    touch-manipulation
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white border border-blue-500/50 shadow-lg shadow-blue-500/20'
                        : isDisabled
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 hover:text-white hover:bg-white/5 active:bg-white/10'
                    }
                  `}
                >
                  <div className={isActive ? 'text-blue-400' : ''}>{item.icon}</div>
                  <span className="text-sm sm:text-base font-medium">{item.label}</span>
                  {isDisabled && (
                    <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  )}
                  {item.href === '/alerts' && unreadCount > 0 && !isDisabled && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-3 sm:p-4 border-t border-white/10 shrink-0 space-y-2">
            {/* Theme Toggle */}
            <CompactThemeToggle className="w-full justify-center" />

            {/* Lock Wallet Button */}
            {isUnlocked && (
              <button
                onClick={handleLockWallet}
                className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 active:bg-red-500/20 transition-all duration-300 touch-manipulation"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm sm:text-base font-medium">Lock Wallet</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsCollapsed(false)}
        className={`
          fixed top-4 left-4 z-30 lg:hidden
          p-2.5 sm:p-3 rounded-xl glass-strong border border-white/10
          text-white transition-all duration-300
          touch-manipulation
          shadow-lg
          ${isCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        aria-label="Open menu"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
}
