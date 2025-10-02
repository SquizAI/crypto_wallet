'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '@/context/WalletContext';
import { useBalance } from '@/hooks/useBalance';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { PortfolioValue } from '@/components/dashboard/PortfolioValue';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { AssetsCard } from '@/components/dashboard/AssetsCard';
import { TransactionsCard } from '@/components/dashboard/TransactionsCard';
import { SendModal } from '@/components/modals/SendModal';
import { ReceiveModal } from '@/components/modals/ReceiveModal';
import { Skeleton } from '@/components/ui/Skeleton';
import { TOKENS } from '@/constants/tokens';

export default function Home() {
  const router = useRouter();
  const { address, isUnlocked } = useWallet();
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  // Fetch all token balances
  const { data: balances, isLoading: balancesLoading } = useBalance();

  // Fetch recent transactions (limit to 5)
  const { data: transactions, isLoading: transactionsLoading } = useTransactionHistory({
    limit: 5,
  });

  // Redirect if not unlocked (handled by LayoutContent, but extra safety)
  if (!isUnlocked || !address) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl text-white mb-4">Wallet Locked</h2>
          <p className="text-gray-400">Please unlock your wallet to continue</p>
        </div>
      </div>
    );
  }

  // Transform balances for AssetsCard
  const assets = balances
    ? balances.map((balance) => ({
        symbol: balance.symbol,
        name: TOKENS[balance.symbol]?.name || balance.symbol,
        balance: balance.balanceFormatted,
        usdValue: balance.balanceFormatted, // Stablecoins are ~$1
        icon: '',
      }))
    : [];

  // Calculate total value
  const totalValue = balances
    ? balances.reduce((sum, balance) => sum + parseFloat(balance.balanceFormatted), 0)
    : 0;

  // Transform transactions for TransactionsCard
  const recentTransactions = transactions
    ? transactions.map((tx) => ({
        id: tx.hash,
        type: tx.status === 'pending' ? ('pending' as const) : (tx.type as 'send' | 'receive'),
        amount: tx.value,
        token: tx.tokenSymbol,
        timestamp: tx.timestamp ? formatTimestamp(tx.timestamp) : 'Pending',
        address: tx.type === 'send' ? tx.to || '' : tx.from,
      }))
    : [];

  return (
    <div className="min-h-screen relative">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Two Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Value */}
            {balancesLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <PortfolioValue
                totalValue={totalValue}
                change24h={0} // Stablecoins don't change much
                onSendClick={() => setShowSendModal(true)}
                onReceiveClick={() => setShowReceiveModal(true)}
              />
            )}

            {/* Performance Chart */}
            <PerformanceChart />
          </div>

          {/* Secondary Column (1/3 width) */}
          <div className="space-y-6">
            {/* Assets */}
            {balancesLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <AssetsCard
                assets={assets}
                onTokenClick={(symbol) => router.push(`/token/${symbol}`)}
              />
            )}

            {/* Recent Transactions */}
            {transactionsLoading ? (
              <Skeleton className="h-96" />
            ) : (
              <TransactionsCard
                transactions={recentTransactions}
                onTransactionClick={(hash) => router.push(`/transactions?hash=${hash}`)}
              />
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <SendModal isOpen={showSendModal} onClose={() => setShowSendModal(false)} />
      <ReceiveModal isOpen={showReceiveModal} onClose={() => setShowReceiveModal(false)} />
    </div>
  );
}

/**
 * Format timestamp to relative time
 */
function formatTimestamp(timestamp: string | number | null): string {
  if (!timestamp) return 'Unknown';

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}
