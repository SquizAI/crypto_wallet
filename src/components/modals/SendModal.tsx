/**
 * Send Modal Component
 *
 * Functional send transaction modal with real blockchain integration.
 * Features form validation, gas estimation, and transaction tracking.
 */

'use client';

import { useState } from 'react';
import { isAddress } from 'ethers';
import { useWallet } from '@/context/WalletContext';
import { useBalance } from '@/hooks/useBalance';
import { useSendTransaction } from '@/hooks/useSendTransaction';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Dropdown } from '@/components/ui/Dropdown';
import { Alert } from '@/components/ui/Alert';
import { getTokensForNetwork, type TokenSymbol } from '@/constants/tokens';
import { env } from '@/lib/env';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SendStep = 'form' | 'confirm' | 'password' | 'sending' | 'success' | 'error';

export function SendModal({ isOpen, onClose }: SendModalProps) {
  const { address } = useWallet();
  const [step, setStep] = useState<SendStep>('form');

  // Form state
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('USDC');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [txHash, setTxHash] = useState('');

  // Form validation
  const [errors, setErrors] = useState<{
    recipient?: string;
    amount?: string;
    password?: string;
  }>({});

  // Fetch balance for selected token
  const { data: balance, isLoading: balanceLoading } = useBalance(selectedToken);

  // Send transaction mutation
  const {
    mutate: sendTransaction,
    isPending,
    error: sendError,
  } = useSendTransaction();

  // Get available tokens for current network
  const availableTokens = getTokensForNetwork(env.NEXT_PUBLIC_NETWORK);

  const tokenOptions = availableTokens.map((token) => ({
    value: token.symbol,
    label: `${token.symbol} - ${token.name}`,
  }));

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validate recipient address
    if (!recipient) {
      newErrors.recipient = 'Recipient address is required';
    } else if (!isAddress(recipient)) {
      newErrors.recipient = 'Invalid Ethereum address';
    } else if (recipient.toLowerCase() === address?.toLowerCase()) {
      newErrors.recipient = 'Cannot send to your own address';
    }

    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (balance && parseFloat(amount) > parseFloat(balance.balanceFormatted)) {
      newErrors.amount = `Insufficient ${selectedToken} balance`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) return;
    setStep('confirm');
  };

  // Handle send confirmation
  const handleConfirm = () => {
    setStep('password');
  };

  // Handle password submission
  const handlePasswordSubmit = () => {
    if (!password) {
      setErrors({ ...errors, password: 'Password is required' });
      return;
    }

    setStep('sending');

    sendTransaction(
      {
        tokenSymbol: selectedToken,
        recipient,
        amount,
        password,
      },
      {
        onSuccess: (data) => {
          setTxHash(data.hash);
          setStep('success');
          // Reset form after 3 seconds
          setTimeout(() => {
            handleClose();
          }, 3000);
        },
        onError: (error) => {
          console.error('Send error:', error);
          setStep('error');
        },
      }
    );
  };

  // Reset and close
  const handleClose = () => {
    setStep('form');
    setRecipient('');
    setAmount('');
    setPassword('');
    setErrors({});
    setTxHash('');
    onClose();
  };

  // Render form step
  const renderForm = () => (
    <>
      <div className="space-y-4">
        {/* Token Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Token
          </label>
          <Dropdown
            options={tokenOptions}
            value={selectedToken}
            onChange={(e) => setSelectedToken(e.target.value as TokenSymbol)}
          />
          {balance && (
            <p className="mt-2 text-sm text-gray-400">
              Available: {balance.balanceFormatted} {selectedToken}
            </p>
          )}
        </div>

        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Recipient Address
          </label>
          <Input
            value={recipient}
            onChange={(e) => {
              setRecipient(e.target.value);
              setErrors({ ...errors, recipient: undefined });
            }}
            placeholder="0x..."
            error={errors.recipient}
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount
          </label>
          <Input
            type="number"
            step="0.000001"
            min="0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setErrors({ ...errors, amount: undefined });
            }}
            placeholder="0.00"
            error={errors.amount}
          />
          {balance && amount && (
            <button
              onClick={() => setAmount(balance.balanceFormatted)}
              className="mt-2 text-sm text-blue-400 hover:text-blue-300"
            >
              Use Max
            </button>
          )}
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={balanceLoading}>
          Continue
        </Button>
      </ModalFooter>
    </>
  );

  // Render confirmation step
  const renderConfirm = () => (
    <>
      <div className="space-y-4">
        <Alert variant="info">
          Please review the transaction details carefully before confirming.
        </Alert>

        <div className="glass-card p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Token:</span>
            <span className="text-white font-medium">{selectedToken}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Amount:</span>
            <span className="text-white font-medium">{amount} {selectedToken}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">To:</span>
            <span className="text-white font-mono text-sm">
              {recipient.slice(0, 10)}...{recipient.slice(-8)}
            </span>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={() => setStep('form')}>
          Back
        </Button>
        <Button onClick={handleConfirm}>
          Confirm
        </Button>
      </ModalFooter>
    </>
  );

  // Render password step
  const renderPassword = () => (
    <>
      <div className="space-y-4">
        <Alert variant="warning">
          Enter your wallet password to sign and send this transaction.
        </Alert>

        <PasswordInput
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors({ ...errors, password: undefined });
          }}
          placeholder="Wallet password"
          error={errors.password}
          autoFocus
        />
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={() => setStep('confirm')}>
          Back
        </Button>
        <Button onClick={handlePasswordSubmit} disabled={!password}>
          Send Transaction
        </Button>
      </ModalFooter>
    </>
  );

  // Render sending step
  const renderSending = () => (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Sending Transaction</h3>
      <p className="text-gray-400">Please wait while we process your transaction...</p>
    </div>
  );

  // Render success step
  const renderSuccess = () => (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Transaction Sent!</h3>
      <p className="text-gray-400 mb-4">Your transaction has been broadcast to the network</p>
      {txHash && (
        <p className="text-sm text-gray-500 font-mono break-all">
          {txHash}
        </p>
      )}
    </div>
  );

  // Render error step
  const renderError = () => (
    <>
      <Alert variant="error">
        {sendError?.message || 'Failed to send transaction. Please try again.'}
      </Alert>

      <ModalFooter>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button onClick={() => setStep('form')}>
          Try Again
        </Button>
      </ModalFooter>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={step === 'sending' ? () => {} : handleClose}
      title={
        step === 'form'
          ? 'Send Transaction'
          : step === 'confirm'
          ? 'Confirm Transaction'
          : step === 'password'
          ? 'Enter Password'
          : ''
      }
      closeOnBackdropClick={step !== 'sending'}
      showCloseButton={step !== 'sending'}
    >
      {step === 'form' && renderForm()}
      {step === 'confirm' && renderConfirm()}
      {step === 'password' && renderPassword()}
      {step === 'sending' && renderSending()}
      {step === 'success' && renderSuccess()}
      {step === 'error' && renderError()}
    </Modal>
  );
}
