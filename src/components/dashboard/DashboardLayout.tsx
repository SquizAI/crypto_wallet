/**
 * Dashboard Layout Component
 *
 * Main layout for the dashboard with header, navigation, and content area.
 * Provides responsive design and navigation between tabs.
 */

'use client';

import { useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import { Button } from '@/components/ui';
import { truncateAddress, copyToClipboard } from '@/lib/utils';

export type DashboardTab = 'wallet' | 'transactions' | 'settings';

export interface DashboardLayoutProps {
  /**
   * Dashboard content
   */
  children: React.ReactNode;

  /**
   * Active tab
   * @default 'wallet'
   */
  activeTab?: DashboardTab;

  /**
   * Called when tab changes
   */
  onTabChange?: (tab: DashboardTab) => void;

  /**
   * Additional class names
   */
  className?: string;
}

/**
 * Dashboard Layout Component
 */
export function DashboardLayout({
  children,
  activeTab = 'wallet',
  onTabChange,
  className = '',
}: DashboardLayoutProps) {
  const { address, lock } = useWallet();
  const [copied, setCopied] = useState(false);

  // Handle copy address
  const handleCopyAddress = async () => {
    if (address) {
      try {
        await copyToClipboard(address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  // Handle logout
  const handleLogout = () => {
    if (confirm('Are you sure you want to lock your wallet?')) {
      lock();
    }
  };

  // Handle tab click
  const handleTabClick = (tab: DashboardTab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Stablecoin Wallet</h1>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Wallet Address */}
              {address && (
                <button
                  onClick={handleCopyAddress}
                  className="
                    hidden sm:flex items-center gap-2 px-4 py-2
                    bg-gray-100 hover:bg-gray-200
                    rounded-lg transition-colors
                  "
                  aria-label="Copy wallet address"
                >
                  <span className="text-sm font-medium text-gray-700">
                    {truncateAddress(address)}
                  </span>
                  {copied ? (
                    <svg
                      className="w-4 h-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              )}

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                aria-label="Lock wallet"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Lock</span>
                </span>
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-1 -mb-px" role="tablist">
            <TabButton
              active={activeTab === 'wallet'}
              onClick={() => handleTabClick('wallet')}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              }
            >
              Wallet
            </TabButton>
            <TabButton
              active={activeTab === 'transactions'}
              onClick={() => handleTabClick('transactions')}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            >
              Transactions
            </TabButton>
            <TabButton
              active={activeTab === 'settings'}
              onClick={() => handleTabClick('settings')}
              icon={
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              }
            >
              Settings
            </TabButton>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

/**
 * Tab Button Component
 */
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function TabButton({ active, onClick, icon, children }: TabButtonProps) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-3
        border-b-2 font-medium text-sm
        transition-colors
        ${
          active
            ? 'border-blue-500 text-blue-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }
      `}
    >
      {icon}
      <span className="hidden sm:inline">{children}</span>
    </button>
  );
}
