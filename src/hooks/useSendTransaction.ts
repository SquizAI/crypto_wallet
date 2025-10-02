/**
 * useSendTransaction Hook
 *
 * React Query mutation hook for sending token transactions.
 * Handles token transfers with gas estimation and automatic balance invalidation.
 *
 * Features:
 * - Automatic gas estimation before sending
 * - Balance query invalidation on success
 * - Transaction history tracking
 * - Real-time transaction monitoring
 * - Comprehensive error handling
 *
 * @example
 * ```tsx
 * const { mutate: sendToken, isPending, error } = useSendTransaction();
 *
 * // Send USDC
 * sendToken(
 *   {
 *     tokenSymbol: 'USDC',
 *     recipient: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *     amount: '10.5',
 *   },
 *   {
 *     onSuccess: (data) => console.log('Transaction sent!', data.hash),
 *     onError: (error) => console.error('Failed to send:', error),
 *   }
 * );
 * ```
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet } from 'ethers';
import { useWallet } from '@/context/WalletContext';
import {
  sendToken,
  estimateTransferGas,
  getTokenBalance,
} from '@/services/contractService';
import {
  unlockWallet as unlockWalletService,
  WalletError,
} from '@/services/walletService';
import { trackTransaction } from '@/services/transactionService';
import { getTokenAddress, getTokenConfig, type TokenSymbol } from '@/constants/tokens';
import { env } from '@/lib/env';
import type { GasEstimate } from '@/types/contract';
import type { Transaction } from '@/types/wallet';

/**
 * Send transaction parameters
 */
export interface SendTransactionParams {
  /**
   * Token to send (e.g., 'USDC', 'USDT', 'DAI')
   */
  tokenSymbol: TokenSymbol;

  /**
   * Recipient Ethereum address (0x prefixed)
   */
  recipient: string;

  /**
   * Amount to send in token units (e.g., "10.5")
   */
  amount: string;

  /**
   * User password to unlock wallet for signing
   * If not provided, will throw an error
   */
  password?: string;
}

/**
 * Send transaction result
 */
export interface SendTransactionResult {
  /**
   * Transaction hash
   */
  hash: string;

  /**
   * Transaction record stored in history
   */
  transaction: Transaction;

  /**
   * Gas estimate used for the transaction
   */
  gasEstimate: GasEstimate;

  /**
   * Cleanup function to stop monitoring the transaction
   */
  stopMonitoring: () => void;
}

/**
 * useSendTransaction Hook
 *
 * Mutation hook for sending token transactions.
 * Automatically invalidates balance queries on success.
 *
 * @returns React Query mutation result
 */
export function useSendTransaction() {
  const { address, isUnlocked } = useWallet();
  const queryClient = useQueryClient();
  const network = env.NEXT_PUBLIC_NETWORK;

  return useMutation<SendTransactionResult, Error, SendTransactionParams>({
    mutationFn: async ({ tokenSymbol, recipient, amount, password }) => {
      // Validation
      if (!address) {
        throw new Error('Wallet not connected');
      }

      if (!isUnlocked) {
        throw new Error('Wallet is locked. Please unlock your wallet first.');
      }

      if (!password) {
        throw new Error('Password is required to sign transaction');
      }

      // Get token configuration
      const tokenConfig = getTokenConfig(tokenSymbol);
      if (!tokenConfig) {
        throw new Error(`Token ${tokenSymbol} not found`);
      }

      const tokenAddress = getTokenAddress(tokenSymbol, network);
      if (!tokenAddress) {
        throw new Error(`Token ${tokenSymbol} not supported on ${network}`);
      }

      // Unlock wallet to get signer
      const unlockedWallet = await unlockWalletService(password);
      const wallet = new Wallet(unlockedWallet.privateKey);

      // Estimate gas before sending
      const gasEstimate = await estimateTransferGas(
        tokenAddress,
        address,
        recipient,
        amount,
        tokenConfig.decimals
      );

      // Check token balance
      const balance = await getTokenBalance(tokenAddress, address);
      const balanceNum = parseFloat(balance.balanceFormatted);
      const amountNum = parseFloat(amount);

      if (balanceNum < amountNum) {
        throw new Error(
          `Insufficient ${tokenSymbol} balance. Required: ${amount}, Available: ${balance.balanceFormatted}`
        );
      }

      // Send transaction
      const txResponse = await sendToken(
        wallet,
        tokenAddress,
        recipient,
        amount,
        tokenConfig.decimals
      );

      // Track transaction with monitoring
      const stopMonitoring = await trackTransaction(
        txResponse,
        tokenAddress,
        tokenSymbol,
        tokenConfig.decimals,
        'send',
        {
          onConfirmed: (receipt) => {
            console.log('Transaction confirmed:', receipt.hash);
            // Invalidate balance queries to trigger refetch
            queryClient.invalidateQueries({ queryKey: ['balance', address] });
            queryClient.invalidateQueries({ queryKey: ['balances', address] });
            queryClient.invalidateQueries({ queryKey: ['transactions', address] });
          },
          onFailed: (error) => {
            console.error('Transaction failed:', error);
            // Still invalidate queries in case of balance changes
            queryClient.invalidateQueries({ queryKey: ['balance', address] });
            queryClient.invalidateQueries({ queryKey: ['balances', address] });
            queryClient.invalidateQueries({ queryKey: ['transactions', address] });
          },
          onUpdate: (status, receipt) => {
            console.log('Transaction status update:', status);
          },
        }
      );

      // Create transaction record
      const transaction: Transaction = {
        hash: txResponse.hash,
        from: address,
        to: recipient,
        value: amount,
        tokenAddress,
        tokenSymbol,
        tokenDecimals: tokenConfig.decimals,
        status: 'pending',
        type: 'send',
        blockNumber: null,
        timestamp: null,
        gasUsed: null,
        gasPrice: txResponse.gasPrice?.toString() || null,
        chainId: Number(txResponse.chainId),
      };

      return {
        hash: txResponse.hash,
        transaction,
        gasEstimate,
        stopMonitoring,
      };
    },

    // On success, invalidate relevant queries
    onSuccess: (data) => {
      // Invalidate balance queries to show updated balances
      queryClient.invalidateQueries({ queryKey: ['balance', address] });
      queryClient.invalidateQueries({ queryKey: ['balances', address] });

      // Invalidate transaction history
      queryClient.invalidateQueries({ queryKey: ['transactions', address] });
    },

    // On error, still invalidate to ensure consistent state
    onError: (error) => {
      console.error('Send transaction error:', error);

      // Check if it's a wallet error for better error messages
      if (error instanceof WalletError) {
        if (error.code === 'DECRYPTION_FAILED') {
          throw new Error('Incorrect password');
        }
      }
    },

    // Retry once on network errors
    retry: (failureCount, error) => {
      // Don't retry on validation errors or wallet errors
      if (
        error.message.includes('Insufficient') ||
        error.message.includes('not supported') ||
        error.message.includes('password') ||
        error instanceof WalletError
      ) {
        return false;
      }

      // Retry once on network errors
      return failureCount < 1;
    },
  });
}

/**
 * Hook to estimate gas for a token transfer without sending
 *
 * Useful for showing gas estimates to users before they confirm.
 *
 * @example
 * ```tsx
 * const { data: gasEstimate, isLoading } = useEstimateGas({
 *   tokenSymbol: 'USDC',
 *   recipient: '0x...',
 *   amount: '10.5',
 * });
 * ```
 */
export function useEstimateGas(params: Omit<SendTransactionParams, 'password'>) {
  const { address } = useWallet();
  const network = env.NEXT_PUBLIC_NETWORK;

  return useMutation<GasEstimate, Error, void>({
    mutationFn: async () => {
      if (!address) {
        throw new Error('Wallet not connected');
      }

      const { tokenSymbol, recipient, amount } = params;

      const tokenConfig = getTokenConfig(tokenSymbol);
      if (!tokenConfig) {
        throw new Error(`Token ${tokenSymbol} not found`);
      }

      const tokenAddress = getTokenAddress(tokenSymbol, network);
      if (!tokenAddress) {
        throw new Error(`Token ${tokenSymbol} not supported on ${network}`);
      }

      return await estimateTransferGas(
        tokenAddress,
        address,
        recipient,
        amount,
        tokenConfig.decimals
      );
    },
  });
}
