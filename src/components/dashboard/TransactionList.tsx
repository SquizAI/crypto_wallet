/**
 * Transaction List Component
 *
 * Displays list of recent transactions with filtering and pagination.
 */

'use client';

import { useState } from 'react';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { TransactionItemSkeleton } from '@/components/ui/Skeleton';
import { TransactionStatusBadge, Button, Alert } from '@/components/ui';
import { TransactionDetailModal } from './TransactionDetailModal';
import { formatAmount, formatTimestamp, truncateAddress } from '@/lib/utils';
import type { Transaction } from '@/types/wallet';

export interface TransactionListProps {
  /**
   * Number of transactions to show per page
   * @default 10
   */
  pageSize?: number;

  /**
   * Additional class names
   */
  className?: string;
}

/**
 * Transaction List Component
 */
export function TransactionList({ pageSize = 10, className = '' }: TransactionListProps) {
  const [page, setPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Fetch transaction history
  const { data: allTransactions, isLoading, error } = useTransactionHistory({
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Paginate transactions
  const transactions = allTransactions?.slice(0, page * pageSize) || [];
  const hasMore = (allTransactions?.length || 0) > transactions.length;

  // Handle load more
  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  // Handle transaction click
  const handleTransactionClick = (tx: Transaction) => {
    setSelectedTx(tx);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setSelectedTx(null);
  };

  if (error) {
    return (
      <Alert variant="error" className={className}>
        Failed to load transactions: {error.message}
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <TransactionItemSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className={`bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center ${className}`}>
        <svg
          className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No transactions yet
        </h3>
        <p className="text-gray-500">
          Your transaction history will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {transactions.map((tx, index) => {
          const isSend = tx.type === 'send';
          const amount = parseFloat(tx.value);
          const isLast = index === transactions.length - 1;

          return (
            <button
              key={tx.hash}
              onClick={() => handleTransactionClick(tx)}
              className={`
                w-full flex items-center justify-between p-4
                hover:bg-gray-50 transition-colors text-left
                ${!isLast ? 'border-b border-gray-200' : ''}
              `}
            >
              {/* Left: Token and Address */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Icon */}
                <div
                  className={`
                    flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    ${isSend ? 'bg-red-100' : 'bg-green-100'}
                  `}
                  aria-hidden="true"
                >
                  {isSend ? (
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-900">
                      {isSend ? 'Sent' : 'Received'} {tx.tokenSymbol}
                    </p>
                    <TransactionStatusBadge status={tx.status} size="sm" />
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {isSend ? 'To: ' : 'From: '}
                    {truncateAddress(isSend ? (tx.to || '') : tx.from)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatTimestamp(tx.timestamp)}
                  </p>
                </div>
              </div>

              {/* Right: Amount */}
              <div className="text-right ml-4 flex-shrink-0">
                <p
                  className={`
                    text-base font-semibold
                    ${isSend ? 'text-red-600' : 'text-green-600'}
                  `}
                >
                  {isSend ? '-' : '+'}
                  {formatAmount(amount, 2)} {tx.tokenSymbol}
                </p>
                {tx.status === 'confirmed' && tx.blockNumber && (
                  <p className="text-xs text-gray-500 mt-1">
                    Block {tx.blockNumber}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-4 text-center">
          <Button variant="secondary" onClick={handleLoadMore}>
            Load More
          </Button>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <TransactionDetailModal
          isOpen={!!selectedTx}
          onClose={handleCloseModal}
          transaction={selectedTx}
        />
      )}
    </div>
  );
}
