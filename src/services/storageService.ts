/**
 * Storage Service
 *
 * Secure LocalStorage wrapper for wallet data and transaction history.
 * Handles storage operations with proper error handling and validation.
 *
 * Security Features:
 * - Validates data before storage
 * - Handles localStorage quota exceeded errors
 * - Handles browsers that block localStorage (privacy mode)
 * - Never stores unencrypted sensitive data
 * - Provides atomic operations with error recovery
 */

import type { WalletData, Transaction } from '@/types/wallet';

/**
 * Storage keys used in localStorage
 */
const STORAGE_KEYS = {
  WALLET: 'stablecoin_wallet_data',
  TRANSACTIONS: 'stablecoin_wallet_transactions',
  SETTINGS: 'stablecoin_wallet_settings',
} as const;

/**
 * Storage error types
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code: 'QUOTA_EXCEEDED' | 'ACCESS_DENIED' | 'INVALID_DATA' | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Check if localStorage is available and accessible
 *
 * @returns true if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely parse JSON with error handling
 *
 * @param data - JSON string to parse
 * @returns Parsed data or null if invalid
 */
function safeJsonParse<T>(data: string | null): T | null {
  if (!data) {
    return null;
  }

  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

/**
 * Store encrypted wallet data in localStorage
 *
 * @param data - Encrypted wallet data to store
 * @throws StorageError if storage fails
 *
 * Security Note: This function expects already-encrypted data.
 * Never call this with unencrypted private keys or mnemonics.
 */
export function setWallet(data: WalletData): void {
  try {
    // Check localStorage availability
    if (!isLocalStorageAvailable()) {
      throw new StorageError(
        'LocalStorage is not available. Please check your browser settings.',
        'ACCESS_DENIED'
      );
    }

    // Validate wallet data structure
    if (!data.encryptedPrivateKey || !data.address) {
      throw new StorageError(
        'Invalid wallet data: missing required fields',
        'INVALID_DATA'
      );
    }

    // Validate address format
    if (!data.address.startsWith('0x') || data.address.length !== 42) {
      throw new StorageError(
        'Invalid wallet data: malformed address',
        'INVALID_DATA'
      );
    }

    // Validate wallet type
    if (data.type !== 'hd' && data.type !== 'imported') {
      throw new StorageError(
        'Invalid wallet data: invalid wallet type',
        'INVALID_DATA'
      );
    }

    // Serialize and store
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEYS.WALLET, serialized);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    // Handle quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new StorageError(
        'Storage quota exceeded. Please clear some data.',
        'QUOTA_EXCEEDED'
      );
    }

    // Handle other errors
    throw new StorageError(
      `Failed to store wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Retrieve encrypted wallet data from localStorage
 *
 * @returns Encrypted wallet data, or null if no wallet exists
 * @throws StorageError if storage access fails
 */
export function getWallet(): WalletData | null {
  try {
    // Check localStorage availability
    if (!isLocalStorageAvailable()) {
      throw new StorageError(
        'LocalStorage is not available. Please check your browser settings.',
        'ACCESS_DENIED'
      );
    }

    // Retrieve and parse
    const serialized = localStorage.getItem(STORAGE_KEYS.WALLET);
    const data = safeJsonParse<WalletData>(serialized);

    // Validate retrieved data
    if (data) {
      if (!data.encryptedPrivateKey || !data.address) {
        // Corrupted data - clear it
        clearWallet();
        return null;
      }
    }

    return data;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    throw new StorageError(
      `Failed to retrieve wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Delete wallet data from localStorage
 *
 * @throws StorageError if storage access fails
 */
export function clearWallet(): void {
  try {
    // Check localStorage availability
    if (!isLocalStorageAvailable()) {
      throw new StorageError(
        'LocalStorage is not available. Please check your browser settings.',
        'ACCESS_DENIED'
      );
    }

    localStorage.removeItem(STORAGE_KEYS.WALLET);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    throw new StorageError(
      `Failed to clear wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Store transaction history in localStorage
 *
 * @param transactions - Array of transaction records
 * @throws StorageError if storage fails
 *
 * Note: Transactions are stored in reverse chronological order (newest first)
 */
export function setTransactionHistory(transactions: Transaction[]): void {
  try {
    // Check localStorage availability
    if (!isLocalStorageAvailable()) {
      throw new StorageError(
        'LocalStorage is not available. Please check your browser settings.',
        'ACCESS_DENIED'
      );
    }

    // Validate transactions array
    if (!Array.isArray(transactions)) {
      throw new StorageError(
        'Invalid transaction data: must be an array',
        'INVALID_DATA'
      );
    }

    // Validate each transaction
    for (const tx of transactions) {
      if (!tx.hash || !tx.from) {
        throw new StorageError(
          'Invalid transaction data: missing required fields',
          'INVALID_DATA'
        );
      }
    }

    // Serialize and store
    const serialized = JSON.stringify(transactions);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, serialized);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    // Handle quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new StorageError(
        'Storage quota exceeded. Consider clearing old transactions.',
        'QUOTA_EXCEEDED'
      );
    }

    throw new StorageError(
      `Failed to store transactions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Retrieve transaction history from localStorage
 *
 * @returns Array of transaction records (newest first), or empty array if none exist
 * @throws StorageError if storage access fails
 */
export function getTransactionHistory(): Transaction[] {
  try {
    // Check localStorage availability
    if (!isLocalStorageAvailable()) {
      throw new StorageError(
        'LocalStorage is not available. Please check your browser settings.',
        'ACCESS_DENIED'
      );
    }

    // Retrieve and parse
    const serialized = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const data = safeJsonParse<Transaction[]>(serialized);

    // Return empty array if no data or invalid data
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    throw new StorageError(
      `Failed to retrieve transactions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Clear all transaction history
 *
 * @throws StorageError if storage access fails
 */
export function clearTransactionHistory(): void {
  try {
    // Check localStorage availability
    if (!isLocalStorageAvailable()) {
      throw new StorageError(
        'LocalStorage is not available. Please check your browser settings.',
        'ACCESS_DENIED'
      );
    }

    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    throw new StorageError(
      `Failed to clear transactions: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Add a single transaction to history
 *
 * @param transaction - Transaction to add
 * @throws StorageError if storage fails
 *
 * Note: Adds to the beginning of the array (newest first)
 */
export function addTransaction(transaction: Transaction): void {
  const existing = getTransactionHistory();

  // Check if transaction already exists
  const index = existing.findIndex(tx => tx.hash === transaction.hash);

  if (index >= 0) {
    // Update existing transaction
    existing[index] = transaction;
  } else {
    // Add new transaction at the beginning
    existing.unshift(transaction);
  }

  // Limit to last 1000 transactions to prevent storage bloat
  const limited = existing.slice(0, 1000);

  setTransactionHistory(limited);
}

/**
 * Update an existing transaction in history
 *
 * @param hash - Transaction hash to update
 * @param updates - Partial transaction data to update
 * @throws StorageError if storage fails
 */
export function updateTransaction(
  hash: string,
  updates: Partial<Transaction>
): void {
  const existing = getTransactionHistory();
  const index = existing.findIndex(tx => tx.hash === hash);

  if (index >= 0) {
    // Merge updates with existing transaction
    existing[index] = {
      ...existing[index],
      ...updates,
    };

    setTransactionHistory(existing);
  }
}

/**
 * Check if a wallet exists in storage
 *
 * @returns true if a wallet exists
 */
export function hasWallet(): boolean {
  try {
    const wallet = getWallet();
    return wallet !== null;
  } catch {
    return false;
  }
}

/**
 * Clear all wallet-related data from storage
 * Use with caution - this operation cannot be undone
 *
 * @throws StorageError if storage access fails
 */
export function clearAllData(): void {
  clearWallet();
  clearTransactionHistory();
}
