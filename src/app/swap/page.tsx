/**
 * Swap Page
 *
 * Token swap interface with DEX integration
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { SwapInterface } from '@/components/swap/SwapInterface';

export default function SwapPage() {
  const router = useRouter();
  const { isUnlocked, hasExistingWallet } = useWallet();

  // Redirect to onboarding if no wallet exists
  useEffect(() => {
    if (!hasExistingWallet()) {
      router.push('/onboarding');
    }
  }, [hasExistingWallet, router]);

  // Redirect to unlock if wallet is locked
  useEffect(() => {
    if (hasExistingWallet() && !isUnlocked) {
      router.push('/unlock');
    }
  }, [hasExistingWallet, isUnlocked, router]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Token Swap
          </h1>
          <p className="text-gray-400">
            Swap stablecoins instantly using Uniswap V3
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-400 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="space-y-1">
              <p className="text-sm text-blue-400 font-semibold">
                About Token Swaps
              </p>
              <p className="text-sm text-gray-300">
                Swaps are executed on Uniswap V3 with on-chain prices. You'll need to approve
                the token before your first swap. Network fees apply for each transaction.
              </p>
            </div>
          </div>
        </div>

        {/* Swap Interface */}
        <SwapInterface />

        {/* Help Section */}
        <div className="mt-8 p-6 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">How it works</h3>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-400 font-semibold text-xs">1</span>
              </div>
              <p>
                <strong className="text-white">Select tokens:</strong> Choose the token you
                want to swap from and the token you want to receive.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-400 font-semibold text-xs">2</span>
              </div>
              <p>
                <strong className="text-white">Enter amount:</strong> Type the amount you want
                to swap. The output amount will be calculated automatically.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-400 font-semibold text-xs">3</span>
              </div>
              <p>
                <strong className="text-white">Review details:</strong> Check the exchange
                rate, price impact, and fees before confirming.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-400 font-semibold text-xs">4</span>
              </div>
              <p>
                <strong className="text-white">Approve & Swap:</strong> First-time swaps require
                token approval. Then confirm the swap with your password.
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="text-sm font-semibold text-white mb-2">
              Important Notes
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Slippage tolerance protects you from price changes during the swap</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Price impact shows how much your trade affects the market price</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Network fees (gas) are paid in ETH and vary based on network congestion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-1">•</span>
                <span>Quotes refresh automatically every 30 seconds</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
