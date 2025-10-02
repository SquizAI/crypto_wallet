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
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Transaction History</h1>
          <p className="text-gray-400">View and filter all your transactions</p>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <Dropdown
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TransactionStatus | 'all')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
              <span>Total: {transactions.length} transactions</span>
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
            <div className="p-6 space-y-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          ) : !transactions || transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-500/20 mb-4">
                <svg className="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Transactions</h3>
              <p className="text-gray-400">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {transactions.map((tx) => (
                <div
                  key={tx.hash}
                  className={`
                    p-6 hover:bg-white/5 transition-colors
                    ${highlightHash === tx.hash ? 'bg-blue-500/10' : ''}
                  `}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Side */}
                    <div className="flex-1 space-y-2">
                      {/* Type and Token */}
                      <div className="flex items-center gap-3">
                        {getTypeBadge(tx.type)}
                        <span className="text-gray-500">•</span>
                        <span className="text-white font-medium">
                          {tx.value} {tx.tokenSymbol}
                        </span>
                      </div>

                      {/* Address */}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">
                          {tx.type === 'send' ? 'To:' : 'From:'}
                        </span>
                        <span className="text-gray-300 font-mono">
                          {tx.type === 'send'
                            ? `${tx.to?.slice(0, 10)}...${tx.to?.slice(-8)}`
                            : `${tx.from.slice(0, 10)}...${tx.from.slice(-8)}`}
                        </span>
                      </div>

                      {/* Transaction Hash */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">Hash:</span>
                        <a
                          href={`https://${
                            process.env.NEXT_PUBLIC_NETWORK === 'sepolia' ? 'sepolia.' : ''
                          }etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 font-mono"
                        >
                          {tx.hash.slice(0, 16)}...{tx.hash.slice(-8)}
                        </a>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="text-right space-y-2">
                      {/* Status */}
                      <div>{getStatusBadge(tx.status)}</div>

                      {/* Timestamp */}
                      <div className="text-sm text-gray-400">
                        {formatTimestamp(tx.timestamp)}
                      </div>

                      {/* Block Number */}
                      {tx.blockNumber && (
                        <div className="text-xs text-gray-500">
                          Block #{tx.blockNumber}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gas Used */}
                  {tx.gasUsed && (
                    <div className="mt-3 pt-3 border-t border-white/10 text-xs text-gray-500">
                      Gas Used: {tx.gasUsed}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
