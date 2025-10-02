/**
 * Address Form Modal Component
 *
 * Modal for adding or editing address book entries with validation
 */

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button, Input, Alert } from '@/components/ui';
import { QRScanner } from '@/components/qr';
import type {
  AddressBookEntry,
  AddressBookFormData,
  NetworkType,
} from '@/types/addressBook';
import { isValidAddress } from '@/lib/utils';

export interface AddressFormModalProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean;

  /**
   * Called when modal should close
   */
  onClose: () => void;

  /**
   * Called when form is submitted
   */
  onSubmit: (entry: AddressBookEntry) => void;

  /**
   * Entry to edit (null for new entry)
   */
  entry?: AddressBookEntry | null;
}

/**
 * Form validation schema
 */
const addressFormSchema = z.object({
  label: z
    .string()
    .min(1, 'Label is required')
    .max(50, 'Label must be 50 characters or less'),
  address: z
    .string()
    .min(1, 'Address is required')
    .refine((val) => isValidAddress(val), 'Invalid Ethereum address'),
  network: z.enum(['sepolia', 'mainnet'] as const),
  notes: z.string().max(200, 'Notes must be 200 characters or less').optional(),
});

/**
 * Address Form Modal Component
 */
export function AddressFormModal({
  isOpen,
  onClose,
  onSubmit,
  entry,
}: AddressFormModalProps) {
  const isEditing = !!entry;
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressBookFormData>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      label: entry?.label || '',
      address: entry?.address || '',
      network: entry?.network || 'sepolia',
      notes: entry?.notes || '',
    },
  });

  // Reset form when modal opens/closes or entry changes
  useEffect(() => {
    if (isOpen) {
      reset({
        label: entry?.label || '',
        address: entry?.address || '',
        network: entry?.network || 'sepolia',
        notes: entry?.notes || '',
      });
    }
  }, [isOpen, entry, reset]);

  // Handle QR scan result
  const handleQRScan = (scannedAddress: string) => {
    setValue('address', scannedAddress, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setIsQRScannerOpen(false);
  };

  // Handle form submission
  const handleFormSubmit = (data: AddressBookFormData) => {
    const now = new Date().toISOString();

    const newEntry: AddressBookEntry = {
      id: entry?.id || `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: data.label,
      address: data.address,
      network: data.network,
      notes: data.notes || undefined,
      createdAt: entry?.createdAt || now,
      updatedAt: now,
    };

    onSubmit(newEntry);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Address' : 'Add New Address'}
      closeOnBackdropClick={!isSubmitting}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Label Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Label <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            placeholder="e.g., Alice's Wallet, Exchange, etc."
            {...register('label')}
            error={errors.label?.message}
            fullWidth
          />
        </div>

        {/* Address Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Ethereum Address <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="0x..."
              {...register('address')}
              error={errors.address?.message}
              fullWidth
              disabled={isEditing} // Don't allow address change on edit
            />
            {!isEditing && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsQRScannerOpen(true)}
                className="shrink-0 px-3"
                title="Scan QR Code"
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
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </Button>
            )}
          </div>
          {isEditing && (
            <p className="text-xs text-gray-500 mt-1">
              Address cannot be changed after creation
            </p>
          )}
        </div>

        {/* Network Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Network <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 px-4 py-3 glass rounded-lg cursor-pointer hover:bg-white/10 transition-all flex-1">
              <input
                type="radio"
                value="sepolia"
                {...register('network')}
                className="w-4 h-4 text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-white">Sepolia Testnet</span>
            </label>
            <label className="flex items-center gap-2 px-4 py-3 glass rounded-lg cursor-pointer hover:bg-white/10 transition-all flex-1">
              <input
                type="radio"
                value="mainnet"
                {...register('network')}
                className="w-4 h-4 text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-white">Mainnet</span>
            </label>
          </div>
          {errors.network && (
            <p className="text-sm text-red-400 mt-1">{errors.network.message}</p>
          )}
        </div>

        {/* Notes Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Notes (Optional)
          </label>
          <textarea
            placeholder="Add any notes about this address..."
            {...register('notes')}
            rows={3}
            className={`
              w-full px-4 py-3 rounded-xl
              bg-white/5 backdrop-blur-sm
              border border-white/10
              text-white placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200
              resize-none
              ${errors.notes ? 'border-red-500' : ''}
            `}
          />
          {errors.notes && (
            <p className="text-sm text-red-400 mt-1">{errors.notes.message}</p>
          )}
        </div>

        {/* Info Alert */}
        <Alert variant="info" className="text-sm">
          Double-check the address before saving. Sending funds to an incorrect
          address may result in permanent loss.
        </Alert>

        {/* Action Buttons */}
        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Saving...'
              : isEditing
              ? 'Update Address'
              : 'Add Address'}
          </Button>
        </ModalFooter>
      </form>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onScan={handleQRScan}
        title="Scan Address QR Code"
      />
    </Modal>
  );
}
