/**
 * Swap Service
 *
 * Uniswap V3 integration service for token swaps
 *
 * Features:
 * - Real-time price quotes
 * - Price impact calculation
 * - Slippage protection
 * - Token approval handling
 * - Swap execution with gas estimation
 *
 * Security Notes:
 * - All addresses validated before operations
 * - Balance checks before swaps
 * - Gas estimation with safety margins
 * - Slippage protection with minimum output
 * - Deadline enforcement to prevent stale transactions
 */

import {
  Contract,
  JsonRpcProvider,
  Wallet,
  parseUnits,
  formatUnits,
  isAddress,
} from 'ethers';
import { env } from '@/lib/env';
import { TOKENS, getTokenAddress, type TokenSymbol } from '@/constants/tokens';
import {
  UNISWAP_V3_ROUTER_ADDRESS,
  UNISWAP_V3_QUOTER_ADDRESS,
  UNISWAP_V3_FACTORY_ADDRESS,
  DEFAULT_STABLECOIN_FEE,
  QUOTER_ABI,
  SWAP_ROUTER_ABI,
  FACTORY_ABI,
  POOL_ABI,
  DEFAULT_DEADLINE_OFFSET,
  MAX_PRICE_IMPACT_ERROR,
} from '@/constants/uniswap';
import { ERC20_ABI } from '@/constants/abis';
import type {
  SwapQuote,
  SwapParams,
  SwapGasEstimate,
  TokenAllowance,
  SwapErrorCode,
  PoolInfo,
} from '@/types/swap';
import { SwapError } from '@/types/swap';

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
 * Validate Ethereum address format
 */
function validateAddress(address: string): void {
  if (!address || !isAddress(address)) {
    throw new SwapError(
      `Invalid Ethereum address: ${address}`,
      'INVALID_PAIR'
    );
  }
}

/**
 * Retry helper with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on validation errors
      if (error instanceof SwapError && error.code === 'INVALID_PAIR') {
        throw error;
      }

      if (i === maxRetries - 1) break;

      await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, i)));
    }
  }

  throw new SwapError(
    `Network operation failed after ${maxRetries} retries: ${lastError?.message}`,
    'NETWORK_ERROR',
    lastError
  );
}

/**
 * Get pool address for a token pair
 */
export async function getPoolAddress(
  tokenA: string,
  tokenB: string,
  fee: number = DEFAULT_STABLECOIN_FEE
): Promise<string> {
  validateAddress(tokenA);
  validateAddress(tokenB);

  return withRetry(async () => {
    try {
      const provider = getProvider();
      const factory = new Contract(
        UNISWAP_V3_FACTORY_ADDRESS,
        FACTORY_ABI,
        provider
      );

      const poolAddress = await factory.getPool(tokenA, tokenB, fee) as string;

      if (poolAddress === '0x0000000000000000000000000000000000000000') {
        throw new SwapError(
          'Pool does not exist for this token pair',
          'INVALID_PAIR'
        );
      }

      return poolAddress;
    } catch (error) {
      if (error instanceof SwapError) throw error;

      throw new SwapError(
        `Failed to get pool address: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR',
        error
      );
    }
  });
}

/**
 * Get pool information
 */
export async function getPoolInfo(poolAddress: string): Promise<PoolInfo> {
  validateAddress(poolAddress);

  return withRetry(async () => {
    try {
      const provider = getProvider();
      const pool = new Contract(poolAddress, POOL_ABI, provider);

      const [token0, token1, fee, liquidity, slot0] = await Promise.all([
        pool.token0() as Promise<string>,
        pool.token1() as Promise<string>,
        pool.fee() as Promise<bigint>,
        pool.liquidity() as Promise<bigint>,
        pool.slot0() as Promise<[bigint, bigint, bigint, bigint, bigint, bigint, boolean]>,
      ]);

      return {
        address: poolAddress,
        token0,
        token1,
        fee: Number(fee),
        liquidity: liquidity.toString(),
        sqrtPriceX96: slot0[0].toString(),
        tick: Number(slot0[1]),
      };
    } catch (error) {
      throw new SwapError(
        `Failed to get pool info: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR',
        error
      );
    }
  });
}

/**
 * Get swap quote from Uniswap V3 Quoter
 */
export async function getSwapQuote(
  tokenIn: TokenSymbol,
  tokenOut: TokenSymbol,
  amountIn: string,
  slippageTolerance: number = 0.5
): Promise<SwapQuote> {
  const network = env.NEXT_PUBLIC_NETWORK;

  // Get token addresses
  const tokenInAddress = getTokenAddress(tokenIn, network);
  const tokenOutAddress = getTokenAddress(tokenOut, network);

  if (!tokenInAddress || !tokenOutAddress) {
    throw new SwapError(
      'Token not supported on current network',
      'INVALID_PAIR'
    );
  }

  if (tokenInAddress === tokenOutAddress) {
    throw new SwapError(
      'Cannot swap same token',
      'INVALID_PAIR'
    );
  }

  // Get token configs
  const tokenInConfig = TOKENS[tokenIn];
  const tokenOutConfig = TOKENS[tokenOut];

  // Parse amount to wei
  const amountInWei = parseUnits(amountIn, tokenInConfig.decimals);

  return withRetry(async () => {
    try {
      const provider = getProvider();
      const quoter = new Contract(
        UNISWAP_V3_QUOTER_ADDRESS,
        QUOTER_ABI,
        provider
      );

      // Get quote from Uniswap
      const quoteParams = {
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        amountIn: amountInWei,
        fee: DEFAULT_STABLECOIN_FEE,
        sqrtPriceLimitX96: 0, // No price limit
      };

      const [amountOut, sqrtPriceX96After, initializedTicksCrossed, gasEstimate] =
        await quoter.quoteExactInputSingle.staticCall(quoteParams) as [
          bigint,
          bigint,
          number,
          bigint
        ];

      // Format amounts
      const amountOutFormatted = formatUnits(amountOut, tokenOutConfig.decimals);

      // Calculate exchange rate
      const exchangeRate = (
        parseFloat(amountOutFormatted) / parseFloat(amountIn)
      ).toFixed(6);

      // Calculate price impact (simplified for stablecoins)
      // For stablecoins, we expect ~1:1 ratio
      const expectedRate = 1.0;
      const actualRate = parseFloat(exchangeRate);
      const priceImpact = Math.abs((actualRate - expectedRate) / expectedRate) * 100;

      // Check price impact
      if (priceImpact > MAX_PRICE_IMPACT_ERROR) {
        throw new SwapError(
          `Price impact too high: ${priceImpact.toFixed(2)}%`,
          'EXCESSIVE_PRICE_IMPACT'
        );
      }

      // Calculate minimum amount out with slippage
      const slippageMultiplier = 1 - slippageTolerance / 100;
      const minAmountOut = (amountOut * BigInt(Math.floor(slippageMultiplier * 10000))) / BigInt(10000);
      const minAmountOutFormatted = formatUnits(minAmountOut, tokenOutConfig.decimals);

      return {
        tokenIn,
        tokenOut,
        amountIn,
        amountOut: amountOutFormatted,
        amountInRaw: amountInWei.toString(),
        amountOutRaw: amountOut.toString(),
        exchangeRate,
        priceImpact,
        minAmountOut: minAmountOut.toString(),
        minAmountOutFormatted,
        slippageTolerance,
        poolFee: DEFAULT_STABLECOIN_FEE,
        estimatedGas: gasEstimate.toString(),
        timestamp: Date.now(),
      };
    } catch (error) {
      if (error instanceof SwapError) throw error;

      // Check for insufficient liquidity
      if (error instanceof Error && error.message.includes('STF')) {
        throw new SwapError(
          'Insufficient liquidity for this swap amount',
          'INSUFFICIENT_LIQUIDITY',
          error
        );
      }

      throw new SwapError(
        `Failed to get swap quote: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR',
        error
      );
    }
  });
}

/**
 * Check token allowance for router
 */
export async function checkAllowance(
  tokenAddress: string,
  ownerAddress: string,
  amountRequired: string
): Promise<TokenAllowance> {
  validateAddress(tokenAddress);
  validateAddress(ownerAddress);

  return withRetry(async () => {
    try {
      const provider = getProvider();
      const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);

      const allowance = await tokenContract.allowance(
        ownerAddress,
        UNISWAP_V3_ROUTER_ADDRESS
      ) as bigint;

      const allowanceStr = allowance.toString();
      const isSufficient = allowance >= BigInt(amountRequired);

      return {
        tokenAddress,
        spenderAddress: UNISWAP_V3_ROUTER_ADDRESS,
        allowance: allowanceStr,
        isSufficient,
        requiredAmount: amountRequired,
      };
    } catch (error) {
      throw new SwapError(
        `Failed to check allowance: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR',
        error
      );
    }
  });
}

/**
 * Approve token spending for router
 */
export async function approveToken(
  wallet: Wallet,
  tokenAddress: string,
  amount: string
): Promise<string> {
  validateAddress(tokenAddress);

  return withRetry(async () => {
    try {
      const provider = getProvider();
      const tokenContract = new Contract(tokenAddress, ERC20_ABI, provider);
      const connectedContract = tokenContract.connect(wallet) as Contract;

      // Approve exact amount (or use max for unlimited approval)
      const tx = await connectedContract.approve(
        UNISWAP_V3_ROUTER_ADDRESS,
        amount
      );

      // Wait for confirmation
      const receipt = await tx.wait();

      if (!receipt || receipt.status === 0) {
        throw new SwapError(
          'Token approval transaction failed',
          'APPROVAL_FAILED'
        );
      }

      return tx.hash;
    } catch (error) {
      if (error instanceof SwapError) throw error;

      throw new SwapError(
        `Token approval failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'APPROVAL_FAILED',
        error
      );
    }
  });
}

/**
 * Estimate gas for swap transaction
 */
export async function estimateSwapGas(
  wallet: Wallet,
  quote: SwapQuote,
  needsApproval: boolean
): Promise<SwapGasEstimate> {
  return withRetry(async () => {
    try {
      const provider = getProvider();

      // Get current gas prices
      const feeData = await provider.getFeeData();

      const maxFeePerGas = feeData.maxFeePerGas || parseUnits('50', 'gwei');
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || parseUnits('2', 'gwei');

      // Use quote's estimated gas with 20% buffer
      const swapGasLimit = (BigInt(quote.estimatedGas) * BigInt(120)) / BigInt(100);

      // Approval gas estimate (if needed)
      let approvalGasLimit: bigint | undefined;
      if (needsApproval) {
        approvalGasLimit = BigInt(50000); // Standard ERC20 approval
      }

      // Calculate total cost
      const totalGas = swapGasLimit + (approvalGasLimit || BigInt(0));
      const totalCostWei = totalGas * maxFeePerGas;
      const totalCostEth = formatUnits(totalCostWei, 'ether');

      return {
        approvalGasLimit,
        swapGasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas,
        totalCostEth,
        totalCostWei,
      };
    } catch (error) {
      throw new SwapError(
        `Failed to estimate gas: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR',
        error
      );
    }
  });
}

/**
 * Execute token swap
 */
export async function executeSwap(
  wallet: Wallet,
  quote: SwapQuote
): Promise<string> {
  const network = env.NEXT_PUBLIC_NETWORK;

  // Get token addresses
  const tokenInAddress = getTokenAddress(quote.tokenIn, network);
  const tokenOutAddress = getTokenAddress(quote.tokenOut, network);

  if (!tokenInAddress || !tokenOutAddress) {
    throw new SwapError(
      'Token not supported on current network',
      'INVALID_PAIR'
    );
  }

  return withRetry(async () => {
    try {
      const provider = getProvider();

      // Check token balance
      const tokenInContract = new Contract(tokenInAddress, ERC20_ABI, provider);
      const balance = await tokenInContract.balanceOf(wallet.address) as bigint;

      if (balance < BigInt(quote.amountInRaw)) {
        throw new SwapError(
          'Insufficient token balance for swap',
          'INSUFFICIENT_BALANCE'
        );
      }

      // Check ETH balance for gas
      const ethBalance = await provider.getBalance(wallet.address);
      const gasEstimate = await estimateSwapGas(wallet, quote, false);

      if (ethBalance < gasEstimate.totalCostWei) {
        throw new SwapError(
          `Insufficient ETH for gas. Required: ${gasEstimate.totalCostEth} ETH`,
          'INSUFFICIENT_BALANCE'
        );
      }

      // Prepare swap params
      const deadline = Math.floor(Date.now() / 1000) + DEFAULT_DEADLINE_OFFSET;

      const swapParams = {
        tokenIn: tokenInAddress,
        tokenOut: tokenOutAddress,
        fee: quote.poolFee,
        recipient: wallet.address,
        deadline,
        amountIn: quote.amountInRaw,
        amountOutMinimum: quote.minAmountOut,
        sqrtPriceLimitX96: 0,
      };

      // Execute swap
      const router = new Contract(
        UNISWAP_V3_ROUTER_ADDRESS,
        SWAP_ROUTER_ABI,
        provider
      );
      const connectedRouter = router.connect(wallet) as Contract;

      const tx = await connectedRouter.exactInputSingle(swapParams, {
        maxFeePerGas: gasEstimate.maxFeePerGas,
        maxPriorityFeePerGas: gasEstimate.maxPriorityFeePerGas,
        gasLimit: gasEstimate.swapGasLimit,
      });

      // Wait for confirmation
      const receipt = await tx.wait();

      if (!receipt || receipt.status === 0) {
        throw new SwapError(
          'Swap transaction failed',
          'SWAP_FAILED'
        );
      }

      return tx.hash;
    } catch (error) {
      if (error instanceof SwapError) throw error;

      // Check for slippage exceeded
      if (error instanceof Error && error.message.includes('Too little received')) {
        throw new SwapError(
          'Slippage tolerance exceeded. Try increasing slippage or reducing amount.',
          'SLIPPAGE_EXCEEDED',
          error
        );
      }

      throw new SwapError(
        `Swap execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SWAP_FAILED',
        error
      );
    }
  });
}

/**
 * Check if quote is still valid (not expired)
 */
export function isQuoteValid(quote: SwapQuote, maxAgeMs: number = 30000): boolean {
  return Date.now() - quote.timestamp < maxAgeMs;
}

/**
 * Get user-friendly error message
 */
export function getSwapErrorMessage(error: SwapError): string {
  const messages: Record<SwapErrorCode, string> = {
    INSUFFICIENT_BALANCE: 'Insufficient balance to complete this swap.',
    INSUFFICIENT_LIQUIDITY: 'Not enough liquidity available for this swap amount.',
    EXCESSIVE_PRICE_IMPACT: 'Price impact is too high. Try reducing the swap amount.',
    SLIPPAGE_EXCEEDED: 'Price changed too much. Try increasing slippage tolerance.',
    APPROVAL_FAILED: 'Failed to approve token spending. Please try again.',
    SWAP_FAILED: 'Swap transaction failed. Please try again.',
    QUOTE_EXPIRED: 'Price quote expired. Fetching new quote...',
    INVALID_PAIR: 'Invalid token pair selected.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  };

  return messages[error.code] || error.message;
}
