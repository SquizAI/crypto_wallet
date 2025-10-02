/**
 * Wallets Management Page
 *
 * Page for managing multiple wallets:
 * - View all wallets
 * - Switch between wallets
 * - Edit wallet labels
 * - Delete wallets (with confirmation)
 * - Create new wallets
 * - Import wallets
 *
 * Features:
 * - Grid layout of wallet cards
 * - Visual distinction with colors/icons
 * - Active wallet indicator
 * - CRUD operations for wallets
 * - Mobile-responsive design
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { WalletCard } from '@/components/wallet/WalletCard';
import {
  updateWallet as updateWalletService,
  deleteWallet as deleteWalletService,
} from '@/services/multiWalletService';
import type { WalletColor, WalletIcon } from '@/types/multiWallet';
import { WALLET_COLORS, WALLET_ICONS } from '@/types/multiWallet';

export default function WalletsPage() {
  const router = useRouter();
  const { wallets, switchWallet, refreshWallets, isUnlocked, isMultiWallet } = useWallet();
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState<WalletColor>('blue');
  const [editIcon, setEditIcon] = useState<WalletIcon>('wallet');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not unlocked
  useEffect(() => {
    if (!isUnlocked) {
      router.push('/unlock');
    }
  }, [isUnlocked, router]);

  // Redirect if not in multi-wallet mode
  useEffect(() => {
    if (!isMultiWallet) {
      router.push('/dashboard');
    }
  }, [isMultiWallet, router]);

  const handleSwitchWallet = (walletId: string) => {
    try {
      switchWallet(walletId);
      setError(null);
    } catch (err) {
      setError('Failed to switch wallet. Please try again.');
      console.error('Failed to switch wallet:', err);
    }
  };

  const handleEditWallet = (walletId: string) => {
    const wallet = wallets.find((w) => w.id === walletId);
    if (wallet) {
      setEditingWalletId(walletId);
      setEditLabel(wallet.label);
      setEditColor(wallet.color);
      setEditIcon(wallet.icon);
    }
  };

  const handleSaveEdit = () => {
    if (!editingWalletId) return;

    try {
      updateWalletService(editingWalletId, {
        label: editLabel,
        color: editColor,
        icon: editIcon,
      });

      refreshWallets();
      setEditingWalletId(null);
      setEditLabel('');
      setError(null);
    } catch (err) {
      setError('Failed to update wallet. Please try again.');
      console.error('Failed to update wallet:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditingWalletId(null);
    setEditLabel('');
  };

  const handleDeleteWallet = (walletId: string) => {
    setDeleteConfirmId(walletId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;

    setIsDeleting(true);
    setError(null);

    try {
      deleteWalletService(deleteConfirmId);
      refreshWallets();
      setDeleteConfirmId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete wallet');
      console.error('Failed to delete wallet:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  if (!isUnlocked || !isMultiWallet) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Manage Wallets
          </h1>
          <p className="text-gray-400">
            View and manage all your wallets. Switch between wallets or edit their details.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <p>{error}</p>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Wallets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              wallet={wallet}
              onSwitch={handleSwitchWallet}
              onEdit={handleEditWallet}
              onDelete={handleDeleteWallet}
            />
          ))}
        </div>

        {/* Add Wallet Button */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl glass-strong border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 text-white transition-all duration-300 group"
          >
            <svg className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">Create New Wallet</span>
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingWalletId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-strong border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Wallet</h2>

            {/* Label Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Wallet Label
              </label>
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="My Wallet"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                maxLength={32}
              />
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(WALLET_COLORS).map(([colorKey, colorValue]) => (
                  <button
                    key={colorKey}
                    onClick={() => setEditColor(colorKey as WalletColor)}
                    className={`
                      h-12 rounded-xl bg-gradient-to-br ${colorValue.gradient}
                      transition-all duration-200
                      ${
                        editColor === colorKey
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0d1117] scale-110'
                          : 'hover:scale-105 opacity-70 hover:opacity-100'
                      }
                    `}
                    aria-label={`Select ${colorKey} color`}
                  />
                ))}
              </div>
            </div>

            {/* Icon Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Icon
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(WALLET_ICONS).map(([iconKey, iconPath]) => (
                  <button
                    key={iconKey}
                    onClick={() => setEditIcon(iconKey as WalletIcon)}
                    className={`
                      h-12 rounded-xl bg-white/5 border flex items-center justify-center
                      transition-all duration-200
                      ${
                        editIcon === iconKey
                          ? 'border-blue-500 bg-blue-500/20 scale-110'
                          : 'border-white/10 hover:border-white/20 hover:scale-105'
                      }
                    `}
                    aria-label={`Select ${iconKey} icon`}
                  >
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelEdit}
                className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editLabel.trim()}
                className="flex-1 px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-strong border border-red-500/50 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Delete Wallet?</h2>
            </div>

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this wallet? This action cannot be undone.
              Make sure you have backed up your recovery phrase before deleting.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Wallet'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
