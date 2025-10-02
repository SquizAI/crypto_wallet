/**
 * Analytics Hook
 *
 * React hook for accessing portfolio analytics data with automatic updates
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useWallet } from '@/context/WalletContext';
import { getTransactionHistory } from '@/services/storageService';
import type {
  PortfolioMetrics,
  AssetAllocation,
  TransactionVolume,
  ChartDataPoint,
  AnalyticsPeriod,
} from '@/types/analytics';
import type { TokenSymbol } from '@/constants/tokens';
import {
  calculatePortfolioMetrics,
  getAssetAllocation,
  getTransactionVolumes,
  getPortfolioChartData,
  recordPortfolioSnapshot,
  shouldTakeDailySnapshot,
} from '@/services/analyticsService';
import { getAllBalances } from '@/services/contractService';
import { formatUnits } from 'ethers';
import type { NetworkId } from '@/types/network';

/**
 * Fetch current balances for all tokens
 */
async function fetchBalances(
  address: string,
  networkId: NetworkId = 'ethereum'
): Promise<Record<TokenSymbol, string>> {
  const balances: Record<TokenSymbol, string> = {} as Record<TokenSymbol, string>;

  try {
    const tokenBalances = await getAllBalances(address, networkId);

    for (const balance of tokenBalances) {
      balances[balance.symbol as TokenSymbol] = balance.balanceFormatted;
    }
  } catch (error) {
    console.error('Failed to fetch balances:', error);
    // Return empty balances on error
    balances.USDC = '0';
    balances.USDT = '0';
    balances.DAI = '0';
  }

  return balances;
}

/**
 * Hook for portfolio metrics
 */
export function usePortfolioMetrics() {
  const { address, isUnlocked } = useWallet();
  const networkId: NetworkId = 'ethereum'; // Default to ethereum, can be made dynamic later

  return useQuery({
    queryKey: ['portfolio-metrics', address, networkId],
    queryFn: async () => {
      if (!address) throw new Error('No wallet address');

      const balances = await fetchBalances(address, networkId);
      const transactions = getTransactionHistory();

      // Take daily snapshot if needed
      if (shouldTakeDailySnapshot()) {
        await recordPortfolioSnapshot(balances, address);
      }

      return await calculatePortfolioMetrics(balances, transactions, address);
    },
    enabled: isUnlocked && !!address,
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider fresh for 30 seconds
  });
}

/**
 * Hook for asset allocation
 */
export function useAssetAllocation() {
  const { address, isUnlocked } = useWallet();
  const networkId: NetworkId = 'ethereum';

  return useQuery({
    queryKey: ['asset-allocation', address, networkId],
    queryFn: async () => {
      if (!address) throw new Error('No wallet address');

      const balances = await fetchBalances(address, networkId);
      return await getAssetAllocation(balances);
    },
    enabled: isUnlocked && !!address,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

/**
 * Hook for transaction volumes
 */
export function useTransactionVolumes() {
  const { address, isUnlocked } = useWallet();

  return useQuery({
    queryKey: ['transaction-volumes', address],
    queryFn: async () => {
      if (!address) throw new Error('No wallet address');

      const transactions = getTransactionHistory();
      return await getTransactionVolumes(transactions, address);
    },
    enabled: isUnlocked && !!address,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

/**
 * Hook for portfolio chart data
 */
export function usePortfolioChartData(period: AnalyticsPeriod = '30d') {
  const { address, isUnlocked } = useWallet();
  const networkId: NetworkId = 'ethereum';

  return useQuery({
    queryKey: ['portfolio-chart-data', address, period, networkId],
    queryFn: async () => {
      if (!address) throw new Error('No wallet address');

      const balances = await fetchBalances(address, networkId);
      const transactions = getTransactionHistory();
      const metrics = await calculatePortfolioMetrics(balances, transactions, address);

      return getPortfolioChartData(period, metrics.currentValue);
    },
    enabled: isUnlocked && !!address,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}

/**
 * Hook for combined analytics data
 */
export function useAnalytics(period: AnalyticsPeriod = '30d') {
  const metrics = usePortfolioMetrics();
  const allocation = useAssetAllocation();
  const volumes = useTransactionVolumes();
  const chartData = usePortfolioChartData(period);

  return {
    metrics: metrics.data,
    allocation: allocation.data,
    volumes: volumes.data,
    chartData: chartData.data,
    isLoading:
      metrics.isLoading ||
      allocation.isLoading ||
      volumes.isLoading ||
      chartData.isLoading,
    isError:
      metrics.isError || allocation.isError || volumes.isError || chartData.isError,
    refetch: () => {
      metrics.refetch();
      allocation.refetch();
      volumes.refetch();
      chartData.refetch();
    },
  };
}

/**
 * Hook for recording manual snapshots
 */
export function useRecordSnapshot() {
  const { address } = useWallet();
  const networkId: NetworkId = 'ethereum';

  return async () => {
    if (!address) return;

    try {
      const balances = await fetchBalances(address, networkId);
      await recordPortfolioSnapshot(balances, address);
    } catch (error) {
      console.error('Failed to record snapshot:', error);
      throw error;
    }
  };
}
