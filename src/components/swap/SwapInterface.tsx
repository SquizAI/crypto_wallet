/**
 * Swap Interface Component
 *
 * Main component for token swapping with Uniswap V3 integration
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { TokenSelector } from './TokenSelector';
import { SwapConfirmModal } from './SwapConfirmModal';
import { useSwap } from '@/hooks/useSwap';
import { useWallet } from '@/context/WalletContext';
import { useBalance } from '@/hooks/useBalance';
import type { TokenSymbol } from '@/constants/tokens';
import { MAX_PRICE_IMPACT_WARNING } from '@/constants/uniswap';

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0] as const;

export function SwapInterface() {
  const { address, isUnlocked } = useWallet();
  const { data: balances } = useBalance(); // Fetch all balances

  // Swap state
  const [tokenIn, setTokenIn] = useState<TokenSymbol>('USDC');
  const [tokenOut, setTokenOut] = useState<TokenSymbol>('USDT');
  const [amountIn, setAmountIn] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [customSlippage, setCustomSlippage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Swap hook
  const {
    quote,
    gasEstimate,
    allowance,
    status,
    error,
    isLoadingQuote,
    isApproving,
    isSwapping,
    txHash,
    fetchQuote,
    approve,
    swap,
    clearError,
    reset,
    needsApproval,
  } = useSwap(address);

  // Get balance for selected token
  const tokenInBalance = balances?.find((b) => b.symbol === tokenIn);

  // Fetch quote when inputs change
  useEffect(() => {
    if (amountIn && parseFloat(amountIn) > 0 && tokenIn && tokenOut) {
      const timer = setTimeout(() => {
        fetchQuote(tokenIn, tokenOut, amountIn, slippage);
      }, 500); // Debounce

      return () => clearTimeout(timer);
    } else {
      reset();
    }
  }, [tokenIn, tokenOut, amountIn, slippage, fetchQuote, reset]);

  // Reset on success
  useEffect(() => {
    if (status === 'success') {
      setAmountIn('');
      reset();
    }
  }, [status, reset]);

  const handleSwapDirection = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
  };

  const handleSetMaxAmount = () => {
    if (tokenInBalance) {
      setAmountIn(tokenInBalance.balanceFormatted);
    }
  };

  const handleSlippageChange = (value: number) => {
    setSlippage(value);
    setCustomSlippage('');
  };

  const handleCustomSlippageChange = (value: string) => {
    setCustomSlippage(value);
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0 && num <= 50) {
      setSlippage(num);
    }
  };

  const handleConfirm = async (password: string) => {
    await swap(password);
  };

  const handleApprove = async (password: string) => {
    await approve(password);
    // Keep modal open after approval for swap
  };

  const canSwap =
    isUnlocked &&
    amountIn &&
    parseFloat(amountIn) > 0 &&
    quote &&
    !isLoadingQuote &&
    !needsApproval;

  const canApprove = isUnlocked && quote && needsApproval;

  const insufficientBalance = Boolean(
    tokenInBalance &&
    amountIn &&
    parseFloat(amountIn) > parseFloat(tokenInBalance.balanceFormatted)
  );

  return (
    <>
      <Card className="max-w-lg mx-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Swap Tokens</h2>

            {/* Settings Icon (Slippage) */}
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              title="Slippage Settings"
            >
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          {/* Slippage Settings */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-400">
              Slippage Tolerance
            </label>
            <div className="flex gap-2">
              {SLIPPAGE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSlippageChange(option)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors
                    ${
                      slippage === option && !customSlippage
                        ? 'bg-blue-500 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }
                  `}
                >
                  {option}%
                </button>
              ))}
              <Input
                type="number"
                value={customSlippage}
                onChange={(e) => handleCustomSlippageChange(e.target.value)}
                placeholder="Custom"
                className="w-24"
                min="0"
                max="50"
                step="0.1"
              />
            </div>
          </div>

          {/* From Token */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-400">From</label>
            <div className="space-y-2">
              <TokenSelector
                selectedToken={tokenIn}
                onSelect={setTokenIn}
                excludeToken={tokenOut}
              />

              <div className="relative">
                <Input
                  type="number"
                  value={amountIn}
                  onChange={(e) => setAmountIn(e.target.value)}
                  placeholder="0.0"
                  className="text-2xl pr-20"
                  min="0"
                  step="any"
                />
                <button
                  type="button"
                  onClick={handleSetMaxAmount}
                  className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors"
                >
                  MAX
                </button>
              </div>

              {tokenInBalance && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Balance:</span>
                  <span className="text-white font-medium">
                    {parseFloat(tokenInBalance.balanceFormatted).toFixed(4)} {tokenIn}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-2">
            <button
              type="button"
              onClick={handleSwapDirection}
              className="p-3 rounded-full bg-gray-800 border-4 border-gray-900 hover:bg-gray-700 transition-colors z-10"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </button>
          </div>

          {/* To Token */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-400">To</label>
            <div className="space-y-2">
              <TokenSelector
                selectedToken={tokenOut}
                onSelect={setTokenOut}
                excludeToken={tokenIn}
              />

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                {isLoadingQuote ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-gray-400">Fetching quote...</span>
                  </div>
                ) : quote ? (
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {parseFloat(quote.amountOut).toFixed(6)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Min received: {parseFloat(quote.minAmountOutFormatted).toFixed(6)}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">Enter amount to see quote</p>
                )}
              </div>
            </div>
          </div>

          {/* Quote Details */}
          {quote && !isLoadingQuote && (
            <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Rate</span>
                <span className="text-white">
                  1 {tokenIn} = {quote.exchangeRate} {tokenOut}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price Impact</span>
                <span
                  className={
                    quote.priceImpact > MAX_PRICE_IMPACT_WARNING
                      ? 'text-yellow-400'
                      : 'text-green-400'
                  }
                >
                  {quote.priceImpact.toFixed(2)}%
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Pool Fee</span>
                <span className="text-white">{(quote.poolFee / 10000).toFixed(2)}%</span>
              </div>

              {gasEstimate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Network Fee</span>
                  <span className="text-white">
                    ~{parseFloat(gasEstimate.totalCostEth).toFixed(6)} ETH
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Insufficient Balance Warning */}
          {insufficientBalance && (
            <Alert variant="error">Insufficient {tokenIn} balance</Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="error">
              <div className="flex items-start justify-between gap-2">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={clearError}
                  className="text-red-400 hover:text-red-300"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </Alert>
          )}

          {/* Success Message */}
          {status === 'success' && txHash && (
            <Alert variant="success">
              <div className="space-y-2">
                <p className="font-semibold">Swap Successful!</p>
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline hover:no-underline"
                >
                  View on Etherscan
                </a>
              </div>
            </Alert>
          )}

          {/* Action Button */}
          {!isUnlocked ? (
            <Button variant="secondary" disabled className="w-full">
              Unlock Wallet to Swap
            </Button>
          ) : canApprove ? (
            <Button
              variant="primary"
              onClick={() => setShowConfirmModal(true)}
              disabled={insufficientBalance}
              className="w-full"
            >
              Approve {tokenIn}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setShowConfirmModal(true)}
              disabled={!canSwap || insufficientBalance}
              isLoading={isLoadingQuote}
              className="w-full"
            >
              {isLoadingQuote ? 'Loading...' : canSwap ? 'Review Swap' : 'Enter Amount'}
            </Button>
          )}
        </div>
      </Card>

      {/* Confirm Modal */}
      {quote && (
        <SwapConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          quote={quote}
          gasEstimate={gasEstimate}
          needsApproval={needsApproval}
          onConfirm={handleConfirm}
          onApprove={handleApprove}
          isSwapping={isSwapping}
          isApproving={isApproving}
        />
      )}
    </>
  );
}
