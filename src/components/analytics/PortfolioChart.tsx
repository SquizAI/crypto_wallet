/**
 * Portfolio Chart Component
 *
 * Line chart showing portfolio value over time with period selection
 */

'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { ChartDataPoint, AnalyticsPeriod } from '@/types/analytics';

interface PortfolioChartProps {
  /**
   * Chart data points
   */
  data: ChartDataPoint[];

  /**
   * Current selected period
   */
  period: AnalyticsPeriod;

  /**
   * Period change callback
   */
  onPeriodChange: (period: AnalyticsPeriod) => void;

  /**
   * Chart type
   */
  type?: 'line' | 'area';

  /**
   * Chart height
   */
  height?: number;
}

const PERIODS: { value: AnalyticsPeriod; label: string }[] = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '1y', label: '1Y' },
  { value: 'all', label: 'All' },
];

export function PortfolioChart({
  data,
  period,
  onPeriodChange,
  type = 'area',
  height = 400,
}: PortfolioChartProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const currentValue = data.length > 0 ? data[data.length - 1].value : 0;
  const displayValue = hoveredValue !== null ? hoveredValue : currentValue;

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-strong rounded-lg p-3 border border-white/20">
          <p className="text-xs text-gray-400 mb-1">{data.label}</p>
          <p className="text-lg font-bold text-white">
            ${data.value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Portfolio Value
          </h3>
          <p className="text-3xl font-bold text-white">
            ${displayValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/10">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriodChange(p.value)}
              className={`
                px-3 sm:px-4 py-2 rounded-lg text-sm font-medium
                transition-all duration-200
                ${
                  period === p.value
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              {p.label}
            </button>
          ))}
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
            <p className="text-sm">No historical data available</p>
            <p className="text-xs text-gray-500 mt-1">
              Data will appear as you use your wallet
            </p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          {type === 'area' ? (
            <AreaChart
              data={data}
              onMouseMove={(e: any) => {
                if (e.activePayload && e.activePayload[0]) {
                  setHoveredValue(e.activePayload[0].payload.value);
                }
              }}
              onMouseLeave={() => setHoveredValue(null)}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                dataKey="label"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                tickLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                tickLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorValue)"
                animationDuration={300}
              />
            </AreaChart>
          ) : (
            <LineChart
              data={data}
              onMouseMove={(e: any) => {
                if (e.activePayload && e.activePayload[0]) {
                  setHoveredValue(e.activePayload[0].payload.value);
                }
              }}
              onMouseLeave={() => setHoveredValue(null)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis
                dataKey="label"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                tickLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                tickLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
                animationDuration={300}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}
