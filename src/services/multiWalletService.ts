/**
 * Multi-Wallet Service
 *
 * Service layer for managing multiple wallets with switching capabilities.
 * Builds on top of walletService to provide multi-wallet functionality.
 *
 * Features:
 * - Create multiple wallets with unique IDs and labels
 * - Switch between wallets without re-entering password (session-based)
 * - Update wallet metadata (label, color, icon)
 * - Delete individual wallets
 * - Automatic color and icon assignment
 */

import { randomBytes } from 'ethers';
import {
  createWallet as createSingleWallet,
  importFromMnemonic as importSingleFromMnemonic,
  importFromPrivateKey as importSingleFromPrivateKey,
  unlockWallet as unlockSingleWallet,
  WalletError,
} from './walletService';
import {
  setMultiWallet,
  getMultiWallet,
  getAllMultiWallets,
  getActiveWalletId,
  setActiveWalletId,
  deleteMultiWallet,
  updateMultiWalletMetadata,
  hasMultiWalletStorage,
  clearMultiWalletStorage,
} from './storageService';
import type {
  MultiWalletData,
  CreateWalletOptions,
  UpdateWalletOptions,
  WalletSummary,
  WalletColor,
  WalletIcon,
} from '@/types/multiWallet';
import type { UnlockedWallet } from '@/types/wallet';

/**
 * Available colors for auto-assignment
 */
const AVAILABLE_COLORS: WalletColor[] = [
  'blue',
  'purple',
  'green',
  'orange',
  'pink',
  'cyan',
  'red',
  'yellow',
];

/**
 * Available icons for auto-assignment
 */
const AVAILABLE_ICONS: WalletIcon[] = [
  'wallet',
  'star',
  'shield',
  'key',
  'lock',
  'coin',
  'chart',
  'briefcase',
];

/**
 * Generate a unique wallet ID
 *
 * @returns Unique wallet ID
 */
function generateWalletId(): string {
  const bytes = randomBytes(16);
  return `wallet_${Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * Get next available color for wallet
 *
 * @returns Color that is least used
 */
function getNextAvailableColor(): WalletColor {
  const wallets = getAllMultiWallets();

  // Count color usage
  const colorCounts: Record<WalletColor, number> = {
    blue: 0,
    purple: 0,
    green: 0,
    orange: 0,
    pink: 0,
    cyan: 0,
    red: 0,
    yellow: 0,
  };

  wallets.forEach((w) => {
    colorCounts[w.color] = (colorCounts[w.color] || 0) + 1;
  });

  // Find least used color
  let minColor: WalletColor = 'blue';
  let minCount = Infinity;

  for (const color of AVAILABLE_COLORS) {
    if (colorCounts[color] < minCount) {
      minCount = colorCounts[color];
      minColor = color;
    }
  }

  return minColor;
}

/**
 * Get next available icon for wallet
 *
 * @returns Icon that is least used
 */
function getNextAvailableIcon(): WalletIcon {
  const wallets = getAllMultiWallets();

  // Count icon usage
  const iconCounts: Record<WalletIcon, number> = {
    wallet: 0,
    star: 0,
    shield: 0,
    key: 0,
    lock: 0,
    coin: 0,
    chart: 0,
    briefcase: 0,
  };

  wallets.forEach((w) => {
    iconCounts[w.icon] = (iconCounts[w.icon] || 0) + 1;
  });

  // Find least used icon
  let minIcon: WalletIcon = 'wallet';
  let minCount = Infinity;

  for (const icon of AVAILABLE_ICONS) {
    if (iconCounts[icon] < minCount) {
      minCount = iconCounts[icon];
      minIcon = icon;
    }
  }

  return minIcon;
}

/**
 * Create a new multi-wallet
 *
 * @param password - Password to encrypt the wallet
 * @param options - Wallet creation options
 * @returns Object containing wallet ID, address, and mnemonic
 * @throws WalletError if creation fails
 *
 * @example
 * ```typescript
 * const { id, address, mnemonic } = await createMultiWallet('password', {
 *   label: 'My Main Wallet',
 *   color: 'blue',
 *   icon: 'wallet'
 * });
 * ```
 */
export async function createMultiWallet(
  password: string,
  options: CreateWalletOptions
): Promise<{
  id: string;
  address: string;
  mnemonic: string;
}> {
  try {
    // Create the base wallet using single wallet service
    // We'll temporarily store it and then move it to multi-wallet storage
    const { address, mnemonic } = await createSingleWallet(password);

    // Generate wallet ID
    const walletId = generateWalletId();

    // Get wallet data that was just created
    const { getWallet, clearWallet } = await import('./storageService');
    const walletData = getWallet();

    if (!walletData) {
      throw new WalletError(
        'Failed to retrieve created wallet data',
        'UNKNOWN'
      );
    }

    // Clear the single wallet storage as we're moving to multi-wallet
    clearWallet();

    // Prepare multi-wallet data
    const now = new Date().toISOString();
    const wallets = getAllMultiWallets();
    const multiWalletData: MultiWalletData = {
      ...walletData,
      id: walletId,
      label: options.label,
      color: options.color || getNextAvailableColor(),
      icon: options.icon || getNextAvailableIcon(),
      lastUsedAt: now,
      order: wallets.length,
    };

    // Store in multi-wallet storage
    setMultiWallet(multiWalletData);

    return {
      id: walletId,
      address,
      mnemonic,
    };
  } catch (error) {
    if (error instanceof WalletError) {
      throw error;
    }

    throw new WalletError(
      `Failed to create multi-wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Import wallet from mnemonic into multi-wallet storage
 *
 * @param mnemonic - Mnemonic phrase
 * @param password - Password to encrypt the wallet
 * @param options - Wallet creation options
 * @returns Object containing wallet ID and address
 * @throws WalletError if import fails
 */
export async function importMultiWalletFromMnemonic(
  mnemonic: string,
  password: string,
  options: CreateWalletOptions
): Promise<{
  id: string;
  address: string;
}> {
  try {
    // Import using single wallet service
    const address = await importSingleFromMnemonic(mnemonic, password);

    // Get wallet data that was just created
    const { getWallet, clearWallet } = await import('./storageService');
    const walletData = getWallet();

    if (!walletData) {
      throw new WalletError(
        'Failed to retrieve imported wallet data',
        'UNKNOWN'
      );
    }

    // Clear the single wallet storage
    clearWallet();

    // Generate wallet ID
    const walletId = generateWalletId();

    // Prepare multi-wallet data
    const now = new Date().toISOString();
    const wallets = getAllMultiWallets();
    const multiWalletData: MultiWalletData = {
      ...walletData,
      id: walletId,
      label: options.label,
      color: options.color || getNextAvailableColor(),
      icon: options.icon || getNextAvailableIcon(),
      lastUsedAt: now,
      order: wallets.length,
    };

    // Store in multi-wallet storage
    setMultiWallet(multiWalletData);

    return {
      id: walletId,
      address,
    };
  } catch (error) {
    if (error instanceof WalletError) {
      throw error;
    }

    throw new WalletError(
      `Failed to import multi-wallet from mnemonic: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Import wallet from private key into multi-wallet storage
 *
 * @param privateKey - Private key
 * @param password - Password to encrypt the wallet
 * @param options - Wallet creation options
 * @returns Object containing wallet ID and address
 * @throws WalletError if import fails
 */
export async function importMultiWalletFromPrivateKey(
  privateKey: string,
  password: string,
  options: CreateWalletOptions
): Promise<{
  id: string;
  address: string;
}> {
  try {
    // Import using single wallet service
    const address = await importSingleFromPrivateKey(privateKey, password);

    // Get wallet data that was just created
    const { getWallet, clearWallet } = await import('./storageService');
    const walletData = getWallet();

    if (!walletData) {
      throw new WalletError(
        'Failed to retrieve imported wallet data',
        'UNKNOWN'
      );
    }

    // Clear the single wallet storage
    clearWallet();

    // Generate wallet ID
    const walletId = generateWalletId();

    // Prepare multi-wallet data
    const now = new Date().toISOString();
    const wallets = getAllMultiWallets();
    const multiWalletData: MultiWalletData = {
      ...walletData,
      id: walletId,
      label: options.label,
      color: options.color || getNextAvailableColor(),
      icon: options.icon || getNextAvailableIcon(),
      lastUsedAt: now,
      order: wallets.length,
    };

    // Store in multi-wallet storage
    setMultiWallet(multiWalletData);

    return {
      id: walletId,
      address,
    };
  } catch (error) {
    if (error instanceof WalletError) {
      throw error;
    }

    throw new WalletError(
      `Failed to import multi-wallet from private key: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Unlock a specific wallet by ID
 *
 * @param walletId - Wallet ID to unlock
 * @param password - Password to unlock the wallet
 * @returns Unlocked wallet instance
 * @throws WalletError if unlock fails
 */
export async function unlockMultiWallet(
  walletId: string,
  password: string
): Promise<UnlockedWallet> {
  try {
    const wallet = getMultiWallet(walletId);
    if (!wallet) {
      throw new WalletError(
        `Wallet with ID ${walletId} not found`,
        'NO_WALLET'
      );
    }

    // Temporarily set this wallet as the single wallet for unlocking
    const { setWallet, getWallet, clearWallet } = await import('./storageService');
    setWallet(wallet);

    // Unlock using single wallet service
    const unlockedWallet = await unlockSingleWallet(password);

    // Clean up temporary single wallet storage
    clearWallet();

    return unlockedWallet;
  } catch (error) {
    // Clean up on error
    const { clearWallet } = await import('./storageService');
    clearWallet();

    if (error instanceof WalletError) {
      throw error;
    }

    throw new WalletError(
      `Failed to unlock multi-wallet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'UNKNOWN'
    );
  }
}

/**
 * Switch to a different wallet
 *
 * @param walletId - Wallet ID to switch to
 * @throws WalletError if wallet not found
 */
export function switchWallet(walletId: string): void {
  setActiveWalletId(walletId);
}

/**
 * Get active wallet data
 *
 * @returns Active wallet data or null if none active
 */
export function getActiveWallet(): MultiWalletData | null {
  const activeId = getActiveWalletId();
  if (!activeId) {
    return null;
  }

  return getMultiWallet(activeId);
}

/**
 * Get all wallets as summaries
 *
 * @returns Array of wallet summaries
 */
export function getAllWalletSummaries(): WalletSummary[] {
  const wallets = getAllMultiWallets();
  const activeId = getActiveWalletId();

  return wallets.map((wallet) => ({
    id: wallet.id,
    label: wallet.label,
    address: wallet.address,
    color: wallet.color,
    icon: wallet.icon,
    type: wallet.type,
    createdAt: wallet.createdAt,
    lastUsedAt: wallet.lastUsedAt,
    isActive: wallet.id === activeId,
  }));
}

/**
 * Update wallet metadata
 *
 * @param walletId - Wallet ID
 * @param updates - Updates to apply
 * @throws WalletError if wallet not found
 */
export function updateWallet(
  walletId: string,
  updates: UpdateWalletOptions
): void {
  updateMultiWalletMetadata(walletId, updates);
}

/**
 * Delete a wallet
 *
 * @param walletId - Wallet ID to delete
 * @throws WalletError if wallet is the only one or not found
 */
export function deleteWallet(walletId: string): void {
  const wallets = getAllMultiWallets();

  if (wallets.length <= 1) {
    throw new WalletError(
      'Cannot delete the last wallet. Create another wallet first.',
      'INVALID_MNEMONIC' // Using existing error code
    );
  }

  deleteMultiWallet(walletId);
}

/**
 * Check if multi-wallet mode is enabled
 *
 * @returns true if multi-wallet storage exists
 */
export function isMultiWalletMode(): boolean {
  return hasMultiWalletStorage();
}

/**
 * Clear all multi-wallet data
 * WARNING: This will delete all wallets
 */
export function clearAllWallets(): void {
  clearMultiWalletStorage();
}

/**
 * Get wallet count
 *
 * @returns Number of wallets
 */
export function getWalletCount(): number {
  return getAllMultiWallets().length;
}
