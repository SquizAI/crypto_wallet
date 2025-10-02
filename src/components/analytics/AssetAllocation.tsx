/**
 * Asset Allocation Component
 *
 * Pie chart showing portfolio allocation by token
 */

'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { AssetAllocation as AssetAllocationData } from '@/types/analytics';
import { TOKENS } from '@/constants/tokens';

interface AssetAllocationProps {
  /**
   * Asset allocation data
   */
  data: AssetAllocationData[];
}

const COLORS: Record<string, string> = {
  USDC: '#2775CA',
  USDT: '#26A17B',
  DAI: '#F5AC37',
};

export function AssetAllocation({ data }: AssetAllocationProps) {
  // Filter out tokens with zero balance
  const filteredData = data.filter((item) => parseFloat(item.balance) > 0);

  // Prepare data for pie chart
  const chartData = filteredData.map((item) => ({
    name: item.token,
    value: item.usdValue,
    percentage: item.percentage,
    balance: item.balance,
  }));

  // Custom label
  const renderLabel = (entry: any) => {
    return `${entry.percentage.toFixed(1)}%`;
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-strong rounded-lg p-3 border border-white/20">
          <p className="text-sm font-semibold text-white mb-2">{data.name}</p>
          <div className="space-y-1 text-xs">
            <p className="text-gray-400">
              Balance:{' '}
              <span className="text-white font-medium">
                {parseFloat(data.balance).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 6,
                })}{' '}
                {data.name}
              </span>
            </p>
            <p className="text-gray-400">
              Value:{' '}
              <span className="text-white font-medium">
                ${data.value.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </p>
            <p className="text-gray-400">
              Share:{' '}
              <span className="text-white font-medium">
                {data.percentage.toFixed(2)}%
              </span>
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
      <h3 className="text-lg font-semibold text-white mb-6">Asset Allocation</h3>

      {/* Chart */}
      {filteredData.length === 0 ? (
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
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
            <p className="text-sm">No assets in portfolio</p>
            <p className="text-xs text-gray-500 mt-1">
              Add funds to see allocation
            </p>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationDuration={500}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[entry.name] || '#3b82f6'}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="mt-6 space-y-3">
            {filteredData.map((item) => (
              <div
                key={item.token}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[item.token] }}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {TOKENS[item.token].name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {parseFloat(item.balance).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 6,
                      })}{' '}
                      {item.token}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    ${item.usdValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {item.percentage.toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
