/**
 * Wallet Overview Component
 *
 * Displays total portfolio value and balance cards for all tokens.
 * Uses React Query for data fetching and auto-refresh.
 */

'use client';

import { useState } from 'react';
import { useBalance } from '@/hooks/useBalance';
import { useWallet } from '@/context/WalletContext';
import { BalanceCard } from './BalanceCard';
import { SendModal } from './SendModal';
import { ReceiveModal } from './ReceiveModal';
import { Button, Alert } from '@/components/ui';
import { formatAmount } from '@/lib/utils';
import { getAllTokenSymbols, type TokenSymbol } from '@/constants/tokens';
import { BalanceCardSkeleton } from '@/components/ui/Skeleton';

export interface WalletOverviewProps {
  /**
   * Additional class names
   */
  className?: string;
}

/**
 * Wallet Overview Component
 */
export function WalletOverview({ className = '' }: WalletOverviewProps) {
  const { isUnlocked } = useWallet();
  const [selectedToken, setSelectedToken] = useState<TokenSymbol | null>(null);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);

  // Fetch all token balances
  const { data: balances, isLoading, error, refetch } = useBalance({
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  // Calculate total portfolio value
  const totalValue = balances?.reduce((sum, token) => {
    // For stablecoins, 1 token ≈ 1 USD
    return sum + parseFloat(token.balanceFormatted || '0');
  }, 0) || 0;

  // Handle send button click
  const handleSendClick = (tokenSymbol: TokenSymbol) => {
    setSelectedToken(tokenSymbol);
    setIsSendModalOpen(true);
  };

  // Handle receive button click
  const handleReceiveClick = (tokenSymbol: TokenSymbol) => {
    setSelectedToken(tokenSymbol);
    setIsReceiveModalOpen(true);
  };

  // Handle modal close
  const handleCloseSendModal = () => {
    setIsSendModalOpen(false);
    setSelectedToken(null);
  };

  const handleCloseReceiveModal = () => {
    setIsReceiveModalOpen(false);
    setSelectedToken(null);
  };

  if (!isUnlocked) {
    return (
      <Alert variant="warning" className={className}>
        Please unlock your wallet to view balances.
      </Alert>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <Alert variant="error" className="mb-4">
          Failed to load balances: {error.message}
        </Alert>
        <Button onClick={() => refetch()} variant="primary">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Portfolio Header */}
      <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-gray-600 mb-1">
              Total Portfolio Value
            </h2>
            {isLoading ? (
              <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
            ) : (
              <p className="text-4xl font-bold text-gray-900">
                ${formatAmount(totalValue, 2)}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            aria-label="Refresh balances"
          >
            <svg
              className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
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
          </Button>
        </div>
      </div>

      {/* Token Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          // Loading skeletons
          getAllTokenSymbols().map((symbol) => (
            <BalanceCardSkeleton key={symbol} />
          ))
        ) : balances && balances.length > 0 ? (
          // Balance cards
          balances.map((token) => (
            <BalanceCard
              key={token.symbol}
              tokenSymbol={token.symbol as TokenSymbol}
              balance={token.balanceFormatted}
              usdValue={token.balanceFormatted} // 1:1 for stablecoins
              onSend={() => handleSendClick(token.symbol as TokenSymbol)}
              onReceive={() => handleReceiveClick(token.symbol as TokenSymbol)}
            />
          ))
        ) : (
          // Empty state
          <div className="col-span-full p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              No balances found
            </h3>
            <p className="text-gray-500">
              Your wallet doesn&apos;t have any tokens yet.
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedToken && (
        <>
          <SendModal
            isOpen={isSendModalOpen}
            onClose={handleCloseSendModal}
            defaultToken={selectedToken}
          />
          <ReceiveModal
            isOpen={isReceiveModalOpen}
            onClose={handleCloseReceiveModal}
            tokenSymbol={selectedToken}
          />
        </>
      )}
    </div>
  );
}
