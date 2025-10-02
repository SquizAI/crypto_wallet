/**
 * Analytics Type Definitions
 *
 * Types for portfolio analytics, historical data tracking, and performance metrics
 */

import type { TokenSymbol } from '@/constants/tokens';

/**
 * Time period for analytics
 */
export type AnalyticsPeriod = '24h' | '7d' | '30d' | '90d' | '1y' | 'all';

/**
 * Historical balance snapshot for a specific token
 */
export interface BalanceSnapshot {
  /**
   * Snapshot timestamp (ISO 8601)
   */
  timestamp: string;

  /**
   * Token symbol
   */
  token: TokenSymbol;

  /**
   * Balance in token units (formatted, e.g., "1234.56")
   */
  balance: string;

  /**
   * USD value at the time of snapshot
   */
  usdValue: number;

  /**
   * Token price in USD at snapshot time
   */
  tokenPrice: number;
}

/**
 * Portfolio snapshot at a specific point in time
 */
export interface PortfolioSnapshot {
  /**
   * Snapshot timestamp (ISO 8601)
   */
  timestamp: string;

  /**
   * Total portfolio value in USD
   */
  totalValue: number;

  /**
   * Individual token balances
   */
  balances: BalanceSnapshot[];
}

/**
 * Price change data for a period
 */
export interface PriceChange {
  /**
   * Absolute change in USD
   */
  absolute: number;

  /**
   * Percentage change
   */
  percentage: number;

  /**
   * Direction of change
   */
  direction: 'up' | 'down' | 'neutral';
}

/**
 * Portfolio performance metrics
 */
export interface PortfolioMetrics {
  /**
   * Current total portfolio value (USD)
   */
  currentValue: number;

  /**
   * 24 hour change
   */
  change24h: PriceChange;

  /**
   * 7 day change
   */
  change7d: PriceChange;

  /**
   * 30 day change
   */
  change30d: PriceChange;

  /**
   * Total number of transactions
   */
  totalTransactions: number;

  /**
   * Average transaction size (USD)
   */
  averageTransactionSize: number;

  /**
   * Most used token
   */
  mostUsedToken: TokenSymbol | null;

  /**
   * Largest gain (USD)
   */
  largestGain: number;

  /**
   * Largest loss (USD)
   */
  largestLoss: number;

  /**
   * Total sent (USD)
   */
  totalSent: number;

  /**
   * Total received (USD)
   */
  totalReceived: number;

  /**
   * Net flow (received - sent) in USD
   */
  netFlow: number;
}

/**
 * Asset allocation data for a token
 */
export interface AssetAllocation {
  /**
   * Token symbol
   */
  token: TokenSymbol;

  /**
   * Balance in token units
   */
  balance: string;

  /**
   * USD value
   */
  usdValue: number;

  /**
   * Percentage of total portfolio
   */
  percentage: number;

  /**
   * Token price in USD
   */
  tokenPrice: number;
}

/**
 * Transaction volume data
 */
export interface TransactionVolume {
  /**
   * Token symbol
   */
  token: TokenSymbol;

  /**
   * Number of send transactions
   */
  sendCount: number;

  /**
   * Number of receive transactions
   */
  receiveCount: number;

  /**
   * Total send volume (in token units)
   */
  sendVolume: string;

  /**
   * Total receive volume (in token units)
   */
  receiveVolume: string;

  /**
   * Total send volume (USD)
   */
  sendVolumeUSD: number;

  /**
   * Total receive volume (USD)
   */
  receiveVolumeUSD: number;
}

/**
 * Chart data point for time series
 */
export interface ChartDataPoint {
  /**
   * Timestamp for the data point
   */
  timestamp: string;

  /**
   * Date label for display (e.g., "Jan 15")
   */
  label: string;

  /**
   * Value at this point
   */
  value: number;

  /**
   * Optional breakdown by token
   */
  breakdown?: Record<TokenSymbol, number>;
}

/**
 * Historical data storage
 */
export interface HistoricalData {
  /**
   * Portfolio snapshots
   */
  snapshots: PortfolioSnapshot[];

  /**
   * Last update timestamp
   */
  lastUpdate: string;

  /**
   * Version for data migration
   */
  version: string;
}

/**
 * Analytics export format
 */
export type ExportFormat = 'csv' | 'pdf';

/**
 * Export data structure for CSV
 */
export interface ExportData {
  /**
   * Export timestamp
   */
  timestamp: string;

  /**
   * Portfolio metrics
   */
  metrics: PortfolioMetrics;

  /**
   * Asset allocation
   */
  allocation: AssetAllocation[];

  /**
   * Transaction volumes
   */
  volumes: TransactionVolume[];

  /**
   * Historical snapshots
   */
  snapshots: PortfolioSnapshot[];
}

/**
 * Analytics filter options
 */
export interface AnalyticsFilter {
  /**
   * Time period to analyze
   */
  period: AnalyticsPeriod;

  /**
   * Specific tokens to include (null = all)
   */
  tokens: TokenSymbol[] | null;

  /**
   * Include pending transactions
   */
  includePending: boolean;
}

/**
 * Real-time analytics update event
 */
export interface AnalyticsUpdateEvent {
  /**
   * Type of update
   */
  type: 'balance' | 'transaction' | 'price';

  /**
   * Updated metrics
   */
  metrics: PortfolioMetrics;

  /**
   * Timestamp of update
   */
  timestamp: string;
}
