/**
 * Metric Card Component
 *
 * Displays a single metric with value, change, and icon
 */

'use client';

import type { PriceChange } from '@/types/analytics';

interface MetricCardProps {
  /**
   * Metric label
   */
  label: string;

  /**
   * Primary value to display
   */
  value: string;

  /**
   * Optional change data
   */
  change?: PriceChange;

  /**
   * Icon element
   */
  icon?: React.ReactNode;

  /**
   * Optional description
   */
  description?: string;

  /**
   * Custom color theme
   */
  theme?: 'default' | 'success' | 'danger' | 'warning';
}

export function MetricCard({
  label,
  value,
  change,
  icon,
  description,
  theme = 'default',
}: MetricCardProps) {
  const themeColors = {
    default: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    success: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    danger: 'from-red-500/20 to-pink-500/20 border-red-500/30',
    warning: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
  };

  const getChangeColor = (direction: PriceChange['direction']) => {
    switch (direction) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getChangeIcon = (direction: PriceChange['direction']) => {
    switch (direction) {
      case 'up':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`
        glass-strong rounded-2xl p-6
        border bg-gradient-to-br ${themeColors[theme]}
        transition-all duration-300 hover:scale-[1.02]
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
        </div>
        {icon && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            {icon}
          </div>
        )}
      </div>

      {/* Change Indicator */}
      {change && (
        <div className={`flex items-center gap-2 ${getChangeColor(change.direction)}`}>
          {getChangeIcon(change.direction)}
          <span className="text-sm font-medium">
            {change.absolute >= 0 ? '+' : ''}
            ${Math.abs(change.absolute).toFixed(2)}
          </span>
          <span className="text-sm">
            ({change.percentage >= 0 ? '+' : ''}
            {change.percentage.toFixed(2)}%)
          </span>
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      )}
    </div>
  );
}
