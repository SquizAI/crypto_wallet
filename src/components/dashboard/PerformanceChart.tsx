/**
 * Performance Chart Component
 *
 * Displays price performance chart with time period selectors
 * Uses CSS gradients to simulate a glowing chart
 */

'use client';

import { useState } from 'react';

type TimePeriod = '1H' | '1D' | '1W' | '1M' | '1Y';

interface PerformanceChartProps {
  className?: string;
}

export function PerformanceChart({ className = '' }: PerformanceChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1W');

  const periods: TimePeriod[] = ['1H', '1D', '1W', '1M', '1Y'];

  return (
    <div className={`glass-card rounded-2xl p-8 fade-in ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Performance</h3>

        {/* Time Period Selectors */}
        <div className="flex gap-1 bg-white/5 rounded-lg p-1">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium
                transition-all duration-300 ease-out
                ${
                  selectedPeriod === period
                    ? 'bg-electric-blue text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              `}
              style={
                selectedPeriod === period
                  ? { backgroundColor: 'var(--electric-blue)' }
                  : {}
              }
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container with Glowing Gradient */}
      <div className="relative h-64 bg-gradient-to-br from-white/5 to-transparent rounded-xl p-6 overflow-hidden">
        {/* Simulated Chart Line with Gradient */}
        <svg
          className="w-full h-full"
          viewBox="0 0 400 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Chart Path */}
          <path
            d="M 0 150 Q 50 120, 100 130 T 200 100 T 300 80 T 400 60"
            stroke="url(#chartGradient)"
            strokeWidth="3"
            fill="none"
            className="drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
          />

          {/* Fill Area */}
          <path
            d="M 0 150 Q 50 120, 100 130 T 200 100 T 300 80 T 400 60 L 400 200 L 0 200 Z"
            fill="url(#chartFill)"
          />

          {/* Glowing Dot at End */}
          <circle
            cx="400"
            cy="60"
            r="6"
            fill="#3b82f6"
            className="pulse-gentle drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]"
          />
        </svg>

        {/* Overlay Grid Lines */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full grid grid-rows-4 gap-0">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border-b border-white/5" />
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
        <div>
          <div className="text-xs text-gray-500 mb-1">High</div>
          <div className="text-lg font-semibold text-emerald-400">$1,245.67</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Low</div>
          <div className="text-lg font-semibold text-gray-300">$1,189.23</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Volume</div>
          <div className="text-lg font-semibold text-blue-400">$45.2K</div>
        </div>
      </div>
    </div>
  );
}
