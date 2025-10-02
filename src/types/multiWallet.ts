/**
 * Multi-Wallet Type Definitions
 *
 * Types for managing multiple wallets with switching capabilities
 */

import type { WalletData } from './wallet';

/**
 * Wallet color scheme for visual distinction
 */
export type WalletColor =
  | 'blue'
  | 'purple'
  | 'green'
  | 'orange'
  | 'pink'
  | 'cyan'
  | 'red'
  | 'yellow';

/**
 * Wallet icon type for visual distinction
 */
export type WalletIcon =
  | 'wallet'
  | 'star'
  | 'shield'
  | 'key'
  | 'lock'
  | 'coin'
  | 'chart'
  | 'briefcase';

/**
 * Extended wallet data with multi-wallet metadata
 */
export interface MultiWalletData extends WalletData {
  /**
   * Unique identifier for this wallet
   */
  id: string;

  /**
   * User-defined label for the wallet
   */
  label: string;

  /**
   * Visual color scheme
   */
  color: WalletColor;

  /**
   * Visual icon type
   */
  icon: WalletIcon;

  /**
   * Last used timestamp (for sorting)
   */
  lastUsedAt: string;

  /**
   * Order index for custom sorting
   */
  order: number;
}

/**
 * Multi-wallet storage structure
 */
export interface MultiWalletStorage {
  /**
   * All wallets keyed by wallet ID
   */
  wallets: Record<string, MultiWalletData>;

  /**
   * Currently active wallet ID
   */
  activeWalletId: string | null;

  /**
   * Storage format version for future compatibility
   */
  version: string;

  /**
   * Creation timestamp
   */
  createdAt: string;

  /**
   * Last updated timestamp
   */
  updatedAt: string;
}

/**
 * Wallet creation options
 */
export interface CreateWalletOptions {
  /**
   * Wallet label (required)
   */
  label: string;

  /**
   * Color scheme (optional, will auto-assign if not provided)
   */
  color?: WalletColor;

  /**
   * Icon type (optional, will auto-assign if not provided)
   */
  icon?: WalletIcon;
}

/**
 * Wallet update options
 */
export interface UpdateWalletOptions {
  /**
   * New label (optional)
   */
  label?: string;

  /**
   * New color scheme (optional)
   */
  color?: WalletColor;

  /**
   * New icon type (optional)
   */
  icon?: WalletIcon;
}

/**
 * Wallet summary for list displays
 */
export interface WalletSummary {
  /**
   * Wallet ID
   */
  id: string;

  /**
   * Wallet label
   */
  label: string;

  /**
   * Wallet address
   */
  address: string;

  /**
   * Color scheme
   */
  color: WalletColor;

  /**
   * Icon type
   */
  icon: WalletIcon;

  /**
   * Wallet type
   */
  type: 'hd' | 'imported';

  /**
   * Creation timestamp
   */
  createdAt: string;

  /**
   * Last used timestamp
   */
  lastUsedAt: string;

  /**
   * Whether this is the active wallet
   */
  isActive: boolean;
}

/**
 * Available wallet colors with their CSS classes
 */
export const WALLET_COLORS: Record<
  WalletColor,
  {
    gradient: string;
    text: string;
    border: string;
    bg: string;
    shadow: string;
  }
> = {
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    text: 'text-blue-400',
    border: 'border-blue-500/50',
    bg: 'bg-blue-500/20',
    shadow: 'shadow-blue-500/50',
  },
  purple: {
    gradient: 'from-purple-500 to-pink-500',
    text: 'text-purple-400',
    border: 'border-purple-500/50',
    bg: 'bg-purple-500/20',
    shadow: 'shadow-purple-500/50',
  },
  green: {
    gradient: 'from-green-500 to-emerald-500',
    text: 'text-green-400',
    border: 'border-green-500/50',
    bg: 'bg-green-500/20',
    shadow: 'shadow-green-500/50',
  },
  orange: {
    gradient: 'from-orange-500 to-amber-500',
    text: 'text-orange-400',
    border: 'border-orange-500/50',
    bg: 'bg-orange-500/20',
    shadow: 'shadow-orange-500/50',
  },
  pink: {
    gradient: 'from-pink-500 to-rose-500',
    text: 'text-pink-400',
    border: 'border-pink-500/50',
    bg: 'bg-pink-500/20',
    shadow: 'shadow-pink-500/50',
  },
  cyan: {
    gradient: 'from-cyan-500 to-teal-500',
    text: 'text-cyan-400',
    border: 'border-cyan-500/50',
    bg: 'bg-cyan-500/20',
    shadow: 'shadow-cyan-500/50',
  },
  red: {
    gradient: 'from-red-500 to-orange-500',
    text: 'text-red-400',
    border: 'border-red-500/50',
    bg: 'bg-red-500/20',
    shadow: 'shadow-red-500/50',
  },
  yellow: {
    gradient: 'from-yellow-500 to-orange-400',
    text: 'text-yellow-400',
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/20',
    shadow: 'shadow-yellow-500/50',
  },
};

/**
 * Available wallet icons with their SVG paths
 */
export const WALLET_ICONS: Record<WalletIcon, string> = {
  wallet: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
  star: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  key: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z',
  lock: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  coin: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  briefcase: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
};
