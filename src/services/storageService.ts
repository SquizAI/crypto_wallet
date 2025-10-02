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
import type { AddressBookEntry } from '@/types/addressBook';
import type { MultiWalletStorage, MultiWalletData } from '@/types/multiWallet';

/**
 * Storage keys used in localStorage
 */
const STORAGE_KEYS = {
  WALLET: 'stablecoin_wallet_data',
  MULTI_WALLET: 'stablecoin_multi_wallet_data',
  TRANSACTIONS: 'stablecoin_wallet_transactions',
  SETTINGS: 'stablecoin_wallet_settings',
  ADDRESS_BOOK: 'stablecoin_wallet_address_book',
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
  if (typeof window === 'undefined') {
    return false;
  }

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
    // Return null during SSR
    if (typeof window === 'undefined') {
      return null;
    }

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
    // Return empty array during SSR
    if (typeof window === 'undefined') {
      return [];
    }

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
  // Return false during SSR
  if (typeof window === 'undefined') {
    return false;
  }

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
  clearAddressBook();

  // Clear backup status
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('stablecoin_wallet_backup_status');
    } catch (error) {
      console.error('Failed to clear backup status:', error);
    }
  }
}

// ============================================================================
// Address Book Storage Functions
// ============================================================================

/**
 * Save an address to the address book
 *
 * @param entry - Address book entry to save
 * @throws StorageError if storage fails
 */
export function saveAddress(entry: AddressBookEntry): void {
  try {
    // Check localStorage availability
    if (!isLocalStorageAvailable()) {
      throw new StorageError(
        'LocalStorage is not available. Please check your browser settings.',
        'ACCESS_DENIED'
      );
    }

    // Validate entry
    if (!entry.id || !entry.label || !entry.address) {
      throw new StorageError(
        'Invalid address book entry: missing required fields',
        'INVALID_DATA'
      );
    }

    // Validate address format
    if (!entry.address.startsWith('0x') || entry.address.length !== 42) {
      throw new StorageError(
        'Invalid address format',
        'INVALID_DATA'
      );
    }

    const addresses = getAddresses();

    // Check if entry with this ID already exists
    const existingIndex = addresses.findIndex(a => a.id === entry.id);

    if (existingIndex >= 0) {
      // Update existing entry
      addresses[existingIndex] = entry;
    } else {
      // Add new entry
      addresses.push(entry);
    }

    // Serialize and store
    const serialized = JSON.stringify(addresses);
    localStorage.setItem(STORAGE_KEYS.ADDRESS_BOOK, serialized);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    // Handle quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new StorageError(
        'Storage quota exceeded. Consider removing unused addresses.',
        'QUOTA_EXCEEDED'
      );
    }

    throw new StorageError(
      `Failed to save address: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Get all saved addresses from address book
 *
 * @returns Array of address book entries
 * @throws StorageError if storage access fails
 */
export function getAddresses(): AddressBookEntry[] {
  try {
    // Return empty array during SSR
    if (typeof window === 'undefined') {
      return [];
    }

    // Check localStorage availability
    if (!isLocalStorageAvailable()) {
      throw new StorageError(
        'LocalStorage is not available. Please check your browser settings.',
        'ACCESS_DENIED'
      );
    }

    // Retrieve and parse
    const serialized = localStorage.getItem(STORAGE_KEYS.ADDRESS_BOOK);
    const data = safeJsonParse<AddressBookEntry[]>(serialized);

    // Return empty array if no data or invalid data
    if (!data || !Array.isArray(data)) {
      return [];
    }

    // Sort by createdAt (newest first)
    return data.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    throw new StorageError(
      `Failed to retrieve addresses: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Update an existing address in address book
 *
 * @param id - ID of the address entry to update
 * @param updates - Partial address book entry data to update
 * @throws StorageError if storage fails
 */
export function updateAddress(
  id: string,
  updates: Partial<AddressBookEntry>
): void {
  const addresses = getAddresses();
  const index = addresses.findIndex(a => a.id === id);

  if (index >= 0) {
    // Merge updates with existing entry
    addresses[index] = {
      ...addresses[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Save updated list
    const serialized = JSON.stringify(addresses);
    localStorage.setItem(STORAGE_KEYS.ADDRESS_BOOK, serialized);
  } else {
    throw new StorageError(
      `Address with ID ${id} not found`,
      'INVALID_DATA'
    );
  }
}

/**
 * Delete an address from address book
 *
 * @param id - ID of the address entry to delete
 * @throws StorageError if storage fails
 */
export function deleteAddress(id: string): void {
  try {
    // Check localStorage availability
    if (!isLocalStorageAvailable()) {
      throw new StorageError(
        'LocalStorage is not available. Please check your browser settings.',
        'ACCESS_DENIED'
      );
    }

    const addresses = getAddresses();
    const filtered = addresses.filter(a => a.id !== id);

    // Save filtered list
    const serialized = JSON.stringify(filtered);
    localStorage.setItem(STORAGE_KEYS.ADDRESS_BOOK, serialized);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    throw new StorageError(
      `Failed to delete address: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Clear all addresses from address book
 *
 * @throws StorageError if storage access fails
 */
export function clearAddressBook(): void {
  try {
    // Check localStorage availability
    if (!isLocalStorageAvailable()) {
      throw new StorageError(
        'LocalStorage is not available. Please check your browser settings.',
        'ACCESS_DENIED'
      );
    }

    localStorage.removeItem(STORAGE_KEYS.ADDRESS_BOOK);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    throw new StorageError(
      `Failed to clear address book: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Get a single address by ID
 *
 * @param id - ID of the address entry
 * @returns Address book entry or null if not found
 */
export function getAddressById(id: string): AddressBookEntry | null {
  const addresses = getAddresses();
  return addresses.find(a => a.id === id) || null;
}

// ============================================================================
// Multi-Wallet Storage Functions
// ============================================================================

/**
 * Get multi-wallet storage data
 *
 * @returns Multi-wallet storage or null if none exists
 */
export function getMultiWalletStorage(): MultiWalletStorage | null {
  try {
    // Return null during SSR
    if (typeof window === 'undefined') {
      return null;
    }

    // Check localStorage availability
    if (!isLocalStorageAvailable()) {
      throw new StorageError(
        'LocalStorage is not available. Please check your browser settings.',
        'ACCESS_DENIED'
      );
    }

    // Retrieve and parse
    const serialized = localStorage.getItem(STORAGE_KEYS.MULTI_WALLET);
    const data = safeJsonParse<MultiWalletStorage>(serialized);

    // Validate retrieved data
    if (data) {
      if (!data.wallets || typeof data.wallets !== 'object') {
        // Corrupted data - clear it
        clearMultiWalletStorage();
        return null;
      }
    }

    return data;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    throw new StorageError(
      `Failed to retrieve multi-wallet data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Set multi-wallet storage data
 *
 * @param data - Multi-wallet storage data
 * @throws StorageError if storage fails
 */
export function setMultiWalletStorage(data: MultiWalletStorage): void {
  try {
    // Check localStorage availability
    if (!isLocalStorageAvailable()) {
      throw new StorageError(
        'LocalStorage is not available. Please check your browser settings.',
        'ACCESS_DENIED'
      );
    }

    // Validate data structure
    if (!data.wallets || typeof data.wallets !== 'object') {
      throw new StorageError(
        'Invalid multi-wallet data: missing wallets object',
        'INVALID_DATA'
      );
    }

    // Update timestamp
    data.updatedAt = new Date().toISOString();

    // Serialize and store
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEYS.MULTI_WALLET, serialized);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    // Handle quota exceeded error
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      throw new StorageError(
        'Storage quota exceeded. Please delete unused wallets.',
        'QUOTA_EXCEEDED'
      );
    }

    throw new StorageError(
      `Failed to store multi-wallet data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Clear multi-wallet storage
 *
 * @throws StorageError if storage access fails
 */
export function clearMultiWalletStorage(): void {
  try {
    // Check localStorage availability
    if (!isLocalStorageAvailable()) {
      throw new StorageError(
        'LocalStorage is not available. Please check your browser settings.',
        'ACCESS_DENIED'
      );
    }

    localStorage.removeItem(STORAGE_KEYS.MULTI_WALLET);
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }

    throw new StorageError(
      `Failed to clear multi-wallet data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Add or update a wallet in multi-wallet storage
 *
 * @param wallet - Wallet data to add/update
 * @throws StorageError if storage fails
 */
export function setMultiWallet(wallet: MultiWalletData): void {
  let storage = getMultiWalletStorage();

  if (!storage) {
    // Initialize new multi-wallet storage
    storage = {
      wallets: {},
      activeWalletId: wallet.id,
      version: '1.0.0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Add or update wallet
  storage.wallets[wallet.id] = wallet;

  // If no active wallet, set this as active
  if (!storage.activeWalletId) {
    storage.activeWalletId = wallet.id;
  }

  setMultiWalletStorage(storage);
}

/**
 * Get a specific wallet by ID
 *
 * @param walletId - Wallet ID
 * @returns Wallet data or null if not found
 */
export function getMultiWallet(walletId: string): MultiWalletData | null {
  const storage = getMultiWalletStorage();
  if (!storage) {
    return null;
  }

  return storage.wallets[walletId] || null;
}

/**
 * Get all wallets
 *
 * @returns Array of all wallets
 */
export function getAllMultiWallets(): MultiWalletData[] {
  const storage = getMultiWalletStorage();
  if (!storage) {
    return [];
  }

  return Object.values(storage.wallets).sort((a, b) => {
    // Sort by order first, then by lastUsedAt
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
  });
}

/**
 * Get active wallet ID
 *
 * @returns Active wallet ID or null
 */
export function getActiveWalletId(): string | null {
  const storage = getMultiWalletStorage();
  return storage?.activeWalletId || null;
}

/**
 * Set active wallet ID
 *
 * @param walletId - Wallet ID to set as active
 * @throws StorageError if storage fails or wallet not found
 */
export function setActiveWalletId(walletId: string): void {
  const storage = getMultiWalletStorage();
  if (!storage) {
    throw new StorageError(
      'No multi-wallet storage found',
      'INVALID_DATA'
    );
  }

  if (!storage.wallets[walletId]) {
    throw new StorageError(
      `Wallet with ID ${walletId} not found`,
      'INVALID_DATA'
    );
  }

  storage.activeWalletId = walletId;

  // Update lastUsedAt for the wallet
  storage.wallets[walletId].lastUsedAt = new Date().toISOString();

  setMultiWalletStorage(storage);
}

/**
 * Delete a wallet from multi-wallet storage
 *
 * @param walletId - Wallet ID to delete
 * @throws StorageError if storage fails
 */
export function deleteMultiWallet(walletId: string): void {
  const storage = getMultiWalletStorage();
  if (!storage) {
    return;
  }

  // Remove wallet
  delete storage.wallets[walletId];

  // If this was the active wallet, select another one
  if (storage.activeWalletId === walletId) {
    const wallets = Object.values(storage.wallets);
    if (wallets.length > 0) {
      // Set the most recently used wallet as active
      const sortedWallets = wallets.sort((a, b) =>
        new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime()
      );
      storage.activeWalletId = sortedWallets[0].id;
    } else {
      storage.activeWalletId = null;
    }
  }

  // If no wallets left, clear entire storage
  if (Object.keys(storage.wallets).length === 0) {
    clearMultiWalletStorage();
  } else {
    setMultiWalletStorage(storage);
  }
}

/**
 * Check if multi-wallet storage exists
 *
 * @returns true if multi-wallet storage exists
 */
export function hasMultiWalletStorage(): boolean {
  // Return false during SSR
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const storage = getMultiWalletStorage();
    return storage !== null && Object.keys(storage.wallets).length > 0;
  } catch {
    return false;
  }
}

/**
 * Update wallet metadata (label, color, icon, order)
 *
 * @param walletId - Wallet ID
 * @param updates - Partial wallet data to update
 * @throws StorageError if storage fails
 */
export function updateMultiWalletMetadata(
  walletId: string,
  updates: Partial<Pick<MultiWalletData, 'label' | 'color' | 'icon' | 'order'>>
): void {
  const storage = getMultiWalletStorage();
  if (!storage) {
    throw new StorageError(
      'No multi-wallet storage found',
      'INVALID_DATA'
    );
  }

  const wallet = storage.wallets[walletId];
  if (!wallet) {
    throw new StorageError(
      `Wallet with ID ${walletId} not found`,
      'INVALID_DATA'
    );
  }

  // Merge updates
  storage.wallets[walletId] = {
    ...wallet,
    ...updates,
  };

  setMultiWalletStorage(storage);
}
