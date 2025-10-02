/**
 * Wallet Card Component
 *
 * Displays individual wallet information in wallet management view.
 * Shows wallet details with action buttons for editing and deleting.
 *
 * Features:
 * - Visual distinction with colors and icons
 * - Wallet label and address display
 * - Type indicator (HD/Imported)
 * - Active wallet indicator
 * - Edit and delete actions
 * - Responsive glassmorphic design
 */

'use client';

import { useState } from 'react';
import { WALLET_COLORS, WALLET_ICONS } from '@/types/multiWallet';
import type { WalletSummary } from '@/types/multiWallet';

interface WalletCardProps {
  wallet: WalletSummary;
  onSwitch: (walletId: string) => void;
  onEdit: (walletId: string) => void;
  onDelete: (walletId: string) => void;
  showActions?: boolean;
}

export function WalletCard({
  wallet,
  onSwitch,
  onEdit,
  onDelete,
  showActions = true,
}: WalletCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const colors = WALLET_COLORS[wallet.color];
  const iconPath = WALLET_ICONS[wallet.icon];

  const handleSwitch = () => {
    if (!wallet.isActive) {
      onSwitch(wallet.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit(wallet.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete(wallet.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div
      className={`
        relative glass-strong rounded-xl p-4 sm:p-6
        border transition-all duration-300
        ${
          wallet.isActive
            ? `${colors.border} ${colors.bg} ring-2 ring-offset-2 ring-offset-[#0d1117] ${colors.shadow}`
            : 'border-white/10 hover:border-white/20'
        }
        ${!wallet.isActive ? 'cursor-pointer hover:scale-[1.02]' : ''}
      `}
      onClick={handleSwitch}
      role="button"
      tabIndex={wallet.isActive ? -1 : 0}
      aria-label={`Switch to ${wallet.label}`}
    >
      {/* Active Badge */}
      {wallet.isActive && (
        <div
          className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} border ${colors.border}`}
        >
          Active
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Wallet Icon */}
        <div
          className={`
            w-14 h-14 sm:w-16 sm:h-16 rounded-xl
            bg-gradient-to-br ${colors.gradient}
            flex items-center justify-center
            shadow-lg ${colors.shadow}
            shrink-0
          `}
        >
          <svg
            className="w-7 h-7 sm:w-8 sm:h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
        </div>

        {/* Wallet Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                {wallet.label}
              </h3>
              <p className="text-sm font-mono text-gray-400 mt-1 truncate">
                {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
              </p>
            </div>

            {/* Actions Menu */}
            {showActions && !wallet.isActive && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                  className="p-2 rounded-lg hover:bg-white/10 active:bg-white/20 text-gray-400 hover:text-white transition-colors"
                  aria-label="Wallet actions"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>

                {showMenu && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(false);
                      }}
                    />

                    {/* Menu */}
                    <div className="absolute right-0 top-full mt-2 z-20 w-48 glass-strong border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
                      <button
                        onClick={handleEdit}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 active:bg-white/20 text-white transition-colors border-b border-white/5"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit Label
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-500/10 active:bg-red-500/20 text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete Wallet
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span>{wallet.type === 'hd' ? 'HD Wallet' : 'Imported'}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>Created {formatDate(wallet.createdAt)}</span>
            </div>

            {wallet.lastUsedAt && (
              <div className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Used {formatDate(wallet.lastUsedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Switch Hint (only for non-active wallets) */}
      {!wallet.isActive && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Click to switch to this wallet
          </p>
        </div>
      )}
    </div>
  );
}
