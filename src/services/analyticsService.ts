/**
 * Analytics Service
 *
 * Handles portfolio analytics calculation, historical data tracking,
 * and performance metrics computation.
 */

import type { Transaction } from '@/types/wallet';
import type {
  AnalyticsPeriod,
  BalanceSnapshot,
  PortfolioSnapshot,
  PortfolioMetrics,
  PriceChange,
  AssetAllocation,
  TransactionVolume,
  ChartDataPoint,
  HistoricalData,
  AnalyticsFilter,
} from '@/types/analytics';
import type { TokenSymbol } from '@/constants/tokens';
import { TOKENS } from '@/constants/tokens';
import { getTokenPrices } from './priceService';
import type { TokenPrice } from '@/types/alerts';
import { formatUnits } from 'ethers';

/**
 * Storage key for historical data
 */
const HISTORICAL_DATA_KEY = 'stablecoin_wallet_analytics_history';

/**
 * Storage key for daily snapshots
 */
const DAILY_SNAPSHOT_KEY = 'stablecoin_wallet_daily_snapshot';

/**
 * Get historical data from localStorage
 */
export function getHistoricalData(): HistoricalData {
  if (typeof window === 'undefined') {
    return {
      snapshots: [],
      lastUpdate: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  try {
    const data = localStorage.getItem(HISTORICAL_DATA_KEY);
    if (!data) {
      return {
        snapshots: [],
        lastUpdate: new Date().toISOString(),
        version: '1.0.0',
      };
    }

    const parsed: HistoricalData = JSON.parse(data);
    return parsed;
  } catch (error) {
    console.error('Failed to load historical data:', error);
    return {
      snapshots: [],
      lastUpdate: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}

/**
 * Save historical data to localStorage
 */
export function saveHistoricalData(data: HistoricalData): void {
  if (typeof window === 'undefined') return;

  try {
    // Keep only last 365 days of snapshots to prevent storage bloat
    const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
    const filtered = data.snapshots.filter(
      (snapshot) => new Date(snapshot.timestamp).getTime() > oneYearAgo
    );

    const updated: HistoricalData = {
      ...data,
      snapshots: filtered,
      lastUpdate: new Date().toISOString(),
    };

    localStorage.setItem(HISTORICAL_DATA_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save historical data:', error);
  }
}

/**
 * Record a portfolio snapshot
 */
export async function recordPortfolioSnapshot(
  balances: Record<TokenSymbol, string>,
  address: string
): Promise<void> {
  try {
    // Get current prices
    const prices = await getTokenPrices();

    // Create balance snapshots
    const balanceSnapshots: BalanceSnapshot[] = [];
    let totalValue = 0;

    for (const [symbol, balance] of Object.entries(balances)) {
      const tokenSymbol = symbol as TokenSymbol;
      const tokenConfig = TOKENS[tokenSymbol];
      const priceData = prices as Record<string, TokenPrice>;
      const price = priceData[tokenSymbol]?.usd || 0;
      const balanceNum = parseFloat(balance);
      const usdValue = balanceNum * price;

      balanceSnapshots.push({
        timestamp: new Date().toISOString(),
        token: tokenSymbol,
        balance,
        usdValue,
        tokenPrice: price,
      });

      totalValue += usdValue;
    }

    // Create portfolio snapshot
    const snapshot: PortfolioSnapshot = {
      timestamp: new Date().toISOString(),
      totalValue,
      balances: balanceSnapshots,
    };

    // Get existing historical data
    const historicalData = getHistoricalData();

    // Add new snapshot
    historicalData.snapshots.push(snapshot);

    // Save updated data
    saveHistoricalData(historicalData);

    // Update last daily snapshot timestamp
    localStorage.setItem(DAILY_SNAPSHOT_KEY, new Date().toISOString());
  } catch (error) {
    console.error('Failed to record portfolio snapshot:', error);
  }
}

/**
 * Check if daily snapshot is needed
 */
export function shouldTakeDailySnapshot(): boolean {
  if (typeof window === 'undefined') return false;

  const lastSnapshot = localStorage.getItem(DAILY_SNAPSHOT_KEY);
  if (!lastSnapshot) return true;

  const lastDate = new Date(lastSnapshot);
  const now = new Date();

  // Take snapshot if last one was on a different day
  return (
    lastDate.getDate() !== now.getDate() ||
    lastDate.getMonth() !== now.getMonth() ||
    lastDate.getFullYear() !== now.getFullYear()
  );
}

/**
 * Calculate price change between two values
 */
function calculatePriceChange(current: number, previous: number): PriceChange {
  const absolute = current - previous;
  const percentage = previous === 0 ? 0 : (absolute / previous) * 100;

  return {
    absolute,
    percentage,
    direction: absolute > 0 ? 'up' : absolute < 0 ? 'down' : 'neutral',
  };
}

/**
 * Get snapshots for a specific period
 */
function getSnapshotsForPeriod(
  snapshots: PortfolioSnapshot[],
  period: AnalyticsPeriod
): PortfolioSnapshot[] {
  const now = Date.now();
  const periodMs: Record<AnalyticsPeriod, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
    '90d': 90 * 24 * 60 * 60 * 1000,
    '1y': 365 * 24 * 60 * 60 * 1000,
    all: Infinity,
  };

  const cutoff = now - periodMs[period];

  return snapshots.filter(
    (snapshot) => new Date(snapshot.timestamp).getTime() >= cutoff
  );
}

/**
 * Calculate portfolio metrics
 */
export async function calculatePortfolioMetrics(
  balances: Record<TokenSymbol, string>,
  transactions: Transaction[],
  address: string
): Promise<PortfolioMetrics> {
  try {
    // Get current prices
    const prices = await getTokenPrices();

    // Calculate current portfolio value
    let currentValue = 0;
    for (const [symbol, balance] of Object.entries(balances)) {
      const tokenSymbol = symbol as TokenSymbol;
      const priceData = prices as Record<string, TokenPrice>;
      const price = priceData[tokenSymbol]?.usd || 0;
      const balanceNum = parseFloat(balance);
      currentValue += balanceNum * price;
    }

    // Get historical data
    const historicalData = getHistoricalData();
    const sortedSnapshots = [...historicalData.snapshots].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Calculate changes for different periods
    const change24h = calculateChangeForPeriod(sortedSnapshots, currentValue, '24h');
    const change7d = calculateChangeForPeriod(sortedSnapshots, currentValue, '7d');
    const change30d = calculateChangeForPeriod(sortedSnapshots, currentValue, '30d');

    // Calculate transaction metrics
    const userTransactions = transactions.filter(
      (tx) => tx.from.toLowerCase() === address.toLowerCase() ||
              tx.to?.toLowerCase() === address.toLowerCase()
    );

    const totalTransactions = userTransactions.length;

    // Calculate transaction volumes
    let totalSent = 0;
    let totalReceived = 0;
    const tokenUsage = new Map<TokenSymbol, number>();

    for (const tx of userTransactions) {
      const isSent = tx.from.toLowerCase() === address.toLowerCase();
      const tokenSymbol = tx.tokenSymbol as TokenSymbol;
      const tokenConfig = TOKENS[tokenSymbol];

      if (!tokenConfig) continue;

      const amount = parseFloat(formatUnits(tx.value, tx.tokenDecimals));
      const priceData = prices as Record<string, TokenPrice>;
      const price = priceData[tokenSymbol]?.usd || 0;
      const usdValue = amount * price;

      if (isSent) {
        totalSent += usdValue;
      } else {
        totalReceived += usdValue;
      }

      // Track token usage
      const count = tokenUsage.get(tokenSymbol) || 0;
      tokenUsage.set(tokenSymbol, count + 1);
    }

    // Find most used token
    let mostUsedToken: TokenSymbol | null = null;
    let maxUsage = 0;
    for (const [token, count] of tokenUsage.entries()) {
      if (count > maxUsage) {
        maxUsage = count;
        mostUsedToken = token;
      }
    }

    // Calculate average transaction size
    const averageTransactionSize =
      totalTransactions > 0 ? (totalSent + totalReceived) / totalTransactions : 0;

    // Calculate net flow
    const netFlow = totalReceived - totalSent;

    // Calculate largest gain/loss (using 30d change as proxy)
    const largestGain = change30d.absolute > 0 ? change30d.absolute : 0;
    const largestLoss = change30d.absolute < 0 ? Math.abs(change30d.absolute) : 0;

    return {
      currentValue,
      change24h,
      change7d,
      change30d,
      totalTransactions,
      averageTransactionSize,
      mostUsedToken,
      largestGain,
      largestLoss,
      totalSent,
      totalReceived,
      netFlow,
    };
  } catch (error) {
    console.error('Failed to calculate portfolio metrics:', error);

    // Return default metrics on error
    return {
      currentValue: 0,
      change24h: { absolute: 0, percentage: 0, direction: 'neutral' },
      change7d: { absolute: 0, percentage: 0, direction: 'neutral' },
      change30d: { absolute: 0, percentage: 0, direction: 'neutral' },
      totalTransactions: 0,
      averageTransactionSize: 0,
      mostUsedToken: null,
      largestGain: 0,
      largestLoss: 0,
      totalSent: 0,
      totalReceived: 0,
      netFlow: 0,
    };
  }
}

/**
 * Calculate change for a specific period
 */
function calculateChangeForPeriod(
  snapshots: PortfolioSnapshot[],
  currentValue: number,
  period: AnalyticsPeriod
): PriceChange {
  const periodSnapshots = getSnapshotsForPeriod(snapshots, period);

  if (periodSnapshots.length === 0) {
    return { absolute: 0, percentage: 0, direction: 'neutral' };
  }

  const oldestSnapshot = periodSnapshots[0];
  return calculatePriceChange(currentValue, oldestSnapshot.totalValue);
}

/**
 * Get asset allocation
 */
export async function getAssetAllocation(
  balances: Record<TokenSymbol, string>
): Promise<AssetAllocation[]> {
  try {
    // Get current prices
    const prices = await getTokenPrices();

    // Calculate total portfolio value
    let totalValue = 0;
    const allocations: AssetAllocation[] = [];

    for (const [symbol, balance] of Object.entries(balances)) {
      const tokenSymbol = symbol as TokenSymbol;
      const priceData = prices as Record<string, TokenPrice>;
      const price = priceData[tokenSymbol]?.usd || 0;
      const balanceNum = parseFloat(balance);
      const usdValue = balanceNum * price;

      totalValue += usdValue;

      allocations.push({
        token: tokenSymbol,
        balance,
        usdValue,
        percentage: 0, // Will calculate after total
        tokenPrice: price,
      });
    }

    // Calculate percentages
    return allocations.map((allocation) => ({
      ...allocation,
      percentage: totalValue > 0 ? (allocation.usdValue / totalValue) * 100 : 0,
    }));
  } catch (error) {
    console.error('Failed to get asset allocation:', error);
    return [];
  }
}

/**
 * Get transaction volumes by token
 */
export async function getTransactionVolumes(
  transactions: Transaction[],
  address: string
): Promise<TransactionVolume[]> {
  try {
    // Get current prices
    const prices = await getTokenPrices();

    // Group transactions by token
    const volumeMap = new Map<TokenSymbol, TransactionVolume>();

    for (const tx of transactions) {
      const isSent = tx.from.toLowerCase() === address.toLowerCase();
      const tokenSymbol = tx.tokenSymbol as TokenSymbol;
      const tokenConfig = TOKENS[tokenSymbol];

      if (!tokenConfig) continue;

      const amount = parseFloat(formatUnits(tx.value, tx.tokenDecimals));
      const priceData = prices as Record<string, TokenPrice>;
      const price = priceData[tokenSymbol]?.usd || 0;
      const usdValue = amount * price;

      // Get or create volume entry
      let volume = volumeMap.get(tokenSymbol);
      if (!volume) {
        volume = {
          token: tokenSymbol,
          sendCount: 0,
          receiveCount: 0,
          sendVolume: '0',
          receiveVolume: '0',
          sendVolumeUSD: 0,
          receiveVolumeUSD: 0,
        };
        volumeMap.set(tokenSymbol, volume);
      }

      // Update volume
      if (isSent) {
        volume.sendCount++;
        volume.sendVolume = (parseFloat(volume.sendVolume) + amount).toString();
        volume.sendVolumeUSD += usdValue;
      } else {
        volume.receiveCount++;
        volume.receiveVolume = (parseFloat(volume.receiveVolume) + amount).toString();
        volume.receiveVolumeUSD += usdValue;
      }
    }

    return Array.from(volumeMap.values());
  } catch (error) {
    console.error('Failed to get transaction volumes:', error);
    return [];
  }
}

/**
 * Get chart data for portfolio value over time
 */
export function getPortfolioChartData(
  period: AnalyticsPeriod,
  currentValue: number
): ChartDataPoint[] {
  const historicalData = getHistoricalData();
  const periodSnapshots = getSnapshotsForPeriod(historicalData.snapshots, period);

  // Sort by timestamp
  const sorted = [...periodSnapshots].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Convert to chart data points
  const chartData: ChartDataPoint[] = sorted.map((snapshot) => ({
    timestamp: snapshot.timestamp,
    label: formatDateLabel(snapshot.timestamp, period),
    value: snapshot.totalValue,
  }));

  // Add current value as the latest point if not already there
  if (chartData.length === 0 || chartData[chartData.length - 1].value !== currentValue) {
    chartData.push({
      timestamp: new Date().toISOString(),
      label: formatDateLabel(new Date().toISOString(), period),
      value: currentValue,
    });
  }

  return chartData;
}

/**
 * Format date label based on period
 */
function formatDateLabel(timestamp: string, period: AnalyticsPeriod): string {
  const date = new Date(timestamp);

  switch (period) {
    case '24h':
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    case '7d':
    case '30d':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    case '90d':
    case '1y':
    case 'all':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    default:
      return date.toLocaleDateString();
  }
}

/**
 * Clear all historical data
 */
export function clearHistoricalData(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(HISTORICAL_DATA_KEY);
    localStorage.removeItem(DAILY_SNAPSHOT_KEY);
  } catch (error) {
    console.error('Failed to clear historical data:', error);
  }
}
