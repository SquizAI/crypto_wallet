/**
 * Swap Confirm Modal Component
 *
 * Confirmation modal for reviewing swap details before execution
 */

'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { SwapQuote, SwapGasEstimate } from '@/types/swap';
import { MAX_PRICE_IMPACT_WARNING } from '@/constants/uniswap';

interface SwapConfirmModalProps {
  /**
   * Whether modal is open
   */
  isOpen: boolean;

  /**
   * Callback to close modal
   */
  onClose: () => void;

  /**
   * Swap quote details
   */
  quote: SwapQuote;

  /**
   * Gas estimate
   */
  gasEstimate: SwapGasEstimate | null;

  /**
   * Whether approval is needed
   */
  needsApproval: boolean;

  /**
   * Callback when user confirms swap
   */
  onConfirm: (password: string) => Promise<void>;

  /**
   * Callback when user confirms approval
   */
  onApprove: (password: string) => Promise<void>;

  /**
   * Whether swap is in progress
   */
  isSwapping: boolean;

  /**
   * Whether approval is in progress
   */
  isApproving: boolean;
}

export function SwapConfirmModal({
  isOpen,
  onClose,
  quote,
  gasEstimate,
  needsApproval,
  onConfirm,
  onApprove,
  isSwapping,
  isApproving,
}: SwapConfirmModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!password) {
      setError('Password is required');
      return;
    }

    setError(null);

    try {
      if (needsApproval) {
        await onApprove(password);
      } else {
        await onConfirm(password);
      }
    } catch (err) {
      console.error('Transaction failed:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
    }
  };

  const handleClose = () => {
    if (!isSwapping && !isApproving) {
      setPassword('');
      setError(null);
      onClose();
    }
  };

  const showPriceImpactWarning = quote.priceImpact > MAX_PRICE_IMPACT_WARNING;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={needsApproval ? 'Approve Token' : 'Confirm Swap'}
    >
      <div className="space-y-6">
        {/* Swap Details */}
        <div className="space-y-4">
          {/* From Token */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
              <p className="text-sm text-gray-400 mb-1">You Pay</p>
              <p className="text-2xl font-bold text-white">{quote.amountIn}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-white">{quote.tokenIn}</p>
            </div>
          </div>

          {/* Arrow Down */}
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>

          {/* To Token */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
              <p className="text-sm text-gray-400 mb-1">You Receive</p>
              <p className="text-2xl font-bold text-white">{quote.amountOut}</p>
              <p className="text-xs text-gray-500 mt-1">
                Min: {quote.minAmountOutFormatted}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-white">{quote.tokenOut}</p>
            </div>
          </div>
        </div>

        {/* Swap Info */}
        <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Exchange Rate</span>
            <span className="text-white font-medium">
              1 {quote.tokenIn} = {quote.exchangeRate} {quote.tokenOut}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Price Impact</span>
            <span
              className={`font-medium ${
                quote.priceImpact > MAX_PRICE_IMPACT_WARNING
                  ? 'text-yellow-400'
                  : 'text-green-400'
              }`}
            >
              {quote.priceImpact.toFixed(2)}%
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Slippage Tolerance</span>
            <span className="text-white font-medium">{quote.slippageTolerance}%</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Pool Fee</span>
            <span className="text-white font-medium">
              {(quote.poolFee / 10000).toFixed(2)}%
            </span>
          </div>

          {gasEstimate && (
            <div className="flex justify-between text-sm pt-3 border-t border-white/10">
              <span className="text-gray-400">Network Fee</span>
              <span className="text-white font-medium">
                ~{parseFloat(gasEstimate.totalCostEth).toFixed(6)} ETH
              </span>
            </div>
          )}
        </div>

        {/* Price Impact Warning */}
        {showPriceImpactWarning && (
          <Alert variant="warning">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-400 mt-0.5"
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
              <div>
                <p className="font-semibold text-yellow-400">High Price Impact</p>
                <p className="text-sm text-gray-300 mt-1">
                  This swap has a price impact of {quote.priceImpact.toFixed(2)}%. Consider
                  reducing the swap amount.
                </p>
              </div>
            </div>
          </Alert>
        )}

        {/* Approval Notice */}
        {needsApproval && (
          <Alert variant="info">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-400 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="font-semibold text-blue-400">Approval Required</p>
                <p className="text-sm text-gray-300 mt-1">
                  You need to approve {quote.tokenIn} spending before you can swap. This is a
                  one-time transaction.
                </p>
              </div>
            </div>
          </Alert>
        )}

        {/* Password Input */}
        <div>
          <PasswordInput
            label="Confirm with Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your wallet password"
            disabled={isSwapping || isApproving}
            autoComplete="current-password"
          />
        </div>

        {/* Error Message */}
        {error && <Alert variant="error">{error}</Alert>}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isSwapping || isApproving}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!password || isSwapping || isApproving}
            isLoading={isSwapping || isApproving}
            className="flex-1"
          >
            {needsApproval
              ? isApproving
                ? 'Approving...'
                : 'Approve'
              : isSwapping
              ? 'Swapping...'
              : 'Confirm Swap'}
          </Button>
        </div>

        {/* Processing Info */}
        {(isSwapping || isApproving) && (
          <div className="text-center text-sm text-gray-400">
            <p>Please wait while the transaction is being processed...</p>
            <p className="mt-1">Do not close this window.</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
