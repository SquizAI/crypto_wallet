/**
 * Price Service
 *
 * Fetches cryptocurrency prices from CoinGecko API.
 * Includes caching, rate limiting, and error handling.
 */

import type { AlertToken, TokenPrice, PriceCacheEntry } from '@/types/alerts';

/**
 * CoinGecko API configuration
 */
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

/**
 * Token ID mapping for CoinGecko API
 */
const TOKEN_IDS: Record<AlertToken, string> = {
  USDC: 'usd-coin',
  USDT: 'tether',
  DAI: 'dai',
};

/**
 * Cache duration in milliseconds (60 seconds)
 */
const CACHE_DURATION = 60 * 1000;

/**
 * Cache key for localStorage
 */
const CACHE_KEY = 'price-cache';

/**
 * Get cached prices if valid
 */
function getCachedPrices(): PriceCacheEntry | null {
  if (typeof window === 'undefined') return null;

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const entry: PriceCacheEntry = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid
    if (now - entry.lastFetch < CACHE_DURATION) {
      return entry;
    }

    return null;
  } catch (error) {
    console.error('Failed to read price cache:', error);
    return null;
  }
}

/**
 * Set price cache
 */
function setCachedPrices(prices: Record<AlertToken, TokenPrice>): void {
  if (typeof window === 'undefined') return;

  try {
    const entry: PriceCacheEntry = {
      prices,
      lastFetch: Date.now(),
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch (error) {
    console.error('Failed to cache prices:', error);
  }
}

/**
 * Fetch prices from CoinGecko API
 */
async function fetchPricesFromAPI(): Promise<Record<AlertToken, TokenPrice>> {
  const tokens: AlertToken[] = ['USDC', 'USDT', 'DAI'];
  const ids = tokens.map((token) => TOKEN_IDS[token]).join(',');

  const url = `${COINGECKO_API_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`Failed to fetch prices: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform API response to our format
    const prices: Record<AlertToken, TokenPrice> = {} as Record<AlertToken, TokenPrice>;

    tokens.forEach((token) => {
      const id = TOKEN_IDS[token];
      const priceData = data[id];

      if (!priceData) {
        throw new Error(`Missing price data for ${token}`);
      }

      prices[token] = {
        token,
        usd: priceData.usd || 0,
        usd_24h_change: priceData.usd_24h_change || 0,
        last_updated: new Date(priceData.last_updated_at * 1000).toISOString(),
      };
    });

    return prices;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch token prices');
  }
}

/**
 * Get current prices for all supported tokens
 * Uses cache when available, fetches from API if cache expired
 */
export async function getTokenPrices(
  forceRefresh = false
): Promise<Record<AlertToken, TokenPrice>> {
  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = getCachedPrices();
    if (cached) {
      return cached.prices;
    }
  }

  // Fetch from API
  const prices = await fetchPricesFromAPI();

  // Cache the results
  setCachedPrices(prices);

  return prices;
}

/**
 * Get price for a specific token
 */
export async function getTokenPrice(
  token: AlertToken,
  forceRefresh = false
): Promise<TokenPrice> {
  const prices = await getTokenPrices(forceRefresh);
  return prices[token];
}

/**
 * Clear price cache
 */
export function clearPriceCache(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Failed to clear price cache:', error);
  }
}

/**
 * Get cache age in milliseconds
 */
export function getCacheAge(): number | null {
  const cached = getCachedPrices();
  if (!cached) return null;

  return Date.now() - cached.lastFetch;
}

/**
 * Check if cache is valid
 */
export function isCacheValid(): boolean {
  const cached = getCachedPrices();
  if (!cached) return false;

  return Date.now() - cached.lastFetch < CACHE_DURATION;
}
