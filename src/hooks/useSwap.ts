/**
 * useSwap Hook
 *
 * React hook for managing token swap operations
 *
 * Features:
 * - Real-time quote fetching
 * - Auto-refresh quotes
 * - Token approval handling
 * - Swap execution
 * - Error handling
 * - Loading states
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Wallet } from 'ethers';
import { unlockWallet } from '@/services/walletService';
import { getTokenAddress, type TokenSymbol } from '@/constants/tokens';
import { env } from '@/lib/env';
import {
  getSwapQuote,
  checkAllowance,
  approveToken,
  estimateSwapGas,
  executeSwap,
  isQuoteValid,
  getSwapErrorMessage,
} from '@/services/swapService';
import type {
  SwapQuote,
  SwapStatus,
  SwapGasEstimate,
  TokenAllowance,
} from '@/types/swap';
import { SwapError } from '@/types/swap';

interface UseSwapOptions {
  /**
   * Auto-refresh interval in ms (default: 30000)
   */
  refreshInterval?: number;

  /**
   * Enable auto-refresh (default: true)
   */
  autoRefresh?: boolean;
}

interface UseSwapReturn {
  /**
   * Current swap quote
   */
  quote: SwapQuote | null;

  /**
   * Gas estimate for swap
   */
  gasEstimate: SwapGasEstimate | null;

  /**
   * Token allowance info
   */
  allowance: TokenAllowance | null;

  /**
   * Current swap status
   */
  status: SwapStatus;

  /**
   * Error message (null if no error)
   */
  error: string | null;

  /**
   * Whether quote is being fetched
   */
  isLoadingQuote: boolean;

  /**
   * Whether approval is in progress
   */
  isApproving: boolean;

  /**
   * Whether swap is in progress
   */
  isSwapping: boolean;

  /**
   * Transaction hash of completed swap
   */
  txHash: string | null;

  /**
   * Fetch swap quote
   */
  fetchQuote: (
    tokenIn: TokenSymbol,
    tokenOut: TokenSymbol,
    amountIn: string,
    slippage: number
  ) => Promise<void>;

  /**
   * Approve token spending
   */
  approve: (password: string) => Promise<void>;

  /**
   * Execute swap
   */
  swap: (password: string) => Promise<void>;

  /**
   * Clear error state
   */
  clearError: () => void;

  /**
   * Reset swap state
   */
  reset: () => void;

  /**
   * Whether needs approval
   */
  needsApproval: boolean;
}

/**
 * Hook for managing token swaps
 */
export function useSwap(
  userAddress: string | null,
  options: UseSwapOptions = {}
): UseSwapReturn {
  const {
    refreshInterval = 30000,
    autoRefresh = true,
  } = options;

  // State
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [gasEstimate, setGasEstimate] = useState<SwapGasEstimate | null>(null);
  const [allowance, setAllowance] = useState<TokenAllowance | null>(null);
  const [status, setStatus] = useState<SwapStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Refs for auto-refresh
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastQuoteParamsRef = useRef<{
    tokenIn: TokenSymbol;
    tokenOut: TokenSymbol;
    amountIn: string;
    slippage: number;
  } | null>(null);

  /**
   * Clear refresh timer
   */
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  /**
   * Fetch swap quote
   */
  const fetchQuote = useCallback(
    async (
      tokenIn: TokenSymbol,
      tokenOut: TokenSymbol,
      amountIn: string,
      slippage: number
    ) => {
      if (!userAddress) {
        setError('Wallet not connected');
        return;
      }

      if (!amountIn || parseFloat(amountIn) <= 0) {
        setError('Invalid amount');
        return;
      }

      // Clear previous timer
      clearRefreshTimer();

      setStatus('fetching-quote');
      setError(null);

      try {
        // Fetch quote
        const newQuote = await getSwapQuote(tokenIn, tokenOut, amountIn, slippage);
        setQuote(newQuote);

        // Check allowance
        const network = env.NEXT_PUBLIC_NETWORK;
        const tokenInAddress = getTokenAddress(tokenIn, network);

        if (tokenInAddress) {
          const allowanceInfo = await checkAllowance(
            tokenInAddress,
            userAddress,
            newQuote.amountInRaw
          );
          setAllowance(allowanceInfo);

          // Estimate gas (need approval or not)
          // We need a wallet instance for gas estimation, but we'll use a dummy one
          // Real gas estimation will happen during swap
          setGasEstimate(null);
        }

        // Save params for auto-refresh
        lastQuoteParamsRef.current = { tokenIn, tokenOut, amountIn, slippage };

        // Set up auto-refresh
        if (autoRefresh) {
          refreshTimerRef.current = setTimeout(() => {
            if (lastQuoteParamsRef.current) {
              const params = lastQuoteParamsRef.current;
              fetchQuote(params.tokenIn, params.tokenOut, params.amountIn, params.slippage);
            }
          }, refreshInterval);
        }

        setStatus('idle');
      } catch (err) {
        console.error('Failed to fetch quote:', err);

        if (err instanceof SwapError) {
          setError(getSwapErrorMessage(err));
        } else {
          setError('Failed to fetch quote. Please try again.');
        }

        setStatus('error');
        setQuote(null);
        setAllowance(null);
        setGasEstimate(null);
      }
    },
    [userAddress, autoRefresh, refreshInterval, clearRefreshTimer]
  );

  /**
   * Approve token spending
   */
  const approve = useCallback(
    async (password: string) => {
      if (!quote || !allowance || !userAddress) {
        setError('Missing required data for approval');
        return;
      }

      if (allowance.isSufficient) {
        setError('Approval not needed');
        return;
      }

      setStatus('approving');
      setError(null);

      try {
        // Unlock wallet
        const unlockedWallet = await unlockWallet(password);
        const wallet = new Wallet(unlockedWallet.privateKey);

        // Approve token
        const approvalTxHash = await approveToken(
          wallet,
          allowance.tokenAddress,
          allowance.requiredAmount
        );

        console.log('Approval transaction:', approvalTxHash);

        // Refresh allowance
        const updatedAllowance = await checkAllowance(
          allowance.tokenAddress,
          userAddress,
          allowance.requiredAmount
        );
        setAllowance(updatedAllowance);

        setStatus('idle');
      } catch (err) {
        console.error('Approval failed:', err);

        if (err instanceof SwapError) {
          setError(getSwapErrorMessage(err));
        } else {
          setError('Token approval failed. Please try again.');
        }

        setStatus('error');
      }
    },
    [quote, allowance, userAddress]
  );

  /**
   * Execute swap
   */
  const swap = useCallback(
    async (password: string) => {
      if (!quote || !allowance || !userAddress) {
        setError('Missing required data for swap');
        return;
      }

      if (!allowance.isSufficient) {
        setError('Token approval required before swap');
        return;
      }

      // Check if quote is still valid
      if (!isQuoteValid(quote)) {
        setError('Quote expired. Please refresh.');
        setStatus('error');
        return;
      }

      // Clear refresh timer during swap
      clearRefreshTimer();

      setStatus('swapping');
      setError(null);

      try {
        // Unlock wallet
        const unlockedWallet = await unlockWallet(password);
        const wallet = new Wallet(unlockedWallet.privateKey);

        // Estimate gas
        const gas = await estimateSwapGas(wallet, quote, false);
        setGasEstimate(gas);

        // Execute swap
        const swapTxHash = await executeSwap(wallet, quote);
        setTxHash(swapTxHash);

        console.log('Swap transaction:', swapTxHash);

        setStatus('success');
      } catch (err) {
        console.error('Swap failed:', err);

        if (err instanceof SwapError) {
          setError(getSwapErrorMessage(err));
        } else {
          setError('Swap failed. Please try again.');
        }

        setStatus('error');
      }
    },
    [quote, allowance, userAddress, clearRefreshTimer]
  );

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
    if (status === 'error') {
      setStatus('idle');
    }
  }, [status]);

  /**
   * Reset swap state
   */
  const reset = useCallback(() => {
    clearRefreshTimer();
    setQuote(null);
    setGasEstimate(null);
    setAllowance(null);
    setStatus('idle');
    setError(null);
    setTxHash(null);
    lastQuoteParamsRef.current = null;
  }, [clearRefreshTimer]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearRefreshTimer();
    };
  }, [clearRefreshTimer]);

  // Computed values
  const isLoadingQuote = status === 'fetching-quote';
  const isApproving = status === 'approving';
  const isSwapping = status === 'swapping';
  const needsApproval = allowance ? !allowance.isSufficient : false;

  return {
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
  };
}
