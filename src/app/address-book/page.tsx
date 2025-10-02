/**
 * Address Book Page
 *
 * Manage saved wallet addresses with search, filter, and CRUD operations
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { Button, Input, Alert } from '@/components/ui';
import {
  getAddresses,
  saveAddress,
  deleteAddress,
} from '@/services/storageService';
import type { AddressBookEntry, NetworkType } from '@/types/addressBook';
import { truncateAddress, copyToClipboard } from '@/lib/utils';
import { AddressFormModal } from '@/components/address-book/AddressFormModal';
import { DeleteConfirmModal } from '@/components/address-book/DeleteConfirmModal';

/**
 * Address Book Page Component
 */
export default function AddressBookPage() {
  const router = useRouter();
  const { isUnlocked } = useWallet();
  const [addresses, setAddresses] = useState<AddressBookEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType | 'all'>(
    'all'
  );
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<AddressBookEntry | null>(
    null
  );
  const [deletingEntry, setDeletingEntry] = useState<AddressBookEntry | null>(
    null
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load addresses on mount
  useEffect(() => {
    setAddresses(getAddresses());
    setIsLoaded(true);
  }, []);

  // Redirect if not unlocked
  useEffect(() => {
    if (isLoaded && !isUnlocked) {
      router.push('/unlock');
    }
  }, [isLoaded, isUnlocked, router]);

  if (!isLoaded || !isUnlocked) {
    return null;
  }

  // Filter addresses based on search and network
  const filteredAddresses = useMemo(() => {
    return addresses.filter((entry) => {
      // Filter by search query
      const matchesSearch =
        entry.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.notes?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by network
      const matchesNetwork =
        selectedNetwork === 'all' || entry.network === selectedNetwork;

      return matchesSearch && matchesNetwork;
    });
  }, [addresses, searchQuery, selectedNetwork]);

  // Handle copy address
  const handleCopyAddress = async (address: string, id: string) => {
    try {
      await copyToClipboard(address);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      setError('Failed to copy address');
    }
  };

  // Handle add new address
  const handleAddAddress = () => {
    setEditingEntry(null);
    setIsFormModalOpen(true);
  };

  // Handle edit address
  const handleEditAddress = (entry: AddressBookEntry) => {
    setEditingEntry(entry);
    setIsFormModalOpen(true);
  };

  // Handle delete address
  const handleDeleteAddress = (entry: AddressBookEntry) => {
    setDeletingEntry(entry);
    setIsDeleteModalOpen(true);
  };

  // Handle form submit
  const handleFormSubmit = (entry: AddressBookEntry) => {
    try {
      saveAddress(entry);
      setAddresses(getAddresses());
      setIsFormModalOpen(false);
      setEditingEntry(null);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save address'
      );
    }
  };

  // Handle delete confirm
  const handleDeleteConfirm = () => {
    if (!deletingEntry) return;

    try {
      deleteAddress(deletingEntry.id);
      setAddresses(getAddresses());
      setIsDeleteModalOpen(false);
      setDeletingEntry(null);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete address'
      );
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Address Book
          </h1>
          <p className="text-gray-400">
            Manage your saved wallet addresses
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Search and Filter */}
        <div className="glass-strong rounded-2xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search Input */}
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by label, address, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                fullWidth
              />
            </div>

            {/* Network Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedNetwork('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedNetwork === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'glass text-gray-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedNetwork('sepolia')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedNetwork === 'sepolia'
                    ? 'bg-blue-500 text-white'
                    : 'glass text-gray-400 hover:text-white'
                }`}
              >
                Sepolia
              </button>
              <button
                onClick={() => setSelectedNetwork('mainnet')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedNetwork === 'mainnet'
                    ? 'bg-blue-500 text-white'
                    : 'glass text-gray-400 hover:text-white'
                }`}
              >
                Mainnet
              </button>
            </div>

            {/* Add Button */}
            <Button
              variant="primary"
              onClick={handleAddAddress}
              className="whitespace-nowrap"
            >
              <svg
                className="w-5 h-5 mr-2 inline-block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Address
            </Button>
          </div>

          {/* Results Count */}
          <p className="text-sm text-gray-400">
            {filteredAddresses.length} address
            {filteredAddresses.length !== 1 ? 'es' : ''} found
          </p>
        </div>

        {/* Address List */}
        {filteredAddresses.length === 0 ? (
          <div className="glass-strong rounded-2xl p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">
              No addresses found
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || selectedNetwork !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by adding your first address'}
            </p>
            {!searchQuery && selectedNetwork === 'all' && (
              <Button variant="primary" onClick={handleAddAddress}>
                Add Your First Address
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAddresses.map((entry) => (
              <div
                key={entry.id}
                className="glass-strong rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Address Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {entry.label}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          entry.network === 'mainnet'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {entry.network}
                      </span>
                    </div>

                    {/* Address */}
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-mono text-gray-400 truncate sm:hidden">
                        {truncateAddress(entry.address, 6)}
                      </p>
                      <p className="text-sm font-mono text-gray-400 truncate hidden sm:block">
                        {entry.address}
                      </p>
                      <button
                        onClick={() =>
                          handleCopyAddress(entry.address, entry.id)
                        }
                        className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
                        title="Copy address"
                      >
                        {copiedId === entry.id ? (
                          <svg
                            className="w-4 h-4 text-green-400"
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
                            className="w-4 h-4"
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
                    </div>

                    {/* Notes */}
                    {entry.notes && (
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {entry.notes}
                      </p>
                    )}

                    {/* Timestamps */}
                    <p className="text-xs text-gray-600 mt-2">
                      Added {new Date(entry.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleEditAddress(entry)}
                      className="px-4 py-2 rounded-lg glass text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                      title="Edit"
                    >
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(entry)}
                      className="px-4 py-2 rounded-lg glass text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                      title="Delete"
                    >
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AddressFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={handleFormSubmit}
        entry={editingEntry}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingEntry(null);
        }}
        onConfirm={handleDeleteConfirm}
        entry={deletingEntry}
      />
    </div>
  );
}
