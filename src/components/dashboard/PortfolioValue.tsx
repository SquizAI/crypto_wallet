/**
 * Portfolio Value Component
 *
 * Displays total portfolio value with holographic shimmer effect
 * and 24h change percentage
 */

'use client';

interface PortfolioValueProps {
  totalValue: number;
  change24h?: number;
  isLoading?: boolean;
  onSendClick: () => void;
  onReceiveClick: () => void;
}

export function PortfolioValue({
  totalValue,
  change24h = 2.45,
  isLoading = false,
  onSendClick,
  onReceiveClick,
}: PortfolioValueProps) {
  return (
    <div className="glass-card rounded-2xl p-8 fade-in">
      <h2 className="text-sm font-medium text-gray-400 mb-4">
        Total Portfolio Value
      </h2>

      {/* Holographic Value Display */}
      {isLoading ? (
        <div className="h-16 w-64 bg-gray-800/50 rounded-lg animate-pulse mb-4" />
      ) : (
        <div className="mb-6">
          <div className="text-6xl font-bold holographic-shimmer mb-2">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          {/* 24h Change */}
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-emerald-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <span className="text-emerald-400 font-semibold text-lg">
              +{change24h.toFixed(2)}%
            </span>
            <span className="text-gray-500 text-sm">24h</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onSendClick}
          className="
            flex-1 px-6 py-3 rounded-xl
            bg-electric-blue text-white font-semibold
            transition-all duration-300 ease-out
            hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]
            hover:scale-[1.02]
            active:scale-[0.98]
          "
          style={{ backgroundColor: 'var(--electric-blue)' }}
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
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
        </button>

        <button
          onClick={onReceiveClick}
          className="
            flex-1 px-6 py-3 rounded-xl
            bg-white/5 text-white font-semibold
            border border-white/10
            transition-all duration-300 ease-out
            hover:bg-white/10
            hover:border-white/20
            hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]
            hover:scale-[1.02]
            active:scale-[0.98]
          "
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m0 0l-4-4m4 4l4-4"
              />
            </svg>
            Receive
          </span>
        </button>
      </div>
    </div>
  );
}
