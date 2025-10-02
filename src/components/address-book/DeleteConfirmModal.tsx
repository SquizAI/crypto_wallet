/**
 * Delete Confirm Modal Component
 *
 * Confirmation dialog for deleting address book entries
 */

'use client';

import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button, Alert } from '@/components/ui';
import type { AddressBookEntry } from '@/types/addressBook';
import { truncateAddress } from '@/lib/utils';

export interface DeleteConfirmModalProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean;

  /**
   * Called when modal should close
   */
  onClose: () => void;

  /**
   * Called when deletion is confirmed
   */
  onConfirm: () => void;

  /**
   * Entry to delete
   */
  entry: AddressBookEntry | null;
}

/**
 * Delete Confirmation Modal Component
 */
export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  entry,
}: DeleteConfirmModalProps) {
  if (!entry) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Address"
      size="sm"
    >
      <div className="space-y-4">
        {/* Warning Icon */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Message */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-white mb-2">
            Are you sure?
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            You are about to delete the following address from your address book:
          </p>

          {/* Address Details */}
          <div className="glass rounded-lg p-4 text-left mb-4">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-semibold text-white">{entry.label}</p>
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
            <p className="text-xs font-mono text-gray-400 break-all">
              {entry.address}
            </p>
          </div>

          <Alert variant="error" className="text-sm text-left">
            This action cannot be undone. The address will be permanently removed
            from your address book.
          </Alert>
        </div>

        {/* Action Buttons */}
        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            fullWidth
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            fullWidth
          >
            Delete Address
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
