/**
 * React Query Provider
 *
 * Configures and provides React Query client for server state management.
 * Handles data fetching, caching, and synchronization for blockchain data.
 *
 * Configuration:
 * - 30s stale time for balance queries (blockchain data changes slowly)
 * - 5 minute cache time (keep data in cache for quick access)
 * - 3 retries with exponential backoff for failed queries
 * - Automatic refetch on window focus (for up-to-date balances)
 *
 * @example
 * ```tsx
 * <QueryProvider>
 *   <App />
 * </QueryProvider>
 * ```
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

/**
 * Query Provider Props
 */
interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Query Provider Component
 *
 * Creates and provides React Query client with optimized settings
 * for blockchain data fetching.
 *
 * Settings Rationale:
 * - staleTime: Blockchain data doesn't change instantly, so we consider
 *   data fresh for 30s before refetching
 * - gcTime (formerly cacheTime): Keep cached data for 5 minutes
 * - retry: Network requests can fail, retry up to 3 times
 * - refetchOnWindowFocus: Refresh balances when user returns to app
 * - refetchOnReconnect: Refresh when network connection is restored
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Consider data fresh for 30 seconds
            // Reduces unnecessary refetches for blockchain data
            staleTime: 30 * 1000, // 30 seconds

            // Keep unused data in cache for 5 minutes
            gcTime: 5 * 60 * 1000, // 5 minutes

            // Retry failed queries up to 3 times
            // Useful for transient network errors
            retry: 3,

            // Exponential backoff for retries
            // First retry: ~1s, second: ~2s, third: ~4s
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

            // Refetch on window focus to ensure fresh data
            // Good for balances that might change while user is away
            refetchOnWindowFocus: true,

            // Refetch when network connection is restored
            refetchOnReconnect: true,

            // Don't refetch on mount if data is fresh
            refetchOnMount: false,
          },
          mutations: {
            // Retry mutations once on failure
            retry: 1,

            // Shorter delay for mutations
            retryDelay: 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
