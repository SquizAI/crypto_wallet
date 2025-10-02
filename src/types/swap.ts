/**
 * Swap Type Definitions
 *
 * Type definitions for token swap operations with DEX integration
 */

import type { TokenSymbol } from '@/constants/tokens';

/**
 * Swap input mode
 */
export type SwapMode = 'exactInput' | 'exactOutput';

/**
 * Slippage tolerance options
 */
export type SlippageTolerance = 0.1 | 0.5 | 1.0 | number;

/**
 * Swap transaction status
 */
export type SwapStatus = 'idle' | 'fetching-quote' | 'approving' | 'swapping' | 'success' | 'error';

/**
 * Token pair for swap
 */
export interface TokenPair {
  tokenIn: TokenSymbol;
  tokenOut: TokenSymbol;
}

/**
 * Swap quote from Uniswap
 */
export interface SwapQuote {
  /**
   * Token being sold
   */
  tokenIn: TokenSymbol;

  /**
   * Token being bought
   */
  tokenOut: TokenSymbol;

  /**
   * Amount in (formatted)
   */
  amountIn: string;

  /**
   * Amount out (formatted)
   */
  amountOut: string;

  /**
   * Amount in (raw wei)
   */
  amountInRaw: string;

  /**
   * Amount out (raw wei)
   */
  amountOutRaw: string;

  /**
   * Exchange rate (1 tokenIn = X tokenOut)
   */
  exchangeRate: string;

  /**
   * Price impact percentage (0-100)
   */
  priceImpact: number;

  /**
   * Minimum amount out after slippage (raw wei)
   */
  minAmountOut: string;

  /**
   * Minimum amount out after slippage (formatted)
   */
  minAmountOutFormatted: string;

  /**
   * Slippage tolerance percentage
   */
  slippageTolerance: number;

  /**
   * Pool fee tier (in basis points, e.g., 500 = 0.05%)
   */
  poolFee: number;

  /**
   * Estimated gas limit
   */
  estimatedGas: string;

  /**
   * Quote timestamp
   */
  timestamp: number;
}

/**
 * Gas estimate for swap
 */
export interface SwapGasEstimate {
  /**
   * Gas limit for approval (if needed)
   */
  approvalGasLimit?: bigint;

  /**
   * Gas limit for swap
   */
  swapGasLimit: bigint;

  /**
   * Max fee per gas (EIP-1559)
   */
  maxFeePerGas: bigint;

  /**
   * Max priority fee per gas (EIP-1559)
   */
  maxPriorityFeePerGas: bigint;

  /**
   * Total estimated cost in ETH (formatted)
   */
  totalCostEth: string;

  /**
   * Total estimated cost in ETH (raw wei)
   */
  totalCostWei: bigint;
}

/**
 * Swap parameters for execution
 */
export interface SwapParams {
  /**
   * Token being sold
   */
  tokenIn: string;

  /**
   * Token being bought
   */
  tokenOut: string;

  /**
   * Pool fee tier
   */
  fee: number;

  /**
   * Recipient address
   */
  recipient: string;

  /**
   * Deadline timestamp
   */
  deadline: number;

  /**
   * Amount in (raw wei)
   */
  amountIn: string;

  /**
   * Minimum amount out (raw wei)
   */
  amountOutMinimum: string;

  /**
   * Square root price limit (0 for no limit)
   */
  sqrtPriceLimitX96: string;
}

/**
 * Swap transaction result
 */
export interface SwapResult {
  /**
   * Transaction hash
   */
  hash: string;

  /**
   * Token in symbol
   */
  tokenIn: TokenSymbol;

  /**
   * Token out symbol
   */
  tokenOut: TokenSymbol;

  /**
   * Amount in (formatted)
   */
  amountIn: string;

  /**
   * Amount out (formatted)
   */
  amountOut: string;

  /**
   * Block number
   */
  blockNumber: number | null;

  /**
   * Timestamp
   */
  timestamp: string;

  /**
   * Status
   */
  status: 'pending' | 'confirmed' | 'failed';
}

/**
 * Token allowance info
 */
export interface TokenAllowance {
  /**
   * Token address
   */
  tokenAddress: string;

  /**
   * Spender address (router)
   */
  spenderAddress: string;

  /**
   * Current allowance (raw wei)
   */
  allowance: string;

  /**
   * Whether allowance is sufficient for swap
   */
  isSufficient: boolean;

  /**
   * Required amount (raw wei)
   */
  requiredAmount: string;
}

/**
 * Swap error types
 */
export type SwapErrorCode =
  | 'INSUFFICIENT_BALANCE'
  | 'INSUFFICIENT_LIQUIDITY'
  | 'EXCESSIVE_PRICE_IMPACT'
  | 'SLIPPAGE_EXCEEDED'
  | 'APPROVAL_FAILED'
  | 'SWAP_FAILED'
  | 'QUOTE_EXPIRED'
  | 'INVALID_PAIR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Swap error class
 */
export class SwapError extends Error {
  code: SwapErrorCode;
  originalError?: unknown;

  constructor(message: string, code: SwapErrorCode, originalError?: unknown) {
    super(message);
    this.name = 'SwapError';
    this.code = code;
    this.originalError = originalError;
  }
}

/**
 * Pool information
 */
export interface PoolInfo {
  /**
   * Pool address
   */
  address: string;

  /**
   * Token0 address
   */
  token0: string;

  /**
   * Token1 address
   */
  token1: string;

  /**
   * Fee tier
   */
  fee: number;

  /**
   * Pool liquidity
   */
  liquidity: string;

  /**
   * Current price (sqrt price X96)
   */
  sqrtPriceX96: string;

  /**
   * Current tick
   */
  tick: number;
}
