/**
 * Contract Service
 *
 * ERC20 token interaction service using ethers.js v6
 *
 * Features:
 * - Token balance queries for USDC, USDT, DAI
 * - ERC20 token transfers
 * - Gas estimation with fallbacks
 * - Network gas price fetching
 * - Comprehensive error handling
 *
 * Security Notes:
 * - All addresses are validated before operations
 * - Gas estimation includes safety margins
 * - Network errors are handled with retries
 * - Transaction details are returned for user verification
 */

import { Contract, JsonRpcProvider, formatUnits, parseUnits, Wallet, isAddress, type ContractTransactionResponse } from 'ethers';
import { env } from '@/lib/env';
import { TOKENS, getTokenAddress, getTokensForNetwork, type TokenSymbol } from '@/constants/tokens';
import type { TokenBalance, GasEstimate, ContractError } from '@/types/contract';
import { ContractError as ContractErrorClass } from '@/types/contract';

/**
 * Standard ERC20 ABI (minimal interface for balance and transfer operations)
 */
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

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
 *
 * @param address - Address to validate
 * @throws ContractError if address is invalid
 */
function validateAddress(address: string): void {
  if (!address || !isAddress(address)) {
    throw new ContractErrorClass(
      `Invalid Ethereum address: ${address}`,
      'INVALID_ADDRESS'
    );
  }
}

/**
 * Retry helper with exponential backoff for network operations
 *
 * @param fn - Async function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param baseDelay - Base delay in ms (default: 1000)
 * @returns Result from the function
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
      if (error instanceof ContractErrorClass && error.code === 'INVALID_ADDRESS') {
        throw error;
      }

      // If this was the last retry, throw
      if (i === maxRetries - 1) {
        break;
      }

      // Wait with exponential backoff
      await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, i)));
    }
  }

  throw new ContractErrorClass(
    `Network operation failed after ${maxRetries} retries: ${lastError?.message}`,
    'NETWORK_ERROR',
    lastError
  );
}

/**
 * Get token balance for a specific ERC20 token
 *
 * @param tokenAddress - ERC20 token contract address
 * @param userAddress - User's wallet address
 * @returns Token balance details
 * @throws ContractError on validation or network errors
 */
export async function getTokenBalance(
  tokenAddress: string,
  userAddress: string
): Promise<TokenBalance> {
  validateAddress(tokenAddress);
  validateAddress(userAddress);

  return withRetry(async () => {
    try {
      const provider = getProvider();
      const contract = new Contract(tokenAddress, ERC20_ABI, provider);

      // Fetch token details and balance in parallel
      const [balance, decimals, symbol, name] = await Promise.all([
        contract.balanceOf(userAddress) as Promise<bigint>,
        contract.decimals() as Promise<bigint>,
        contract.symbol() as Promise<string>,
        contract.name() as Promise<string>,
      ]);

      const balanceRaw = balance.toString();
      const balanceFormatted = formatUnits(balance, Number(decimals));

      return {
        tokenAddress,
        symbol,
        name,
        decimals: Number(decimals),
        balanceRaw,
        balanceFormatted,
      };
    } catch (error) {
      throw new ContractErrorClass(
        `Failed to fetch token balance: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CONTRACT_ERROR',
        error
      );
    }
  });
}

/**
 * Get balances for all supported tokens on the current network
 *
 * @param userAddress - User's wallet address
 * @returns Array of token balances
 * @throws ContractError on validation or network errors
 */
export async function getAllBalances(userAddress: string): Promise<TokenBalance[]> {
  validateAddress(userAddress);

  const network = env.NEXT_PUBLIC_NETWORK;
  const supportedTokens = getTokensForNetwork(network);

  // Fetch all balances in parallel
  const balancePromises = supportedTokens
    .map(token => {
      const address = getTokenAddress(token.symbol as TokenSymbol, network);
      if (!address) return null;

      return getTokenBalance(address, userAddress).catch(error => {
        console.error(`Failed to fetch balance for ${token.symbol}:`, error);
        // Return zero balance on error instead of failing completely
        return {
          tokenAddress: address,
          symbol: token.symbol,
          name: token.name,
          decimals: token.decimals,
          balanceRaw: '0',
          balanceFormatted: '0.0',
        } as TokenBalance;
      });
    })
    .filter((promise): promise is Promise<TokenBalance> => promise !== null);

  return Promise.all(balancePromises);
}

/**
 * Get current gas price from the network
 *
 * @returns Gas price details (EIP-1559 format)
 * @throws ContractError on network errors
 */
export async function getGasPrice(): Promise<{
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
}> {
  return withRetry(async () => {
    try {
      const provider = getProvider();
      const feeData = await provider.getFeeData();

      // Use EIP-1559 if available, otherwise fall back to legacy gas price
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        return {
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        };
      }

      // Fallback to legacy gas price
      const gasPrice = feeData.gasPrice || parseUnits('50', 'gwei');
      return {
        maxFeePerGas: gasPrice,
        maxPriorityFeePerGas: parseUnits('2', 'gwei'),
      };
    } catch (error) {
      throw new ContractErrorClass(
        `Failed to fetch gas price: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR',
        error
      );
    }
  });
}

/**
 * Estimate gas for an ERC20 token transfer
 *
 * @param tokenAddress - ERC20 token contract address
 * @param from - Sender address
 * @param to - Recipient address
 * @param amount - Amount to transfer (in token units, e.g., "10.5")
 * @param decimals - Token decimals
 * @returns Gas estimation details
 * @throws ContractError on validation or estimation errors
 */
export async function estimateTransferGas(
  tokenAddress: string,
  from: string,
  to: string,
  amount: string,
  decimals: number
): Promise<GasEstimate> {
  validateAddress(tokenAddress);
  validateAddress(from);
  validateAddress(to);

  return withRetry(async () => {
    try {
      const provider = getProvider();
      const contract = new Contract(tokenAddress, ERC20_ABI, provider);

      // Parse amount to wei
      const parsedAmount = parseUnits(amount, decimals);

      // Get gas price
      const gasPrice = await getGasPrice();

      // Estimate gas limit
      let gasLimit: bigint;
      try {
        gasLimit = await contract.transfer.estimateGas(to, parsedAmount, { from });
      } catch (error) {
        // Fallback gas limits based on operation type
        console.warn('Gas estimation failed, using fallback:', error);
        gasLimit = BigInt(100000); // Standard ERC20 transfer gas limit
      }

      // Add 20% buffer to gas limit for safety
      const gasLimitWithBuffer = (gasLimit * BigInt(120)) / BigInt(100);

      // Calculate estimated cost
      const estimatedCost = gasLimitWithBuffer * gasPrice.maxFeePerGas;
      const estimatedCostFormatted = formatUnits(estimatedCost, 'ether');

      return {
        gasLimit: gasLimitWithBuffer,
        maxFeePerGas: gasPrice.maxFeePerGas,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
        estimatedCost,
        estimatedCostFormatted,
      };
    } catch (error) {
      throw new ContractErrorClass(
        `Failed to estimate gas: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CONTRACT_ERROR',
        error
      );
    }
  });
}

/**
 * Send ERC20 token transfer
 *
 * @param wallet - Wallet instance (with private key)
 * @param tokenAddress - ERC20 token contract address
 * @param recipient - Recipient address
 * @param amount - Amount to transfer (in token units, e.g., "10.5")
 * @param decimals - Token decimals
 * @returns Transaction response from ethers
 * @throws ContractError on validation, insufficient balance, or transaction errors
 *
 * Security Note: This function signs and broadcasts a transaction.
 * Always verify transaction details before calling.
 */
export async function sendToken(
  wallet: Wallet,
  tokenAddress: string,
  recipient: string,
  amount: string,
  decimals: number
) {
  validateAddress(tokenAddress);
  validateAddress(recipient);

  return withRetry(async () => {
    try {
      const provider = getProvider();
      const contract = new Contract(tokenAddress, ERC20_ABI, provider);
      const connectedContract = contract.connect(wallet);

      // Parse amount
      const parsedAmount = parseUnits(amount, decimals);

      // Check balance
      const balance = await contract.balanceOf(wallet.address) as bigint;
      if (balance < parsedAmount) {
        throw new ContractErrorClass(
          `Insufficient token balance. Required: ${amount}, Available: ${formatUnits(balance, decimals)}`,
          'INSUFFICIENT_BALANCE'
        );
      }

      // Estimate gas
      const gasEstimate = await estimateTransferGas(
        tokenAddress,
        wallet.address,
        recipient,
        amount,
        decimals
      );

      // Check ETH balance for gas
      const ethBalance = await provider.getBalance(wallet.address);
      if (ethBalance < gasEstimate.estimatedCost) {
        throw new ContractErrorClass(
          `Insufficient ETH for gas. Required: ${gasEstimate.estimatedCostFormatted} ETH`,
          'INSUFFICIENT_GAS'
        );
      }

      // Send transaction with gas parameters
      const tx = await (connectedContract as Contract).transfer(recipient, parsedAmount, {
        maxFeePerGas: gasEstimate.maxFeePerGas,
        maxPriorityFeePerGas: gasEstimate.maxPriorityFeePerGas,
        gasLimit: gasEstimate.gasLimit,
      }) as ContractTransactionResponse;

      return tx;
    } catch (error) {
      if (error instanceof ContractErrorClass) {
        throw error;
      }

      throw new ContractErrorClass(
        `Token transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TRANSACTION_FAILED',
        error
      );
    }
  });
}

/**
 * Get token info for a given address
 *
 * @param tokenAddress - ERC20 token contract address
 * @returns Token details (name, symbol, decimals)
 * @throws ContractError on validation or network errors
 */
export async function getTokenInfo(tokenAddress: string): Promise<{
  name: string;
  symbol: string;
  decimals: number;
}> {
  validateAddress(tokenAddress);

  return withRetry(async () => {
    try {
      const provider = getProvider();
      const contract = new Contract(tokenAddress, ERC20_ABI, provider);

      const [name, symbol, decimals] = await Promise.all([
        contract.name() as Promise<string>,
        contract.symbol() as Promise<string>,
        contract.decimals() as Promise<bigint>,
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
      };
    } catch (error) {
      throw new ContractErrorClass(
        `Failed to fetch token info: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CONTRACT_ERROR',
        error
      );
    }
  });
}
