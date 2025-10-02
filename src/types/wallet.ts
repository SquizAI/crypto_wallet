/**
 * Wallet Type Definitions
 *
 * Core types for wallet data, transactions, and storage
 */

/**
 * Encrypted wallet data stored in localStorage
 */
export interface WalletData {
  /**
   * Encrypted private key (AES-256-GCM encrypted with user password)
   */
  encryptedPrivateKey: string;

  /**
   * Encrypted mnemonic phrase (only present for HD wallets)
   * null for wallets imported from private key only
   */
  encryptedMnemonic: string | null;

  /**
   * Public Ethereum address (0x prefixed)
   */
  address: string;

  /**
   * Wallet creation timestamp (ISO 8601 format)
   */
  createdAt: string;

  /**
   * Wallet type: 'hd' (with mnemonic) or 'imported' (private key only)
   */
  type: 'hd' | 'imported';
}

/**
 * Transaction status
 */
export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

/**
 * Transaction type
 */
export type TransactionType = 'send' | 'receive' | 'approve' | 'contract';

/**
 * Transaction record for history
 */
export interface Transaction {
  /**
   * Transaction hash (0x prefixed)
   */
  hash: string;

  /**
   * From address (0x prefixed)
   */
  from: string;

  /**
   * To address (0x prefixed), null for contract creation
   */
  to: string | null;

  /**
   * Amount in wei (as string to preserve precision)
   */
  value: string;

  /**
   * Token address for ERC20 transfers, null for ETH transfers
   */
  tokenAddress: string | null;

  /**
   * Token symbol (e.g., 'ETH', 'USDC')
   */
  tokenSymbol: string;

  /**
   * Token decimals
   */
  tokenDecimals: number;

  /**
   * Transaction status
   */
  status: TransactionStatus;

  /**
   * Transaction type
   */
  type: TransactionType;

  /**
   * Block number where transaction was mined (null if pending)
   */
  blockNumber: number | null;

  /**
   * Transaction timestamp (ISO 8601 format), null if pending
   */
  timestamp: string | null;

  /**
   * Gas used (as string), null if pending
   */
  gasUsed: string | null;

  /**
   * Effective gas price in wei (as string), null if pending
   */
  gasPrice: string | null;

  /**
   * Chain ID
   */
  chainId: number;

  /**
   * Error message if transaction failed
   */
  error?: string;
}

/**
 * Unlocked wallet instance (used in-memory only, never stored)
 */
export interface UnlockedWallet {
  /**
   * Wallet address
   */
  address: string;

  /**
   * Mnemonic phrase (only for HD wallets)
   */
  mnemonic: string | null;

  /**
   * Private key (0x prefixed)
   */
  privateKey: string;

  /**
   * Wallet type
   */
  type: 'hd' | 'imported';
}
