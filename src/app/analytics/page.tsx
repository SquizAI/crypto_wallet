/**
 * Analytics Dashboard Page
 *
 * Comprehensive portfolio analytics with charts, metrics, and export functionality
 */

'use client';

import { useState } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useWallet } from '@/context/WalletContext';
import { MetricCard } from '@/components/analytics/MetricCard';
import { PortfolioChart } from '@/components/analytics/PortfolioChart';
import { AssetAllocation } from '@/components/analytics/AssetAllocation';
import { TransactionVolumeChart } from '@/components/analytics/TransactionVolumeChart';
import { ExportButton } from '@/components/analytics/ExportButton';
import type { AnalyticsPeriod } from '@/types/analytics';
import { Skeleton } from '@/components/ui/Skeleton';

export default function AnalyticsPage() {
  const { isUnlocked } = useWallet();
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const { metrics, allocation, volumes, chartData, isLoading, refetch } =
    useAnalytics(period);

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-strong rounded-2xl p-8 border border-white/10 max-w-md w-full text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Wallet Locked
          </h2>
          <p className="text-gray-400 mb-6">
            Please unlock your wallet to view analytics
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Portfolio Analytics
            </h1>
            <p className="text-gray-400">
              Track your portfolio performance and insights
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="
                p-2 rounded-xl glass-strong border border-white/10
                text-gray-400 hover:text-white
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              "
              aria-label="Refresh data"
            >
              <svg
                className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>

            {/* Export Button */}
            {metrics && allocation && volumes && (
              <ExportButton
                metrics={metrics}
                allocation={allocation}
                volumes={volumes}
              />
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
            <Skeleton className="h-96 rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-96 rounded-2xl" />
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Portfolio Value"
                value={`$${metrics?.currentValue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || '0.00'}`}
                change={metrics?.change24h}
                icon={
                  <svg
                    className="w-6 h-6 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                }
                description="Current total portfolio value in USD"
              />

              <MetricCard
                label="Total Transactions"
                value={metrics?.totalTransactions.toString() || '0'}
                icon={
                  <svg
                    className="w-6 h-6 text-cyan-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                }
                description="Lifetime transaction count"
              />

              <MetricCard
                label="Net Flow"
                value={`$${Math.abs(metrics?.netFlow || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                theme={
                  (metrics?.netFlow || 0) > 0
                    ? 'success'
                    : (metrics?.netFlow || 0) < 0
                    ? 'danger'
                    : 'default'
                }
                icon={
                  <svg
                    className="w-6 h-6 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                }
                description={
                  (metrics?.netFlow || 0) >= 0
                    ? 'Total received minus sent'
                    : 'Total sent minus received'
                }
              />

              <MetricCard
                label="Most Used Token"
                value={metrics?.mostUsedToken || 'N/A'}
                icon={
                  <svg
                    className="w-6 h-6 text-purple-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                }
                description="Token with most transactions"
              />
            </div>

            {/* Portfolio Chart */}
            {chartData && (
              <PortfolioChart
                data={chartData}
                period={period}
                onPeriodChange={setPeriod}
                type="area"
              />
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Asset Allocation */}
              {allocation && <AssetAllocation data={allocation} />}

              {/* Transaction Volumes */}
              {volumes && <TransactionVolumeChart data={volumes} />}
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="glass-strong rounded-2xl p-6 border border-white/10">
                <h4 className="text-sm text-gray-400 mb-2">
                  Average Transaction
                </h4>
                <p className="text-2xl font-bold text-white">
                  ${metrics?.averageTransactionSize.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="glass-strong rounded-2xl p-6 border border-white/10">
                <h4 className="text-sm text-gray-400 mb-2">Total Sent</h4>
                <p className="text-2xl font-bold text-red-400">
                  ${metrics?.totalSent.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="glass-strong rounded-2xl p-6 border border-white/10">
                <h4 className="text-sm text-gray-400 mb-2">Total Received</h4>
                <p className="text-2xl font-bold text-green-400">
                  ${metrics?.totalReceived.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="glass-strong rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">
                Performance Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-2">24 Hour Change</p>
                  <p
                    className={`text-xl font-bold ${
                      (metrics?.change24h.direction || 'neutral') === 'up'
                        ? 'text-green-400'
                        : (metrics?.change24h.direction || 'neutral') === 'down'
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {(metrics?.change24h.absolute || 0) >= 0 ? '+' : ''}
                    ${(metrics?.change24h.absolute || 0).toFixed(2)} (
                    {(metrics?.change24h.percentage || 0) >= 0 ? '+' : ''}
                    {(metrics?.change24h.percentage || 0).toFixed(2)}%)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">7 Day Change</p>
                  <p
                    className={`text-xl font-bold ${
                      (metrics?.change7d.direction || 'neutral') === 'up'
                        ? 'text-green-400'
                        : (metrics?.change7d.direction || 'neutral') === 'down'
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {(metrics?.change7d.absolute || 0) >= 0 ? '+' : ''}
                    ${(metrics?.change7d.absolute || 0).toFixed(2)} (
                    {(metrics?.change7d.percentage || 0) >= 0 ? '+' : ''}
                    {(metrics?.change7d.percentage || 0).toFixed(2)}%)
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-2">30 Day Change</p>
                  <p
                    className={`text-xl font-bold ${
                      (metrics?.change30d.direction || 'neutral') === 'up'
                        ? 'text-green-400'
                        : (metrics?.change30d.direction || 'neutral') === 'down'
                        ? 'text-red-400'
                        : 'text-gray-400'
                    }`}
                  >
                    {(metrics?.change30d.absolute || 0) >= 0 ? '+' : ''}
                    ${(metrics?.change30d.absolute || 0).toFixed(2)} (
                    {(metrics?.change30d.percentage || 0) >= 0 ? '+' : ''}
                    {(metrics?.change30d.percentage || 0).toFixed(2)}%)
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
