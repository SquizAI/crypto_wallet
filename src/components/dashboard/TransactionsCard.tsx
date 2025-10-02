/**
 * Transactions Card Component
 *
 * Displays recent transactions with color-coded status
 */

'use client';

type TransactionType = 'send' | 'receive' | 'pending';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  token: string;
  timestamp: string;
  address: string;
}

interface TransactionsCardProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onTransactionClick?: (id: string) => void;
}

export function TransactionsCard({
  transactions,
  isLoading = false,
  onTransactionClick,
}: TransactionsCardProps) {
  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'receive':
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
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
                d="M12 4v16m0 0l-4-4m4 4l4-4"
              />
            </svg>
          </div>
        );
      case 'send':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-400"
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
          </div>
        );
      case 'pending':
        return (
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-amber-400 animate-spin"
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
          </div>
        );
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'receive':
        return 'text-emerald-400';
      case 'send':
        return 'text-blue-400';
      case 'pending':
        return 'text-amber-400';
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 fade-in">
        <h3 className="text-lg font-semibold text-white mb-4">
          Recent Transactions
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-gray-700/50 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-20 bg-gray-700/50 rounded mb-2" />
                <div className="h-3 w-32 bg-gray-700/50 rounded" />
              </div>
              <div className="h-4 w-16 bg-gray-700/50 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6 fade-in">
      <h3 className="text-lg font-semibold text-white mb-4">
        Recent Transactions
      </h3>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 text-gray-600 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-sm">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
          {transactions.map((tx) => (
            <button
              key={tx.id}
              onClick={() => onTransactionClick?.(tx.id)}
              className="
                w-full flex items-center gap-3 p-3 rounded-xl
                bg-white/5 border border-white/10
                transition-all duration-300 ease-out
                hover:bg-white/10 hover:border-white/20
                hover:transform hover:scale-[1.02]
                active:scale-[0.98]
              "
            >
              {/* Transaction Icon */}
              {getTransactionIcon(tx.type)}

              {/* Transaction Info */}
              <div className="flex-1 text-left">
                <div className="font-semibold text-white capitalize">
                  {tx.type}
                </div>
                <div className="text-sm text-gray-400">
                  {truncateAddress(tx.address)}
                </div>
                <div className="text-xs text-gray-500 mt-1">{tx.timestamp}</div>
              </div>

              {/* Amount */}
              <div className={`text-right font-semibold ${getTransactionColor(tx.type)}`}>
                {tx.type === 'receive' ? '+' : '-'}
                {tx.amount} {tx.token}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
