/**
 * Transaction Volume Chart Component
 *
 * Bar chart showing transaction volumes by token
 */

'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { TransactionVolume } from '@/types/analytics';
import { TOKENS } from '@/constants/tokens';

interface TransactionVolumeChartProps {
  /**
   * Transaction volume data
   */
  data: TransactionVolume[];

  /**
   * Chart height
   */
  height?: number;

  /**
   * Show USD values instead of token amounts
   */
  showUSD?: boolean;
}

export function TransactionVolumeChart({
  data,
  height = 300,
  showUSD = true,
}: TransactionVolumeChartProps) {
  // Prepare data for chart
  const chartData = data.map((item) => ({
    token: item.token,
    sent: showUSD ? item.sendVolumeUSD : parseFloat(item.sendVolume),
    received: showUSD ? item.receiveVolumeUSD : parseFloat(item.receiveVolume),
    sendCount: item.sendCount,
    receiveCount: item.receiveCount,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-strong rounded-lg p-3 border border-white/20">
          <p className="text-sm font-semibold text-white mb-2">{data.token}</p>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <p className="text-gray-400">
                Received:{' '}
                <span className="text-white font-medium">
                  {showUSD
                    ? `$${data.received.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : `${data.received.toLocaleString()} ${data.token}`}
                </span>
              </p>
            </div>
            <p className="text-gray-500 text-xs ml-5">
              {data.receiveCount} transaction{data.receiveCount !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <p className="text-gray-400">
                Sent:{' '}
                <span className="text-white font-medium">
                  {showUSD
                    ? `$${data.sent.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : `${data.sent.toLocaleString()} ${data.token}`}
                </span>
              </p>
            </div>
            <p className="text-gray-500 text-xs ml-5">
              {data.sendCount} transaction{data.sendCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Transaction Volumes</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-gray-400">Received</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-gray-400">Sent</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <p className="text-sm">No transaction data</p>
            <p className="text-xs text-gray-500 mt-1">
              Make transactions to see volumes
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="token"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickLine={false}
            />
            <YAxis
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
              tickLine={false}
              tickFormatter={(value) =>
                showUSD ? `$${value.toLocaleString()}` : value.toLocaleString()
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="received" fill="#10b981" radius={[8, 8, 0, 0]} />
            <Bar dataKey="sent" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Summary */}
      {data.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {data.map((item) => (
            <div
              key={item.token}
              className="p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <p className="text-xs text-gray-400 mb-1">
                {TOKENS[item.token].name}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-400">
                  {item.receiveCount} in
                </span>
                <span className="text-red-400">
                  {item.sendCount} out
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
