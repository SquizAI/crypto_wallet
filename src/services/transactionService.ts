/**
 * Transaction Service
 *
 * Transaction monitoring, history management, and status tracking
 *
 * Features:
 * - Transaction confirmation waiting with polling
 * - Transaction history persistence
 * - Status updates (pending → confirmed/failed)
 * - Real-time monitoring with callbacks
 * - Receipt parsing and storage
 *
 * Security Notes:
 * - All transaction data is validated before storage
 * - Network errors are handled gracefully
 * - Transaction history is limited to prevent storage bloat
 */

import { JsonRpcProvider, TransactionReceipt, TransactionResponse } from 'ethers';
import { env } from '@/lib/env';
import type { Transaction, TransactionStatus } from '@/types/wallet';
import type { TransactionMonitor } from '@/types/contract';
import { TransactionError as TransactionErrorClass } from '@/types/contract';
import {
  getTransactionHistory,
  addTransaction as storeTransaction,
  updateTransaction as updateStoredTransaction,
} from './storageService';

/**
 * JSON-RPC provider instance (singleton)
 */
let providerInstance: JsonRpcProvider | null = null;

/**
 * Get or create provider instance
 */
function getProvider(): JsonRpcProvider {
  if (!providerInstance) {
    providerInstance = new JsonRpcProvider(env.NEXT_PUBLIC_RPC_URL);
  }
  return providerInstance;
}

/**
 * Active transaction monitors (for cleanup)
 */
const activeMonitors = new Map<string, NodeJS.Timeout>();

/**
 * Wait for transaction confirmation
 *
 * @param txHash - Transaction hash
 * @param confirmations - Number of confirmations to wait for (default: 1)
 * @param timeout - Timeout in milliseconds (default: 5 minutes)
 * @returns Transaction receipt
 * @throws TransactionError on timeout or failure
 */
export async function waitForTransaction(
  txHash: string,
  confirmations = 1,
  timeout = 5 * 60 * 1000
): Promise<TransactionReceipt> {
  const provider = getProvider();

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new TransactionErrorClass(
          `Transaction confirmation timeout after ${timeout}ms`,
          'TIMEOUT',
          txHash
        ));
      }, timeout);
    });

    // Wait for transaction with timeout
    const receipt = await Promise.race([
      provider.waitForTransaction(txHash, confirmations),
      timeoutPromise,
    ]);

    if (!receipt) {
      throw new TransactionErrorClass(
        'Transaction receipt not found',
        'UNKNOWN_ERROR',
        txHash
      );
    }

    // Check if transaction was successful
    if (receipt.status === 0) {
      throw new TransactionErrorClass(
        'Transaction reverted',
        'REVERTED',
        txHash
      );
    }

    return receipt;
  } catch (error) {
    if (error instanceof TransactionErrorClass) {
      throw error;
    }

    throw new TransactionErrorClass(
      `Failed to wait for transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'NETWORK_ERROR',
      txHash,
      error
    );
  }
}

/**
 * Get transaction by hash
 *
 * @param txHash - Transaction hash
 * @returns Transaction response or null if not found
 * @throws TransactionError on network errors
 */
export async function getTransaction(txHash: string): Promise<TransactionResponse | null> {
  try {
    const provider = getProvider();
    return await provider.getTransaction(txHash);
  } catch (error) {
    throw new TransactionErrorClass(
      `Failed to fetch transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'NETWORK_ERROR',
      txHash,
      error
    );
  }
}

/**
 * Get transaction receipt (only available after confirmation)
 *
 * @param txHash - Transaction hash
 * @returns Transaction receipt or null if not mined yet
 * @throws TransactionError on network errors
 */
export async function getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null> {
  try {
    const provider = getProvider();
    return await provider.getTransactionReceipt(txHash);
  } catch (error) {
    throw new TransactionErrorClass(
      `Failed to fetch transaction receipt: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'NETWORK_ERROR',
      txHash,
      error
    );
  }
}

/**
 * Save transaction to local history
 *
 * @param tx - Transaction data to save
 * @throws TransactionError on storage errors
 */
export async function saveTransaction(tx: Transaction): Promise<void> {
  try {
    storeTransaction(tx);
  } catch (error) {
    throw new TransactionErrorClass(
      `Failed to save transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR',
      tx.hash,
      error
    );
  }
}

/**
 * Get all transactions from history
 *
 * @returns Array of transactions (newest first)
 */
export function getStoredTransactionHistory(): Transaction[] {
  return getTransactionHistory();
}

/**
 * Update transaction status and receipt data
 *
 * @param txHash - Transaction hash
 * @param status - New transaction status
 * @param receipt - Transaction receipt (optional)
 * @throws TransactionError on storage errors
 */
export async function updateTransactionStatus(
  txHash: string,
  status: TransactionStatus,
  receipt?: TransactionReceipt
): Promise<void> {
  try {
    const updates: Partial<Transaction> = {
      status,
    };

    if (receipt) {
      // Parse receipt data
      updates.blockNumber = receipt.blockNumber;
      updates.gasUsed = receipt.gasUsed.toString();
      updates.gasPrice = receipt.gasPrice?.toString() || null;

      // Get block timestamp
      const provider = getProvider();
      const block = await provider.getBlock(receipt.blockNumber);
      if (block) {
        updates.timestamp = new Date(block.timestamp * 1000).toISOString();
      }
    }

    // Handle failed status
    if (status === 'failed' && receipt?.status === 0) {
      updates.error = 'Transaction reverted';
    }

    updateStoredTransaction(txHash, updates);
  } catch (error) {
    throw new TransactionErrorClass(
      `Failed to update transaction status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN_ERROR',
      txHash,
      error
    );
  }
}

/**
 * Monitor a transaction with real-time callbacks
 *
 * @param monitor - Transaction monitor configuration
 * @returns Cleanup function to stop monitoring
 * @throws TransactionError on monitoring errors
 *
 * Example:
 * ```ts
 * const cleanup = await monitorTransaction({
 *   hash: txHash,
 *   transaction: tx,
 *   confirmations: 2,
 *   onConfirmed: (receipt) => console.log('Confirmed!', receipt),
 *   onFailed: (error) => console.error('Failed!', error),
 *   onUpdate: (status, receipt) => console.log('Status:', status),
 * });
 *
 * // Later: cleanup to stop monitoring
 * cleanup();
 * ```
 */
export async function monitorTransaction(
  monitor: TransactionMonitor
): Promise<() => void> {
  const { hash, transaction, confirmations = 1, onConfirmed, onFailed, onUpdate } = monitor;

  // Cleanup any existing monitor for this transaction
  const existingMonitor = activeMonitors.get(hash);
  if (existingMonitor) {
    clearInterval(existingMonitor);
  }

  let isMonitoring = true;

  // Start monitoring
  const monitoringPromise = (async () => {
    try {
      // Initial update
      onUpdate?.('pending');

      // Wait for confirmation
      const receipt = await waitForTransaction(hash, confirmations);

      if (!isMonitoring) return; // Stop if cleanup was called

      // Update status to confirmed
      await updateTransactionStatus(hash, 'confirmed', receipt);

      // Call callbacks
      onUpdate?.('confirmed', receipt);
      onConfirmed?.(receipt);
    } catch (error) {
      if (!isMonitoring) return; // Stop if cleanup was called

      // Update status to failed
      await updateTransactionStatus(hash, 'failed');

      // Call callbacks
      const txError = error instanceof TransactionErrorClass
        ? error
        : new TransactionErrorClass(
          error instanceof Error ? error.message : 'Unknown error',
          'UNKNOWN_ERROR',
          hash
        );

      onUpdate?.('failed');
      onFailed?.(txError);
    } finally {
      // Cleanup
      activeMonitors.delete(hash);
    }
  })();

  // Polling for updates (check every 5 seconds)
  const pollInterval = setInterval(async () => {
    if (!isMonitoring) {
      clearInterval(pollInterval);
      return;
    }

    try {
      const receipt = await getTransactionReceipt(hash);
      if (receipt) {
        // Transaction is mined, the main monitoring promise will handle it
        clearInterval(pollInterval);
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, 5000);

  activeMonitors.set(hash, pollInterval);

  // Return cleanup function
  return () => {
    isMonitoring = false;
    const interval = activeMonitors.get(hash);
    if (interval) {
      clearInterval(interval);
      activeMonitors.delete(hash);
    }
  };
}

/**
 * Create a transaction record from a transaction response
 *
 * @param tx - Transaction response from ethers
 * @param tokenAddress - Token address (for ERC20 transfers)
 * @param tokenSymbol - Token symbol
 * @param tokenDecimals - Token decimals
 * @param type - Transaction type
 * @returns Transaction record for storage
 */
export function createTransactionRecord(
  tx: TransactionResponse,
  tokenAddress: string | null,
  tokenSymbol: string,
  tokenDecimals: number,
  type: Transaction['type'] = 'send'
): Transaction {
  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value.toString(),
    tokenAddress,
    tokenSymbol,
    tokenDecimals,
    status: 'pending',
    type,
    blockNumber: null,
    timestamp: null,
    gasUsed: null,
    gasPrice: tx.gasPrice?.toString() || null,
    chainId: Number(tx.chainId),
  };
}

/**
 * Monitor and save a transaction
 *
 * @param tx - Transaction response
 * @param tokenAddress - Token address (for ERC20)
 * @param tokenSymbol - Token symbol
 * @param tokenDecimals - Token decimals
 * @param type - Transaction type
 * @param callbacks - Optional callbacks for status updates
 * @returns Cleanup function
 *
 * This is a convenience function that combines transaction creation,
 * saving, and monitoring in one call.
 */
export async function trackTransaction(
  tx: TransactionResponse,
  tokenAddress: string | null,
  tokenSymbol: string,
  tokenDecimals: number,
  type: Transaction['type'] = 'send',
  callbacks?: {
    onConfirmed?: (receipt: TransactionReceipt) => void;
    onFailed?: (error: Error) => void;
    onUpdate?: (status: TransactionStatus, receipt?: TransactionReceipt) => void;
  }
): Promise<() => void> {
  // Create transaction record
  const txRecord = createTransactionRecord(
    tx,
    tokenAddress,
    tokenSymbol,
    tokenDecimals,
    type
  );

  // Save to history
  await saveTransaction(txRecord);

  // Start monitoring
  return monitorTransaction({
    hash: tx.hash,
    transaction: tx,
    confirmations: 1,
    onConfirmed: callbacks?.onConfirmed,
    onFailed: callbacks?.onFailed,
    onUpdate: callbacks?.onUpdate,
  });
}

/**
 * Clean up all active monitors
 *
 * Call this when unmounting or cleaning up the app
 */
export function cleanupAllMonitors(): void {
  activeMonitors.forEach(interval => clearInterval(interval));
  activeMonitors.clear();
}

/**
 * Get pending transactions from history
 *
 * @returns Array of pending transactions
 */
export function getPendingTransactions(): Transaction[] {
  const history = getTransactionHistory();
  return history.filter(tx => tx.status === 'pending');
}

/**
 * Recheck pending transactions and update their status
 *
 * Useful for recovering transaction states after app restart
 *
 * @returns Number of transactions updated
 */
export async function recheckPendingTransactions(): Promise<number> {
  const pending = getPendingTransactions();
  let updated = 0;

  for (const tx of pending) {
    try {
      const receipt = await getTransactionReceipt(tx.hash);

      if (receipt) {
        const status = receipt.status === 1 ? 'confirmed' : 'failed';
        await updateTransactionStatus(tx.hash, status, receipt);
        updated++;
      }
    } catch (error) {
      console.error(`Failed to recheck transaction ${tx.hash}:`, error);
    }
  }

  return updated;
}
