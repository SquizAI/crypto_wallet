/**
 * Transactions Page
 *
 * Full transaction history with filtering and search capabilities.
 */

'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { Skeleton } from '@/components/ui/Skeleton';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import type { TransactionStatus, TransactionType } from '@/types/wallet';

export default function TransactionsPage() {
  const searchParams = useSearchParams();
  const highlightHash = searchParams.get('hash');

  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');

  // Fetch transactions with filters
  const { data: transactions, isLoading } = useTransactionHistory({
    statusFilter: statusFilter !== 'all' ? statusFilter : undefined,
    typeFilter: typeFilter !== 'all' ? typeFilter : undefined,
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'failed', label: 'Failed' },
  ];

  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'send', label: 'Sent' },
    { value: 'receive', label: 'Received' },
  ];

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'confirmed':
        return <Badge variant="success">Confirmed</Badge>;
      case 'failed':
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'send':
        return (
          <div className="flex items-center gap-2 text-red-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            <span>Send</span>
          </div>
        );
      case 'receive':
        return (
          <div className="flex items-center gap-2 text-green-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span>Receive</span>
          </div>
        );
      default:
        return <span>{type}</span>;
    }
  };

  const formatTimestamp = (timestamp: string | number | null): string => {
    if (!timestamp) return 'Pending';

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Transaction History</h1>
          <p className="text-sm sm:text-base text-gray-400">View and filter all your transactions</p>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-4 sm:p-6 border border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <Dropdown
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | 'all')}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <Dropdown
                options={typeOptions}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TransactionType | 'all')}
              />
            </div>
          </div>

          {transactions && (
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
              <span>Total: {transactions.length}</span>
              <span>•</span>
              <span>
                Pending: {transactions.filter((tx) => tx.status === 'pending').length}
              </span>
            </div>
          )}
        </div>

        {/* Transactions List */}
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
          {isLoading ? (
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <Skeleton className="h-16 sm:h-20" />
              <Skeleton className="h-16 sm:h-20" />
              <Skeleton className="h-16 sm:h-20" />
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-500/20 mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Transactions</h3>
              <p className="text-sm sm:text-base text-gray-400">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {transactions.map((tx) => (
                <div
                  key={tx.hash}
                  className={`
                    p-4 sm:p-6 hover:bg-white/5 active:bg-white/10 transition-colors
                    ${highlightHash === tx.hash ? 'bg-blue-500/10' : ''}
                  `}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    {/* Left Side */}
                    <div className="flex-1 space-y-2">
                      {/* Type and Token */}
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        {getTypeBadge(tx.type)}
                        <span className="text-gray-500">•</span>
                        <span className="text-sm sm:text-base text-white font-medium">
                          {tx.value} {tx.tokenSymbol}
                        </span>
                      </div>

                      {/* Address */}
                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                        <span className="text-gray-400">
                          {tx.type === 'send' ? 'To:' : 'From:'}
                        </span>
                        <span className="text-gray-300 font-mono break-all">
                          <span className="sm:hidden">
                            {tx.type === 'send'
                              ? `${tx.to?.slice(0, 8)}...${tx.to?.slice(-6)}`
                              : `${tx.from.slice(0, 8)}...${tx.from.slice(-6)}`}
                          </span>
                          <span className="hidden sm:inline">
                            {tx.type === 'send'
                              ? `${tx.to?.slice(0, 10)}...${tx.to?.slice(-8)}`
                              : `${tx.from.slice(0, 10)}...${tx.from.slice(-8)}`}
                          </span>
                        </span>
                      </div>

                      {/* Transaction Hash */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-gray-500">Hash:</span>
                        <a
                          href={`https://${
                            process.env.NEXT_PUBLIC_NETWORK === 'sepolia' ? 'sepolia.' : ''
                          }etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 active:text-blue-200 font-mono break-all touch-manipulation"
                        >
                          <span className="sm:hidden">{tx.hash.slice(0, 12)}...{tx.hash.slice(-6)}</span>
                          <span className="hidden sm:inline">{tx.hash.slice(0, 16)}...{tx.hash.slice(-8)}</span>
                        </a>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:space-y-2 sm:text-right">
                      {/* Status */}
                      <div>{getStatusBadge(tx.status)}</div>

                      {/* Timestamp */}
                      <div className="text-xs sm:text-sm text-gray-400">
                        {formatTimestamp(tx.timestamp)}
                      </div>

                      {/* Block Number */}
                      {tx.blockNumber && (
                        <div className="hidden sm:block text-xs text-gray-500">
                          Block #{tx.blockNumber}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gas Used & Block (Mobile) */}
                  <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-xs text-gray-500">
                    {tx.gasUsed && <span>Gas: {tx.gasUsed}</span>}
                    {tx.blockNumber && <span className="sm:hidden">Block #{tx.blockNumber}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
