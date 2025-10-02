/**
 * Dashboard Page
 *
 * Main dashboard view with wallet overview and transaction history.
 * Demonstrates integration of all dashboard components.
 */

'use client';

import { useState } from 'react';
import { DashboardLayout, WalletOverview, TransactionList, type DashboardTab } from '@/components/dashboard';
import { useWallet } from '@/context/WalletContext';
import { Alert } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { isUnlocked, address } = useWallet();
  const [activeTab, setActiveTab] = useState<DashboardTab>('wallet');

  // Redirect to onboarding if wallet is locked
  if (!isUnlocked || !address) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6">
          <Alert variant="warning" className="mb-4">
            Please unlock your wallet to access the dashboard.
          </Alert>
          <button
            onClick={() => router.push('/onboarding')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Unlock
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Your Wallet
          </h2>
          <WalletOverview />
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Transaction History
          </h2>
          <TransactionList />
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Settings
          </h2>
          <div className="glass-card rounded-lg border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Wallet Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Wallet Address
                </label>
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-sm font-mono text-white break-all">
                    {address}
                  </p>
                </div>
              </div>
              <Alert variant="info" className="text-sm">
                More settings coming soon...
              </Alert>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
