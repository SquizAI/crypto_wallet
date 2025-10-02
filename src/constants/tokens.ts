/**
 * Token Definitions
 * Stablecoin configurations for USDC, USDT, and DAI across supported networks
 */

export interface TokenConfig {
  symbol: string;
  name: string;
  decimals: number;
  addresses: {
    mainnet?: string;
    sepolia?: string;
  };
  logoUrl?: string;
  coingeckoId?: string;
}

export const TOKENS: Record<string, TokenConfig> = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    addresses: {
      mainnet: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      sepolia: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    },
    logoUrl: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.svg',
    coingeckoId: 'usd-coin',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    addresses: {
      mainnet: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    },
    logoUrl: 'https://cryptologos.cc/logos/tether-usdt-logo.svg',
    coingeckoId: 'tether',
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    addresses: {
      mainnet: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    },
    logoUrl: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg',
    coingeckoId: 'dai',
  },
} as const;

export type TokenSymbol = keyof typeof TOKENS;

/**
 * Get token address for a specific network
 */
export function getTokenAddress(
  symbol: TokenSymbol,
  network: 'mainnet' | 'sepolia'
): string | undefined {
  return TOKENS[symbol].addresses[network];
}

/**
 * Get token configuration by symbol
 */
export function getTokenConfig(symbol: string): TokenConfig | undefined {
  return TOKENS[symbol as TokenSymbol];
}

/**
 * Get all supported tokens for a network
 */
export function getTokensForNetwork(network: 'mainnet' | 'sepolia'): TokenConfig[] {
  return Object.values(TOKENS).filter((token) => token.addresses[network] !== undefined);
}

/**
 * Validate if token is supported on network
 */
export function isTokenSupported(symbol: TokenSymbol, network: 'mainnet' | 'sepolia'): boolean {
  return TOKENS[symbol]?.addresses[network] !== undefined;
}

/**
 * Get all token symbols
 */
export function getAllTokenSymbols(): TokenSymbol[] {
  return Object.keys(TOKENS) as TokenSymbol[];
}
