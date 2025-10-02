/**
 * Balance Card Component
 *
 * Displays single token balance with send/receive actions.
 * Shows formatted balance, USD value, and action buttons.
 */

'use client';

import { Button } from '@/components/ui';
import { formatAmount } from '@/lib/utils';
import type { TokenSymbol } from '@/constants/tokens';

export interface BalanceCardProps {
  /**
   * Token symbol (USDC, USDT, DAI)
   */
  tokenSymbol: TokenSymbol;

  /**
   * Token balance (formatted)
   */
  balance: string;

  /**
   * USD value (optional)
   */
  usdValue?: string;

  /**
   * Whether balance is loading
   */
  isLoading?: boolean;

  /**
   * Send button click handler
   */
  onSend: () => void;

  /**
   * Receive button click handler
   */
  onReceive: () => void;

  /**
   * Additional class names
   */
  className?: string;
}

/**
 * Token color configurations
 */
const tokenColors: Record<TokenSymbol, { bg: string; text: string; border: string }> = {
  USDC: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  USDT: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    border: 'border-green-200',
  },
  DAI: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-600',
    border: 'border-yellow-200',
  },
};

/**
 * Balance Card Component
 */
export function BalanceCard({
  tokenSymbol,
  balance,
  usdValue,
  isLoading = false,
  onSend,
  onReceive,
  className = '',
}: BalanceCardProps) {
  const colors = tokenColors[tokenSymbol];

  if (isLoading) {
    return (
      <div className={`p-6 bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full ${colors.bg}`} />
            <div className="h-5 bg-gray-200 rounded w-20" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
          <div className="flex gap-2">
            <div className="h-9 bg-gray-200 rounded flex-1" />
            <div className="h-9 bg-gray-200 rounded flex-1" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        p-6 bg-white rounded-lg border-2 transition-all duration-200
        hover:shadow-md hover:border-gray-300
        ${colors.border}
        ${className}
      `}
    >
      {/* Token Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={`
            w-10 h-10 rounded-full flex items-center justify-center
            font-semibold text-sm
            ${colors.bg} ${colors.text}
          `}
          aria-hidden="true"
        >
          {tokenSymbol[0]}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{tokenSymbol}</h3>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <p className="text-3xl font-bold text-gray-900 mb-1">
          {formatAmount(balance, 2)}
        </p>
        {usdValue && (
          <p className="text-sm text-gray-500">
            ≈ ${formatAmount(usdValue, 2)}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          onClick={onSend}
          fullWidth
          aria-label={`Send ${tokenSymbol}`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Send
          </span>
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={onReceive}
          fullWidth
          aria-label={`Receive ${tokenSymbol}`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <svg
              className="w-4 h-4"
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
            Receive
          </span>
        </Button>
      </div>
    </div>
  );
}
