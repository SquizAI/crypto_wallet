/**
 * Transactions Page
 *
 * Full transaction history with filtering and search capabilities.
 */

'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { useWallet } from '@/context/WalletContext';
import { Skeleton } from '@/components/ui/Skeleton';
import { Dropdown } from '@/components/ui/Dropdown';
import { Badge } from '@/components/ui/Badge';
import { downloadCSV, downloadPDF } from '@/utils/exportTransactions';
import type { TransactionStatus, TransactionType } from '@/types/wallet';

export const dynamic = 'force-dynamic';

function TransactionsContent() {
  const searchParams = useSearchParams();
  const highlightHash = searchParams.get('hash');
  const { address } = useWallet();

  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

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

  // Handle CSV export
  const handleExportCSV = async () => {
    if (!transactions || transactions.length === 0) return;

    setIsExporting(true);
    setIsExportMenuOpen(false);

    try {
      downloadCSV(transactions);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle PDF export
  const handleExportPDF = async () => {
    if (!transactions || transactions.length === 0 || !address) return;

    setIsExporting(true);
    setIsExportMenuOpen(false);

    try {
      downloadPDF(transactions, address);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Transaction History</h1>
            <p className="text-sm sm:text-base text-gray-400">View and filter all your transactions</p>
          </div>

          {/* Export Button */}
          {transactions && transactions.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                disabled={isExporting}
                className="
                  px-4 py-2 sm:px-6 sm:py-3
                  bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                  text-white text-sm sm:text-base font-medium
                  rounded-lg transition-colors duration-200
                  flex items-center gap-2 sm:gap-3
                  touch-manipulation
                  disabled:opacity-50 disabled:cursor-not-allowed
                  min-w-[140px] justify-center
                "
                aria-label="Export transactions"
                aria-expanded={isExportMenuOpen}
                aria-haspopup="true"
              >
                {isExporting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export</span>
                    <svg className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>

              {/* Export Dropdown Menu */}
              {isExportMenuOpen && !isExporting && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsExportMenuOpen(false)}
                    aria-hidden="true"
                  />

                  {/* Menu */}
                  <div
                    className="
                      absolute right-0 mt-2 w-48 sm:w-56
                      glass-card rounded-xl border border-white/10
                      shadow-xl
                      z-20
                      overflow-hidden
                    "
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <button
                      onClick={handleExportCSV}
                      className="
                        w-full px-4 py-3
                        flex items-center gap-3
                        text-left text-sm sm:text-base text-white
                        hover:bg-white/10 active:bg-white/20
                        transition-colors duration-200
                        touch-manipulation
                      "
                      role="menuitem"
                    >
                      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <div className="font-medium">Export as CSV</div>
                        <div className="text-xs text-gray-400">For spreadsheets</div>
                      </div>
                    </button>

                    <div className="h-px bg-white/10" />

                    <button
                      onClick={handleExportPDF}
                      className="
                        w-full px-4 py-3
                        flex items-center gap-3
                        text-left text-sm sm:text-base text-white
                        hover:bg-white/10 active:bg-white/20
                        transition-colors duration-200
                        touch-manipulation
                      "
                      role="menuitem"
                    >
                      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <div className="font-medium">Export as PDF</div>
                        <div className="text-xs text-gray-400">For printing</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
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

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="p-6"><Skeleton className="h-96" /></div>}>
      <TransactionsContent />
    </Suspense>
  );
}
