/**
 * Contract Type Definitions
 *
 * Types for ERC20 token interactions and blockchain operations
 */

import type { TransactionReceipt, TransactionResponse } from 'ethers';

/**
 * Token balance for a specific address
 */
export interface TokenBalance {
  /**
   * Token contract address
   */
  tokenAddress: string;

  /**
   * Token symbol (e.g., 'USDC', 'USDT', 'DAI')
   */
  symbol: string;

  /**
   * Token name (e.g., 'USD Coin')
   */
  name: string;

  /**
   * Token decimals
   */
  decimals: number;

  /**
   * Raw balance in smallest unit (as string to preserve precision)
   */
  balanceRaw: string;

  /**
   * Formatted balance (human-readable)
   */
  balanceFormatted: string;
}

/**
 * Gas estimation details
 */
export interface GasEstimate {
  /**
   * Estimated gas limit
   */
  gasLimit: bigint;

  /**
   * Max fee per gas (EIP-1559)
   */
  maxFeePerGas: bigint;

  /**
   * Max priority fee per gas (EIP-1559)
   */
  maxPriorityFeePerGas: bigint;

  /**
   * Estimated total cost in wei
   */
  estimatedCost: bigint;

  /**
   * Formatted cost in ETH
   */
  estimatedCostFormatted: string;
}

/**
 * Transaction monitoring callback
 */
export interface TransactionMonitor {
  /**
   * Transaction hash being monitored
   */
  hash: string;

  /**
   * Transaction response from ethers
   */
  transaction: TransactionResponse;

  /**
   * Callback invoked when transaction is confirmed
   */
  onConfirmed?: (receipt: TransactionReceipt) => void;

  /**
   * Callback invoked when transaction fails
   */
  onFailed?: (error: Error) => void;

  /**
   * Callback invoked on status updates
   */
  onUpdate?: (status: 'pending' | 'confirmed' | 'failed', receipt?: TransactionReceipt) => void;

  /**
   * Number of confirmations to wait for (default: 1)
   */
  confirmations?: number;
}

/**
 * Contract error types
 */
export type ContractErrorCode =
  | 'INSUFFICIENT_BALANCE'
  | 'INSUFFICIENT_GAS'
  | 'INVALID_ADDRESS'
  | 'NETWORK_ERROR'
  | 'CONTRACT_ERROR'
  | 'TRANSACTION_FAILED'
  | 'UNKNOWN_ERROR';

/**
 * Contract operation error
 */
export class ContractError extends Error {
  constructor(
    message: string,
    public readonly code: ContractErrorCode,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ContractError';
  }
}

/**
 * Transaction error types
 */
export type TransactionErrorCode =
  | 'TIMEOUT'
  | 'REVERTED'
  | 'REPLACED'
  | 'CANCELLED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Transaction operation error
 */
export class TransactionError extends Error {
  constructor(
    message: string,
    public readonly code: TransactionErrorCode,
    public readonly txHash?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'TransactionError';
  }
}
