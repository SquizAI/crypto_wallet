/**
 * Network Service
 *
 * Network management service for multi-chain support
 *
 * Features:
 * - Provider management per network
 * - Network switching with validation
 * - Network preference persistence
 * - RPC health checking
 * - Gas price fetching per network
 *
 * Security Notes:
 * - All network operations are validated against supported networks
 * - Provider instances are cached to avoid redundant connections
 * - Network changes are persisted to localStorage
 */

import { JsonRpcProvider } from 'ethers';
import { getNetworkById, getNetworkByChainId, isNetworkSupported } from '@/config/networks';
import type { Network, NetworkId } from '@/types/network';

/**
 * Storage key for network preference
 */
const NETWORK_STORAGE_KEY = 'stablecoin_wallet_network';

/**
 * Provider cache to avoid creating multiple instances
 */
const providerCache: Map<NetworkId, JsonRpcProvider> = new Map();

/**
 * Get or create a provider for a specific network
 *
 * @param networkId - Network identifier
 * @returns JsonRpcProvider instance for the network
 */
export function getProvider(networkId: NetworkId): JsonRpcProvider {
  // Return cached provider if available
  if (providerCache.has(networkId)) {
    return providerCache.get(networkId)!;
  }

  // Create new provider
  const network = getNetworkById(networkId);
  const provider = new JsonRpcProvider(network.rpcUrl, {
    chainId: network.chainId,
    name: network.name,
  });

  // Cache for future use
  providerCache.set(networkId, provider);

  return provider;
}

/**
 * Clear provider cache (useful for testing or when RPC endpoints change)
 */
export function clearProviderCache(): void {
  providerCache.clear();
}

/**
 * Get network configuration
 *
 * @param networkId - Network identifier
 * @returns Network configuration
 */
export function getNetwork(networkId: NetworkId): Network {
  return getNetworkById(networkId);
}

/**
 * Detect network from chain ID
 *
 * @param chainId - Chain ID from provider or wallet
 * @returns Network configuration or undefined if not supported
 */
export function detectNetwork(chainId: number): Network | undefined {
  return getNetworkByChainId(chainId);
}

/**
 * Validate network RPC endpoint
 *
 * @param networkId - Network identifier
 * @returns True if RPC is responsive, false otherwise
 */
export async function validateNetworkRpc(networkId: NetworkId): Promise<boolean> {
  try {
    const provider = getProvider(networkId);
    const network = getNetworkById(networkId);

    // Try to get block number to verify connection
    const blockNumber = await provider.getBlockNumber();

    // Also verify chain ID matches
    const providerNetwork = await provider.getNetwork();
    if (Number(providerNetwork.chainId) !== network.chainId) {
      console.error(
        `Chain ID mismatch: expected ${network.chainId}, got ${providerNetwork.chainId}`
      );
      return false;
    }

    return blockNumber > 0;
  } catch (error) {
    console.error(`Failed to validate RPC for ${networkId}:`, error);
    return false;
  }
}

/**
 * Get current gas price for a network
 *
 * @param networkId - Network identifier
 * @returns Gas price details (EIP-1559 format with fallback)
 */
export async function getNetworkGasPrice(networkId: NetworkId): Promise<{
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  gasPrice?: bigint;
}> {
  const provider = getProvider(networkId);
  const network = getNetworkById(networkId);
  const feeData = await provider.getFeeData();

  // Apply network-specific gas price multiplier for safety margin
  const multiplier = Math.floor(network.gasPriceMultiplier * 100);

  if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
    // EIP-1559 supported
    return {
      maxFeePerGas: (feeData.maxFeePerGas * BigInt(multiplier)) / BigInt(100),
      maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas * BigInt(multiplier)) / BigInt(100),
      gasPrice: feeData.gasPrice || undefined,
    };
  }

  // Fallback to legacy gas price
  const gasPrice = feeData.gasPrice || BigInt(0);
  const adjustedGasPrice = (gasPrice * BigInt(multiplier)) / BigInt(100);

  return {
    maxFeePerGas: adjustedGasPrice,
    maxPriorityFeePerGas: adjustedGasPrice / BigInt(10), // 10% of gas price as priority
    gasPrice: adjustedGasPrice,
  };
}

/**
 * Get current block number for a network
 *
 * @param networkId - Network identifier
 * @returns Current block number
 */
export async function getBlockNumber(networkId: NetworkId): Promise<number> {
  const provider = getProvider(networkId);
  return await provider.getBlockNumber();
}

/**
 * Get native currency balance for an address on a network
 *
 * @param networkId - Network identifier
 * @param address - Wallet address
 * @returns Balance in wei as string
 */
export async function getNativeBalance(networkId: NetworkId, address: string): Promise<string> {
  const provider = getProvider(networkId);
  const balance = await provider.getBalance(address);
  return balance.toString();
}

/**
 * Save network preference to localStorage
 *
 * @param networkId - Network identifier to save
 */
export function saveNetworkPreference(networkId: NetworkId): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(NETWORK_STORAGE_KEY, networkId);
  } catch (error) {
    console.error('Failed to save network preference:', error);
  }
}

/**
 * Load network preference from localStorage
 *
 * @returns Saved network ID or undefined if not found/invalid
 */
export function loadNetworkPreference(): NetworkId | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const saved = localStorage.getItem(NETWORK_STORAGE_KEY);
    if (saved && isNetworkSupported(saved)) {
      return saved as NetworkId;
    }
  } catch (error) {
    console.error('Failed to load network preference:', error);
  }

  return undefined;
}

/**
 * Clear network preference from localStorage
 */
export function clearNetworkPreference(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(NETWORK_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear network preference:', error);
  }
}

/**
 * Estimate time until transaction confirmation
 *
 * @param networkId - Network identifier
 * @param confirmations - Number of confirmations to wait for (default: 1)
 * @returns Estimated time in seconds
 */
export function estimateConfirmationTime(networkId: NetworkId, confirmations = 1): number {
  const network = getNetworkById(networkId);
  return network.avgBlockTime * confirmations;
}

/**
 * Check if network is a testnet
 *
 * @param networkId - Network identifier
 * @returns True if testnet, false if mainnet
 */
export function isTestnet(networkId: NetworkId): boolean {
  const network = getNetworkById(networkId);
  return network.isTestnet;
}

/**
 * Get network color for UI
 *
 * @param networkId - Network identifier
 * @returns Hex color string
 */
export function getNetworkColor(networkId: NetworkId): string {
  const network = getNetworkById(networkId);
  return network.color;
}

/**
 * Get network icon identifier
 *
 * @param networkId - Network identifier
 * @returns Icon identifier string
 */
export function getNetworkIcon(networkId: NetworkId): string {
  const network = getNetworkById(networkId);
  return network.icon;
}

/**
 * Wait for transaction confirmation on a specific network
 *
 * @param networkId - Network identifier
 * @param txHash - Transaction hash
 * @param confirmations - Number of confirmations to wait for (default: 1)
 * @param timeout - Timeout in milliseconds (default: 5 minutes)
 * @returns Transaction receipt
 */
export async function waitForTransaction(
  networkId: NetworkId,
  txHash: string,
  confirmations = 1,
  timeout = 300000
): Promise<any> {
  const provider = getProvider(networkId);

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Transaction confirmation timeout after ${timeout}ms`));
    }, timeout);

    provider
      .waitForTransaction(txHash, confirmations)
      .then((receipt) => {
        clearTimeout(timeoutId);
        resolve(receipt);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

/**
 * Get transaction receipt for a specific network
 *
 * @param networkId - Network identifier
 * @param txHash - Transaction hash
 * @returns Transaction receipt or null if not found
 */
export async function getTransactionReceipt(
  networkId: NetworkId,
  txHash: string
): Promise<any | null> {
  const provider = getProvider(networkId);
  return await provider.getTransactionReceipt(txHash);
}

/**
 * Get transaction details for a specific network
 *
 * @param networkId - Network identifier
 * @param txHash - Transaction hash
 * @returns Transaction details or null if not found
 */
export async function getTransaction(networkId: NetworkId, txHash: string): Promise<any | null> {
  const provider = getProvider(networkId);
  return await provider.getTransaction(txHash);
}
