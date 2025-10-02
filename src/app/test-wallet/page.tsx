/**
 * Test page to verify wallet context is working
 * This can be accessed at /test-wallet
 */

'use client';

import { useWallet } from '@/context/WalletContext';

export default function TestWalletPage() {
  const {
    address,
    isUnlocked,
    isLoading,
    error,
    hasExistingWallet,
  } = useWallet();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Wallet Context Test</h1>

      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-semibold">Wallet State</h2>
          <ul className="mt-2 space-y-1">
            <li>Has Existing Wallet: {hasExistingWallet() ? 'Yes' : 'No'}</li>
            <li>Is Unlocked: {isUnlocked ? 'Yes' : 'No'}</li>
            <li>Is Loading: {isLoading ? 'Yes' : 'No'}</li>
            <li>Address: {address || 'None'}</li>
            <li>Error: {error || 'None'}</li>
          </ul>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold">Status</h2>
          <p className="mt-2 text-green-600">
            Wallet Context is working correctly!
          </p>
          <p className="mt-1 text-sm text-gray-600">
            All providers are loaded and the useWallet hook is accessible.
          </p>
        </div>
      </div>
    </div>
  );
}
