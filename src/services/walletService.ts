/**
 * Wallet Service
 *
 * Core wallet management service using ethers.js v6.
 * Handles wallet creation, import, encryption, and unlocking.
 *
 * Security Features:
 * - HD wallet generation with BIP39 mnemonics
 * - BIP44 derivation path (m/44'/60'/0'/0/0)
 * - AES-256-GCM encryption for private keys and mnemonics
 * - Password validation (min 8 characters)
 * - Mnemonic validation (12 words, valid BIP39)
 * - Private key validation (0x prefixed, 64 hex chars)
 * - Secure memory handling (never log sensitive data)
 */

import { HDNodeWallet, Wallet, Mnemonic, isAddress, getBytes, randomBytes } from 'ethers';
import { encrypt, decrypt } from './encryptionService';
import {
  setWallet,
  getWallet,
  clearWallet,
  hasWallet as storageHasWallet,
} from './storageService';
import type { WalletData, UnlockedWallet } from '@/types/wallet';

/**
 * BIP44 derivation path for Ethereum
 * m/44'/60'/0'/0/0
 */
const DERIVATION_PATH = "m/44'/60'/0'/0/0";

/**
 * Wallet service error types
 */
export class WalletError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'INVALID_PASSWORD'
      | 'INVALID_MNEMONIC'
      | 'INVALID_PRIVATE_KEY'
      | 'WALLET_EXISTS'
      | 'NO_WALLET'
      | 'DECRYPTION_FAILED'
      | 'ENCRYPTION_FAILED'
      | 'UNKNOWN'
  ) {
    super(message);
    this.name = 'WalletError';
  }
}

/**
 * Validate password strength
 *
 * @param password - Password to validate
 * @throws WalletError if password is invalid
 */
function validatePassword(password: string): void {
  if (!password || password.length < 8) {
    throw new WalletError(
      'Password must be at least 8 characters long',
      'INVALID_PASSWORD'
    );
  }

  // Additional password strength checks could be added here
  // For example: require numbers, special characters, etc.
}

/**
 * Validate mnemonic phrase
 *
 * @param mnemonic - Mnemonic phrase to validate
 * @throws WalletError if mnemonic is invalid
 */
function validateMnemonic(mnemonic: string): void {
  try {
    const trimmed = mnemonic.trim().toLowerCase();
    const words = trimmed.split(/\s+/);

    // Check word count (12, 15, 18, 21, or 24 words)
    if (![12, 15, 18, 21, 24].includes(words.length)) {
      throw new WalletError(
        `Invalid mnemonic: must be 12, 15, 18, 21, or 24 words (got ${words.length})`,
        'INVALID_MNEMONIC'
      );
    }

    // Validate using ethers.js Mnemonic class
    Mnemonic.fromPhrase(trimmed);
  } catch (error) {
    if (error instanceof WalletError) {
      throw error;
    }

    throw new WalletError(
      `Invalid mnemonic phrase: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'INVALID_MNEMONIC'
    );
  }
}

/**
 * Validate private key format
 *
 * @param privateKey - Private key to validate
 * @throws WalletError if private key is invalid
 */
function validatePrivateKey(privateKey: string): void {
  try {
    // Remove 0x prefix if present
    const key = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

    // Check length (0x + 64 hex chars = 66 chars)
    if (key.length !== 66) {
      throw new WalletError(
        'Invalid private key: must be 32 bytes (64 hex characters)',
        'INVALID_PRIVATE_KEY'
      );
    }

    // Validate hex format
    if (!/^0x[0-9a-fA-F]{64}$/.test(key)) {
      throw new WalletError(
        'Invalid private key: must be hexadecimal',
        'INVALID_PRIVATE_KEY'
      );
    }

    // Validate by trying to create a wallet
    getBytes(key);
  } catch (error) {
    if (error instanceof WalletError) {
      throw error;
    }

    throw new WalletError(
      `Invalid private key: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'INVALID_PRIVATE_KEY'
    );
  }
}

/**
 * Create a new HD wallet with a randomly generated mnemonic
 *
 * @param password - Password to encrypt the wallet (min 8 characters)
 * @returns Object containing wallet address and mnemonic phrase
 * @throws WalletError if wallet creation fails
 *
 * Security Notes:
 * - Generates cryptographically secure 12-word mnemonic
 * - Uses BIP44 derivation path for Ethereum
 * - Encrypts both private key and mnemonic with user password
 * - Stores encrypted data in localStorage
 *
 * @example
 * ```typescript
 * const { address, mnemonic } = await createWallet('mySecurePassword123');
 * console.log('Wallet created:', address);
 * console.log('Backup phrase:', mnemonic); // Show this ONCE to user
 * ```
 */
export async function createWallet(password: string): Promise<{
  address: string;
  mnemonic: string;
}> {
  try {
    // Validate password
    validatePassword(password);

    // Check if wallet already exists
    if (hasWallet()) {
      throw new WalletError(
        'Wallet already exists. Delete existing wallet before creating a new one.',
        'WALLET_EXISTS'
      );
    }

    // Generate random mnemonic (12 words = 128 bits of entropy)
    const entropy = randomBytes(16);
    const mnemonic = Mnemonic.fromEntropy(entropy);

    // Create wallet directly at the BIP44 path
    const derivedWallet = HDNodeWallet.fromMnemonic(mnemonic, DERIVATION_PATH);

    // Get mnemonic phrase
    const mnemonicPhrase = mnemonic.phrase;
    if (!mnemonicPhrase) {
      throw new WalletError(
        'Failed to generate mnemonic phrase',
        'UNKNOWN'
      );
    }

    // Encrypt private key and mnemonic
    const encryptedPrivateKey = await encrypt(derivedWallet.privateKey, password);
    const encryptedMnemonic = await encrypt(mnemonicPhrase, password);

    // Prepare wallet data
    const walletData: WalletData = {
      encryptedPrivateKey,
      encryptedMnemonic,
      address: derivedWallet.address,
      createdAt: new Date().toISOString(),
      type: 'hd',
    };

    // Store encrypted wallet
    setWallet(walletData);

    return {
      address: derivedWallet.address,
      mnemonic: mnemonicPhrase,
    };
  } catch (error) {
    if (error instanceof WalletError) {
      throw error;
    }

    // Handle encryption errors
    if (error instanceof Error && error.message.includes('Encryption failed')) {
      throw new WalletError(
        `Failed to encrypt wallet: ${error.message}`,
        'ENCRYPTION_FAILED'
      );
    }

    throw new WalletError(
      `Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Import wallet from mnemonic phrase
 *
 * @param mnemonic - 12-word mnemonic phrase (BIP39)
 * @param password - Password to encrypt the wallet (min 8 characters)
 * @returns Wallet address
 * @throws WalletError if import fails
 *
 * Security Notes:
 * - Validates mnemonic phrase against BIP39 wordlist
 * - Uses BIP44 derivation path for Ethereum
 * - Encrypts both private key and mnemonic
 *
 * @example
 * ```typescript
 * const address = await importFromMnemonic(
 *   'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12',
 *   'mySecurePassword123'
 * );
 * ```
 */
export async function importFromMnemonic(
  mnemonic: string,
  password: string
): Promise<string> {
  try {
    // Validate inputs
    validatePassword(password);
    validateMnemonic(mnemonic);

    // Check if wallet already exists
    if (hasWallet()) {
      throw new WalletError(
        'Wallet already exists. Delete existing wallet before importing.',
        'WALLET_EXISTS'
      );
    }

    // Normalize mnemonic (trim and lowercase)
    const normalizedMnemonic = mnemonic.trim().toLowerCase();

    // Create HD wallet from mnemonic
    const hdWallet = HDNodeWallet.fromPhrase(normalizedMnemonic);

    // Derive account using BIP44 path
    const derivedWallet = hdWallet.derivePath(DERIVATION_PATH);

    // Encrypt private key and mnemonic
    const encryptedPrivateKey = await encrypt(derivedWallet.privateKey, password);
    const encryptedMnemonic = await encrypt(normalizedMnemonic, password);

    // Prepare wallet data
    const walletData: WalletData = {
      encryptedPrivateKey,
      encryptedMnemonic,
      address: derivedWallet.address,
      createdAt: new Date().toISOString(),
      type: 'hd',
    };

    // Store encrypted wallet
    setWallet(walletData);

    return derivedWallet.address;
  } catch (error) {
    if (error instanceof WalletError) {
      throw error;
    }

    // Handle encryption errors
    if (error instanceof Error && error.message.includes('Encryption failed')) {
      throw new WalletError(
        `Failed to encrypt wallet: ${error.message}`,
        'ENCRYPTION_FAILED'
      );
    }

    throw new WalletError(
      `Failed to import wallet from mnemonic: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Import wallet from private key
 *
 * @param privateKey - Private key (0x prefixed or raw hex)
 * @param password - Password to encrypt the wallet (min 8 characters)
 * @returns Wallet address
 * @throws WalletError if import fails
 *
 * Security Notes:
 * - Validates private key format
 * - No mnemonic available for private key imports
 * - Encrypts private key only
 *
 * @example
 * ```typescript
 * const address = await importFromPrivateKey(
 *   '0x1234567890abcdef...',
 *   'mySecurePassword123'
 * );
 * ```
 */
export async function importFromPrivateKey(
  privateKey: string,
  password: string
): Promise<string> {
  try {
    // Validate inputs
    validatePassword(password);
    validatePrivateKey(privateKey);

    // Check if wallet already exists
    if (hasWallet()) {
      throw new WalletError(
        'Wallet already exists. Delete existing wallet before importing.',
        'WALLET_EXISTS'
      );
    }

    // Ensure 0x prefix
    const normalizedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;

    // Create wallet from private key
    const wallet = new Wallet(normalizedKey);

    // Encrypt private key
    const encryptedPrivateKey = await encrypt(normalizedKey, password);

    // Prepare wallet data (no mnemonic for private key imports)
    const walletData: WalletData = {
      encryptedPrivateKey,
      encryptedMnemonic: null,
      address: wallet.address,
      createdAt: new Date().toISOString(),
      type: 'imported',
    };

    // Store encrypted wallet
    setWallet(walletData);

    return wallet.address;
  } catch (error) {
    if (error instanceof WalletError) {
      throw error;
    }

    // Handle encryption errors
    if (error instanceof Error && error.message.includes('Encryption failed')) {
      throw new WalletError(
        `Failed to encrypt wallet: ${error.message}`,
        'ENCRYPTION_FAILED'
      );
    }

    throw new WalletError(
      `Failed to import wallet from private key: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Unlock wallet with password
 *
 * @param password - User password
 * @returns Unlocked wallet instance (in-memory only)
 * @throws WalletError if unlock fails
 *
 * Security Notes:
 * - Decrypts wallet data in memory only
 * - Never stores decrypted data
 * - Returns instance should be used immediately and discarded
 * - Wrong password will throw DECRYPTION_FAILED error
 *
 * @example
 * ```typescript
 * const unlockedWallet = await unlockWallet('mySecurePassword123');
 * // Use wallet immediately
 * // Don't store unlockedWallet - let it be garbage collected
 * ```
 */
export async function unlockWallet(password: string): Promise<UnlockedWallet> {
  try {
    // Validate password
    validatePassword(password);

    // Get encrypted wallet data
    const walletData = getWallet();

    if (!walletData) {
      throw new WalletError(
        'No wallet found. Create or import a wallet first.',
        'NO_WALLET'
      );
    }

    // Decrypt private key
    let privateKey: string;
    try {
      privateKey = await decrypt(walletData.encryptedPrivateKey, password);
    } catch (error) {
      throw new WalletError(
        'Invalid password or corrupted wallet data',
        'DECRYPTION_FAILED'
      );
    }

    // Decrypt mnemonic (if available)
    let mnemonic: string | null = null;
    if (walletData.encryptedMnemonic) {
      try {
        mnemonic = await decrypt(walletData.encryptedMnemonic, password);
      } catch (error) {
        // If mnemonic decryption fails, wallet might be corrupted
        throw new WalletError(
          'Invalid password or corrupted wallet data',
          'DECRYPTION_FAILED'
        );
      }
    }

    // Verify private key produces correct address
    const wallet = new Wallet(privateKey);
    if (wallet.address !== walletData.address) {
      throw new WalletError(
        'Wallet verification failed: address mismatch',
        'DECRYPTION_FAILED'
      );
    }

    // Return unlocked wallet instance
    return {
      address: wallet.address,
      privateKey,
      mnemonic,
      type: walletData.type,
    };
  } catch (error) {
    if (error instanceof WalletError) {
      throw error;
    }

    throw new WalletError(
      `Failed to unlock wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Check if a wallet exists in storage
 *
 * @returns true if wallet exists
 */
export function hasWallet(): boolean {
  return storageHasWallet();
}

/**
 * Delete wallet from storage
 *
 * @throws WalletError if deletion fails
 *
 * Security Note: This operation cannot be undone.
 * Ensure user has backed up their mnemonic/private key before calling.
 */
export function deleteWallet(): void {
  try {
    if (!hasWallet()) {
      throw new WalletError(
        'No wallet to delete',
        'NO_WALLET'
      );
    }

    clearWallet();
  } catch (error) {
    if (error instanceof WalletError) {
      throw error;
    }

    throw new WalletError(
      `Failed to delete wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Get wallet address without unlocking
 *
 * @returns Wallet address or null if no wallet exists
 */
export function getWalletAddress(): string | null {
  const walletData = getWallet();
  return walletData?.address ?? null;
}

/**
 * Get wallet type without unlocking
 *
 * @returns Wallet type or null if no wallet exists
 */
export function getWalletType(): 'hd' | 'imported' | null {
  const walletData = getWallet();
  return walletData?.type ?? null;
}

/**
 * Verify password is correct without fully unlocking wallet
 *
 * @param password - Password to verify
 * @returns true if password is correct
 */
export async function verifyPassword(password: string): Promise<boolean> {
  try {
    const walletData = getWallet();
    if (!walletData) {
      return false;
    }

    // Try to decrypt private key
    await decrypt(walletData.encryptedPrivateKey, password);
    return true;
  } catch {
    return false;
  }
}

/**
 * Export private key (requires password)
 *
 * @param password - User password
 * @returns Private key (0x prefixed)
 * @throws WalletError if export fails
 *
 * Security Warning: Private keys should be handled with extreme care.
 * Only export when absolutely necessary and ensure secure display/storage.
 */
export async function exportPrivateKey(password: string): Promise<string> {
  const unlocked = await unlockWallet(password);
  return unlocked.privateKey;
}

/**
 * Export mnemonic phrase (requires password)
 *
 * @param password - User password
 * @returns Mnemonic phrase or null if not available
 * @throws WalletError if export fails
 *
 * Security Warning: Mnemonic phrases should be handled with extreme care.
 * Only export when absolutely necessary and ensure secure display/storage.
 */
export async function exportMnemonic(password: string): Promise<string | null> {
  const unlocked = await unlockWallet(password);
  return unlocked.mnemonic;
}
