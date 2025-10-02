/**
 * useBalance Hook
 *
 * React Query hook for fetching token balances from the blockchain.
 * Supports fetching a single token balance or all token balances.
 *
 * Features:
 * - Automatic caching with 30s stale time
 * - Auto-refetch when wallet address changes
 * - Disabled when wallet is locked
 * - Supports fetching all balances in parallel
 *
 * @example
 * ```tsx
 * // Fetch single token balance
 * const { data: usdcBalance, isLoading, error } = useBalance('USDC');
 *
 * // Fetch all token balances
 * const { data: allBalances, isLoading } = useBalance();
 *
 * // With custom refetch interval
 * const { data, refetch } = useBalance('USDT', { refetchInterval: 10000 });
 * ```
 */

'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { useWallet } from '@/context/WalletContext';
import { getTokenBalance, getAllBalances } from '@/services/contractService';
import { getTokenAddress, type TokenSymbol } from '@/constants/tokens';
import { env } from '@/lib/env';
import type { TokenBalance } from '@/types/contract';

/**
 * Options for useBalance hook
 */
export interface UseBalanceOptions {
  /**
   * Custom refetch interval in milliseconds
   * Default: undefined (no automatic refetch)
   */
  refetchInterval?: number;

  /**
   * Whether to enable the query
   * Useful for conditional fetching
   */
  enabled?: boolean;

  /**
   * Additional React Query options
   */
  queryOptions?: Partial<UseQueryOptions<TokenBalance | TokenBalance[], Error>>;
}

/**
 * Fetch single token balance
 *
 * @param tokenSymbol - Token symbol (e.g., 'USDC', 'USDT', 'DAI')
 * @param options - Hook options
 * @returns React Query result with token balance data
 */
export function useBalance(tokenSymbol: TokenSymbol, options?: UseBalanceOptions): ReturnType<typeof useQuery<TokenBalance, Error>>;

/**
 * Fetch all token balances
 *
 * @param tokenSymbol - Set to null to fetch all balances
 * @param options - Hook options
 * @returns React Query result with all token balances
 */
export function useBalance(tokenSymbol: null, options?: UseBalanceOptions): ReturnType<typeof useQuery<TokenBalance[], Error>>;

/**
 * Fetch all token balances (no parameters)
 *
 * @param options - Hook options
 * @returns React Query result with all token balances
 */
export function useBalance(options?: UseBalanceOptions): ReturnType<typeof useQuery<TokenBalance[], Error>>;

/**
 * useBalance Hook Implementation
 */
export function useBalance(
  tokenSymbolOrOptions?: TokenSymbol | null | UseBalanceOptions,
  optionsParam?: UseBalanceOptions
): ReturnType<typeof useQuery<TokenBalance | TokenBalance[], Error>> {
  const { address, isUnlocked } = useWallet();
  const network = env.NEXT_PUBLIC_NETWORK;

  // Parse parameters
  let tokenSymbol: TokenSymbol | null = null;
  let options: UseBalanceOptions = {};

  if (typeof tokenSymbolOrOptions === 'string') {
    // Called with tokenSymbol as first parameter
    tokenSymbol = tokenSymbolOrOptions;
    options = optionsParam || {};
  } else if (tokenSymbolOrOptions === null) {
    // Called with null to fetch all balances
    tokenSymbol = null;
    options = optionsParam || {};
  } else if (tokenSymbolOrOptions !== undefined) {
    // Called with options only (fetch all balances)
    tokenSymbol = null;
    options = tokenSymbolOrOptions;
  }

  const { refetchInterval, enabled = true, queryOptions } = options;

  // Determine if this is a single token or all tokens query
  const isSingleToken = tokenSymbol !== null;

  return useQuery({
    // Query key includes address and token for proper cache invalidation
    queryKey: isSingleToken
      ? ['balance', address, tokenSymbol]
      : ['balances', address],

    // Query function
    queryFn: async () => {
      if (!address) {
        throw new Error('Wallet address not available');
      }

      if (isSingleToken) {
        // Fetch single token balance
        const tokenAddress = getTokenAddress(tokenSymbol as TokenSymbol, network);
        if (!tokenAddress) {
          throw new Error(`Token ${tokenSymbol} not supported on ${network}`);
        }

        return await getTokenBalance(tokenAddress, address);
      } else {
        // Fetch all token balances
        return await getAllBalances(address);
      }
    },

    // Only fetch when wallet is unlocked and address is available
    enabled: enabled && isUnlocked && !!address,

    // Custom refetch interval (optional)
    refetchInterval,

    // Stale time is already set globally to 30s in QueryProvider
    // But we can override if needed
    staleTime: 30 * 1000, // 30 seconds

    // Keep data in cache for 5 minutes
    gcTime: 5 * 60 * 1000,

    // Refetch on window focus to ensure fresh balances
    refetchOnWindowFocus: true,

    // Merge any additional query options
    ...queryOptions,
  }) as ReturnType<typeof useQuery<TokenBalance | TokenBalance[], Error>>;
}

/**
 * Type guard to check if balance data is a single token balance
 *
 * @param data - Balance data from useBalance
 * @returns true if data is a single TokenBalance
 */
export function isSingleTokenBalance(
  data: TokenBalance | TokenBalance[] | undefined
): data is TokenBalance {
  return data !== undefined && !Array.isArray(data);
}

/**
 * Type guard to check if balance data is multiple token balances
 *
 * @param data - Balance data from useBalance
 * @returns true if data is an array of TokenBalance
 */
export function isMultipleTokenBalances(
  data: TokenBalance | TokenBalance[] | undefined
): data is TokenBalance[] {
  return data !== undefined && Array.isArray(data);
}
