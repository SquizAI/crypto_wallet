/**
 * useNetwork Hook
 *
 * Convenient hook for accessing network state and utilities
 */

import { useMemo } from 'react';
import { useNetworkContext } from '@/context/NetworkContext';
import {
  getNetworkById,
  getTokenAddress,
  getNetworkTokens,
  getAddressExplorerUrl,
  getTransactionExplorerUrl,
  getTokenExplorerUrl,
} from '@/config/networks';
import { getProvider, getNetworkGasPrice, getNativeBalance } from '@/services/networkService';
import type { NetworkId } from '@/types/network';

/**
 * Network hook with extended utilities
 *
 * Provides access to network state plus helper functions
 * for common network operations
 *
 * Usage:
 * ```tsx
 * const network = useNetwork();
 * const usdcAddress = network.getTokenAddress('USDC');
 * const explorerUrl = network.getTransactionUrl(txHash);
 * ```
 */
export function useNetwork() {
  const {
    currentNetwork,
    availableNetworks,
    isSwitching,
    error,
    switchNetwork,
    validateNetwork,
    clearError,
  } = useNetworkContext();

  // Get current network configuration
  const networkConfig = useMemo(() => getNetworkById(currentNetwork), [currentNetwork]);

  // Get provider for current network
  const provider = useMemo(() => getProvider(currentNetwork), [currentNetwork]);

  // Get all tokens for current network
  const tokens = useMemo(() => getNetworkTokens(currentNetwork), [currentNetwork]);

  /**
   * Get token address for current network
   */
  const getToken = (tokenSymbol: 'USDC' | 'USDT' | 'DAI'): string | undefined => {
    return getTokenAddress(currentNetwork, tokenSymbol);
  };

  /**
   * Get address explorer URL for current network
   */
  const getAddressUrl = (address: string): string => {
    return getAddressExplorerUrl(currentNetwork, address);
  };

  /**
   * Get transaction explorer URL for current network
   */
  const getTransactionUrl = (txHash: string): string => {
    return getTransactionExplorerUrl(currentNetwork, txHash);
  };

  /**
   * Get token explorer URL for current network
   */
  const getTokenUrl = (tokenAddress: string): string => {
    return getTokenExplorerUrl(currentNetwork, tokenAddress);
  };

  /**
   * Get current gas price for network
   */
  const getGasPrice = async () => {
    return await getNetworkGasPrice(currentNetwork);
  };

  /**
   * Get native balance for an address
   */
  const getBalance = async (address: string): Promise<string> => {
    return await getNativeBalance(currentNetwork, address);
  };

  /**
   * Switch to a specific network
   */
  const switchTo = async (networkId: NetworkId): Promise<void> => {
    await switchNetwork(networkId);
  };

  /**
   * Check if currently on a specific network
   */
  const isNetwork = (networkId: NetworkId): boolean => {
    return currentNetwork === networkId;
  };

  /**
   * Check if network is switching
   */
  const isLoading = isSwitching;

  return {
    // State
    currentNetwork,
    networkConfig,
    availableNetworks,
    isLoading,
    isSwitching,
    error,
    provider,
    tokens,

    // Network info
    chainId: networkConfig.chainId,
    name: networkConfig.name,
    shortName: networkConfig.shortName,
    color: networkConfig.color,
    icon: networkConfig.icon,
    nativeCurrency: networkConfig.nativeCurrency,
    blockExplorer: networkConfig.blockExplorer,
    isTestnet: networkConfig.isTestnet,

    // Actions
    switchNetwork: switchTo,
    validateNetwork,
    clearError,

    // Utilities
    getToken,
    getAddressUrl,
    getTransactionUrl,
    getTokenUrl,
    getGasPrice,
    getBalance,
    isNetwork,
  };
}

/**
 * Hook to check if a specific token is supported on current network
 *
 * Usage:
 * ```tsx
 * const isSupported = useTokenSupport('USDT');
 * ```
 */
export function useTokenSupport(tokenSymbol: 'USDC' | 'USDT' | 'DAI'): boolean {
  const { getToken } = useNetwork();
  return getToken(tokenSymbol) !== undefined;
}

/**
 * Hook to get network display information
 *
 * Returns formatted information for UI display
 *
 * Usage:
 * ```tsx
 * const display = useNetworkDisplay();
 * // { name: 'Ethereum', shortName: 'ETH', color: '#627EEA', ... }
 * ```
 */
export function useNetworkDisplay() {
  const network = useNetwork();

  return {
    name: network.name,
    shortName: network.shortName,
    color: network.color,
    icon: network.icon,
    chainId: network.chainId,
    isTestnet: network.isTestnet,
    blockExplorerName: network.blockExplorer.name,
    nativeCurrencySymbol: network.nativeCurrency.symbol,
  };
}
