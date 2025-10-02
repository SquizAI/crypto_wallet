/**
 * Network Context
 *
 * Global state management for multi-network support
 * Manages current network selection and network switching
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { type NetworkId } from '@/types/network';
import { DEFAULT_NETWORK, isNetworkSupported, getAllNetworkIds } from '@/config/networks';
import {
  getProvider,
  saveNetworkPreference,
  loadNetworkPreference,
  validateNetworkRpc,
} from '@/services/networkService';

/**
 * Network context state
 */
interface NetworkContextState {
  /**
   * Currently active network
   */
  currentNetwork: NetworkId;

  /**
   * All available networks
   */
  availableNetworks: NetworkId[];

  /**
   * Whether a network switch is in progress
   */
  isSwitching: boolean;

  /**
   * Last error from network operations
   */
  error: string | null;

  /**
   * Switch to a different network
   */
  switchNetwork: (networkId: NetworkId) => Promise<void>;

  /**
   * Validate current network connection
   */
  validateNetwork: () => Promise<boolean>;

  /**
   * Clear any network errors
   */
  clearError: () => void;
}

/**
 * Network context
 */
const NetworkContext = createContext<NetworkContextState | undefined>(undefined);

/**
 * Network provider props
 */
interface NetworkProviderProps {
  children: ReactNode;
  defaultNetwork?: NetworkId;
}

/**
 * Network Provider Component
 *
 * Provides network state and switching functionality to the entire app
 *
 * Usage:
 * ```tsx
 * <NetworkProvider>
 *   <App />
 * </NetworkProvider>
 * ```
 */
export function NetworkProvider({ children, defaultNetwork }: NetworkProviderProps) {
  const [currentNetwork, setCurrentNetwork] = useState<NetworkId>(() => {
    // Try to load saved preference, otherwise use default
    if (typeof window !== 'undefined') {
      const saved = loadNetworkPreference();
      if (saved) return saved;
    }
    return defaultNetwork || DEFAULT_NETWORK;
  });

  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const availableNetworks = getAllNetworkIds();

  /**
   * Validate current network on mount
   */
  useEffect(() => {
    validateCurrentNetwork();
  }, []);

  /**
   * Save network preference when it changes
   */
  useEffect(() => {
    saveNetworkPreference(currentNetwork);
  }, [currentNetwork]);

  /**
   * Validate current network connection
   */
  const validateCurrentNetwork = async () => {
    try {
      const isValid = await validateNetworkRpc(currentNetwork);
      if (!isValid) {
        setError(`Unable to connect to ${currentNetwork} network. Please check your connection.`);
      }
    } catch (err) {
      console.error('Network validation failed:', err);
      setError('Network validation failed. Please try again.');
    }
  };

  /**
   * Switch to a different network
   */
  const switchNetwork = useCallback(
    async (networkId: NetworkId) => {
      // Validate network is supported
      if (!isNetworkSupported(networkId)) {
        setError(`Network ${networkId} is not supported`);
        return;
      }

      // Don't switch if already on this network
      if (networkId === currentNetwork) {
        return;
      }

      setIsSwitching(true);
      setError(null);

      try {
        // Validate the new network's RPC
        const isValid = await validateNetworkRpc(networkId);

        if (!isValid) {
          throw new Error(`Unable to connect to ${networkId} network`);
        }

        // Switch to new network
        setCurrentNetwork(networkId);

        // Optional: trigger a re-fetch of balances/data in other contexts
        // This is handled by components listening to the currentNetwork change

        console.log(`Successfully switched to ${networkId} network`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to switch network';
        setError(errorMessage);
        console.error('Network switch failed:', err);
        throw err;
      } finally {
        setIsSwitching(false);
      }
    },
    [currentNetwork]
  );

  /**
   * Validate network (public method)
   */
  const validateNetwork = useCallback(async (): Promise<boolean> => {
    try {
      const isValid = await validateNetworkRpc(currentNetwork);
      if (!isValid) {
        setError(`Unable to connect to ${currentNetwork} network`);
      }
      return isValid;
    } catch (err) {
      console.error('Network validation failed:', err);
      setError('Network validation failed');
      return false;
    }
  }, [currentNetwork]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: NetworkContextState = {
    currentNetwork,
    availableNetworks,
    isSwitching,
    error,
    switchNetwork,
    validateNetwork,
    clearError,
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

/**
 * Hook to use network context
 *
 * Usage:
 * ```tsx
 * const { currentNetwork, switchNetwork } = useNetwork();
 * ```
 *
 * @throws Error if used outside NetworkProvider
 */
export function useNetworkContext() {
  const context = useContext(NetworkContext);

  if (context === undefined) {
    throw new Error('useNetworkContext must be used within a NetworkProvider');
  }

  return context;
}

/**
 * Hook to get current network provider
 *
 * Returns the ethers.js provider for the current network
 *
 * Usage:
 * ```tsx
 * const provider = useNetworkProvider();
 * const blockNumber = await provider.getBlockNumber();
 * ```
 */
export function useNetworkProvider() {
  const { currentNetwork } = useNetworkContext();
  return getProvider(currentNetwork);
}
