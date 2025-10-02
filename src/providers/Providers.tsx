/**
 * Combined Providers
 *
 * Wraps the application with all necessary providers in the correct order.
 * Centralizes provider setup for cleaner root layout.
 *
 * Provider Order (outer to inner):
 * 1. QueryProvider - React Query for server state
 * 2. WalletProvider - Wallet authentication and state
 *
 * @example
 * ```tsx
 * // In app/layout.tsx
 * <Providers>
 *   <App />
 * </Providers>
 * ```
 */

'use client';

import { QueryProvider } from './QueryProvider';
import { WalletProvider } from '@/context/WalletContext';
import type { ReactNode } from 'react';

/**
 * Providers Component Props
 */
interface ProvidersProps {
  children: ReactNode;
}

/**
 * Providers Component
 *
 * Combines all application providers in the correct nesting order.
 * QueryProvider must be outer to allow wallet hooks to use React Query.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <WalletProvider>{children}</WalletProvider>
    </QueryProvider>
  );
}
