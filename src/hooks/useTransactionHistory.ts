/**
 * useTransactionHistory Hook
 *
 * React Query hook for fetching transaction history from local storage.
 * Automatically updates when new transactions are added or status changes.
 *
 * Features:
 * - Automatic refetch when wallet unlocks
 * - Filters transactions by address
 * - Sorted by timestamp (newest first)
 * - Automatic pending transaction rechecking
 * - Proper caching and invalidation
 *
 * @example
 * ```tsx
 * // Fetch all transactions
 * const { data: transactions, isLoading, error } = useTransactionHistory();
 *
 * // Fetch only pending transactions
 * const { data: pending } = useTransactionHistory({ statusFilter: 'pending' });
 *
 * // Fetch with custom limit
 * const { data: recent } = useTransactionHistory({ limit: 10 });
 * ```
 */

'use client';

import { useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import {
  getStoredTransactionHistory,
  recheckPendingTransactions,
  getPendingTransactions,
} from '@/services/transactionService';
import type { Transaction, TransactionStatus, TransactionType } from '@/types/wallet';

/**
 * Options for useTransactionHistory hook
 */
export interface UseTransactionHistoryOptions {
  /**
   * Filter transactions by status
   */
  statusFilter?: TransactionStatus;

  /**
   * Filter transactions by type
   */
  typeFilter?: TransactionType;

  /**
   * Limit number of transactions returned
   */
  limit?: number;

  /**
   * Whether to enable the query
   */
  enabled?: boolean;

  /**
   * Custom refetch interval in milliseconds
   * Default: 30000 (30 seconds) for pending transactions
   */
  refetchInterval?: number;

  /**
   * Additional React Query options
   */
  queryOptions?: Partial<UseQueryOptions<Transaction[], Error>>;
}

/**
 * useTransactionHistory Hook
 *
 * Fetches and filters transaction history from local storage.
 * Automatically rechecks pending transactions on mount and periodically.
 *
 * @param options - Hook options for filtering and configuration
 * @returns React Query result with transaction history
 */
export function useTransactionHistory(options: UseTransactionHistoryOptions = {}) {
  const { address, isUnlocked } = useWallet();
  const queryClient = useQueryClient();

  const {
    statusFilter,
    typeFilter,
    limit,
    enabled = true,
    refetchInterval,
    queryOptions,
  } = options;

  // Automatically recheck pending transactions on mount
  useEffect(() => {
    if (isUnlocked && address) {
      // Recheck pending transactions in the background
      recheckPendingTransactions()
        .then((updated) => {
          if (updated > 0) {
            console.log(`Updated ${updated} pending transactions`);
            // Invalidate queries to trigger refetch with updated data
            queryClient.invalidateQueries({ queryKey: ['transactions', address] });
            queryClient.invalidateQueries({ queryKey: ['balance', address] });
            queryClient.invalidateQueries({ queryKey: ['balances', address] });
          }
        })
        .catch((error) => {
          console.error('Failed to recheck pending transactions:', error);
        });
    }
  }, [isUnlocked, address, queryClient]);

  // Determine refetch interval based on pending transactions
  const hasPendingTransactions = getPendingTransactions().length > 0;
  const effectiveRefetchInterval =
    refetchInterval !== undefined
      ? refetchInterval
      : hasPendingTransactions
      ? 30 * 1000 // 30 seconds if there are pending transactions
      : false; // Don't auto-refetch if no pending transactions

  const query = useQuery<Transaction[], Error>({
    // Query key includes address for proper cache separation
    queryKey: ['transactions', address, statusFilter, typeFilter, limit],

    // Query function
    queryFn: async () => {
      // Get all transactions from storage
      let transactions = getStoredTransactionHistory();

      // Filter by wallet address (only show transactions from/to this wallet)
      if (address) {
        transactions = transactions.filter(
          (tx) => tx.from.toLowerCase() === address.toLowerCase() ||
                  tx.to?.toLowerCase() === address.toLowerCase()
        );
      }

      // Apply status filter
      if (statusFilter) {
        transactions = transactions.filter((tx) => tx.status === statusFilter);
      }

      // Apply type filter
      if (typeFilter) {
        transactions = transactions.filter((tx) => tx.type === typeFilter);
      }

      // Sort by timestamp (newest first)
      transactions = transactions.sort((a, b) => {
        // Pending transactions first
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (b.status === 'pending' && a.status !== 'pending') return 1;

        // Then by timestamp (newest first)
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      });

      // Apply limit
      if (limit) {
        transactions = transactions.slice(0, limit);
      }

      return transactions;
    },

    // Only fetch when wallet is unlocked
    enabled: enabled && isUnlocked,

    // Refetch interval based on pending transactions
    refetchInterval: effectiveRefetchInterval,

    // Stale time
    staleTime: 10 * 1000, // 10 seconds (shorter than balances)

    // Keep data in cache for 5 minutes
    gcTime: 5 * 60 * 1000,

    // Refetch on window focus
    refetchOnWindowFocus: true,

    // Merge any additional query options
    ...queryOptions,
  });

  return query;
}

/**
 * Hook to fetch only pending transactions
 *
 * Convenience hook that automatically filters for pending status
 * and sets a more aggressive refetch interval.
 *
 * @example
 * ```tsx
 * const { data: pending, isLoading } = usePendingTransactions();
 * ```
 */
export function usePendingTransactions(
  options: Omit<UseTransactionHistoryOptions, 'statusFilter'> = {}
) {
  return useTransactionHistory({
    ...options,
    statusFilter: 'pending',
    refetchInterval: options.refetchInterval ?? 10 * 1000, // 10 seconds by default
  });
}

/**
 * Hook to fetch only confirmed transactions
 *
 * @example
 * ```tsx
 * const { data: confirmed } = useConfirmedTransactions({ limit: 20 });
 * ```
 */
export function useConfirmedTransactions(
  options: Omit<UseTransactionHistoryOptions, 'statusFilter'> = {}
) {
  return useTransactionHistory({
    ...options,
    statusFilter: 'confirmed',
  });
}

/**
 * Hook to fetch only failed transactions
 *
 * @example
 * ```tsx
 * const { data: failed } = useFailedTransactions();
 * ```
 */
export function useFailedTransactions(
  options: Omit<UseTransactionHistoryOptions, 'statusFilter'> = {}
) {
  return useTransactionHistory({
    ...options,
    statusFilter: 'failed',
  });
}

/**
 * Hook to get transaction count by status
 *
 * Returns counts for pending, confirmed, and failed transactions.
 *
 * @example
 * ```tsx
 * const { data: counts } = useTransactionCounts();
 * // counts = { pending: 2, confirmed: 15, failed: 1, total: 18 }
 * ```
 */
export function useTransactionCounts() {
  const { address, isUnlocked } = useWallet();

  return useQuery<{
    pending: number;
    confirmed: number;
    failed: number;
    total: number;
  }>({
    queryKey: ['transaction-counts', address],
    queryFn: () => {
      let transactions = getStoredTransactionHistory();

      // Filter by address
      if (address) {
        transactions = transactions.filter(
          (tx) => tx.from.toLowerCase() === address.toLowerCase() ||
                  tx.to?.toLowerCase() === address.toLowerCase()
        );
      }

      return {
        pending: transactions.filter((tx) => tx.status === 'pending').length,
        confirmed: transactions.filter((tx) => tx.status === 'confirmed').length,
        failed: transactions.filter((tx) => tx.status === 'failed').length,
        total: transactions.length,
      };
    },
    enabled: isUnlocked,
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

/**
 * Hook to get a single transaction by hash
 *
 * @example
 * ```tsx
 * const { data: transaction } = useTransaction('0x123...');
 * ```
 */
export function useTransaction(txHash: string | null) {
  const { isUnlocked } = useWallet();

  return useQuery<Transaction | null>({
    queryKey: ['transaction', txHash],
    queryFn: () => {
      if (!txHash) return null;

      const transactions = getStoredTransactionHistory();
      return transactions.find((tx) => tx.hash === txHash) || null;
    },
    enabled: isUnlocked && !!txHash,
    staleTime: 10 * 1000,
  });
}
