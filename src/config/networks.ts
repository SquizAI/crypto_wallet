/**
 * Network Configurations
 *
 * Configuration for all supported EVM-compatible networks
 * Includes RPC endpoints, token addresses, and network-specific settings
 */

import { ChainId, type Network, type NetworkId } from '@/types/network';

/**
 * Network configurations with token addresses
 */
export const NETWORKS: Record<NetworkId, Network> = {
  ethereum: {
    id: 'ethereum',
    chainId: ChainId.ETHEREUM,
    name: 'Ethereum',
    shortName: 'ETH',
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC_URL || 'https://eth.llamarpc.com',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: {
      name: 'Etherscan',
      url: 'https://etherscan.io',
    },
    color: '#627EEA',
    icon: 'ethereum',
    isTestnet: false,
    avgBlockTime: 12,
    gasPriceMultiplier: 1.2,
    tokens: {
      USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
  },

  polygon: {
    id: 'polygon',
    chainId: ChainId.POLYGON,
    name: 'Polygon',
    shortName: 'MATIC',
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon.drpc.org',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    blockExplorer: {
      name: 'PolygonScan',
      url: 'https://polygonscan.com',
    },
    color: '#8247E5',
    icon: 'polygon',
    isTestnet: false,
    avgBlockTime: 2,
    gasPriceMultiplier: 1.3,
    tokens: {
      USDC: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // USDC native on Polygon
      USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
    },
  },

  arbitrum: {
    id: 'arbitrum',
    chainId: ChainId.ARBITRUM,
    name: 'Arbitrum One',
    shortName: 'ARB',
    rpcUrl: process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: {
      name: 'Arbiscan',
      url: 'https://arbiscan.io',
    },
    color: '#28A0F0',
    icon: 'arbitrum',
    isTestnet: false,
    avgBlockTime: 0.25,
    gasPriceMultiplier: 1.1,
    tokens: {
      USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC native on Arbitrum
      USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    },
  },

  optimism: {
    id: 'optimism',
    chainId: ChainId.OPTIMISM,
    name: 'Optimism',
    shortName: 'OP',
    rpcUrl: process.env.NEXT_PUBLIC_OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: {
      name: 'Optimistic Etherscan',
      url: 'https://optimistic.etherscan.io',
    },
    color: '#FF0420',
    icon: 'optimism',
    isTestnet: false,
    avgBlockTime: 2,
    gasPriceMultiplier: 1.1,
    tokens: {
      USDC: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', // USDC native on Optimism
      USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
      DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
    },
  },

  base: {
    id: 'base',
    chainId: ChainId.BASE,
    name: 'Base',
    shortName: 'BASE',
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || 'https://mainnet.base.org',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    blockExplorer: {
      name: 'BaseScan',
      url: 'https://basescan.org',
    },
    color: '#0052FF',
    icon: 'base',
    isTestnet: false,
    avgBlockTime: 2,
    gasPriceMultiplier: 1.1,
    tokens: {
      USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC native on Base
      // USDT not yet available on Base
      DAI: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    },
  },
};

/**
 * Default network (Ethereum)
 */
export const DEFAULT_NETWORK: NetworkId = 'ethereum';

/**
 * Get network configuration by ID
 */
export function getNetworkById(networkId: NetworkId): Network {
  return NETWORKS[networkId];
}

/**
 * Get network configuration by chain ID
 */
export function getNetworkByChainId(chainId: number): Network | undefined {
  return Object.values(NETWORKS).find((network) => network.chainId === chainId);
}

/**
 * Get all available networks
 */
export function getAllNetworks(): Network[] {
  return Object.values(NETWORKS);
}

/**
 * Get all network IDs
 */
export function getAllNetworkIds(): NetworkId[] {
  return Object.keys(NETWORKS) as NetworkId[];
}

/**
 * Validate if network ID is supported
 */
export function isNetworkSupported(networkId: string): networkId is NetworkId {
  return networkId in NETWORKS;
}

/**
 * Validate if chain ID is supported
 */
export function isChainIdSupported(chainId: number): boolean {
  return Object.values(NETWORKS).some((network) => network.chainId === chainId);
}

/**
 * Get token address for a specific network
 */
export function getTokenAddress(
  networkId: NetworkId,
  tokenSymbol: 'USDC' | 'USDT' | 'DAI'
): string | undefined {
  return NETWORKS[networkId].tokens[tokenSymbol];
}

/**
 * Get all token addresses for a network
 */
export function getNetworkTokens(networkId: NetworkId): { symbol: string; address: string }[] {
  const network = NETWORKS[networkId];
  return Object.entries(network.tokens)
    .filter(([, address]) => address !== undefined)
    .map(([symbol, address]) => ({ symbol, address: address as string }));
}

/**
 * Check if token is supported on network
 */
export function isTokenSupported(networkId: NetworkId, tokenSymbol: 'USDC' | 'USDT' | 'DAI'): boolean {
  return NETWORKS[networkId].tokens[tokenSymbol] !== undefined;
}

/**
 * Get block explorer URL for an address
 */
export function getAddressExplorerUrl(networkId: NetworkId, address: string): string {
  const network = NETWORKS[networkId];
  return `${network.blockExplorer.url}/address/${address}`;
}

/**
 * Get block explorer URL for a transaction
 */
export function getTransactionExplorerUrl(networkId: NetworkId, txHash: string): string {
  const network = NETWORKS[networkId];
  return `${network.blockExplorer.url}/tx/${txHash}`;
}

/**
 * Get block explorer URL for a token
 */
export function getTokenExplorerUrl(networkId: NetworkId, tokenAddress: string): string {
  const network = NETWORKS[networkId];
  return `${network.blockExplorer.url}/token/${tokenAddress}`;
}

/**
 * Format chain ID to hex string (for wallet_addEthereumChain)
 */
export function chainIdToHex(chainId: number): string {
  return `0x${chainId.toString(16)}`;
}

/**
 * Get network display name with chain ID
 */
export function getNetworkDisplayName(networkId: NetworkId): string {
  const network = NETWORKS[networkId];
  return `${network.name} (${network.chainId})`;
}
