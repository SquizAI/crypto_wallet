/**
 * Address Book Selector Component
 *
 * Dropdown/modal selector for choosing addresses from address book
 */

'use client';

import { useState, useMemo } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button, Input } from '@/components/ui';
import { getAddresses } from '@/services/storageService';
import type { AddressBookEntry } from '@/types/addressBook';
import { truncateAddress } from '@/lib/utils';

export interface AddressBookSelectorProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean;

  /**
   * Called when modal should close
   */
  onClose: () => void;

  /**
   * Called when an address is selected
   */
  onSelect: (address: string, label: string) => void;

  /**
   * Optional network filter
   */
  network?: 'sepolia' | 'mainnet';
}

/**
 * Address Book Selector Component
 */
export function AddressBookSelector({
  isOpen,
  onClose,
  onSelect,
  network,
}: AddressBookSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const addresses = getAddresses();

  // Filter addresses by search and network
  const filteredAddresses = useMemo(() => {
    return addresses.filter((entry) => {
      // Filter by search query
      const matchesSearch =
        entry.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.address.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by network if specified
      const matchesNetwork = !network || entry.network === network;

      return matchesSearch && matchesNetwork;
    });
  }, [addresses, searchQuery, network]);

  // Handle select
  const handleSelect = (entry: AddressBookEntry) => {
    onSelect(entry.address, entry.label);
    onClose();
    setSearchQuery(''); // Reset search
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select from Address Book"
      size="md"
    >
      <div className="space-y-4">
        {/* Search Input */}
        <Input
          type="text"
          placeholder="Search by label or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
        />

        {/* Address List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredAddresses.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 mx-auto mb-3 text-gray-600"
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
              <p className="text-gray-400">
                {searchQuery
                  ? 'No addresses found'
                  : 'No saved addresses yet'}
              </p>
            </div>
          ) : (
            filteredAddresses.map((entry) => (
              <button
                key={entry.id}
                onClick={() => handleSelect(entry)}
                className="w-full glass rounded-lg p-4 hover:bg-white/10 transition-all text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white truncate">
                        {entry.label}
                      </h4>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${
                          entry.network === 'mainnet'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}
                      >
                        {entry.network}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-gray-400 truncate">
                      {entry.address}
                    </p>
                    {entry.notes && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {entry.notes}
                      </p>
                    )}
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
