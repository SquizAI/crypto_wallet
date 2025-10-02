/**
 * Network Type Definitions
 *
 * Types for multi-chain support across EVM-compatible networks
 */

/**
 * Supported blockchain networks
 */
export type NetworkId = 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'base';

/**
 * Chain IDs for supported networks
 */
export enum ChainId {
  ETHEREUM = 1,
  POLYGON = 137,
  ARBITRUM = 42161,
  OPTIMISM = 10,
  BASE = 8453,
}

/**
 * Network configuration
 */
export interface NetworkConfig {
  /**
   * Unique network identifier
   */
  id: NetworkId;

  /**
   * Network chain ID
   */
  chainId: ChainId;

  /**
   * Display name
   */
  name: string;

  /**
   * Short name for display
   */
  shortName: string;

  /**
   * RPC endpoint URL
   */
  rpcUrl: string;

  /**
   * Native currency details
   */
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };

  /**
   * Block explorer URL
   */
  blockExplorer: {
    name: string;
    url: string;
  };

  /**
   * Network color for UI (hex)
   */
  color: string;

  /**
   * Network icon identifier
   */
  icon: string;

  /**
   * Whether this is a testnet
   */
  isTestnet: boolean;

  /**
   * Average block time in seconds
   */
  avgBlockTime: number;

  /**
   * Gas price multiplier for safety margin
   */
  gasPriceMultiplier: number;
}

/**
 * Token addresses per network
 */
export interface NetworkTokenAddresses {
  USDC?: string;
  USDT?: string;
  DAI?: string;
}

/**
 * Complete network with token addresses
 */
export interface Network extends NetworkConfig {
  tokens: NetworkTokenAddresses;
}

/**
 * Network selection option for UI
 */
export interface NetworkOption {
  id: NetworkId;
  chainId: ChainId;
  name: string;
  shortName: string;
  color: string;
  icon: string;
  disabled?: boolean;
}

/**
 * Network switch request
 */
export interface NetworkSwitchRequest {
  fromNetwork: NetworkId;
  toNetwork: NetworkId;
  timestamp: number;
}

/**
 * Network state
 */
export interface NetworkState {
  /**
   * Currently selected network
   */
  currentNetwork: NetworkId;

  /**
   * Available networks
   */
  availableNetworks: NetworkId[];

  /**
   * Whether network is switching
   */
  isSwitching: boolean;

  /**
   * Last network switch error
   */
  lastError: string | null;
}
