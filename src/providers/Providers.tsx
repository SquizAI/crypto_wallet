/**
 * Combined Providers
 *
 * Wraps the application with all necessary providers in the correct order.
 * Centralizes provider setup for cleaner root layout.
 *
 * Provider Order (outer to inner):
 * 1. ThemeProvider - Theme state and system preference detection
 * 2. QueryProvider - React Query for server state
 * 3. NetworkProvider - Multi-network support and network switching
 * 4. NotificationProvider - Notification state management
 * 5. WalletProvider - Wallet authentication and state
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
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { NetworkProvider } from '@/context/NetworkContext';
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
 * ThemeProvider is outermost to apply theme before any components render.
 * NetworkProvider is placed before WalletProvider as wallet operations depend on network.
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <NetworkProvider>
          <NotificationProvider>
            <WalletProvider>{children}</WalletProvider>
          </NotificationProvider>
        </NetworkProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
