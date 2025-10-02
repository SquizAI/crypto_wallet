/**
 * Send Transaction Modal Component
 *
 * Modal for sending token transactions with validation and gas estimation.
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal, ModalFooter, Button, Input, Dropdown, PasswordInput, Alert } from '@/components/ui';
import { useSendTransaction, useEstimateGas } from '@/hooks/useSendTransaction';
import { useBalance } from '@/hooks/useBalance';
import { useWallet } from '@/context/WalletContext';
import { getAllTokenSymbols, type TokenSymbol } from '@/constants/tokens';
import { formatAmount, isValidAddress } from '@/lib/utils';
import { AddressBookSelector } from '@/components/address-book/AddressBookSelector';

export interface SendModalProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean;

  /**
   * Called when modal should close
   */
  onClose: () => void;

  /**
   * Default token to send
   */
  defaultToken?: TokenSymbol;
}

/**
 * Form validation schema
 */
const sendFormSchema = z.object({
  tokenSymbol: z.enum(['USDC', 'USDT', 'DAI'] as const).optional(),
  recipient: z
    .string()
    .min(1, 'Recipient address is required')
    .refine((val) => isValidAddress(val), 'Invalid Ethereum address'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Amount must be greater than 0'),
  password: z.string().min(1, 'Password is required to sign transaction'),
});

type SendFormData = z.infer<typeof sendFormSchema>;

/**
 * Send Transaction Modal
 */
export function SendModal({ isOpen, onClose, defaultToken = 'USDC' }: SendModalProps) {
  const { address } = useWallet();
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SendFormData>({
    resolver: zodResolver(sendFormSchema),
    defaultValues: {
      tokenSymbol: defaultToken as 'USDC' | 'USDT' | 'DAI',
      recipient: '',
      amount: '',
      password: '',
    },
  });

  const selectedToken = watch('tokenSymbol');
  const amount = watch('amount');
  const recipient = watch('recipient');

  // Fetch balance for selected token
  const { data: balance } = useBalance((selectedToken || 'USDC') as 'USDC' | 'USDT' | 'DAI');

  // Send transaction mutation
  const { mutate: sendToken, isPending, error: sendError } = useSendTransaction();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        tokenSymbol: (defaultToken || 'USDC') as 'USDC' | 'USDT' | 'DAI',
        recipient: '',
        amount: '',
        password: '',
      });
      setTxHash(null);
      setIsSuccess(false);
    }
  }, [isOpen, defaultToken, reset]);

  // Handle form submission
  const onSubmit = (data: SendFormData) => {
    sendToken(
      {
        tokenSymbol: (data.tokenSymbol || 'USDC') as TokenSymbol,
        recipient: data.recipient,
        amount: data.amount,
        password: data.password,
      },
      {
        onSuccess: (result) => {
          setTxHash(result.hash);
          setIsSuccess(true);
        },
        onError: (error) => {
          console.error('Send transaction failed:', error);
        },
      }
    );
  };

  // Handle max button click
  const handleMaxClick = () => {
    if (balance) {
      setValue('amount', balance.balanceFormatted);
    }
  };

  // Handle address book selection
  const handleAddressBookSelect = (selectedAddress: string, label: string) => {
    setValue('recipient', selectedAddress);
    setIsAddressBookOpen(false);
  };

  // Handle close
  const handleClose = () => {
    if (!isPending) {
      onClose();
    }
  };

  // Calculate if amount exceeds balance
  const amountNum = parseFloat(amount || '0');
  const balanceNum = parseFloat(balance?.balanceFormatted || '0');
  const exceedsBalance = amountNum > balanceNum;

  // Success view
  if (isSuccess && txHash) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Transaction Sent">
        <div className="text-center py-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
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
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Transaction Submitted
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Your transaction has been submitted to the network.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
            <p className="text-sm font-mono text-gray-900 break-all">{txHash}</p>
          </div>
          <Alert variant="info" className="text-left text-sm">
            Your transaction is being processed. You can track its status in the Transactions tab.
          </Alert>
        </div>
        <ModalFooter>
          <Button onClick={handleClose} variant="primary" fullWidth>
            Done
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  // Form view
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Send Transaction"
      closeOnBackdropClick={!isPending}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Error Alert */}
        {sendError && (
          <Alert variant="error">
            {sendError.message}
          </Alert>
        )}

        {/* Token Selector */}
        <Dropdown
          label="Token"
          options={getAllTokenSymbols().map((symbol) => ({
            label: symbol,
            value: symbol,
          }))}
          {...register('tokenSymbol')}
          error={errors.tokenSymbol?.message}
          fullWidth
        />

        {/* Available Balance */}
        {balance && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              Available Balance:{' '}
              <span className="font-semibold text-gray-900">
                {formatAmount(balance.balanceFormatted, 2)} {selectedToken}
              </span>
            </p>
          </div>
        )}

        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="0x..."
              {...register('recipient')}
              error={errors.recipient?.message}
              fullWidth
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsAddressBookOpen(true)}
              title="Select from Address Book"
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('amount')}
              error={errors.amount?.message || (exceedsBalance ? 'Insufficient balance' : undefined)}
              fullWidth
            />
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleMaxClick}
              disabled={!balance}
            >
              Max
            </Button>
          </div>
        </div>

        {/* Gas Estimate (placeholder - would need actual estimation) */}
        {amount && recipient && isValidAddress(recipient) && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              Estimated Gas:{' '}
              <span className="font-semibold text-gray-900">
                ~$0.50 - $2.00
              </span>
            </p>
          </div>
        )}

        {/* Password */}
        <PasswordInput
          label="Password"
          placeholder="Enter your wallet password"
          {...register('password')}
          error={errors.password?.message}
          fullWidth
        />

        {/* Info Alert */}
        <Alert variant="info" className="text-sm">
          Double-check the recipient address. Transactions cannot be reversed.
        </Alert>

        {/* Action Buttons */}
        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isPending}
            disabled={isPending || exceedsBalance}
          >
            {isPending ? 'Sending...' : 'Send'}
          </Button>
        </ModalFooter>
      </form>

      {/* Address Book Selector */}
      <AddressBookSelector
        isOpen={isAddressBookOpen}
        onClose={() => setIsAddressBookOpen(false)}
        onSelect={handleAddressBookSelect}
        network="sepolia"
      />
    </Modal>
  );
}
