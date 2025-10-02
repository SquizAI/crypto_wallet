/**
 * Dashboard Components Usage Examples
 *
 * This file contains example implementations of all dashboard components.
 * Use these examples as reference for integrating components in your app.
 */

'use client';

import { useState } from 'react';
import {
  DashboardLayout,
  BalanceCard,
  WalletOverview,
  SendModal,
  ReceiveModal,
  TransactionList,
  TransactionDetailModal,
  type DashboardTab,
} from '@/components/dashboard';
import type { TokenSymbol } from '@/constants/tokens';
import type { Transaction } from '@/types/wallet';

// ============================================================================
// Example 1: Complete Dashboard with Tab Navigation
// ============================================================================

export function CompleteDashboardExample() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('wallet');

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'wallet' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Wallet</h2>
          <WalletOverview />
        </div>
      )}

      {activeTab === 'transactions' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Transaction History
          </h2>
          <TransactionList pageSize={15} />
        </div>
      )}

      {activeTab === 'settings' && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
          <p className="text-gray-600">Settings content here...</p>
        </div>
      )}
    </DashboardLayout>
  );
}

// ============================================================================
// Example 2: Individual Balance Card with Custom Handlers
// ============================================================================

export function BalanceCardExample() {
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);

  const handleSend = () => {
    console.log('Send USDC clicked');
    setSendModalOpen(true);
  };

  const handleReceive = () => {
    console.log('Receive USDC clicked');
    setReceiveModalOpen(true);
  };

  return (
    <>
      <BalanceCard
        tokenSymbol="USDC"
        balance="1234.56"
        usdValue="1234.56"
        isLoading={false}
        onSend={handleSend}
        onReceive={handleReceive}
      />

      <SendModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        defaultToken="USDC"
      />

      <ReceiveModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        tokenSymbol="USDC"
      />
    </>
  );
}

// ============================================================================
// Example 3: Balance Cards Grid (Manual)
// ============================================================================

export function BalanceCardsGridExample() {
  const [selectedToken, setSelectedToken] = useState<TokenSymbol | null>(null);
  const [modalType, setModalType] = useState<'send' | 'receive' | null>(null);

  const tokens = [
    { symbol: 'USDC' as TokenSymbol, balance: '1,234.56', usdValue: '1,234.56' },
    { symbol: 'USDT' as TokenSymbol, balance: '5,678.90', usdValue: '5,678.90' },
    { symbol: 'DAI' as TokenSymbol, balance: '999.99', usdValue: '999.99' },
  ];

  const handleSend = (token: TokenSymbol) => {
    setSelectedToken(token);
    setModalType('send');
  };

  const handleReceive = (token: TokenSymbol) => {
    setSelectedToken(token);
    setModalType('receive');
  };

  const handleCloseModal = () => {
    setSelectedToken(null);
    setModalType(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.map((token) => (
          <BalanceCard
            key={token.symbol}
            tokenSymbol={token.symbol}
            balance={token.balance}
            usdValue={token.usdValue}
            onSend={() => handleSend(token.symbol)}
            onReceive={() => handleReceive(token.symbol)}
          />
        ))}
      </div>

      {selectedToken && (
        <>
          <SendModal
            isOpen={modalType === 'send'}
            onClose={handleCloseModal}
            defaultToken={selectedToken}
          />
          <ReceiveModal
            isOpen={modalType === 'receive'}
            onClose={handleCloseModal}
            tokenSymbol={selectedToken}
          />
        </>
      )}
    </>
  );
}

// ============================================================================
// Example 4: Transaction List with Detail Modal
// ============================================================================

export function TransactionListExample() {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Example transaction data (in real app, this comes from useTransactionHistory)
  const exampleTransaction: Transaction = {
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    to: '0x1234567890123456789012345678901234567890',
    value: '100.50',
    tokenAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    tokenSymbol: 'USDC',
    tokenDecimals: 6,
    status: 'confirmed',
    type: 'send',
    blockNumber: 1234567,
    timestamp: new Date().toISOString(),
    gasUsed: '65000',
    gasPrice: '25000000000',
    chainId: 11155111,
  };

  return (
    <>
      <TransactionList pageSize={10} />

      {/* Or manually trigger detail modal */}
      <button
        onClick={() => setSelectedTx(exampleTransaction)}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        View Example Transaction
      </button>

      <TransactionDetailModal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        transaction={selectedTx || exampleTransaction}
      />
    </>
  );
}

// ============================================================================
// Example 5: Send Modal with Programmatic Control
// ============================================================================

export function SendModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultToken, setDefaultToken] = useState<TokenSymbol>('USDC');

  const openSendModal = (token: TokenSymbol) => {
    setDefaultToken(token);
    setIsOpen(true);
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => openSendModal('USDC')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Send USDC
        </button>
        <button
          onClick={() => openSendModal('USDT')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Send USDT
        </button>
        <button
          onClick={() => openSendModal('DAI')}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg"
        >
          Send DAI
        </button>
      </div>

      <SendModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultToken={defaultToken}
      />
    </>
  );
}

// ============================================================================
// Example 6: Receive Modal with QR Code
// ============================================================================

export function ReceiveModalExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenSymbol>('USDC');

  const openReceiveModal = (token: TokenSymbol) => {
    setSelectedToken(token);
    setIsOpen(true);
  };

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => openReceiveModal('USDC')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Receive USDC
        </button>
        <button
          onClick={() => openReceiveModal('USDT')}
          className="px-4 py-2 bg-green-600 text-white rounded-lg"
        >
          Receive USDT
        </button>
        <button
          onClick={() => openReceiveModal('DAI')}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg"
        >
          Receive DAI
        </button>
      </div>

      <ReceiveModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        tokenSymbol={selectedToken}
      />
    </>
  );
}

// ============================================================================
// Example 7: Loading States
// ============================================================================

export function LoadingStatesExample() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Loading Balance Card</h3>
        <BalanceCard
          tokenSymbol="USDC"
          balance="0"
          isLoading={true}
          onSend={() => {}}
          onReceive={() => {}}
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Loaded Balance Card</h3>
        <BalanceCard
          tokenSymbol="USDC"
          balance="1,234.56"
          usdValue="1,234.56"
          isLoading={false}
          onSend={() => {}}
          onReceive={() => {}}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Example 8: Wallet Overview with React Query Integration
// ============================================================================

export function WalletOverviewIntegrationExample() {
  // WalletOverview automatically integrates with React Query hooks
  // No need to manually fetch data or manage state

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Wallet</h2>
      <WalletOverview />
      {/*
        WalletOverview automatically:
        - Fetches all token balances
        - Calculates total portfolio value
        - Handles loading states
        - Handles errors
        - Auto-refreshes every 30 seconds
        - Manages send/receive modals
      */}
    </div>
  );
}

// ============================================================================
// Example 9: Custom Dashboard Tab Component
// ============================================================================

export function CustomTabExample() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('wallet');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'wallet':
        return <WalletOverview />;
      case 'transactions':
        return <TransactionList />;
      case 'settings':
        return (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Settings</h3>
            <p className="text-gray-600">Custom settings content...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {activeTab === 'wallet' && 'Your Wallet'}
          {activeTab === 'transactions' && 'Transaction History'}
          {activeTab === 'settings' && 'Settings'}
        </h2>
        {renderTabContent()}
      </div>
    </DashboardLayout>
  );
}

// ============================================================================
// Export all examples
// ============================================================================

export default {
  CompleteDashboardExample,
  BalanceCardExample,
  BalanceCardsGridExample,
  TransactionListExample,
  SendModalExample,
  ReceiveModalExample,
  LoadingStatesExample,
  WalletOverviewIntegrationExample,
  CustomTabExample,
};
