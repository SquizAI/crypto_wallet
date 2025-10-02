/**
 * Assets Card Component
 *
 * Displays scrollable list of token assets with frosted glass effect
 */

'use client';

interface TokenAsset {
  symbol: string;
  name: string;
  balance: string;
  usdValue: string;
  icon: string;
}

interface AssetsCardProps {
  assets: TokenAsset[];
  isLoading?: boolean;
  onTokenClick?: (symbol: string) => void;
}

export function AssetsCard({
  assets,
  isLoading = false,
  onTokenClick,
}: AssetsCardProps) {
  // Token icons (using circle colors for now)
  const tokenColors: Record<string, string> = {
    USDC: '#2775CA',
    USDT: '#26A17B',
    DAI: '#F5AC37',
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 fade-in">
        <h3 className="text-lg font-semibold text-white mb-4">Your Assets</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-700/50 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-16 bg-gray-700/50 rounded mb-2" />
                <div className="h-3 w-24 bg-gray-700/50 rounded" />
              </div>
              <div className="h-4 w-20 bg-gray-700/50 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 fade-in">
      <h3 className="text-lg font-semibold text-white mb-4">Your Assets</h3>

      {/* Scrollable Asset List */}
      <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        {assets.map((asset) => (
          <button
            key={asset.symbol}
            onClick={() => onTokenClick?.(asset.symbol)}
            className="
              w-full flex items-center gap-3 p-3 rounded-xl
              bg-white/5 border border-white/10
              transition-all duration-300 ease-out
              hover:bg-white/10 hover:border-white/20
              hover:transform hover:scale-[1.02]
              active:scale-[0.98]
            "
          >
            {/* Token Icon */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
              style={{ backgroundColor: tokenColors[asset.symbol] || '#666' }}
            >
              {asset.symbol.charAt(0)}
            </div>

            {/* Token Info */}
            <div className="flex-1 text-left">
              <div className="font-semibold text-white">{asset.symbol}</div>
              <div className="text-sm text-gray-400">{asset.name}</div>
            </div>

            {/* Balance */}
            <div className="text-right">
              <div className="font-semibold text-white">{asset.balance}</div>
              <div className="text-sm text-gray-400">${asset.usdValue}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
