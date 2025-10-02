/**
 * Wallet Switcher Component
 *
 * Dropdown component for switching between multiple wallets.
 * Shows in sidebar/header with visual indicators for each wallet.
 *
 * Features:
 * - Shows active wallet with visual indicator
 * - Dropdown list of all wallets with colors and icons
 * - Quick wallet switching
 * - Condensed address display
 * - Responsive design for mobile/desktop
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { WALLET_COLORS, WALLET_ICONS } from '@/types/multiWallet';
import type { WalletSummary } from '@/types/multiWallet';

interface WalletSwitcherProps {
  className?: string;
  compact?: boolean;
}

export function WalletSwitcher({ className = '', compact = false }: WalletSwitcherProps) {
  const { wallets, activeWalletId, switchWallet, isMultiWallet } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Don't show if not in multi-wallet mode or less than 2 wallets
  if (!isMultiWallet || wallets.length < 2) {
    return null;
  }

  const activeWallet = wallets.find((w) => w.id === activeWalletId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSwitchWallet = (walletId: string) => {
    switchWallet(walletId);
    setIsOpen(false);
  };

  if (!activeWallet) {
    return null;
  }

  const renderWalletIcon = (wallet: WalletSummary, size: 'sm' | 'md' = 'md') => {
    const iconPath = WALLET_ICONS[wallet.icon];
    const colors = WALLET_COLORS[wallet.color];
    const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
    const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

    return (
      <div
        className={`${sizeClass} rounded-lg bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-lg ${colors.shadow}`}
      >
        <svg
          className={`${iconSize} text-white`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
        </svg>
      </div>
    );
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Active Wallet Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
          bg-white/5 border border-white/10
          hover:bg-white/10 active:bg-white/15
          transition-all duration-200
          ${isOpen ? 'ring-2 ring-blue-500/50' : ''}
        `}
        aria-label="Switch wallet"
        aria-expanded={isOpen}
      >
        {/* Wallet Icon */}
        {renderWalletIcon(activeWallet, compact ? 'sm' : 'md')}

        {/* Wallet Info */}
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-medium text-white truncate">
            {activeWallet.label}
          </div>
          {!compact && (
            <div className="text-xs font-mono text-gray-400 truncate">
              {activeWallet.address.slice(0, 6)}...{activeWallet.address.slice(-4)}
            </div>
          )}
        </div>

        {/* Dropdown Arrow */}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-2 z-50 animate-fadeIn"
          role="menu"
          aria-label="Select wallet"
        >
          <div className="glass-strong border border-white/10 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto custom-scrollbar">
            {wallets.map((wallet) => {
              const isActive = wallet.id === activeWalletId;
              const colors = WALLET_COLORS[wallet.color];

              return (
                <button
                  key={wallet.id}
                  onClick={() => handleSwitchWallet(wallet.id)}
                  disabled={isActive}
                  className={`
                    w-full flex items-center gap-3 px-3 py-3
                    border-b border-white/5 last:border-b-0
                    transition-all duration-200
                    ${
                      isActive
                        ? `bg-gradient-to-r ${colors.bg} ${colors.border} border-l-2`
                        : 'hover:bg-white/5 active:bg-white/10'
                    }
                  `}
                  role="menuitem"
                >
                  {/* Wallet Icon */}
                  {renderWalletIcon(wallet, 'sm')}

                  {/* Wallet Info */}
                  <div className="flex-1 text-left min-w-0">
                    <div className={`text-sm font-medium truncate ${isActive ? colors.text : 'text-white'}`}>
                      {wallet.label}
                    </div>
                    <div className="text-xs font-mono text-gray-400 truncate">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {wallet.type === 'hd' ? 'HD Wallet' : 'Imported'}
                    </div>
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="shrink-0">
                      <svg className={`w-5 h-5 ${colors.text}`} fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}

            {/* Manage Wallets Link */}
            <a
              href="/wallets"
              className="
                w-full flex items-center justify-center gap-2 px-3 py-3
                bg-white/5 hover:bg-white/10 active:bg-white/15
                text-blue-400 hover:text-blue-300
                text-sm font-medium
                transition-colors duration-200
                border-t border-white/10
              "
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Manage Wallets
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Wallet Switcher for Header
 */
export function CompactWalletSwitcher({ className = '' }: { className?: string }) {
  return <WalletSwitcher className={className} compact />;
}
